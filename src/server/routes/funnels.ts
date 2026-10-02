import { Router, Response } from 'express';
import { db } from '../database';
import { authMiddleware, AuthenticatedRequest } from '../auth';
import { PlanLimitService } from '../services/planLimits';

export const funnelsRouter = Router();

funnelsRouter.use(authMiddleware);

// Helper: Ensure user owns business that owns funnel
export function getOwnedFunnel(req: AuthenticatedRequest, funnelId: string) {
  if (!req.user) return null;
  const funnel = db.findFunnelById(funnelId);
  if (!funnel) return null;

  const business = db.findBusinessById(funnel.business_id);
  if (!business) return null;

  if (req.user.role !== 'admin' && business.user_id !== req.user.id) {
    return 'FORBIDDEN';
  }
  return { funnel, business };
}

// GET /api/v1/funnels
funnelsRouter.get('/', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const userBusinesses = db.findBusinessesByUserId(req.user.id);
  let allFunnels = userBusinesses.flatMap((b) => db.findFunnelsByBusinessId(b.id));

  // Filters
  const { business_id, location_id, status } = req.query;

  if (business_id && typeof business_id === 'string') {
    allFunnels = allFunnels.filter((f) => f.business_id === business_id);
  }

  if (location_id && typeof location_id === 'string') {
    allFunnels = allFunnels.filter((f) => f.location_id === location_id || f.google_location_id === location_id);
  }

  if (status && typeof status === 'string') {
    const isEnabled = status === 'active' || status === 'enabled';
    allFunnels = allFunnels.filter((f) => f.enabled === isEnabled);
  }

  // Pagination support
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(req.query.per_page as string, 10) || 20));
  const total = allFunnels.length;
  const lastPage = Math.ceil(total / perPage) || 1;
  const paginated = allFunnels.slice((page - 1) * perPage, page * perPage);

  res.json({
    success: true,
    message: 'Funnels retrieved successfully.',
    data: paginated,
    meta: {
      current_page: page,
      per_page: perPage,
      total,
      last_page: lastPage
    }
  });
});

// POST /api/v1/funnels
funnelsRouter.post('/', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { business_id, location_id, name, title, subtitle, logo, primary_color, background_color, google_review_url, language, show_customer_name } = req.body;

  const errors: Record<string, string> = {};

  if (!business_id) {
    errors.business_id = 'Business ID is required.';
  }

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.name = 'Funnel name is required.';
  }

  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.title = 'Funnel title is required.';
  }

  if (google_review_url && !/^https?:\/\/.+/.test(google_review_url)) {
    errors.google_review_url = 'Google Review URL must be a valid URL starting with http:// or https://.';
  }

  if (Object.keys(errors).length > 0) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors
    });
    return;
  }

  const business = db.findBusinessById(business_id);
  if (!business || (req.user.role !== 'admin' && business.user_id !== req.user.id)) {
    res.status(403).json({
      success: false,
      message: 'You do not have permission to create funnels for this business.'
    });
    return;
  }

  if (location_id) {
    const loc = db.findLocationById(location_id);
    if (!loc || loc.business_id !== business_id) {
      res.status(422).json({
        success: false,
        message: 'Supplied location does not belong to the selected business.'
      });
      return;
    }
  }

  // Check funnel limits
  if (!PlanLimitService.canUse(req.user, 'funnels')) {
    const limit = PlanLimitService.limit(req.user, 'funnels');
    res.status(429).json({
      success: false,
      message: `You have reached the maximum review funnels limit (${limit}) allowed on your plan. Please upgrade to create more funnels.`,
      meta: { upgrade_required: true, limit, used: PlanLimitService.usage(req.user, 'funnels') }
    });
    return;
  }

  const slug = db.generateUniqueFunnelSlug(name.trim());

  const newFunnel = db.createFunnel({
    business_id,
    location_id: location_id || undefined,
    name: name.trim(),
    slug,
    title: title.trim(),
    subtitle: subtitle ? subtitle.trim() : 'Your feedback helps other local customers find trusted care.',
    logo: logo || business.logo || '',
    primary_color: primary_color || '#34A853',
    background_color: background_color || '#F9FAFB',
    language: language || 'en',
    enabled: true,
    show_customer_name: show_customer_name !== false,
    google_review_url: google_review_url || business.google_review_url || ''
  });

  db.logAudit({
    user_id: req.user.id,
    action: 'funnel.created',
    entity_type: 'funnel',
    entity_id: newFunnel.id,
    new_values: { name: newFunnel.name, slug: newFunnel.slug, business_id },
    ip_address: req.ip
  });

  res.status(201).json({
    success: true,
    message: 'Review funnel created successfully.',
    data: newFunnel
  });
});

// GET /api/v1/funnels/:id
funnelsRouter.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const result = getOwnedFunnel(req, req.params.id);

  if (result === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied.' });
    return;
  }
  if (!result) {
    res.status(404).json({ success: false, message: 'Funnel not found.' });
    return;
  }

  res.json({
    success: true,
    data: result.funnel
  });
});

// PUT /api/v1/funnels/:id
funnelsRouter.put('/:id', (req: AuthenticatedRequest, res: Response) => {
  const result = getOwnedFunnel(req, req.params.id);

  if (result === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied.' });
    return;
  }
  if (!result) {
    res.status(404).json({ success: false, message: 'Funnel not found.' });
    return;
  }

  const { name, title, subtitle, logo, primary_color, background_color, enabled, show_customer_name, google_review_url, location_id } = req.body;

  let updatedSlug = result.funnel.slug;
  if (name && name.trim() !== result.funnel.name) {
    updatedSlug = db.generateUniqueFunnelSlug(name.trim(), result.funnel.id);
  }

  const updated = db.updateFunnel(req.params.id, {
    ...(name && { name: name.trim(), slug: updatedSlug }),
    ...(title !== undefined && { title: title.trim() }),
    ...(subtitle !== undefined && { subtitle: subtitle.trim() }),
    ...(logo !== undefined && { logo }),
    ...(primary_color && { primary_color }),
    ...(background_color && { background_color }),
    ...(enabled !== undefined && { enabled: Boolean(enabled) }),
    ...(show_customer_name !== undefined && { show_customer_name: Boolean(show_customer_name) }),
    ...(google_review_url !== undefined && { google_review_url }),
    ...(location_id !== undefined && { location_id })
  });

  db.logAudit({
    user_id: req.user?.id,
    action: 'funnel.updated',
    entity_type: 'funnel',
    entity_id: req.params.id,
    new_values: req.body,
    ip_address: req.ip
  });

  res.json({
    success: true,
    message: 'Funnel updated successfully.',
    data: updated
  });
});

// DELETE /api/v1/funnels/:id
funnelsRouter.delete('/:id', (req: AuthenticatedRequest, res: Response) => {
  const result = getOwnedFunnel(req, req.params.id);

  if (result === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied.' });
    return;
  }
  if (!result) {
    res.status(404).json({ success: false, message: 'Funnel not found.' });
    return;
  }

  db.deleteFunnel(req.params.id);

  db.logAudit({
    user_id: req.user?.id,
    action: 'funnel.deleted',
    entity_type: 'funnel',
    entity_id: req.params.id,
    ip_address: req.ip
  });

  res.json({
    success: true,
    message: 'Funnel deleted successfully.'
  });
});
