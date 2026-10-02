import { db } from '../database';
import { PlanLimits, User, Subscription } from '../types';
import { FeatureService } from './features';

export class PlanLimitService {
  /**
   * Retrieves the configured limit for a given resource based on user's active plan.
   */
  public static limit(user: { id: string }, resource: keyof PlanLimits): number {
    const subscription = db.findSubscriptionByUserId(user.id);
    const plans = db.getPlans();

    let plan = plans.find((p) => p.id === subscription?.plan_id);

    // Fall back to free plan if expired, past due without grace, or absent
    if (!plan || !FeatureService.isSubscriptionOperational(subscription)) {
      plan = plans.find((p) => p.is_free) || plans[0];
    }

    if (!plan) return 1;

    if (plan.limits && typeof plan.limits[resource] === 'number') {
      return plan.limits[resource]!;
    }

    // Fallbacks to legacy plan fields
    if (resource === 'businesses') return plan.max_businesses ?? 1;
    if (resource === 'locations') return plan.max_locations ?? 1;
    if (resource === 'qr_codes') return plan.max_qr_codes ?? 2;
    if (resource === 'funnels') return (plan.max_qr_codes ?? 2) * 2;
    if (resource === 'monthly_scans') return plan.monthly_scans ?? 100;
    if (resource === 'ai_generations') return plan.ai_generations ?? 20;
    if (resource === 'google_reviews') return 1000;

    return 100;
  }

  /**
   * Calculates actual current usage for a given resource.
   */
  public static usage(user: { id: string }, resource: keyof PlanLimits): number {
    const userBusinesses = db.findBusinessesByUserId(user.id);
    const bizIds = new Set(userBusinesses.map((b) => b.id));

    switch (resource) {
      case 'businesses':
        return userBusinesses.length;

      case 'locations': {
        let count = 0;
        for (const biz of userBusinesses) {
          count += db.findLocationsByBusinessId(biz.id).length;
        }
        return count;
      }

      case 'funnels': {
        let count = 0;
        for (const biz of userBusinesses) {
          count += db.findFunnelsByBusinessId(biz.id).length;
        }
        return count;
      }

      case 'qr_codes': {
        let count = 0;
        for (const biz of userBusinesses) {
          count += db.findQrCodesByBusinessId(biz.id).length;
        }
        return count;
      }

      case 'ai_generations': {
        // Sum current month's AI generations across user's businesses
        let count = 0;
        for (const biz of userBusinesses) {
          const stats = db.getAIUsageStats(biz.id);
          count += stats.monthlyCount;
        }
        return count;
      }

      case 'google_reviews': {
        let count = 0;
        for (const biz of userBusinesses) {
          count += db.findGoogleReviewsByBusinessId(biz.id).length;
        }
        return count;
      }

      case 'monthly_scans': {
        let count = 0;
        for (const biz of userBusinesses) {
          const qrs = db.findQrCodesByBusinessId(biz.id);
          for (const q of qrs) {
            count += q.scan_count || 0;
          }
        }
        return count;
      }

      default:
        return 0;
    }
  }

  /**
   * Calculates remaining capacity for a given resource.
   */
  public static remaining(user: { id: string }, resource: keyof PlanLimits): number {
    const lim = this.limit(user, resource);
    const used = this.usage(user, resource);
    return Math.max(0, lim - used);
  }

  /**
   * Checks if user has enough capacity to allocate additional units of a resource.
   */
  public static canUse(user: { id: string }, resource: keyof PlanLimits, count: number = 1): boolean {
    const rem = this.remaining(user, resource);
    return rem >= count;
  }

  /**
   * Returns a complete dashboard usage summary across all key plan resources.
   */
  public static getSummary(user: { id: string }): Record<string, { used: number; limit: number; remaining: number; percentage: number }> {
    const resources: (keyof PlanLimits)[] = ['businesses', 'locations', 'funnels', 'qr_codes', 'ai_generations'];
    const summary: Record<string, { used: number; limit: number; remaining: number; percentage: number }> = {};

    for (const r of resources) {
      const used = this.usage(user, r);
      const limit = this.limit(user, r);
      const remaining = Math.max(0, limit - used);
      const percentage = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

      summary[r] = {
        used,
        limit,
        remaining,
        percentage
      };
    }

    return summary;
  }
}
