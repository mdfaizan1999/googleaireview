import { AIProviderInterface, ReplySuggestionContext, ReplySuggestionResult, ReviewAnalysisContext, ReviewAnalysisResult } from '../types';
import { getAIConfig, SUPPORTED_TONES, SUPPORTED_LANGUAGES, AI_SAFETY_RULES } from '../../../config/ai';
import { MockProvider } from './mock';

export class OpenAIProvider implements AIProviderInterface {
  public readonly name = 'openai';
  private fallbackProvider = new MockProvider();

  public isConfigured(): boolean {
    const key = process.env.OPENAI_API_KEY;
    return Boolean(key && key.startsWith('sk-') && key.length > 20);
  }

  public async generateReplySuggestion(context: ReplySuggestionContext): Promise<ReplySuggestionResult> {
    const config = getAIConfig();
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    if (!this.isConfigured()) {
      return this.fallbackProvider.generateReplySuggestion(context);
    }

    try {
      const toneConfig = SUPPORTED_TONES[context.tone] || SUPPORTED_TONES.professional;
      const langConfig = SUPPORTED_LANGUAGES[context.language] || SUPPORTED_LANGUAGES.en;

      const systemPrompt = `You are an authentic customer-review response assistant for "${context.businessName}".
${AI_SAFETY_RULES}
Tone: ${toneConfig.instruction}
Language: ${langConfig.instruction}
Return only the proposed public reply without quotes or conversational commentary.`;

      const userPrompt = `Business: ${context.businessName} (${context.businessCategory})
Reviewer: ${context.reviewerName}
Rating: ${context.starRating} Stars
Review text:
<<<CUSTOMER_REVIEW>>>
${context.reviewText || '[Star rating only]'}
<<<END_CUSTOMER_REVIEW>>>`;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), config.timeout_ms);

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: config.temperature,
          max_tokens: config.max_tokens
        }),
        signal: controller.signal
      });

      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`OpenAI API error: ${res.statusText}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim() || '';

      if (!content) {
        return this.fallbackProvider.generateReplySuggestion(context);
      }

      return {
        suggestion: content,
        provider: 'openai',
        model,
        tone: context.tone,
        language: context.language,
        promptVersion: config.prompt_version,
        tokensUsed: data.usage?.total_tokens || 110
      };
    } catch (err) {
      console.warn('[OpenAIProvider] Request failed, falling back to mock:', err);
      return this.fallbackProvider.generateReplySuggestion(context);
    }
  }

  public async analyzeReview(context: ReviewAnalysisContext): Promise<ReviewAnalysisResult> {
    const config = getAIConfig();
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    if (!this.isConfigured()) {
      return this.fallbackProvider.analyzeReview(context);
    }

    try {
      const prompt = `Analyze this review for "${context.businessName}".
Return JSON only:
{
  "sentiment": "positive" | "neutral" | "negative",
  "topics": string[],
  "urgency": "low" | "medium" | "high",
  "summary": string,
  "confidence": number
}
Rating: ${context.starRating}, Comment: "${context.reviewText || ''}"`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model,
          response_format: { type: 'json_object' },
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2
        })
      });

      if (!res.ok) throw new Error(`OpenAI error: ${res.statusText}`);
      const data = await res.json();
      const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');

      return {
        sentiment: parsed.sentiment || (context.starRating >= 4 ? 'positive' : context.starRating <= 2 ? 'negative' : 'neutral'),
        topics: parsed.topics || ['service'],
        urgency: parsed.urgency || (context.starRating <= 2 ? 'high' : 'low'),
        summary: parsed.summary || `Customer rated ${context.starRating}/5 stars.`,
        confidence: parsed.confidence || 0.9,
        provider: 'openai',
        model,
        promptVersion: config.prompt_version,
        tokensUsed: data.usage?.total_tokens || 70
      };
    } catch (err) {
      console.warn('[OpenAIProvider] analyzeReview failed, falling back to mock:', err);
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
