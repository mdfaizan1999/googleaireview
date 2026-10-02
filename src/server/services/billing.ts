import crypto from 'crypto';
import { db } from '../database';
import {
  Plan,
  Subscription,
  Payment,
  Invoice,
  WebhookEvent,
  BillingCustomer,
  PlanLimits,
  PlanFeatures
} from '../types';
import { RazorpayService } from './razorpay';
import { getRazorpayConfig, isRazorpayConfigured, RAZORPAY_EVENTS } from '../config/razorpay';
import { FeatureService } from './features';
import { PlanLimitService } from './planLimits';

export interface CheckoutResult {
  free?: boolean;
  subscription_id?: string;
  key_id?: string;
  amount?: number;
  currency?: string;
  name?: string;
  description?: string;
  plan_id: string;
  plan_name: string;
  interval: 'monthly' | 'annual';
  customer_name?: string;
  customer_email?: string;
  customer_id?: string;
  simulated?: boolean;
  subscription?: Subscription;
}

export class BillingService {
  /**
   * Retrieves all public active plans.
   */
  public static getPlans(): Plan[] {
    return db.getPlans();
  }

  /**
   * Retrieves comprehensive billing status for the authenticated user.
   */
  public static getSubscriptionStatus(user: { id: string; email?: string; name?: string }) {
    let subscription = db.findSubscriptionByUserId(user.id);
    const plans = db.getPlans();

    // Default to free plan if user has no subscription record yet
    if (!subscription) {
      const freePlan = plans.find((p) => p.is_free) || plans[0];
      const now = new Date().toISOString();
      const endsAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      subscription = db.createSubscriptionRecord({
        user_id: user.id,
        plan_id: freePlan.id,
        gateway: 'manual',
        status: 'active',
        starts_at: now,
        ends_at: endsAt,
        current_period_start: now,
        current_period_end: endsAt,
        billing_interval: 'monthly'
      });
    }

    const currentPlan = plans.find((p) => p.id === subscription?.plan_id) || plans[0];
    const isOperational = FeatureService.isSubscriptionOperational(subscription);

    // Calculate Grace Period state
    let gracePeriod = {
      in_grace_period: false,
      grace_period_end: subscription.grace_period_end || null,
      hours_remaining: 0
    };

    if (subscription.status === 'past_due' && subscription.grace_period_end) {
      const remainingMs = new Date(subscription.grace_period_end).getTime() - Date.now();
      if (remainingMs > 0) {
        gracePeriod.in_grace_period = true;
        gracePeriod.hours_remaining = Math.ceil(remainingMs / (1000 * 60 * 60));
      }
    }

    // Days remaining in current cycle
    let daysRemaining = 0;
    const periodEnd = subscription.current_period_end || subscription.ends_at;
    if (periodEnd) {
      const remainingMs = new Date(periodEnd).getTime() - Date.now();
      daysRemaining = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
    }

    // Resource limits & usage meters
    const resources: (keyof PlanLimits)[] = [
      'businesses',
      'locations',
      'funnels',
      'qr_codes',
      'ai_generations',
      'google_reviews',
      'monthly_scans'
    ];

    const usage: Record<string, { used: number; limit: number; remaining: number; percentage: number }> = {};
    for (const res of resources) {
      const used = PlanLimitService.usage(user, res);
      const limit = PlanLimitService.limit(user, res);
      const remaining = PlanLimitService.remaining(user, res);
      const percentage = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
      usage[res] = { used, limit, remaining, percentage };
    }

    // Feature entitlements
    const featureKeys: (keyof PlanFeatures)[] = [
      'analytics',
      'google_reviews',
      'google_reply',
      'ai_review_analysis',
      'ai_reply_generation',
      'multiple_locations',
      'custom_branding',
      'advanced_analytics',
      'api_access',
      'team_members',
      'export'
    ];

    const features: Record<string, boolean> = {};
    for (const feat of featureKeys) {
      features[feat] = FeatureService.can(user, feat);
    }

    return {
      subscription,
      plan: currentPlan,
      isOperational,
      gracePeriod,
      daysRemaining,
      usage,
      features
    };
  }

