import { AIProviderInterface, ReplySuggestionContext, ReplySuggestionResult, ReviewAnalysisContext, ReviewAnalysisResult } from '../types';
import { getAIConfig, SUPPORTED_TONES } from '../../../config/ai';

export class MockProvider implements AIProviderInterface {
  public readonly name = 'mock';

  public isConfigured(): boolean {
    return true;
  }

  public async generateReplySuggestion(context: ReplySuggestionContext): Promise<ReplySuggestionResult> {
    const config = getAIConfig();
    const isHindi = context.language === 'hi';
    const isHighRating = context.starRating >= 4;
    const isLowRating = context.starRating <= 2;
    const reviewer = context.reviewerName && context.reviewerName !== 'Google Reviewer' 
      ? context.reviewerName 
      : (isHindi ? 'ग्राहक' : 'Guest');

    let reply = '';

    if (isHindi) {
      if (isHighRating) {
        switch (context.tone) {
          case 'friendly':
            reply = `नमस्ते ${reviewer}! आपकी सकारात्मक समीक्षा और प्यार के लिए दिल से धन्यवाद। ${context.businessName} में आपकी सेवा करना हमारे लिए बेहद खुशी की बात है। जल्द ही दोबारा पधारें!`;
            break;
          case 'concise':
            reply = `नमस्ते ${reviewer}, सकारात्मक प्रतिक्रिया के लिए धन्यवाद! हम आपके निरंतर सहयोग की सराहना करते हैं।`;
            break;
          case 'empathetic':
            reply = `नमस्ते ${reviewer}, आपके दयालु शब्दों ने हमारी पूरी टीम का उत्साह बढ़ाया है। हमें खुशी है कि आपका अनुभव उत्कृष्ट रहा। ${context.businessName} को चुनने के लिए हार्दिक आभार।`;
            break;
          case 'professional':
          default:
            reply = `नमस्ते ${reviewer}, ${context.businessName} को 5-स्टार रेटिंग और शानदार समीक्षा देने के लिए धन्यवाद। हम सदैव उच्च गुणवत्ता वाली सेवा प्रदान करने के लिए प्रतिबद्ध हैं।`;
            break;
        }
      } else if (isLowRating) {
        switch (context.tone) {
          case 'empathetic':
            reply = `नमस्ते ${reviewer}, हमें अत्यंत खेद है कि आपका अनुभव हमारी सामान्य अपेक्षाओं के अनुरूप नहीं रहा। हम आपके फीडबैक को गंभीरता से लेते हैं। कृपया हमसे सीधे संपर्क करें ताकि हम आपकी समस्या का उचित समाधान कर सकें।`;
            break;
          case 'concise':
            reply = `नमस्ते ${reviewer}, आपकी असुविधा के लिए हमें खेद है। हम आपके फीडबैक की जांच कर रहे हैं। कृपया निजी संदेश या फोन पर हमसे संपर्क करें।`;
            break;
          case 'friendly':
          case 'professional':
          default:
            reply = `नमस्ते ${reviewer}, आपके फीडबैक के लिए धन्यवाद। हमें यह जानकर निराशा हुई कि आप संतुष्ट नहीं हुए। हम लगातार अपनी सेवा में सुधार कर रहे हैं। कृपया हमसे सीधे संपर्क करें ताकि हम इस मामले को सुलझा सकें।`;
            break;
        }
      } else {
        reply = `नमस्ते ${reviewer}, ${context.businessName} के साथ अपना अनुभव साझा करने के लिए धन्यवाद। हम आपके बहुमूल्य सुझावों का स्वागत करते हैं और अगली बार आपको और भी बेहतर सेवा प्रदान करने की आशा करते हैं।`;
      }
    } else {
      // English suggestions
      if (!context.reviewText || context.reviewText.trim().length === 0) {
        if (isHighRating) {
          reply = `Thank you so much for the ${context.starRating}-star rating, ${reviewer}! We truly appreciate your support for ${context.businessName}.`;
        } else if (isLowRating) {
          reply = `Thank you for sharing your rating, ${reviewer}. We are sorry your experience did not meet expectations and would welcome the chance to learn more and make things right.`;
        } else {
          reply = `Thank you for taking the time to leave a rating, ${reviewer}. We appreciate your visit and hope to welcome you back again soon.`;
        }
      } else if (isHighRating) {
        switch (context.tone) {
          case 'friendly':
            reply = `Hi ${reviewer}! Thank you so much for the glowing review and kind words. It was an absolute delight hosting you at ${context.businessName}, and our entire team can't wait to welcome you back!`;
            break;
          case 'concise':
            reply = `Thank you for the wonderful feedback, ${reviewer}! We appreciate your support and look forward to serving you again soon.`;
            break;
          case 'empathetic':
            reply = `Dear ${reviewer}, thank you so much for taking the time to share your delightful experience with us. Knowing that our dedication made a positive impression means the world to our team at ${context.businessName}.`;
            break;
          case 'professional':
          default:
            reply = `Thank you for your generous review, ${reviewer}. We are thrilled to hear that your experience at ${context.businessName} was exceptional. We look forward to continuing to provide you with premier service.`;
            break;
        }
      } else if (isLowRating) {
        switch (context.tone) {
          case 'empathetic':
            reply = `Dear ${reviewer}, we are truly sorry to hear that your experience fell short of the standards we strive to deliver. We take your feedback seriously and want to understand how we can do better. Please consider reaching out to our management team directly so we can address your concerns.`;
            break;
          case 'concise':
            reply = `Thank you for your feedback, ${reviewer}. We apologize for falling short of your expectations and are reviewing this matter with our team. Please reach out to us directly so we can assist you.`;
            break;
          case 'friendly':
            reply = `Hi ${reviewer}, thank you for letting us know about your visit. We are really sorry that things did not go as planned. We would love the opportunity to make this right—please feel free to connect with our team directly.`;
            break;
          case 'professional':
          default:
            reply = `Thank you for sharing your feedback, ${reviewer}. At ${context.businessName}, we hold our service to high standards and regret that your visit was not completely satisfactory. We are investigating your comments with our staff and invite you to reach out to us directly to discuss your experience.`;
            break;
        }
      } else {
        // Neutral (3 stars)
        switch (context.tone) {
          case 'friendly':
            reply = `Hi ${reviewer}, thank you for visiting ${context.businessName} and sharing your feedback! We are always looking for ways to improve, and we hope to make your next experience a full 5-star visit!`;
            break;
          case 'concise':
            reply = `Thank you for your review and feedback, ${reviewer}. We value your input and look forward to serving you even better next time.`;
            break;
          case 'professional':
          default:
            reply = `Thank you for taking the time to review ${context.businessName}, ${reviewer}. We appreciate your honest feedback and will use your insights to continually enhance our customer experience.`;
            break;
        }
      }
    }

    return {
      suggestion: reply,
      provider: 'mock',
      model: 'mock-reviewer-model',
      tone: context.tone,
      language: context.language,
      promptVersion: config.prompt_version,
      tokensUsed: 65
    };
  }

