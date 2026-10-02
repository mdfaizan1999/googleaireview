import { Router, Request, Response } from 'express';
import { db } from '../database';

export const publicRouter = Router();

// Allowlist of permitted analytics event types
const ALLOWED_EVENT_TYPES = [
  'page_view',
  'qr_scan',
  'rating_selected',
  'feedback_started',
  'feedback_completed',
  'review_assistant_opened',
  'copy_clicked',
  'google_clicked'
] as const;

// Helper to parse basic device info from User-Agent safely
function parseUserAgent(ua: string = '') {
  let device = 'desktop';
  if (/mobile|android|iphone|ipad|ipod/i.test(ua)) {
    device = 'mobile';
  } else if (/tablet/i.test(ua)) {
    device = 'tablet';
  }

  let browser = 'Unknown';
  if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua)) browser = 'Safari';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/edge|edg/i.test(ua)) browser = 'Edge';

  let os = 'Unknown';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  return { device, browser, os };
}

// GET /api/public/funnels/:slug
publicRouter.get('/funnels/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug || typeof slug !== 'string' || slug.length > 100) {
    res.status(400).json({ success: false, message: 'Invalid funnel slug.' });
    return;
  }

  const funnel = db.findFunnelBySlug(slug.trim());
  if (!funnel || !funnel.enabled) {
    res.status(404).json({
      success: false,
      message: 'This review page is currently unavailable.'
    });
    return;
  }

  const business = db.findBusinessById(funnel.business_id);
  if (!business || business.status !== 'active') {
    res.status(404).json({
      success: false,
      message: 'This review page is currently unavailable.'
    });
    return;
  }

  res.json({
    success: true,
    data: {
      funnel: {
        id: funnel.id,
        name: funnel.name,
        slug: funnel.slug,
        title: funnel.title,
        subtitle: funnel.subtitle,
        logo: funnel.logo || business.logo || '',
        primary_color: funnel.primary_color || '#34A853',
        background_color: funnel.background_color || '#F9FAFB',
        language: funnel.language || 'en',
        show_customer_name: funnel.show_customer_name !== false,
        google_review_url: funnel.google_review_url || business.google_review_url || ''
      },
      business: {
        name: business.name,
        address: business.address,
        category: business.category,
        min_star_threshold: business.min_star_threshold || 4
      }
    }
  });
});