  /**
   * Initiates a checkout session for a given plan and billing interval.
   */
  public static async createCheckoutSession(
    user: { id: string; name?: string; email?: string },
    planId: string,
    interval: 'monthly' | 'annual' = 'monthly'
  ): Promise<CheckoutResult> {
    const plans = db.getPlans();
    const targetPlan = plans.find((p) => p.id === planId || p.slug === planId);

    if (!targetPlan) {
      throw new Error(`Plan "${planId}" not found.`);
    }

    // If downgrading / selecting the Free plan, activate directly without Razorpay
    if (targetPlan.is_free) {
      const now = new Date().toISOString();
      const endsAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      const updatedSub = db.upsertSubscription(user.id, targetPlan.id, 'manual');
      db.updateSubscription(updatedSub.id, {
        current_period_start: now,
        current_period_end: endsAt,
        billing_interval: 'monthly',
        cancel_at_period_end: false,
        status: 'active'
      });

      db.logAudit({
        user_id: user.id,
        action: 'subscription.downgraded_free',
        entity_type: 'subscription',
        entity_id: updatedSub.id,
        new_values: { plan_id: targetPlan.id, plan_name: targetPlan.name }
      });

      return {
        free: true,
        plan_id: targetPlan.id,
        plan_name: targetPlan.name,
        interval: 'monthly',
        subscription: updatedSub
      };
    }

    // Ensure customer exists in database / Razorpay
    let customer = db.findBillingCustomerByUserId(user.id);
    if (!customer) {
      const rzpCust = await RazorpayService.createCustomer({
        name: user.name || 'Business Owner',
        email: user.email || 'customer@reviewflow.ai'
      });
      customer = db.upsertBillingCustomer({
        user_id: user.id,
        razorpay_customer_id: rzpCust.id,
        name: rzpCust.name,
        email: rzpCust.email
      });
    }

    // Determine target Razorpay plan ID
    const rzpPlanId =
      interval === 'annual'
        ? targetPlan.razorpay_annual_plan_id || `plan_rzp_${targetPlan.slug}_annual`
        : targetPlan.razorpay_monthly_plan_id || `plan_rzp_${targetPlan.slug}_monthly`;

    const totalCount = interval === 'annual' ? 5 : 60; // 5 years or 60 months

    const rzpSub = await RazorpayService.createSubscription({
      plan_id: rzpPlanId,
      customer_id: customer.razorpay_customer_id,
      total_count: totalCount,
      notes: {
        user_id: user.id,
        app_plan_id: targetPlan.id,
        billing_interval: interval
      }
    });

    const { key_id } = getRazorpayConfig();
    const priceAmount = interval === 'annual' ? targetPlan.annual_price : targetPlan.monthly_price;

    return {
      free: false,
      subscription_id: rzpSub.id,
      key_id,
      amount: priceAmount * 100, // in paise for Razorpay standard checkout
      currency: targetPlan.currency || 'INR',
      name: 'ReviewFlow AI',
      description: `${targetPlan.name} (${interval === 'annual' ? 'Annual Billing' : 'Monthly Billing'})`,
      plan_id: targetPlan.id,
      plan_name: targetPlan.name,
      interval,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_id: customer.razorpay_customer_id,
      simulated: rzpSub.simulated || !isRazorpayConfigured()
    };
  }

  /**
   * Verifies Razorpay client payment signature and activates the subscription.
   */
  public static async verifyPaymentAndActivate(
    user: { id: string },
    params: {
      razorpay_payment_id: string;
      razorpay_subscription_id: string;
      razorpay_signature: string;
      plan_id: string;
      interval: 'monthly' | 'annual';
    }
  ) {
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, plan_id, interval } = params;

    // Check signature
    const isValid = RazorpayService.verifyPaymentSignature({
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature
    });

    // If signature failed and we are not in simulated test mode, reject
    if (!isValid && isRazorpayConfigured()) {
      throw new Error('Payment signature verification failed. Untrusted payment payload.');
    }

