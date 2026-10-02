import { AITone, AILanguage } from '../../config/ai';

export interface ReplySuggestionContext {
  reviewId: string;
  reviewerName: string;
  starRating: number;
  reviewText: string;
  businessName: string;
  businessCategory: string;
  businessDescription?: string;
  locationName?: string;
  tone: AITone;
  language: AILanguage;
}

export interface ReplySuggestionResult {
  suggestion: string;
  provider: string;
  model: string;
  tone: AITone;
  language: AILanguage;
  promptVersion: string;
  tokensUsed?: number;
}

export interface ReviewAnalysisContext {
  reviewId: string;
  reviewerName: string;
  starRating: number;
  reviewText: string;
  businessName: string;
  businessCategory: string;
  locationName?: string;
}

export interface ReviewAnalysisResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
  urgency: 'low' | 'medium' | 'high';
  summary: string;
  confidence: number;
  provider: string;
  model: string;
  promptVersion: string;
  tokensUsed?: number;
}

export interface AIProviderInterface {
  readonly name: string;
  isConfigured(): boolean;
  generateReplySuggestion(context: ReplySuggestionContext): Promise<ReplySuggestionResult>;
  analyzeReview(context: ReviewAnalysisContext): Promise<ReviewAnalysisResult>;
  generateVariants(context: ReplySuggestionContext, count?: number): Promise<ReplySuggestionResult[]>;
}
