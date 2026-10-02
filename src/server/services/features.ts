import { db } from '../database';
import { PlanFeatures, User, Subscription } from '../types';

export class FeatureService {
  /**
   * Evaluates if a subscription is in a valid operational state.
   */
  public static isSubscriptionOperational(sub?: Subscription): boolean {
    if (!sub) return false;

    if (sub.status === 'active' || sub.status === 'trialing') {
      return true;
    }

    // Past due with active grace period
    if (sub.status === 'past_due' && sub.grace_period_end) {
      return new Date(sub.grace_period_end).getTime() > Date.now();
    }

    // Cancelled but still within paid current period
    if (sub.status === 'cancelled' && sub.current_period_end) {
      return new Date(sub.current_period_end).getTime() > Date.now();
    }

    return false;
  }

  /**
   * Determines whether a user has access to a specific boolean feature entitlement.
   */
  public static can(user: { id: string }, feature: keyof PlanFeatures): boolean {
    const subscription = db.findSubscriptionByUserId(user.id);
    const plans = db.getPlans();

    let plan = plans.find((p) => p.id === subscription?.plan_id);

    // If no plan, or subscription expired/halted, fall back to free plan
    if (!plan || !this.isSubscriptionOperational(subscription)) {
      plan = plans.find((p) => p.is_free) || plans[0];
    }

    if (!plan) return false;

    // Check specific feature in plan features map
    if (plan.features && typeof plan.features[feature] === 'boolean') {
      return plan.features[feature]!;
    }

    // Legacy fallback mapping
    if (feature === 'analytics') return Boolean(plan.analytics_enabled);
    if (feature === 'google_reviews' || feature === 'google_reply') return Boolean(plan.google_integration);
    if (feature === 'api_access') return Boolean(plan.api_access);
    if (feature === 'custom_branding') return Boolean(plan.white_label);
    if (feature === 'ai_review_analysis' || feature === 'ai_reply_generation') {
      return (plan.limits?.ai_generations || plan.ai_generations || 0) > 0;
    }

    return false;
  }
}
