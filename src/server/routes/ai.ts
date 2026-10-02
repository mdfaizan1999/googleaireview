import { Router, Response } from 'express';
import { db } from '../database';
import { authMiddleware, AuthenticatedRequest } from '../auth';
import { AIService } from '../services/ai';
import { GoogleBusinessProfileService } from '../services/google';
import { isValidTone, isValidLanguage, AITone, AILanguage } from '../config/ai';

export const aiRouter = Router();

aiRouter.use(authMiddleware);

/**
 * Helper to verify that the review exists and belongs to a business owned by the user.
 */
function verifyReviewOwnership(req: AuthenticatedRequest, reviewId: string) {
  // Check google_reviews first
  let review = db.findGoogleReviewById(reviewId);
  let isGoogleReview = true;

  if (!review) {
    // Check internal funnel reviews
    const internalReview = db.findReviewById(reviewId);
    if (!internalReview) {
      return { status: 'NOT_FOUND' as const };
    }
    isGoogleReview = false;
    review = {
      id: internalReview.id,
      business_id: internalReview.business_id,
      google_location_link_id: '',
      google_review_id: internalReview.google_review_id || '',
      reviewer_name: internalReview.reviewer_name,
      star_rating: internalReview.rating,
      review_text: internalReview.comment,
      has_reply: internalReview.reply_status === 'replied',
      synced_at: internalReview.created_at,
      created_at: internalReview.created_at,
      updated_at: internalReview.updated_at
    };
  }

  const business = db.findBusinessById(review.business_id);
  if (!business || business.user_id !== req.user?.id) {
    return { status: 'FORBIDDEN' as const };
  }

  return { status: 'OK' as const, review, business, isGoogleReview };
}

// ═══════════════════════════════════════════
// 1. GENERATE REPLY SUGGESTION
// ═══════════════════════════════════════════
// POST /api/v1/ai/reviews/:reviewId/reply-suggestion
aiRouter.post('/reviews/:reviewId/reply-suggestion', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { reviewId } = req.params;
  const { tone = 'professional', language = 'en' } = req.body;

  if (tone && !isValidTone(tone)) {
    res.status(422).json({
      success: false,
      message: 'Invalid tone specified. Supported tones: professional, friendly, empathetic, concise.'
    });
    return;
  }

  if (language && !isValidLanguage(language)) {
    res.status(422).json({
      success: false,
      message: 'Invalid language specified. Supported languages: en (English), hi (Hindi).'
    });
    return;
  }

  const check = verifyReviewOwnership(req, reviewId);
  if (check.status === 'NOT_FOUND') {
    res.status(404).json({ success: false, message: 'Review not found.' });
    return;
  }
  if (check.status === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied: You do not own this review.' });
    return;
  }

  const { review, business } = check;

  // Resolve location context if available
  let locationName = '';
  if (review.business_location_id) {
    const loc = db.findLocationById(review.business_location_id);
    if (loc) locationName = loc.name;
  }

  try {
    const suggestionResult = await AIService.generateReplySuggestion({
      userId: req.user.id,
      businessId: business.id,
      reviewId: review.id,
      reviewerName: review.reviewer_name || 'Customer',
      starRating: review.star_rating,
      reviewText: review.review_text,
      businessName: business.name,
      businessCategory: business.category,
      businessDescription: business.description,
      locationName,
      tone,
      language
    });

    // Store in ai_reply_suggestions with status 'generated'
    const storedSuggestion = db.createAISuggestion({
      review_id: review.id,
      business_id: business.id,
      provider: suggestionResult.provider,
      model: suggestionResult.model,
      tone: suggestionResult.tone,
      language: suggestionResult.language,
      suggestion: suggestionResult.suggestion,
      prompt_version: suggestionResult.promptVersion,
      status: 'generated'
    });

    res.json({
      success: true,
      message: 'AI reply suggestion generated successfully. Explicit user approval required to publish.',
      data: storedSuggestion
    });
  } catch (err: any) {
    res.status(err.message?.includes('Monthly AI generation limit') ? 429 : 500).json({
      success: false,
      message: err.message || 'Failed to generate AI reply suggestion.'
    });
  }
});

// ═══════════════════════════════════════════
// 2. ANALYZE REVIEW SENTIMENT & TOPICS
// ═══════════════════════════════════════════
// POST /api/v1/ai/reviews/:reviewId/analyze
aiRouter.post('/reviews/:reviewId/analyze', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { reviewId } = req.params;
  const check = verifyReviewOwnership(req, reviewId);

  if (check.status === 'NOT_FOUND') {
    res.status(404).json({ success: false, message: 'Review not found.' });
    return;
  }
  if (check.status === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied: You do not own this review.' });
    return;
  }

  const { review, business } = check;

  try {
    const analysisResult = await AIService.analyzeReview({
      userId: req.user.id,
      businessId: business.id,
      reviewId: review.id,
      reviewerName: review.reviewer_name || 'Customer',
      starRating: review.star_rating,
      reviewText: review.review_text,
      businessName: business.name,
      businessCategory: business.category
    });

    const storedAnalysis = db.upsertAIAnalysis({
      review_id: review.id,
      business_id: business.id,
      provider: analysisResult.provider,
      model: analysisResult.model,
      sentiment: analysisResult.sentiment,
      urgency: analysisResult.urgency,
      topics: analysisResult.topics,
      summary: analysisResult.summary,
      confidence: analysisResult.confidence,
      prompt_version: analysisResult.promptVersion
    });

    res.json({
      success: true,
      data: storedAnalysis
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to analyze review.'
    });
  }
});

