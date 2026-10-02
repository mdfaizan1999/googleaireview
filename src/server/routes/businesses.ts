import { Router, Response } from 'express';
import { db } from '../database';
import { authMiddleware, AuthenticatedRequest } from '../auth';
import { PlanLimitService } from '../services/planLimits';
import { FeatureService } from '../services/features';

export const businessesRouter = Router();

// Require auth for all business and location endpoints
businessesRouter.use(authMiddleware);

// Helper: Verify business ownership
export function getOwnedBusiness(req: AuthenticatedRequest, businessId: string) {
  if (!req.user) return null;
  const business = db.findBusinessById(businessId);
  if (!business) return null;

  if (req.user.role !== 'admin' && business.user_id !== req.user.id) {
    return 'FORBIDDEN';
  }
  return business;
}

// Helper: Verify location ownership
export function getOwnedLocation(req: AuthenticatedRequest, locationId: string) {
  if (!req.user) return null;
  const location = db.findLocationById(locationId);
  if (!location) return null;

  const business = db.findBusinessById(location.business_id);
  if (!business) return null;

  if (req.user.role !== 'admin' && business.user_id !== req.user.id) {
    return 'FORBIDDEN';
  }
  return { location, business };
}

// ═══════════════════════════════════════════
// BUSINESS CRUD
// ═══════════════════════════════════════════

// GET /api/v1/businesses
businessesRouter.get('/', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const allBusinesses = db.findBusinessesByUserId(req.user.id);

  // Pagination support
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(req.query.per_page as string, 10) || 20));
  const total = allBusinesses.length;
  const lastPage = Math.ceil(total / perPage) || 1;
  const paginated = allBusinesses.slice((page - 1) * perPage, page * perPage);

  res.json({
    success: true,
    message: 'Businesses retrieved successfully.',
    data: paginated,
    meta: {
      current_page: page,
      per_page: perPage,
      total,
      last_page: lastPage
    }
  });
});

// POST /api/v1/businesses
businessesRouter.post('/', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { name, category, address, phone, email, website, logo, description, city, state, country, postal_code, timezone, google_review_url, min_star_threshold, custom_keywords } = req.body;

  const errors: Record<string, string> = {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.name = 'Business name is required.';
  } else if (name.trim().length > 150) {
    errors.name = 'Business name must not exceed 150 characters.';
  }

  if (!address || typeof address !== 'string' || !address.trim()) {
    errors.address = 'Business address is required.';
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  if (website && !/^https?:\/\/.+/.test(website)) {
    errors.website = 'Website must be a valid URL starting with http:// or https://.';
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

  // Check plan limits
  if (!PlanLimitService.canUse(req.user, 'businesses')) {
    const limit = PlanLimitService.limit(req.user, 'businesses');
    res.status(429).json({
      success: false,
      message: `You have reached the maximum business limit (${limit}) allowed on your plan. Please upgrade to add more businesses.`,
      meta: { upgrade_required: true, limit, used: PlanLimitService.usage(req.user, 'businesses') }
    });
    return;
  }

  const uniqueSlug = db.generateUniqueBusinessSlug(name.trim());

  const newBiz = db.createBusiness({
    user_id: req.user.id,
    name: name.trim(),
    slug: uniqueSlug,
    category: category || 'General Business',
    description: description || '',
    phone: phone || '',
    email: email || '',
    website: website || '',
    logo: logo || '',
    address: address.trim(),
    city: city || '',
    state: state || '',
    country: country || '',
    postal_code: postal_code || '',
    timezone: timezone || 'UTC',
    google_review_url: google_review_url || '',
    min_star_threshold: min_star_threshold ? Number(min_star_threshold) : 4,
    custom_keywords: custom_keywords || [],
    status: 'active'
  });

  // Automatically create primary location
  db.createLocation({
    business_id: newBiz.id,
    name: 'Primary Location',
    address: newBiz.address,
    city: newBiz.city,
    state: newBiz.state,
    country: newBiz.country,
    postal_code: newBiz.postal_code,
    phone: newBiz.phone,
    timezone: newBiz.timezone,
    status: 'active'
  });

  db.logAudit({
    user_id: req.user.id,
    action: 'business.created',
    entity_type: 'business',
    entity_id: newBiz.id,
    new_values: { name: newBiz.name, slug: newBiz.slug },
    ip_address: req.ip
  });

  res.status(201).json({
    success: true,
    message: 'Business created successfully.',
    data: newBiz
  });
});

// GET /api/v1/businesses/:id
businessesRouter.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const result = getOwnedBusiness(req, req.params.id);

  if (result === 'FORBIDDEN') {
    res.status(403).json({
      success: false,
      message: 'Access denied. You do not have permission to view this business.'
    });
    return;
  }

  if (!result) {
    res.status(404).json({
      success: false,
      message: 'Business not found.'
    });
    return;
  }

  res.json({
    success: true,
    message: 'Business retrieved successfully.',
    data: result
  });
});

