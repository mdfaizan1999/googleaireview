import { Router, Response } from 'express';
import { db } from '../database';
import { authMiddleware, AuthenticatedRequest } from '../auth';
import { AnalyticsService } from '../services/analytics';
import { getOwnedBusiness } from './businesses';

export const analyticsRouter = Router();

analyticsRouter.use(authMiddleware);

// Helper to validate date ranges (max 365 days)
function validateDateRange(from?: string, to?: string) {
  if (from && !/^\d{4}-\d{2}-\d{2}$/.test(from)) {
    return 'Invalid "from" date format. Expected YYYY-MM-DD.';
  }
  if (to && !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return 'Invalid "to" date format. Expected YYYY-MM-DD.';
  }
  if (from && to) {
    const fromTime = new Date(from).getTime();
    const toTime = new Date(to).getTime();
    if (fromTime > toTime) {
      return '"from" date cannot be after "to" date.';
    }
    const daysDiff = (toTime - fromTime) / (24 * 60 * 60 * 1000);
    if (daysDiff > 365) {
      return 'Date range cannot exceed 365 days.';
    }
  }
  return null;
}

// Helper: Ensure user owns target business, or pick primary business if omitted
function resolveAuthorizedBusiness(req: AuthenticatedRequest, requestedBusinessId?: string) {
  if (!req.user) return null;

  if (requestedBusinessId) {
    const biz = db.findBusinessById(requestedBusinessId);
    if (!biz) return 'NOT_FOUND';
    if (req.user.role !== 'admin' && biz.user_id !== req.user.id) {
      return 'FORBIDDEN';
    }
    return biz;
  }

  // Default to first business owned by user
  const userBusinesses = db.findBusinessesByUserId(req.user.id);
  return userBusinesses[0] || null;
}

// GET /api/v1/analytics/overview
analyticsRouter.get('/overview', (req: AuthenticatedRequest, res: Response) => {
  const { from, to, business_id, location_id, funnel_id, compare } = req.query;

  const dateError = validateDateRange(from as string, to as string);
  if (dateError) {
    res.status(422).json({ success: false, message: dateError });
    return;
  }

  const business = resolveAuthorizedBusiness(req, business_id as string);
  if (business === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied. You do not own this business.' });
    return;
  }
  if (business === 'NOT_FOUND') {
    res.status(404).json({ success: false, message: 'Business not found.' });
    return;
  }

  // If location_id provided, verify ownership
  if (location_id) {
    const loc = db.findLocationById(location_id as string);
    if (!loc || (business && loc.business_id !== business.id)) {
      res.status(403).json({ success: false, message: 'Location not found or unauthorized.' });
      return;
    }
  }

  // If funnel_id provided, verify ownership
  if (funnel_id) {
    const fnl = db.findFunnelById(funnel_id as string);
    if (!fnl || (business && fnl.business_id !== business.id)) {
      res.status(403).json({ success: false, message: 'Funnel not found or unauthorized.' });
      return;
    }
  }

  const data = AnalyticsService.getOverview({
    from: from as string,
    to: to as string,
    business_id: business ? business.id : undefined,
    location_id: location_id as string,
    funnel_id: funnel_id as string,
    include_comparison: compare === 'true' || compare === '1'
  });

  res.json({
    success: true,
    data
  });
});

// GET /api/v1/analytics/timeseries
analyticsRouter.get('/timeseries', (req: AuthenticatedRequest, res: Response) => {
  const { from, to, business_id, location_id, funnel_id, granularity } = req.query;

  const dateError = validateDateRange(from as string, to as string);
  if (dateError) {
    res.status(422).json({ success: false, message: dateError });
    return;
  }

  const business = resolveAuthorizedBusiness(req, business_id as string);
  if (business === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied to this business.' });
    return;
  }
  if (business === 'NOT_FOUND') {
    res.status(404).json({ success: false, message: 'Business not found.' });
    return;
  }

  const data = AnalyticsService.getTimeSeries({
    from: from as string,
    to: to as string,
    business_id: business ? business.id : undefined,
    location_id: location_id as string,
    funnel_id: funnel_id as string,
    granularity: (granularity as 'day' | 'week' | 'month') || 'day'
  });

  res.json({
    success: true,
    data
  });
});

// GET /api/v1/analytics/business/:businessId
analyticsRouter.get('/business/:businessId', (req: AuthenticatedRequest, res: Response) => {
  const biz = getOwnedBusiness(req, req.params.businessId);
  if (biz === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied. You do not own this business.' });
    return;
  }
  if (!biz) {
    res.status(404).json({ success: false, message: 'Business not found.' });
    return;
  }

  const { from, to, location_id, funnel_id } = req.query;
  const overview = AnalyticsService.getOverview({
    from: from as string,
    to: to as string,
    business_id: biz.id,
    location_id: location_id as string,
    funnel_id: funnel_id as string,
    include_comparison: true
  });

  const timeseries = AnalyticsService.getTimeSeries({
    from: from as string,
    to: to as string,
    business_id: biz.id,
    location_id: location_id as string,
    funnel_id: funnel_id as string
  });

  res.json({
    success: true,
    data: {
      business_id: biz.id,
      business_name: biz.name,
      overview,
      timeseries
    }
  });
});