// ═══════════════════════════════════════════
// 3. GET REVIEW SUGGESTIONS & ANALYSIS
// ═══════════════════════════════════════════
// GET /api/v1/ai/reviews/:reviewId/suggestions
aiRouter.get('/reviews/:reviewId/suggestions', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { reviewId } = req.params;
  const check = verifyReviewOwnership(req, reviewId);

  if (check.status === 'NOT_FOUND') {
    res.status(404).json({ success: false, message: 'Review not found.' });
    return;
  }
  if (check.status === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied.' });
    return;
  }

  const suggestions = db.findAISuggestionsByReviewId(reviewId);
  const analysis = db.findAIAnalysisByReviewId(reviewId);

  res.json({
    success: true,
    data: {
      suggestions,
      analysis: analysis || null
    }
  });
});

// ═══════════════════════════════════════════
// 4. UPDATE SUGGESTION (EDIT / ACCEPT / REJECT)
// ═══════════════════════════════════════════
// PATCH /api/v1/ai/suggestions/:suggestionId
aiRouter.patch('/suggestions/:suggestionId', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { suggestionId } = req.params;
  const { status, suggestion } = req.body;

  const existing = db.findAISuggestionById(suggestionId);
  if (!existing) {
    res.status(404).json({ success: false, message: 'Suggestion not found.' });
    return;
  }

  const business = db.findBusinessById(existing.business_id);
  if (!business || business.user_id !== req.user.id) {
    res.status(403).json({ success: false, message: 'Access denied: You do not own this suggestion.' });
    return;
  }

  const updates: Partial<typeof existing> = {};
  if (status) {
    const validStatuses = ['generated', 'edited', 'accepted', 'rejected', 'published', 'failed'];
    if (!validStatuses.includes(status)) {
      res.status(422).json({ success: false, message: 'Invalid status.' });
      return;
    }
    updates.status = status;
  }
  if (suggestion && typeof suggestion === 'string') {
    updates.suggestion = suggestion.trim();
    if (!status) {
      updates.status = 'edited';
    }
  }

  const updated = db.updateAISuggestion(suggestionId, updates);

  res.json({
    success: true,
    data: updated
  });
});

// ═══════════════════════════════════════════
// 5. APPROVE AND PUBLISH SUGGESTION TO GOOGLE
// ═══════════════════════════════════════════
// POST /api/v1/ai/suggestions/:suggestionId/approve-and-publish
aiRouter.post('/suggestions/:suggestionId/approve-and-publish', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { suggestionId } = req.params;
  const { replyText } = req.body; // Optional override if user edited in the approval form

  const suggestion = db.findAISuggestionById(suggestionId);
  if (!suggestion) {
    res.status(404).json({ success: false, message: 'Suggestion not found.' });
    return;
  }

  const business = db.findBusinessById(suggestion.business_id);
  if (!business || business.user_id !== req.user.id) {
    res.status(403).json({ success: false, message: 'Access denied: You do not own this suggestion.' });
    return;
  }

  const finalReply = (replyText && typeof replyText === 'string') ? replyText.trim() : suggestion.suggestion;

  if (!finalReply) {
    res.status(422).json({ success: false, message: 'Reply text cannot be empty.' });
    return;
  }

  // Find Google review
  const googleReview = db.findGoogleReviewById(suggestion.review_id);
  if (!googleReview) {
    res.status(400).json({
      success: false,
      message: 'This suggestion is not associated with an active Google Review.'
    });
    return;
  }

  const link = db.findGoogleLocationLinkById(googleReview.google_location_link_id);
  if (!link) {
    res.status(400).json({
      success: false,
      message: 'This review is not associated with an active Google location link.'
    });
    return;
  }

  try {
    // Call Google reply API via GoogleBusinessProfileService
    const googleResult = await GoogleBusinessProfileService.replyToReview(
      link.google_connection_id,
      link.google_location_id,
      googleReview.google_review_id,
      finalReply
    );

    // Update google_review record
    const updatedReview = db.updateGoogleReview(googleReview.id, {
      google_reply_text: finalReply,
      google_reply_updated_at: new Date().toISOString(),
      has_reply: true
    });

    // Mark suggestion as published
    db.updateAISuggestion(suggestion.id, {
      suggestion: finalReply,
      status: 'published'
    });

    // Log audit
    db.logAudit({
      user_id: req.user.id,
      action: 'review.ai_reply_published',
      entity_type: 'google_review',
      entity_id: googleReview.id,
      new_values: { reply: finalReply, suggestion_id: suggestion.id }
    });

    res.json({
      success: true,
      message: 'AI suggestion approved and successfully published to Google Business Profile!',
      data: {
        review: updatedReview,
        google_result: googleResult
      }
    });
  } catch (err: any) {
    db.updateAISuggestion(suggestion.id, { status: 'failed' });
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to publish reply to Google.'
    });
  }
});

// ═══════════════════════════════════════════
// 6. GET AI USAGE STATS & QUOTA
// ═══════════════════════════════════════════
// GET /api/v1/ai/usage
aiRouter.get('/usage', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { business_id } = req.query;
  const userBusinesses = db.findBusinessesByUserId(req.user.id);

  if (userBusinesses.length === 0) {
    res.json({
      success: true,
      data: { monthlyCount: 0, limit: 100, remaining: 100, logs: [] }
    });
    return;
  }

  const targetBiz = (business_id && typeof business_id === 'string')
    ? userBusinesses.find((b) => b.id === business_id)
    : userBusinesses[0];

  if (!targetBiz) {
    res.status(403).json({ success: false, message: 'Business not found or access denied.' });
    return;
  }

  const stats = db.getAIUsageStats(targetBiz.id);

  res.json({
    success: true,
    data: stats
  });
});
