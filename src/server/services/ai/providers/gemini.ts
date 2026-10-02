import { GoogleGenAI } from '@google/genai';
import { AIProviderInterface, ReplySuggestionContext, ReplySuggestionResult, ReviewAnalysisContext, ReviewAnalysisResult } from '../types';
import { getAIConfig, SUPPORTED_TONES, SUPPORTED_LANGUAGES, AI_SAFETY_RULES } from '../../../config/ai';
import { MockProvider } from './mock';

export class GeminiProvider implements AIProviderInterface {
  public readonly name = 'gemini';
  private fallbackProvider = new MockProvider();

  public isConfigured(): boolean {
    const key = process.env.GEMINI_API_KEY;
    return Boolean(key && !key.includes('MY_GEMINI_API_KEY') && key.trim().length > 5);
  }

  private getClient(): GoogleGenAI {
    return new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }

  public async generateReplySuggestion(context: ReplySuggestionContext): Promise<ReplySuggestionResult> {
    const config = getAIConfig();
    const model = config.model || 'gemini-3.8-flash';

    if (!this.isConfigured()) {
      return this.fallbackProvider.generateReplySuggestion(context);
    }

    try {
      const ai = this.getClient();
      const toneConfig = SUPPORTED_TONES[context.tone] || SUPPORTED_TONES.professional;
      const langConfig = SUPPORTED_LANGUAGES[context.language] || SUPPORTED_LANGUAGES.en;

      const systemPrompt = `You are an elite, authentic customer-review response assistant for "${context.businessName}" (${context.businessCategory}).
Your task is to draft a polite, highly authentic, human-sounding response to a customer's Google review.

${AI_SAFETY_RULES}

TONE INSTRUCTIONS:
${toneConfig.instruction}

LANGUAGE INSTRUCTIONS:
${langConfig.instruction}

OUTPUT CONSTRAINTS:
- Return ONLY the final reply text to be posted publicly on Google.
- Do NOT wrap in quotes.
- Do NOT include any preamble, conversational greeting to the user, or explanatory notes like "Here is your reply:".
- Keep length between 2 to 5 sentences unless "concise" tone is chosen.`;

      const userPrompt = `BUSINESS INFORMATION:
Name: ${context.businessName}
Category: ${context.businessCategory}
${context.locationName ? `Location: ${context.locationName}` : ''}
${context.businessDescription ? `Description: ${context.businessDescription}` : ''}

CUSTOMER REVIEW DETAILS:
Reviewer Name: ${context.reviewerName || 'Google Reviewer'}
Star Rating: ${context.starRating} out of 5 stars
<<<CUSTOMER_REVIEW>>>
${context.reviewText ? context.reviewText.trim() : '[Review left with star rating only, no written comment.]'}
<<<END_CUSTOMER_REVIEW>>>

Draft an authentic, safe, and professional response now:`;

      const response = await ai.models.generateContent({
        model,
        contents: `${systemPrompt}\n\n${userPrompt}`,
        config: {
          temperature: config.temperature,
          maxOutputTokens: config.max_tokens
        }
      });

      let reply = (response.text || '').trim();
      // Remove any surrounding quotes
      if ((reply.startsWith('"') && reply.endsWith('"')) || (reply.startsWith('“') && reply.endsWith('”'))) {
        reply = reply.slice(1, -1).trim();
      }

      if (!reply) {
        return this.fallbackProvider.generateReplySuggestion(context);
      }

      return {
        suggestion: reply,
        provider: 'gemini',
        model,
        tone: context.tone,
        language: context.language,
        promptVersion: config.prompt_version,
        tokensUsed: response.usageMetadata?.totalTokenCount || 120
      };
    } catch (err) {
      console.warn('[GeminiProvider] generateReplySuggestion failed, falling back to heuristic mock:', err);
      return this.fallbackProvider.generateReplySuggestion(context);
    }
  }

  public async analyzeReview(context: ReviewAnalysisContext): Promise<ReviewAnalysisResult> {
    const config = getAIConfig();
    const model = config.model || 'gemini-3.8-flash';

    if (!this.isConfigured()) {
      return this.fallbackProvider.analyzeReview(context);
    }

    try {
      const ai = this.getClient();

      const prompt = `You are a customer sentiment and review intelligence classifier.
Analyze the following Google review for "${context.businessName}".

CRITICAL: AI classifications are suggestions, not absolute objective facts.
Respond with a strict JSON object having this exact schema:
{
  "sentiment": "positive" | "neutral" | "negative",
  "topics": string[], // List 1 to 4 core themes, e.g. ["service", "staff", "speed", "pricing", "cleanliness", "food", "environment"]
  "urgency": "low" | "medium" | "high",
  "summary": string, // Max 1 sentence factual summary of customer sentiment
  "confidence": number // Number between 0.50 and 0.99
}

CUSTOMER REVIEW:
Rating: ${context.starRating} Stars
Reviewer: ${context.reviewerName || 'Anonymous'}
Comment: ${context.reviewText ? context.reviewText : '[No text]'}

Respond with JSON only:`;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });

      const rawText = (response.text || '').trim();
      const parsed = JSON.parse(rawText);

      const sentiment = ['positive', 'neutral', 'negative'].includes(parsed.sentiment) ? parsed.sentiment : (context.starRating >= 4 ? 'positive' : context.starRating <= 2 ? 'negative' : 'neutral');
      const urgency = ['low', 'medium', 'high'].includes(parsed.urgency) ? parsed.urgency : (context.starRating <= 2 ? 'high' : 'low');
      const topics = Array.isArray(parsed.topics) && parsed.topics.length > 0 ? parsed.topics.map(String) : ['general_experience'];
      const summary = typeof parsed.summary === 'string' && parsed.summary.length > 0 ? parsed.summary : `Review rating ${context.starRating}/5.`;
      const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.90;

      return {
        sentiment,
        topics,
        urgency,
        summary,
        confidence,
        provider: 'gemini',
        model,
        promptVersion: config.prompt_version,
        tokensUsed: response.usageMetadata?.totalTokenCount || 85
      };
    } catch (err) {
      console.warn('[GeminiProvider] analyzeReview failed, falling back to mock analyzer:', err);
      return this.fallbackProvider.analyzeReview(context);
    }
  }

  public async generateVariants(context: ReplySuggestionContext, count: number = 3): Promise<ReplySuggestionResult[]> {
    const tones: (typeof context.tone)[] = ['professional', 'friendly', 'empathetic'];
    const results: ReplySuggestionResult[] = [];
    for (let i = 0; i < Math.min(count, tones.length); i++) {
      const res = await this.generateReplySuggestion({ ...context, tone: tones[i] });
      results.push(res);
    }
    return results;
  }
}
