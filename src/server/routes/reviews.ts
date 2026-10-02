import { Router, Response } from 'express';
import { db } from '../database';
import { authMiddleware, AuthenticatedRequest } from '../auth';
import { GoogleBusinessProfileService } from '../services/google';
import { FeatureService } from '../services/features';

export const reviewsRouter = Router();

reviewsRouter.use(authMiddleware);

// Helper: Verify user owns the business associated with a review
function verifyReviewOwnership(req: AuthenticatedRequest, reviewId: string) {
  const review = db.findGoogleReviewById(reviewId);
  if (!review) return { status: 'NOT_FOUND' as const };

  const business = db.findBusinessById(review.business_id);
  if (!business || business.user_id !== req.user?.id) {
    return { status: 'FORBIDDEN' as const };
  }

  return { status: 'OK' as const, review, business };
}

// ═══════════════════════════════════════════
// 1. LIST REVIEWS WITH FILTERS & PAGINATION
// ═══════════════════════════════════════════
// GET /api/v1/reviews
reviewsRouter.get('/', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const {
    business_id,
    location_id,
    rating,
    has_reply,
    from,
    to,
    search,
    page,
    per_page
  } = req.query;

  // Resolve user's businesses
  const userBusinesses = db.findBusinessesByUserId(req.user.id);
  const userBizIds = new Set(userBusinesses.map((b) => b.id));

  if (business_id && typeof business_id === 'string') {
    if (!userBizIds.has(business_id)) {
      res.status(403).json({ success: false, message: 'Access denied: You do not own this business.' });
      return;
    }
  }

  // If no specific business requested, use primary business or allow user's businesses
  const targetBusinessId = (business_id as string) || (userBusinesses[0] ? userBusinesses[0].id : undefined);

  if (!targetBusinessId) {
    res.json({
      success: true,
      data: {
        reviews: [],
        total: 0,
        page: 1,
        per_page: 20,
        total_pages: 1,
        stats: {
          total_reviews: 0,
          average_rating: 5.0,
          replied_count: 0,
          unreplied_count: 0,
          rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        }
      }
    });
    return;
  }

  let hasReplyFilter: boolean | undefined = undefined;
  if (has_reply === 'true') hasReplyFilter = true;
  if (has_reply === 'false') hasReplyFilter = false;

  const result = db.queryGoogleReviews({
    business_id: targetBusinessId,
    location_id: location_id as string | undefined,
    rating: rating ? Number(rating) : undefined,
    has_reply: hasReplyFilter,
    from: from as string | undefined,
    to: to as string | undefined,
    search: search as string | undefined,
    page: page ? Number(page) : 1,
    per_page: per_page ? Number(per_page) : 20
  });

  res.json({
    success: true,
    data: result
  });
});

// ═══════════════════════════════════════════
// 2. REVIEW DETAIL
// ═══════════════════════════════════════════
// GET /api/v1/reviews/:id
reviewsRouter.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const check = verifyReviewOwnership(req, id);

  if (check.status === 'NOT_FOUND') {
    res.status(404).json({ success: false, message: 'Review not found.' });
    return;
  }
  if (check.status === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied: You do not have permission to view this review.' });
    return;
  }

  const review = check.review!;
  const link = db.findGoogleLocationLinkById(review.google_location_link_id);
  const location = review.business_location_id ? db.findLocationById(review.business_location_id) : undefined;

  res.json({
    success: true,
    data: {
      id: review.id,
      google_review_id: review.google_review_id,
      reviewer_name: review.reviewer_name || 'Anonymous Reviewer',
      reviewer_profile_url: review.reviewer_profile_url,
      reviewer_photo_url: review.reviewer_photo_url,
      star_rating: review.star_rating,
      review_text: review.review_text || '',
      review_created_at: review.review_created_at,
      review_updated_at: review.review_updated_at,
      google_reply_text: review.google_reply_text,
      google_reply_updated_at: review.google_reply_updated_at,
      has_reply: review.has_reply,
      location: location ? { id: location.id, name: location.name, address: location.address } : null,
      google_location_name: link?.google_location_name || 'Google Business Location',
      synced_at: review.synced_at
    }
  });
});