    const plans = db.getPlans();
    const targetPlan = plans.find((p) => p.id === plan_id || p.slug === plan_id);
    if (!targetPlan) {
      throw new Error('Selected target plan not found.');
    }

    const now = new Date().toISOString();
    const durationDays = interval === 'annual' ? 365 : 30;
    const endsAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    // Upsert subscription
    let subscription = db.findSubscriptionByUserId(user.id);
    if (subscription) {
      subscription = db.updateSubscription(subscription.id, {
        plan_id: targetPlan.id,
        gateway: 'razorpay',
        gateway_subscription_id: razorpay_subscription_id,
        razorpay_subscription_id,
        status: 'active',
        billing_interval: interval,
        starts_at: now,
        ends_at: endsAt,
        current_period_start: now,
        current_period_end: endsAt,
        cancel_at_period_end: false,
        cancelled_at: undefined,
        grace_period_end: undefined
      })!;
    } else {
      subscription = db.createSubscriptionRecord({
        user_id: user.id,
        plan_id: targetPlan.id,
        gateway: 'razorpay',
        gateway_subscription_id: razorpay_subscription_id,
        razorpay_subscription_id,
        status: 'active',
        billing_interval: interval,
        starts_at: now,
        ends_at: endsAt,
        current_period_start: now,
        current_period_end: endsAt,
        cancel_at_period_end: false
      });
    }

    const price = interval === 'annual' ? targetPlan.annual_price : targetPlan.monthly_price;

    // Record Payment
    const payment = db.createPayment({
      user_id: user.id,
      subscription_id: subscription.id,
      gateway: 'razorpay',
      gateway_payment_id: razorpay_payment_id,
      razorpay_payment_id,
      amount: price,
      currency: targetPlan.currency || 'INR',
      status: 'success',
      payment_method: 'RAZORPAY',
      paid_at: now
    });

    // Create Invoice record
    const invoice = db.createInvoice({
      user_id: user.id,
      subscription_id: subscription.id,
      invoice_number: `INV-${Date.now().toString().slice(-6)}`,
      amount: price,
      currency: targetPlan.currency || 'INR',
      status: 'paid',
      issued_at: now,
      paid_at: now,
      hosted_url: `https://rzp.io/i/${razorpay_subscription_id}`
    });

    // Audit log
    db.logAudit({
      user_id: user.id,
      action: 'subscription.activated',
      entity_type: 'subscription',
      entity_id: subscription.id,
      new_values: {
        plan_id: targetPlan.id,
        plan_name: targetPlan.name,
        payment_id: razorpay_payment_id,
        subscription_id: razorpay_subscription_id,
        interval,
        amount: price
      }
    });

