import { Router, Response } from 'express';
import { db } from '../database';
import { authMiddleware, AuthenticatedRequest } from '../auth';
import { getOwnedLocation } from './businesses';

export const locationsRouter = Router();

locationsRouter.use(authMiddleware);

// GET /api/v1/locations/:id
locationsRouter.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const result = getOwnedLocation(req, req.params.id);

  if (result === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied. You do not own this location.' });
    return;
  }
  if (!result) {
    res.status(404).json({ success: false, message: 'Location not found.' });
    return;
  }

  res.json({
    success: true,
    data: result.location
  });
});

// PUT /api/v1/locations/:id
locationsRouter.put('/:id', (req: AuthenticatedRequest, res: Response) => {
  const result = getOwnedLocation(req, req.params.id);

  if (result === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied. You do not own this location.' });
    return;
  }
  if (!result) {
    res.status(404).json({ success: false, message: 'Location not found.' });
    return;
  }

  const { name, address, city, state, country, postal_code, phone, timezone, status } = req.body;

  const updated = db.updateLocation(req.params.id, {
    ...(name && { name: name.trim() }),
    ...(address !== undefined && { address: address.trim() }),
    ...(city !== undefined && { city }),
    ...(state !== undefined && { state }),
    ...(country !== undefined && { country }),
    ...(postal_code !== undefined && { postal_code }),
    ...(phone !== undefined && { phone }),
    ...(timezone !== undefined && { timezone }),
    ...(status && { status })
  });

  db.logAudit({
    user_id: req.user?.id,
    action: 'location.updated',
    entity_type: 'location',
    entity_id: req.params.id,
    new_values: req.body,
    ip_address: req.ip
  });

  res.json({
    success: true,
    message: 'Location updated successfully.',
    data: updated
  });
});

// DELETE /api/v1/locations/:id
locationsRouter.delete('/:id', (req: AuthenticatedRequest, res: Response) => {
  const result = getOwnedLocation(req, req.params.id);

  if (result === 'FORBIDDEN') {
    res.status(403).json({ success: false, message: 'Access denied. You do not own this location.' });
    return;
  }
  if (!result) {
    res.status(404).json({ success: false, message: 'Location not found.' });
    return;
  }

  db.deleteLocation(req.params.id);

  db.logAudit({
    user_id: req.user?.id,
    action: 'location.deleted',
    entity_type: 'location',
    entity_id: req.params.id,
    ip_address: req.ip
  });

  res.json({
    success: true,
    message: 'Location deleted successfully.'
  });
});