// GET /api/v1/analytics/location/:locationId
analyticsRouter.get('/location/:locationId', (req: AuthenticatedRequest, res: Response) => {
  const loc = db.findLocationById(req.params.locationId);
  if (!loc) {
    res.status(404).json({ success: false, message: 'Location not found.' });
    return;
  }

  const biz = getOwnedBusiness(req, loc.business_id);
  if (biz === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied to this location.' });
    return;
  }

  const { from, to } = req.query;
  const overview = AnalyticsService.getOverview({
    from: from as string,
    to: to as string,
    business_id: loc.business_id,
    location_id: loc.id,
    include_comparison: true
  });

  const timeseries = AnalyticsService.getTimeSeries({
    from: from as string,
    to: to as string,
    business_id: loc.business_id,
    location_id: loc.id
  });

  res.json({
    success: true,
    data: {
      location_id: loc.id,
      location_name: loc.name,
      business_id: loc.business_id,
      overview,
      timeseries
    }
  });
});

// GET /api/v1/analytics/funnel/:funnelId
analyticsRouter.get('/funnel/:funnelId', (req: AuthenticatedRequest, res: Response) => {
  const funnel = db.findFunnelById(req.params.funnelId);
  if (!funnel) {
    res.status(404).json({ success: false, message: 'Funnel not found.' });
    return;
  }

  const biz = getOwnedBusiness(req, funnel.business_id);
  if (biz === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied to this funnel.' });
    return;
  }

  const { from, to } = req.query;
  const overview = AnalyticsService.getOverview({
    from: from as string,
    to: to as string,
    business_id: funnel.business_id,
    funnel_id: funnel.id,
    include_comparison: true
  });

  const timeseries = AnalyticsService.getTimeSeries({
    from: from as string,
    to: to as string,
    business_id: funnel.business_id,
    funnel_id: funnel.id
  });

  res.json({
    success: true,
    data: {
      funnel_id: funnel.id,
      funnel_name: funnel.name,
      slug: funnel.slug,
      overview,
      timeseries
    }
  });
});

// GET /api/v1/analytics/qr/:qrId
analyticsRouter.get('/qr/:qrId', (req: AuthenticatedRequest, res: Response) => {
  const qr = db.findQrCodeById(req.params.qrId);
  if (!qr) {
    res.status(404).json({ success: false, message: 'QR Code not found.' });
    return;
  }

  const biz = getOwnedBusiness(req, qr.business_id);
  if (biz === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied to this QR code.' });
    return;
  }

  const funnel = db.findFunnelById(qr.funnel_id);
  const { from, to } = req.query;

  const timeseries = AnalyticsService.getTimeSeries({
    from: from as string,
    to: to as string,
    business_id: qr.business_id,
    funnel_id: qr.funnel_id
  });

  res.json({
    success: true,
    data: {
      qr_id: qr.id,
      qr_name: qr.name,
      short_code: qr.short_code,
      destination_url: qr.destination_url,
      funnel_name: funnel?.name || 'Unknown',
      scan_count: qr.scan_count || 0,
      timeseries
    }
  });
});

// GET /api/v1/analytics/top-funnels
analyticsRouter.get('/top-funnels', (req: AuthenticatedRequest, res: Response) => {
  const { business_id, limit } = req.query;
  const business = resolveAuthorizedBusiness(req, business_id as string);

  if (business === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied.' });
    return;
  }
  if (business === 'NOT_FOUND') {
    res.status(404).json({ success: false, message: 'Business not found.' });
    return;
  }

  const top = AnalyticsService.getTopFunnels(business ? business.id : undefined, Number(limit) || 10);
  res.json({
    success: true,
    data: top
  });
});

// GET /api/v1/analytics/top-qr
analyticsRouter.get('/top-qr', (req: AuthenticatedRequest, res: Response) => {
  const { business_id, limit } = req.query;
  const business = resolveAuthorizedBusiness(req, business_id as string);

  if (business === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied.' });
    return;
  }
  if (business === 'NOT_FOUND') {
    res.status(404).json({ success: false, message: 'Business not found.' });
    return;
  }

  const top = AnalyticsService.getTopQr(business ? business.id : undefined, Number(limit) || 10);
  res.json({
    success: true,
    data: top
  });
});