// PUT /api/v1/businesses/:id
businessesRouter.put('/:id', (req: AuthenticatedRequest, res: Response) => {
  const result = getOwnedBusiness(req, req.params.id);

  if (result === 'FORBIDDEN') {
    res.status(403).json({
      success: false,
      message: 'Access denied. You do not have permission to modify this business.'
    });
    return;
  }

  if (!result) {
    res.status(404).json({
      success: false,
      message: 'Business not found.'
    });
    return;
  }

  const { name, category, address, phone, email, website, logo, description, city, state, country, postal_code, timezone, google_review_url, min_star_threshold, custom_keywords, status } = req.body;

  const errors: Record<string, string> = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      errors.name = 'Business name cannot be empty.';
    } else if (name.trim().length > 150) {
      errors.name = 'Business name must not exceed 150 characters.';
    }
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  if (website && !/^https?:\/\/.+/.test(website)) {
    errors.website = 'Website must be a valid URL starting with http:// or https://.';
  }

  if (google_review_url && !/^https?:\/\/.+/.test(google_review_url)) {
    errors.google_review_url = 'Google Review URL must be a valid URL starting with http:// or https://.';
  }

  if (status && !['active', 'inactive', 'suspended'].includes(status)) {
    errors.status = 'Status must be active, inactive, or suspended.';
  }

  if (Object.keys(errors).length > 0) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors
    });
    return;
  }

  let updatedSlug = result.slug;
  if (name && name.trim() !== result.name) {
    updatedSlug = db.generateUniqueBusinessSlug(name.trim(), result.id);
  }

  const updated = db.updateBusiness(req.params.id, {
    ...(name && { name: name.trim(), slug: updatedSlug }),
    ...(category !== undefined && { category }),
    ...(description !== undefined && { description }),
    ...(logo !== undefined && { logo }),
    ...(address !== undefined && { address }),
    ...(city !== undefined && { city }),
    ...(state !== undefined && { state }),
    ...(country !== undefined && { country }),
    ...(postal_code !== undefined && { postal_code }),
    ...(timezone !== undefined && { timezone }),
    ...(phone !== undefined && { phone }),
    ...(email !== undefined && { email }),
    ...(website !== undefined && { website }),
    ...(google_review_url !== undefined && { google_review_url }),
    ...(min_star_threshold !== undefined && { min_star_threshold: Number(min_star_threshold) }),
    ...(custom_keywords !== undefined && { custom_keywords }),
    ...(status && { status })
  });

  db.logAudit({
    user_id: req.user?.id,
    action: 'business.updated',
    entity_type: 'business',
    entity_id: req.params.id,
    new_values: req.body,
    ip_address: req.ip
  });

  res.json({
    success: true,
    message: 'Business updated successfully.',
    data: updated
  });
});

// DELETE /api/v1/businesses/:id
businessesRouter.delete('/:id', (req: AuthenticatedRequest, res: Response) => {
  const result = getOwnedBusiness(req, req.params.id);

  if (result === 'FORBIDDEN') {
    res.status(403).json({
      success: false,
      message: 'Access denied. You do not have permission to delete this business.'
    });
    return;
  }

  if (!result) {
    res.status(404).json({
      success: false,
      message: 'Business not found.'
    });
    return;
  }

  db.deleteBusiness(req.params.id);

  db.logAudit({
    user_id: req.user?.id,
    action: 'business.deleted',
    entity_type: 'business',
    entity_id: req.params.id,
    ip_address: req.ip
  });

  res.json({
    success: true,
    message: 'Business deleted successfully.'
  });
});

// ═══════════════════════════════════════════
// BUSINESS LOCATIONS CRUD
// ═══════════════════════════════════════════

// GET /api/v1/businesses/:businessId/locations
businessesRouter.get('/:businessId/locations', (req: AuthenticatedRequest, res: Response) => {
  const biz = getOwnedBusiness(req, req.params.businessId);

  if (biz === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied to this business.' });
    return;
  }
  if (!biz) {
    res.status(404).json({ success: false, message: 'Business not found.' });
    return;
  }

  const locations = db.findLocationsByBusinessId(req.params.businessId);
  res.json({
    success: true,
    message: 'Locations retrieved successfully.',
    data: locations,
    meta: { count: locations.length }
  });
});

// POST /api/v1/businesses/:businessId/locations
businessesRouter.post('/:businessId/locations', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const biz = getOwnedBusiness(req, req.params.businessId);

  if (biz === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied to this business.' });
    return;
  }
  if (!biz) {
    res.status(404).json({ success: false, message: 'Business not found.' });
    return;
  }

  const { name, address, city, state, country, postal_code, phone, timezone } = req.body;

  if (!name || !address) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: {
        name: !name ? 'Location name is required' : '',
        address: !address ? 'Address is required' : ''
      }
    });
    return;
  }

  // Check location limits & multi-location entitlement
  if (!PlanLimitService.canUse(req.user, 'locations')) {
    const limit = PlanLimitService.limit(req.user, 'locations');
    res.status(429).json({
      success: false,
      message: `You have reached the maximum location limit (${limit}) allowed on your plan. Please upgrade to add more locations.`,
      meta: { upgrade_required: true, limit, used: PlanLimitService.usage(req.user, 'locations') }
    });
    return;
  }

  const newLocation = db.createLocation({
    business_id: req.params.businessId,
    name: name.trim(),
    address: address.trim(),
    city: city || '',
    state: state || '',
    country: country || '',
    postal_code: postal_code || '',
    phone: phone || '',
    timezone: timezone || 'UTC',
    status: 'active'
  });

  db.logAudit({
    user_id: req.user?.id,
    action: 'location.created',
    entity_type: 'location',
    entity_id: newLocation.id,
    new_values: { name: newLocation.name, business_id: req.params.businessId },
    ip_address: req.ip
  });

  res.status(201).json({
    success: true,
    message: 'Location added successfully.',
    data: newLocation
  });
});
