import { Router, Response } from 'express';
import { db } from '../database';
import { authMiddleware, AuthenticatedRequest } from '../auth';

export const dashboardRouter = Router();

dashboardRouter.use(authMiddleware);

// GET /api/v1/dashboard/stats
dashboardRouter.get('/stats', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const businesses = db.findBusinessesByUserId(req.user.id);
  const primaryBusiness = businesses[0];

  if (!primaryBusiness) {
    res.json({
      success: true,
      data: {
        has_business: false,
        total_scans: 0,
        total_reviews: 0,
        average_rating: 5.0,
        positive_reviews: 0,
        intercepted_negative: 0
      }
    });
    return;
  }

  const reviews = db.findReviewsByBusinessId(primaryBusiness.id);
  const positiveReviews = reviews.filter((r) => r.rating >= (primaryBusiness.min_star_threshold || 4));
  const negativeReviews = reviews.filter((r) => r.rating < (primaryBusiness.min_star_threshold || 4));
  const avgRating = reviews.length > 0
    ? Number((reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length).toFixed(1))
    : 4.9;

  const subscription = db.findSubscriptionByUserId(req.user.id);
  const plans = db.getPlans();
  const currentPlan = plans.find((p) => p.id === subscription?.plan_id) || plans[0];

  res.json({
    success: true,
    data: {
      has_business: true,
      business: primaryBusiness,
      subscription: {
        ...subscription,
        plan_name: currentPlan.name,
        plan_slug: currentPlan.slug
      },
      stats: {
        total_scans: 48,
        total_reviews: reviews.length,
        average_rating: avgRating,
        positive_reviews: positiveReviews.length,
        intercepted_negative: negativeReviews.length,
        conversion_rate: '34.8%'
      },
      recent_reviews: reviews.slice(0, 5)
    }
  });
});