// ═══════════════════════════════════════════
// 3. PUBLISH REVIEW REPLY
// ═══════════════════════════════════════════
// POST /api/v1/reviews/:id/reply
reviewsRouter.post('/:id/reply', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const { reply } = req.body;

  if (!reply || typeof reply !== 'string' || reply.trim().length === 0) {
    res.status(422).json({ success: false, message: 'Reply text cannot be empty.' });
    return;
  }

  // Check Google Reply Entitlement
  if (!FeatureService.can(req.user, 'google_reply')) {
    res.status(403).json({
      success: false,
      message: 'Google Review replies are not enabled on your current plan. Please upgrade your subscription.',
      meta: { upgrade_required: true }
    });
    return;
  }

  if (reply.trim().length > 4096) {
    res.status(422).json({ success: false, message: 'Reply text must be 4096 characters or fewer.' });
    return;
  }

  const check = verifyReviewOwnership(req, id);
  if (check.status === 'NOT_FOUND') {
    res.status(404).json({ success: false, message: 'Review not found.' });
    return;
  }
  if (check.status === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied: You cannot reply to another business’s reviews.' });
    return;
  }

  const review = check.review!;
  const link = db.findGoogleLocationLinkById(review.google_location_link_id);

  if (!link) {
    res.status(400).json({
      success: false,
      message: 'This review is not associated with an active Google location link.'
    });
    return;
  }

  try {
    const googleResult = await GoogleBusinessProfileService.replyToReview(
      link.google_connection_id,
      link.google_location_id,
      review.google_review_id,
      reply.trim()
    );

    // Update local record only after Google confirms success
    const updatedReview = db.updateGoogleReview(review.id, {
      google_reply_text: googleResult.comment,
      google_reply_updated_at: googleResult.updateTime,
      has_reply: true
    });

    db.logAudit({
      user_id: req.user.id,
      action: 'review.reply_published',
      entity_type: 'google_review',
      entity_id: review.id
    });

    res.json({
      success: true,
      message: 'Reply published to Google Business Profile successfully.',
      data: updatedReview
    });
  } catch (err: any) {
    console.error(`[ReviewReply] Error replying to review ${review.id}:`, err);
    res.status(502).json({
      success: false,
      message: `Google rejected reply: ${err.message}`
    });
  }
});

// ═══════════════════════════════════════════
// 4. UPDATE REVIEW REPLY
// ═══════════════════════════════════════════
// PUT /api/v1/reviews/:id/reply
reviewsRouter.put('/:id/reply', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const { reply } = req.body;

  if (!reply || typeof reply !== 'string' || reply.trim().length === 0) {
    res.status(422).json({ success: false, message: 'Reply text cannot be empty.' });
    return;
  }

  const check = verifyReviewOwnership(req, id);
  if (check.status === 'NOT_FOUND') {
    res.status(404).json({ success: false, message: 'Review not found.' });
    return;
  }
  if (check.status === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied.' });
    return;
  }

  const review = check.review!;
  const link = db.findGoogleLocationLinkById(review.google_location_link_id);

  if (!link) {
    res.status(400).json({ success: false, message: 'Active Google location link not found.' });
    return;
  }

  try {
    const googleResult = await GoogleBusinessProfileService.replyToReview(
      link.google_connection_id,
      link.google_location_id,
      review.google_review_id,
      reply.trim()
    );

    const updatedReview = db.updateGoogleReview(review.id, {
      google_reply_text: googleResult.comment,
      google_reply_updated_at: googleResult.updateTime,
      has_reply: true
    });

    db.logAudit({
      user_id: req.user.id,
      action: 'review.reply_updated',
      entity_type: 'google_review',
      entity_id: review.id
    });

    res.json({
      success: true,
      message: 'Reply updated on Google Business Profile successfully.',
      data: updatedReview
    });
  } catch (err: any) {
    res.status(502).json({
      success: false,
      message: `Google rejected reply update: ${err.message}`
    });
  }
});

// ═══════════════════════════════════════════
// 5. DELETE REVIEW REPLY
// ═══════════════════════════════════════════
// DELETE /api/v1/reviews/:id/reply
reviewsRouter.delete('/:id/reply', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const check = verifyReviewOwnership(req, id);

  if (check.status === 'NOT_FOUND') {
    res.status(404).json({ success: false, message: 'Review not found.' });
    return;
  }
  if (check.status === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied.' });
    return;
  }

  const review = check.review!;
  const link = db.findGoogleLocationLinkById(review.google_location_link_id);

  if (!link) {
    res.status(400).json({ success: false, message: 'Active Google location link not found.' });
    return;
  }

  try {
    await GoogleBusinessProfileService.deleteReviewReply(
      link.google_connection_id,
      link.google_location_id,
      review.google_review_id
    );

    const updatedReview = db.updateGoogleReview(review.id, {
      google_reply_text: undefined,
      google_reply_updated_at: undefined,
      has_reply: false
    });

    db.logAudit({
      user_id: req.user.id,
      action: 'review.reply_deleted',
      entity_type: 'google_review',
      entity_id: review.id
    });

    res.json({
      success: true,
      message: 'Review reply deleted from Google Business Profile successfully.',
      data: updatedReview
    });
  } catch (err: any) {
    res.status(502).json({
      success: false,
      message: `Failed to delete reply from Google: ${err.message}`
    });
  }
});