    return {
      subscription,
      plan: targetPlan,
      payment,
      invoice
    };
  }

  /**
   * Cancels a subscription either immediately or at the end of the current billing cycle.
   */
  public static async cancelSubscription(user: { id: string }, cancelAtPeriodEnd: boolean = true) {
    const subscription = db.findSubscriptionByUserId(user.id);
    if (!subscription) {
      throw new Error('No active subscription found.');
    }

    const plans = db.getPlans();
    const currentPlan = plans.find((p) => p.id === subscription.plan_id);
    if (currentPlan?.is_free) {
      throw new Error('Free plan does not require cancellation.');
    }

    if (subscription.razorpay_subscription_id) {
      try {
        await RazorpayService.cancelSubscription(subscription.razorpay_subscription_id, cancelAtPeriodEnd);
      } catch (err) {
        console.warn('[BillingService] Razorpay cancel failed:', err);
      }
    }

    const now = new Date().toISOString();
    let updatedSub: Subscription | null;

    if (cancelAtPeriodEnd) {
      updatedSub = db.updateSubscription(subscription.id, {
        cancel_at_period_end: true,
        cancelled_at: now
      });
    } else {
      updatedSub = db.updateSubscription(subscription.id, {
        status: 'cancelled',
        cancel_at_period_end: false,
        cancelled_at: now,
        ended_at: now
      });
    }

    db.logAudit({
      user_id: user.id,
      action: 'subscription.cancelled',
      entity_type: 'subscription',
      entity_id: subscription.id,
      new_values: { cancel_at_period_end: cancelAtPeriodEnd }
    });

    return updatedSub;
  }

  /**
   * Reactivates a subscription that was scheduled to cancel at the end of the period.
   */
  public static async reactivateSubscription(user: { id: string }) {
    const subscription = db.findSubscriptionByUserId(user.id);
    if (!subscription) {
      throw new Error('No subscription found.');
    }

    if (!subscription.cancel_at_period_end) {
      throw new Error('Subscription is not scheduled for cancellation.');
    }

    const updatedSub = db.updateSubscription(subscription.id, {
      cancel_at_period_end: false,
      cancelled_at: undefined
    });

    db.logAudit({
      user_id: user.id,
      action: 'subscription.reactivated',
      entity_type: 'subscription',
      entity_id: subscription.id
    });

    return updatedSub;
  }

  /**
   * Webhook processing with HMAC SHA-256 signature verification and idempotency.
   */
  public static async processWebhook(params: {
    rawBody: string | Buffer;
    signature?: string;
    payload: any;
  }): Promise<{ status: 'processed' | 'ignored'; reason?: string; event_type?: string }> {
    const { rawBody, signature, payload } = params;
    const eventType = payload.event;
    const eventId = payload.event_id || payload.id || crypto.createHash('md5').update(rawBody.toString()).digest('hex');

    // 1. Verify HMAC SHA-256 Signature
    if (signature) {
      const isVerified = RazorpayService.verifyWebhookSignature(rawBody, signature);
      if (!isVerified && isRazorpayConfigured()) {
        console.error('[BillingService Webhook] HMAC Signature Verification FAILED.');
        throw new Error('Invalid Razorpay Webhook Signature.');
      }
    }

    // 2. Idempotency Check
    const existingEvent = db.findWebhookEvent('razorpay', eventId);
    if (existingEvent && existingEvent.processing_status === 'processed') {
      console.log(`[BillingService Webhook] Event ${eventId} (${eventType}) already processed. Skipping.`);
      return { status: 'ignored', reason: 'already_processed', event_type: eventType };
    }

    const webhookRecord = db.createWebhookEvent({
      provider: 'razorpay',
      event_id: eventId,
      event_type: eventType,
      signature_verified: Boolean(signature),
      payload_hash: crypto.createHash('sha256').update(rawBody.toString()).digest('hex'),
      payload,
      processing_status: 'pending',
      attempts: 1
    });

    const now = new Date().toISOString();

    try {
      switch (eventType) {
        case RAZORPAY_EVENTS.SUBSCRIPTION_ACTIVATED:
        case RAZORPAY_EVENTS.SUBSCRIPTION_CHARGED: {
          const subEntity = payload.payload?.subscription?.entity;
          const rzpSubId = subEntity?.id;
          if (rzpSubId) {
            const sub = db.findSubscriptionByRazorpayId(rzpSubId);
            if (sub) {
              const currentStart = subEntity.current_start
                ? new Date(subEntity.current_start * 1000).toISOString()
                : now;
              const currentEnd = subEntity.current_end
                ? new Date(subEntity.current_end * 1000).toISOString()
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

              db.updateSubscription(sub.id, {
                status: 'active',
                current_period_start: currentStart,
                current_period_end: currentEnd,
                ends_at: currentEnd,
                grace_period_end: undefined
              });
            }
          }

          // If payment entity exists in payload, record payment & invoice
          const paymentEntity = payload.payload?.payment?.entity;
          if (paymentEntity && paymentEntity.status === 'captured') {
            const rzpPaymentId = paymentEntity.id;
            const amountInRupees = (paymentEntity.amount || 0) / 100;
            const sub = rzpSubId ? db.findSubscriptionByRazorpayId(rzpSubId) : undefined;
            const userId = sub?.user_id || paymentEntity.notes?.user_id;

            if (userId) {
              db.createPayment({
                user_id: userId,
                subscription_id: sub?.id,
                gateway: 'razorpay',
                gateway_payment_id: rzpPaymentId,
                razorpay_payment_id: rzpPaymentId,
                amount: amountInRupees,
                currency: paymentEntity.currency || 'INR',
                status: 'success',
                payment_method: paymentEntity.method?.toUpperCase() || 'RAZORPAY',
                paid_at: now
              });

              db.createInvoice({
                user_id: userId,
                subscription_id: sub?.id,
                invoice_number: `INV-${Date.now().toString().slice(-6)}`,
                amount: amountInRupees,
                currency: paymentEntity.currency || 'INR',
                status: 'paid',
                issued_at: now,
                paid_at: now
              });
            }
          }
          break;
        }

        case RAZORPAY_EVENTS.SUBSCRIPTION_HALTED:
        case RAZORPAY_EVENTS.SUBSCRIPTION_PENDING: {
          const subEntity = payload.payload?.subscription?.entity;
          const rzpSubId = subEntity?.id;
          if (rzpSubId) {
            const sub = db.findSubscriptionByRazorpayId(rzpSubId);
            if (sub) {
              const { grace_period_days } = getRazorpayConfig();
              const graceEnd = new Date(Date.now() + grace_period_days * 24 * 60 * 60 * 1000).toISOString();
              db.updateSubscription(sub.id, {
                status: 'past_due',
                grace_period_end: graceEnd
              });
            }
          }
          break;
        }

        case RAZORPAY_EVENTS.SUBSCRIPTION_CANCELLED: {
          const subEntity = payload.payload?.subscription?.entity;
          const rzpSubId = subEntity?.id;
          if (rzpSubId) {
            const sub = db.findSubscriptionByRazorpayId(rzpSubId);
            if (sub) {
              db.updateSubscription(sub.id, {
                status: 'cancelled',
                ended_at: now
              });
            }
          }
          break;
        }

        case RAZORPAY_EVENTS.PAYMENT_FAILED: {
          const paymentEntity = payload.payload?.payment?.entity;
          if (paymentEntity) {
            const userId = paymentEntity.notes?.user_id;
            if (userId) {
              db.createPayment({
                user_id: userId,
                gateway: 'razorpay',
                gateway_payment_id: paymentEntity.id,
                razorpay_payment_id: paymentEntity.id,
                amount: (paymentEntity.amount || 0) / 100,
                currency: paymentEntity.currency || 'INR',
                status: 'failed',
                payment_method: paymentEntity.method || 'RAZORPAY',
                failure_code: paymentEntity.error_code,
                failure_reason: paymentEntity.error_description
              });

              // Apply grace period to subscription
              const sub = db.findSubscriptionByUserId(userId);
              if (sub && sub.status === 'active') {
                const { grace_period_days } = getRazorpayConfig();
                const graceEnd = new Date(Date.now() + grace_period_days * 24 * 60 * 60 * 1000).toISOString();
                db.updateSubscription(sub.id, {
                  status: 'past_due',
                  grace_period_end: graceEnd
                });
              }
            }
          }
          break;
        }

        case RAZORPAY_EVENTS.INVOICE_PAID: {
          const invoiceEntity = payload.payload?.invoice?.entity;
          if (invoiceEntity) {
            const existingInv = db.findInvoiceByRazorpayId(invoiceEntity.id);
            if (existingInv) {
              db.updateInvoice(existingInv.id, {
                status: 'paid',
                paid_at: now
              });
            }
          }
          break;
        }

        default:
          console.log(`[BillingService Webhook] Unhandled event type: ${eventType}`);
      }

      db.updateWebhookEvent(webhookRecord.id, {
        processing_status: 'processed',
        processed_at: now
      });

      return { status: 'processed', event_type: eventType };
    } catch (err: any) {
      console.error('[BillingService Webhook] Processing error:', err);
      db.updateWebhookEvent(webhookRecord.id, {
        processing_status: 'failed',
        error_message: err.message
      });
      throw err;
    }
  }
}