  public async analyzeReview(context: ReviewAnalysisContext): Promise<ReviewAnalysisResult> {
    const config = getAIConfig();
    const text = (context.reviewText || '').toLowerCase();
    const star = context.starRating;

    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (star >= 4) sentiment = 'positive';
    else if (star <= 2) sentiment = 'negative';

    let urgency: 'low' | 'medium' | 'high' = 'low';
    if (star === 1 || text.includes('terrible') || text.includes('worst') || text.includes('rude') || text.includes('fraud') || text.includes('scam')) {
      urgency = 'high';
    } else if (star === 2 || text.includes('slow') || text.includes('waited') || text.includes('disappointed')) {
      urgency = 'medium';
    }

    const topics: string[] = [];
    if (text.includes('service') || text.includes('staff') || text.includes('doctor') || text.includes('nurse') || text.includes('reception') || text.includes('team')) {
      topics.push('staff');
    }
    if (text.includes('food') || text.includes('taste') || text.includes('coffee') || text.includes('clean') || text.includes('ambience') || text.includes('quality')) {
      topics.push('quality');
    }
    if (text.includes('wait') || text.includes('time') || text.includes('fast') || text.includes('delay') || text.includes('hour') || text.includes('minute')) {
      topics.push('speed');
    }
    if (text.includes('price') || text.includes('expensive') || text.includes('cost') || text.includes('affordable') || text.includes('bill')) {
      topics.push('pricing');
    }
    if (topics.length === 0) {
      topics.push(sentiment === 'positive' ? 'satisfaction' : 'general_experience');
    }

    let summary = '';
    if (!context.reviewText || context.reviewText.trim().length === 0) {
      summary = `Customer left a ${star}-star rating without written remarks.`;
    } else if (sentiment === 'positive') {
      summary = `Customer expressed high satisfaction with ${topics.join(' and ')}.`;
    } else if (sentiment === 'negative') {
      summary = `Customer noted dissatisfaction regarding ${topics.join(' and ')}.`;
    } else {
      summary = `Customer provided balanced feedback on their visit.`;
    }

    return {
      sentiment,
      topics,
      urgency,
      summary,
      confidence: 0.92,
      provider: 'mock',
      model: 'mock-reviewer-model',
      promptVersion: config.prompt_version,
      tokensUsed: 45
    };
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
