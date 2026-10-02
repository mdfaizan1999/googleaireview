import { Router, Response } from 'express';
import QRCodeGenerator from 'qrcode';
import { db } from '../database';
import { authMiddleware, AuthenticatedRequest } from '../auth';
import { PlanLimitService } from '../services/planLimits';

export const qrRouter = Router();

qrRouter.use(authMiddleware);

// Helper: Ensure user owns business that owns QR code
export function getOwnedQr(req: AuthenticatedRequest, qrId: string) {
  if (!req.user) return null;
  const qr = db.findQrCodeById(qrId);
  if (!qr) return null;

  const business = db.findBusinessById(qr.business_id);
  if (!business) return null;

  if (req.user.role !== 'admin' && business.user_id !== req.user.id) {
    return 'FORBIDDEN';
  }
  return { qr, business };
}

// Hex color validator to prevent CSS injection
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// GET /api/v1/qr
qrRouter.get('/', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const userBusinesses = db.findBusinessesByUserId(req.user.id);
  let allQrs = userBusinesses.flatMap((b) => db.findQrCodesByBusinessId(b.id));

  // Filters
  const { business_id, funnel_id, status } = req.query;

  if (business_id && typeof business_id === 'string') {
    allQrs = allQrs.filter((q) => q.business_id === business_id);
  }

  if (funnel_id && typeof funnel_id === 'string') {
    allQrs = allQrs.filter((q) => q.funnel_id === funnel_id);
  }

  if (status && typeof status === 'string') {
    allQrs = allQrs.filter((q) => q.status === status);
  }

  // Pagination support
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(req.query.per_page as string, 10) || 20));
  const total = allQrs.length;
  const lastPage = Math.ceil(total / perPage) || 1;
  const paginated = allQrs.slice((page - 1) * perPage, page * perPage);

  res.json({
    success: true,
    data: paginated,
    meta: {
      current_page: page,
      per_page: perPage,
      total,
      last_page: lastPage
    }
  });
});

// POST /api/v1/qr
qrRouter.post('/', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { business_id, funnel_id, name, short_code, style, foreground_color, background_color, logo } = req.body;

  const errors: Record<string, string> = {};

  if (!business_id) errors.business_id = 'Business ID is required.';
  if (!funnel_id) errors.funnel_id = 'Funnel ID is required.';
  if (!name || typeof name !== 'string' || !name.trim()) errors.name = 'QR Code name is required.';

  if (foreground_color && !HEX_COLOR_REGEX.test(foreground_color)) {
    errors.foreground_color = 'Foreground color must be a valid hex color code (e.g. #166534).';
  }

  if (background_color && !HEX_COLOR_REGEX.test(background_color)) {
    errors.background_color = 'Background color must be a valid hex color code (e.g. #FFFFFF).';
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
    res.status(403).json({ success: false, message: 'Permission denied.' });
    return;
  }

  const funnel = db.findFunnelById(funnel_id);
  if (!funnel || funnel.business_id !== business_id) {
    res.status(422).json({ success: false, message: 'Target funnel not found or does not belong to this business.' });
    return;
  }

  // Check QR code plan limits
  if (!PlanLimitService.canUse(req.user, 'qr_codes')) {
    const limit = PlanLimitService.limit(req.user, 'qr_codes');
    res.status(429).json({
      success: false,
      message: `You have reached the maximum QR code limit (${limit}) allowed on your plan. Please upgrade to generate more QR codes.`,
      meta: { upgrade_required: true, limit, used: PlanLimitService.usage(req.user, 'qr_codes') }
    });
    return;
  }

  const code = (short_code && typeof short_code === 'string' && short_code.trim())
    ? short_code.trim()
    : db.generateUniqueShortCode();

  const destination_url = `/r/${funnel.slug}`;

  const newQr = db.createQrCode({
    business_id,
    funnel_id,
    name: name.trim(),
    short_code: code,
    destination_url,
    style: style || 'modern_dots',
    foreground_color: foreground_color || '#166534',
    background_color: background_color || '#FFFFFF',
    logo: logo || '',
    status: 'active'
  });

  db.logAudit({
    user_id: req.user.id,
    action: 'qr.created',
    entity_type: 'qr',
    entity_id: newQr.id,
    new_values: { name: newQr.name, short_code: code, destination_url },
    ip_address: req.ip
  });

  res.status(201).json({
    success: true,
    message: 'QR code created successfully.',
    data: newQr
  });
});