// POST /api/public/funnels/:slug/event
publicRouter.post('/funnels/:slug/event', (req: Request, res: Response) => {
  const { slug } = req.params;
  const funnel = db.findFunnelBySlug(slug);

  if (!funnel) {
    res.status(404).json({ success: false, message: 'Funnel not found' });
    return;
  }

  const {
    event_type,
    session_id,
    visitor_id,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content,
    metadata
  } = req.body;

  // Validate event type against strict allowlist
  if (!event_type || !ALLOWED_EVENT_TYPES.includes(event_type)) {
    res.status(422).json({
      success: false,
      message: `Invalid event type. Allowed events: ${ALLOWED_EVENT_TYPES.join(', ')}`
    });
    return;
  }

  // Parse UA & Referrer
  const rawUa = req.get('user-agent') || '';
  const { device, browser, os } = parseUserAgent(rawUa);
  const rawReferrer = req.get('referrer') || req.get('referer') || '';
  const cleanReferrer = rawReferrer.slice(0, 300);

  // Anonymized identifiers
  const cleanVisitorId = (visitor_id && typeof visitor_id === 'string')
    ? visitor_id.slice(0, 100)
    : `anon_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const cleanSessionId = (session_id && typeof session_id === 'string')
    ? session_id.slice(0, 100)
    : `sess_${Date.now()}`;

  // Sanitize metadata: strictly exclude customer feedback text from analytics metadata
  const safeMetadata: Record<string, any> = {};
  if (metadata && typeof metadata === 'object') {
    if (metadata.rating !== undefined) safeMetadata.rating = Number(metadata.rating);
    if (metadata.short_code !== undefined) safeMetadata.short_code = String(metadata.short_code).slice(0, 50);
    if (metadata.is_positive !== undefined) safeMetadata.is_positive = Boolean(metadata.is_positive);
  }

  const event = db.createFunnelEvent({
    funnel_id: funnel.id,
    event_type,
    session_id: cleanSessionId,
    visitor_id: cleanVisitorId,
    device,
    browser,
    os,
    referrer: cleanReferrer || undefined,
    utm_source: utm_source ? String(utm_source).slice(0, 100) : undefined,
    utm_medium: utm_medium ? String(utm_medium).slice(0, 100) : undefined,
    utm_campaign: utm_campaign ? String(utm_campaign).slice(0, 100) : undefined,
    metadata: safeMetadata
  });

  res.json({
    success: true,
    data: {
      id: event.id,
      event_type: event.event_type
    }
  });
});

// POST /api/public/funnels/:slug/feedback
publicRouter.post('/funnels/:slug/feedback', (req: Request, res: Response) => {
  const { slug } = req.params;
  const funnel = db.findFunnelBySlug(slug);

  if (!funnel || !funnel.enabled) {
    res.status(404).json({ success: false, message: 'This review page is currently unavailable.' });
    return;
  }

  const business = db.findBusinessById(funnel.business_id);
  if (!business || business.status !== 'active') {
    res.status(404).json({ success: false, message: 'This review page is currently unavailable.' });
    return;
  }

  const { rating, comment, reviewer_name, reviewer_phone, reviewer_email, session_id, visitor_id } = req.body;
  const numRating = Number(rating);

  if (!numRating || numRating < 1 || numRating > 5) {
    res.status(422).json({
      success: false,
      message: 'Rating must be an integer between 1 and 5 stars.'
    });
    return;
  }

  const cleanComment = (comment && typeof comment === 'string') ? comment.slice(0, 2000).trim() : '';
  const cleanName = (reviewer_name && typeof reviewer_name === 'string') ? reviewer_name.slice(0, 100).trim() : 'Anonymous Customer';

  const threshold = business.min_star_threshold || 4;
  const isPositive = numRating >= threshold;

  // Persist review in database
  const review = db.createReview({
    business_id: business.id,
    google_location_id: funnel.location_id || funnel.google_location_id,
    reviewer_name: cleanName,
    rating: numRating,
    comment: cleanComment,
    review_created_at: new Date().toISOString(),
    reply_status: 'unanswered',
    raw_payload: {
      phone: reviewer_phone ? String(reviewer_phone).slice(0, 30) : undefined,
      email: reviewer_email ? String(reviewer_email).slice(0, 100) : undefined,
      source: 'qr_funnel',
      funnel_id: funnel.id
    }
  });

  // Track feedback_completed event
  db.createFunnelEvent({
    funnel_id: funnel.id,
    event_type: 'feedback_completed',
    session_id: session_id ? String(session_id).slice(0, 100) : `sess_${Date.now()}`,
    visitor_id: visitor_id ? String(visitor_id).slice(0, 100) : `anon_${Date.now()}`,
    metadata: { rating: numRating, is_positive: isPositive }
  });

  const googleReviewUrl = funnel.google_review_url || business.google_review_url || 'https://maps.google.com';

  if (isPositive) {
    res.json({
      success: true,
      message: 'Thank you for your rating! Please complete it on Google Maps.',
      data: {
        review_id: review.id,
        is_positive: true,
        redirect_url: googleReviewUrl,
        prompt_google: true
      }
    });
  } else {
    res.json({
      success: true,
      message: 'Thank you for your honest feedback. Our management team has received your comments directly.',
      data: {
        review_id: review.id,
        is_positive: false,
        redirect_url: googleReviewUrl,
        prompt_google: false
      }
    });
  }
});

// Handler for GET /q/:shortCode (Atomic scan tracking & redirect)
export function handleQrRedirect(req: Request, res: Response): void {
  const { shortCode } = req.params;

  if (!shortCode || typeof shortCode !== 'string') {
    res.status(400).send('<h1>Invalid QR code parameter</h1>');
    return;
  }

  const qr = db.findQrCodeByShortCode(shortCode.trim());

  if (!qr || qr.status !== 'active' || qr.deleted_at) {
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head><title>QR Code Unavailable | ReviewFlow AI</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="font-family: sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; background:#FAFAFA; color:#333;">
          <div style="text-align:center; padding:24px; max-width:400px; background:#fff; border-radius:16px; box-shadow:0 4px 12px rgba(0,0,0,0.06);">
            <h2 style="margin-top:0; color:#DC2626;">Unavailable</h2>
            <p style="font-size:14px; color:#666;">This QR code is currently unavailable.</p>
          </div>
        </body>
      </html>
    `);
    return;
  }

  // Atomic increment of fast summary scan counter
  db.incrementQrScan(qr.id);

  // Track event in funnel_events
  const rawUa = req.get('user-agent') || '';
  const { device, browser, os } = parseUserAgent(rawUa);
  const rawReferrer = req.get('referrer') || req.get('referer') || '';

  db.createFunnelEvent({
    funnel_id: qr.funnel_id,
    event_type: 'qr_scan',
    session_id: `qr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    visitor_id: req.ip || 'anon_scanner',
    device,
    browser,
    os,
    referrer: rawReferrer.slice(0, 300) || undefined,
    metadata: { short_code: qr.short_code }
  });

  // 302 Redirect to destination funnel URL
  res.redirect(302, qr.destination_url);
}
