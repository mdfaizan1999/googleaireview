import { AIProviderInterface, ReplySuggestionContext, ReplySuggestionResult, ReviewAnalysisContext, ReviewAnalysisResult } from './types';
import { GeminiProvider } from './providers/gemini';
import { OpenAIProvider } from './providers/openai';
import { MockProvider } from './providers/mock';
import { getAIConfig, isValidTone, isValidLanguage, AITone, AILanguage } from '../../config/ai';
import { db } from '../../database';

export class AIService {
  private static providers: Record<string, AIProviderInterface> = {
    gemini: new GeminiProvider(),
    openai: new OpenAIProvider(),
    mock: new MockProvider()
  };

  /**
   * Resolves the active AI provider based on configuration and credential status.
   */
  public static getProvider(): AIProviderInterface {
    const config = getAIConfig();
    const primary = this.providers[config.provider];

    if (primary && primary.isConfigured()) {
      return primary;
    }

    // Secondary check: if gemini was requested but not configured, try openai if configured
    if (config.provider === 'gemini' && this.providers.openai.isConfigured()) {
      return this.providers.openai;
    }

    // If openai was requested but not configured, try gemini
    if (config.provider === 'openai' && this.providers.gemini.isConfigured()) {
      return this.providers.gemini;
    }

    // Graceful offline/simulation fallback to MockProvider
    return this.providers.mock;
  }

  /**
   * Checks whether the business has available AI generation quota for the current month.
   */
  public static checkUsageLimit(businessId: string): { allowed: boolean; count: number; limit: number; remaining: number } {
    const stats = db.getAIUsageStats(businessId);
    return {
      allowed: stats.remaining > 0,
      count: stats.monthlyCount,
      limit: stats.limit,
      remaining: stats.remaining
    };
  }

  /**
   * Sanitizes review text to prevent prompt injection and extract clean context.
   */
  private static sanitizeReviewText(text?: string): string {
    if (!text) return '';
    // Strip control characters while preserving unicode and multiline
    return text
      .replace(/[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g, '')
      .replace(/<<<|>>>/g, '')
      .trim();
  }

  /**
   * Generates an AI reply suggestion with quota enforcement, validation, and usage logging.
   */
  public static async generateReplySuggestion(params: {
    userId: string;
    businessId: string;
    reviewId: string;
    reviewerName: string;
    starRating: number;
    reviewText?: string;
    businessName: string;
    businessCategory: string;
    businessDescription?: string;
    locationName?: string;
    tone?: string;
    language?: string;
  }): Promise<ReplySuggestionResult> {
    const tone: AITone = (params.tone && isValidTone(params.tone)) ? (params.tone as AITone) : 'professional';
    const language: AILanguage = (params.language && isValidLanguage(params.language)) ? (params.language as AILanguage) : 'en';

    // Verify quota
    const quota = this.checkUsageLimit(params.businessId);
    if (!quota.allowed) {
      throw new Error(`Monthly AI generation limit reached (${quota.count}/${quota.limit}). Please upgrade your plan or wait for the next billing cycle.`);
    }

    const provider = this.getProvider();
    const cleanReviewText = this.sanitizeReviewText(params.reviewText);

    const context: ReplySuggestionContext = {
      reviewId: params.reviewId,
      reviewerName: params.reviewerName || 'Google Customer',
      starRating: Math.min(5, Math.max(1, params.starRating || 5)),
      reviewText: cleanReviewText,
      businessName: params.businessName,
      businessCategory: params.businessCategory,
      businessDescription: params.businessDescription,
      locationName: params.locationName,
      tone,
      language
    };

    let result: ReplySuggestionResult;
    try {
      result = await provider.generateReplySuggestion(context);

      // Post-generation validation & safety normalization
      if (!result.suggestion || result.suggestion.length < 5) {
        throw new Error('AI provider returned an empty or invalid suggestion.');
      }

      // Check max length
      if (result.suggestion.length > 3500) {
        result.suggestion = result.suggestion.slice(0, 3500).trim() + '...';
      }

      // Record successful usage
      db.recordAIUsage({
        business_id: params.businessId,
        user_id: params.userId,
        review_id: params.reviewId,
        provider: result.provider,
        model: result.model,
        tokens_used: result.tokensUsed || 100,
        action: 'reply_suggestion',
        status: 'success'
      });

      return result;
    } catch (err: any) {
      db.recordAIUsage({
        business_id: params.businessId,
        user_id: params.userId,
        review_id: params.reviewId,
        provider: provider.name,
        model: 'unknown',
        tokens_used: 0,
        action: 'reply_suggestion',
        status: 'failed'
      });
      throw err;
    }
  }

  /**
   * Analyzes sentiment, topics, urgency, and generates a factual summary of a review.
   */
  public static async analyzeReview(params: {
    userId: string;
    businessId: string;
    reviewId: string;
    reviewerName: string;
    starRating: number;
    reviewText?: string;
    businessName: string;
    businessCategory: string;
    locationName?: string;
  }): Promise<ReviewAnalysisResult> {
    const provider = this.getProvider();
    const cleanReviewText = this.sanitizeReviewText(params.reviewText);

    const context: ReviewAnalysisContext = {
      reviewId: params.reviewId,
      reviewerName: params.reviewerName || 'Google Customer',
      starRating: Math.min(5, Math.max(1, params.starRating || 5)),
      reviewText: cleanReviewText,
      businessName: params.businessName,
      businessCategory: params.businessCategory,
      locationName: params.locationName
    };

    const result = await provider.analyzeReview(context);

    // Record usage
    db.recordAIUsage({
      business_id: params.businessId,
      user_id: params.userId,
      review_id: params.reviewId,
      provider: result.provider,
      model: result.model,
      tokens_used: result.tokensUsed || 50,
      action: 'review_analysis',
      status: 'success'
    });

    return result;
  }
}