// GET /api/v1/qr/:id
qrRouter.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const result = getOwnedQr(req, req.params.id);

  if (result === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied.' });
    return;
  }
  if (!result) {
    res.status(404).json({ success: false, message: 'QR Code not found.' });
    return;
  }

  res.json({
    success: true,
    data: result.qr
  });
});

// PUT /api/v1/qr/:id
qrRouter.put('/:id', (req: AuthenticatedRequest, res: Response) => {
  const result = getOwnedQr(req, req.params.id);

  if (result === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied.' });
    return;
  }
  if (!result) {
    res.status(404).json({ success: false, message: 'QR code not found.' });
    return;
  }

  const { name, style, foreground_color, background_color, logo, status, funnel_id } = req.body;

  let newDestination = result.qr.destination_url;
  if (funnel_id && funnel_id !== result.qr.funnel_id) {
    const funnel = db.findFunnelById(funnel_id);
    if (!funnel || funnel.business_id !== result.qr.business_id) {
      res.status(422).json({ success: false, message: 'Specified funnel not found for this business.' });
      return;
    }
    newDestination = `/r/${funnel.slug}`;
  }

  const updated = db.updateQrCode(req.params.id, {
    ...(name && { name: name.trim() }),
    ...(funnel_id && { funnel_id, destination_url: newDestination }),
    ...(style !== undefined && { style }),
    ...(foreground_color && HEX_COLOR_REGEX.test(foreground_color) && { foreground_color }),
    ...(background_color && HEX_COLOR_REGEX.test(background_color) && { background_color }),
    ...(logo !== undefined && { logo }),
    ...(status && { status })
  });

  db.logAudit({
    user_id: req.user?.id,
    action: 'qr.updated',
    entity_type: 'qr',
    entity_id: req.params.id,
    new_values: req.body,
    ip_address: req.ip
  });

  res.json({
    success: true,
    message: 'QR code updated successfully.',
    data: updated
  });
});

// GET /api/v1/qr/:id/image (Display)
qrRouter.get('/:id/image', async (req: AuthenticatedRequest, res: Response) => {
  const result = getOwnedQr(req, req.params.id);

  if (!result || result === 'FORBIDDEN') {
    res.status(404).json({ success: false, message: 'QR code not found.' });
    return;
  }

  try {
    const fullScanUrl = `${req.protocol}://${req.get('host')}/q/${result.qr.short_code}`;
    const pngBuffer = await QRCodeGenerator.toBuffer(fullScanUrl, {
      color: {
        dark: result.qr.foreground_color || '#000000',
        light: result.qr.background_color || '#FFFFFF'
      },
      width: 400,
      margin: 2
    });

    res.setHeader('Content-Type', 'image/png');
    res.send(pngBuffer);
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to generate QR image.' });
  }
});

// GET /api/v1/qr/:id/download (Attachment)
qrRouter.get('/:id/download', async (req: AuthenticatedRequest, res: Response) => {
  const result = getOwnedQr(req, req.params.id);

  if (!result || result === 'FORBIDDEN') {
    res.status(404).json({ success: false, message: 'QR code not found.' });
    return;
  }

  try {
    const fullScanUrl = `${req.protocol}://${req.get('host')}/q/${result.qr.short_code}`;
    const pngBuffer = await QRCodeGenerator.toBuffer(fullScanUrl, {
      color: {
        dark: result.qr.foreground_color || '#000000',
        light: result.qr.background_color || '#FFFFFF'
      },
      width: 800, // Print quality high resolution
      margin: 2
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="reviewflow-qr-${result.qr.short_code}.png"`);
    res.send(pngBuffer);
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to download QR code.' });
  }
});

// DELETE /api/v1/qr/:id
qrRouter.delete('/:id', (req: AuthenticatedRequest, res: Response) => {
  const result = getOwnedQr(req, req.params.id);

  if (result === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied.' });
    return;
  }
  if (!result) {
    res.status(404).json({ success: false, message: 'QR code not found.' });
    return;
  }

  db.deleteQrCode(req.params.id);

  db.logAudit({
    user_id: req.user?.id,
    action: 'qr.deleted',
    entity_type: 'qr',
    entity_id: req.params.id,
    ip_address: req.ip
  });

  res.json({
    success: true,
    message: 'QR code deleted successfully.'
  });
});
