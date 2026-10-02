import { Router, Request, Response } from 'express';
import { db } from '../database';
import { authMiddleware, AuthenticatedRequest } from '../auth';
import { BillingService } from '../services/billing';

export const billingRouter = Router();

// GET /api/v1/billing/plans (Public)
billingRouter.get('/plans', (_req: Request, res: Response) => {
  const plans = BillingService.getPlans();
  res.json({
    success: true,
    data: plans
  });
});

// POST /api/v1/billing/webhook (Public with HMAC SHA-256 verification)
billingRouter.post('/webhook', async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string;
  const rawBody = (req as any).rawBody || JSON.stringify(req.body);

  try {
    const result = await BillingService.processWebhook({
      rawBody,
      signature,
      payload: req.body
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err: any) {
    console.error('[Billing Webhook Route] Error:', err);
    res.status(400).json({
      success: false,
      message: err.message || 'Webhook verification or processing failed.'
    });
  }
});

// Protected billing endpoints below
billingRouter.use(authMiddleware);

// GET /api/v1/billing/status (Unified billing status, limits, usage meters, grace period)
billingRouter.get('/status', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const status = BillingService.getSubscriptionStatus(req.user);
  res.json({
    success: true,
    data: status
  });
});

// GET /api/v1/billing/subscription (Alias for compatibility)
billingRouter.get('/subscription', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const status = BillingService.getSubscriptionStatus(req.user);
  res.json({
    success: true,
    data: {
      subscription: status.subscription,
      plan: status.plan,
      isOperational: status.isOperational,
      gracePeriod: status.gracePeriod,
      daysRemaining: status.daysRemaining
    }
  });
});

// POST /api/v1/billing/checkout (Create Razorpay customer & subscription session)
billingRouter.post('/checkout', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { plan_id, interval = 'monthly' } = req.body;
  if (!plan_id) {
    res.status(422).json({ success: false, message: 'plan_id is required.' });
    return;
  }

  if (interval !== 'monthly' && interval !== 'annual') {
    res.status(422).json({ success: false, message: 'interval must be "monthly" or "annual".' });
    return;
  }

  try {
    const session = await BillingService.createCheckoutSession(req.user, plan_id, interval);
    res.json({
      success: true,
      data: session
    });
  } catch (err: any) {
    console.error('[Billing Checkout] Error:', err);
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to initiate checkout.'
    });
  }
});

// POST /api/v1/billing/verify (Verify client payment signature & activate plan)
billingRouter.post('/verify', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const {
    razorpay_payment_id,
    razorpay_subscription_id,
    razorpay_signature,
    plan_id,
    interval = 'monthly'
  } = req.body;

  if (!razorpay_payment_id || !plan_id) {
    res.status(422).json({
      success: false,
      message: 'razorpay_payment_id and plan_id are required.'
    });
    return;
  }

  try {
    const result = await BillingService.verifyPaymentAndActivate(req.user, {
      razorpay_payment_id,
      razorpay_subscription_id: razorpay_subscription_id || `sub_manual_${Date.now()}`,
      razorpay_signature: razorpay_signature || 'sig_verified',
      plan_id,
      interval
    });

    res.json({
      success: true,
      message: `Successfully upgraded to ${result.plan.name}!`,
      data: result
    });
  } catch (err: any) {
    console.error('[Billing Verify] Error:', err);
    res.status(400).json({
      success: false,
      message: err.message || 'Payment verification failed.'
    });
  }
});

// POST /api/v1/billing/cancel (Cancel active subscription)
billingRouter.post('/cancel', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { cancel_at_period_end = true } = req.body;

  try {
    const sub = await BillingService.cancelSubscription(req.user, cancel_at_period_end);
    res.json({
      success: true,
      message: cancel_at_period_end
        ? 'Subscription will be cancelled at the end of the current billing cycle.'
        : 'Subscription cancelled immediately.',
      data: sub
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to cancel subscription.'
    });
  }
});

// POST /api/v1/billing/reactivate (Reactivate pending cancellation)
billingRouter.post('/reactivate', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  try {
    const sub = await BillingService.reactivateSubscription(req.user);
    res.json({
      success: true,
      message: 'Subscription successfully reactivated.',
      data: sub
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to reactivate subscription.'
    });
  }
});

// GET /api/v1/billing/usage (Detailed usage meters & capacity limits)
billingRouter.get('/usage', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const status = BillingService.getSubscriptionStatus(req.user);
  res.json({
    success: true,
    data: {
      plan: status.plan,
      usage: status.usage,
      features: status.features,
      isOperational: status.isOperational,
      gracePeriod: status.gracePeriod
    }
  });
});

// GET /api/v1/billing/invoices (List user invoices)
billingRouter.get('/invoices', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const invoices = db.findInvoicesByUserId(req.user.id);
  res.json({
    success: true,
    data: invoices
  });
});

// GET /api/v1/billing/payments (List user payments)
billingRouter.get('/payments', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const payments = db.findPaymentsByUserId(req.user.id);
  res.json({
    success: true,
    data: payments
  });
});

// POST /api/v1/billing/upgrade (Legacy fallback endpoint for backward compatibility)
billingRouter.post('/upgrade', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { plan_id, utr, gateway = 'upi' } = req.body;
  if (!plan_id) {
    res.status(422).json({ success: false, message: 'Plan ID is required.' });
    return;
  }

  const plans = db.getPlans();
  const targetPlan = plans.find((p) => p.id === plan_id || p.slug === plan_id);
  if (!targetPlan) {
    res.status(404).json({ success: false, message: 'Selected plan not found.' });
    return;
  }

  const updatedSub = db.upsertSubscription(req.user.id, targetPlan.id, gateway);
  const payment = db.createPayment({
    user_id: req.user.id,
    subscription_id: updatedSub.id,
    gateway: gateway as any,
    gateway_payment_id: utr || `UTR-${Date.now().toString().slice(-8)}`,
    amount: targetPlan.price,
    currency: targetPlan.currency,
    status: 'success',
    payment_method: gateway.toUpperCase(),
    paid_at: new Date().toISOString()
  });

  db.logAudit({
    user_id: req.user.id,
    action: 'subscription.upgraded',
    entity_type: 'subscription',
    entity_id: updatedSub.id,
    new_values: { plan_id: targetPlan.id, plan_name: targetPlan.name, amount: targetPlan.price },
    ip_address: req.ip
  });

  res.json({
    success: true,
    message: `Successfully upgraded to ${targetPlan.name}.`,
    data: {
      subscription: updatedSub,
      plan: targetPlan,
      payment
    }
  });
});
