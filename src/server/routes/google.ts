import { Router, Request, Response } from 'express';
import { db } from '../database';
import { authMiddleware, AuthenticatedRequest } from '../auth';
import { generateOAuthState, validateOAuthState } from '../utils/oauthState';
import { encryptToken } from '../utils/crypto';
import { GoogleBusinessProfileService } from '../services/google';
import { SyncGoogleReviewsJob } from '../services/reviewSync';

export const googleRouter = Router();

// ═══════════════════════════════════════════
// 1. OAUTH CONNECT INITIATION
// ═══════════════════════════════════════════
// GET /api/v1/integrations/google/connect
googleRouter.get('/connect', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const state = generateOAuthState(req.user.id);
  const redirectUri = req.query.redirect_uri as string | undefined;
  const authUrl = GoogleBusinessProfileService.getAuthUrl(state, redirectUri);

  res.json({
    success: true,
    data: {
      url: authUrl,
      state
    }
  });
});

// ═══════════════════════════════════════════
// 2. OAUTH CALLBACK & TOKEN EXCHANGE
// ═══════════════════════════════════════════
// GET /api/v1/integrations/google/callback
googleRouter.get('/callback', async (req: Request, res: Response) => {
  const { code, state, error: oauthError } = req.query;

  if (oauthError) {
    res.status(400).json({
      success: false,
      message: `Google authorization denied: ${oauthError}`
    });
    return;
  }

  if (!code || typeof code !== 'string') {
    res.status(400).json({ success: false, message: 'Missing authorization code.' });
    return;
  }

  const validation = validateOAuthState(state as string);
  if (!validation.valid || !validation.userId) {
    res.status(400).json({
      success: false,
      message: validation.error || 'Invalid or expired OAuth state.'
    });
    return;
  }

  const userId = validation.userId;

  try {
    const tokenResult = await GoogleBusinessProfileService.exchangeCode(code);

    const encryptedAccessToken = encryptToken(tokenResult.access_token);
    const encryptedRefreshToken = tokenResult.refresh_token
      ? encryptToken(tokenResult.refresh_token)
      : '';

    const expiresAt = new Date(Date.now() + tokenResult.expires_in * 1000).toISOString();

    const connection = db.upsertGoogleConnection({
      user_id: userId,
      provider: 'google',
      google_account_id: tokenResult.account_id,
      google_email: tokenResult.email,
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      token_expires_at: expiresAt,
      scopes: tokenResult.scopes,
      status: 'active',
      connected_at: new Date().toISOString()
    });

    db.logAudit({
      user_id: userId,
      action: 'google.connected',
      entity_type: 'google_connection',
      entity_id: connection.id
    });

    // Check if browser requested HTML redirect
    const acceptHeader = req.get('accept') || '';
    if (acceptHeader.includes('text/html')) {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Google Account Connected</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; }
              .card { background: white; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center; max-width: 400px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
              .badge { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 12px; background: #ecfdf5; color: #059669; font-size: 24px; margin-bottom: 16px; }
              h2 { margin: 0 0 8px 0; color: #0f172a; }
              p { margin: 0 0 20px 0; color: #64748b; font-size: 14px; }
              a { display: inline-block; background: #34A853; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="badge">✓</div>
              <h2>Google Connected!</h2>
              <p>Your Google Business Profile has been linked successfully. You may close this window or return to your dashboard.</p>
              <a href="/?tab=reviews&connected=true">Go to Dashboard</a>
            </div>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GOOGLE_CONNECTED', success: true }, '*');
                setTimeout(() => window.close(), 1500);
              } else {
                setTimeout(() => { window.location.href = '/?tab=reviews&connected=true'; }, 2000);
              }
            </script>
          </body>
        </html>
      `);
      return;
    }

    res.json({
      success: true,
      message: 'Google account connected successfully.',
      data: {
        connection_id: connection.id,
        google_email: connection.google_email,
        connected_at: connection.connected_at
      }
    });
  } catch (err: any) {
    console.error('[GoogleCallback] Token exchange error:', err);
    res.status(500).json({
      success: false,
      message: `Failed to complete Google authentication: ${err.message}`
    });
  }
});

// ═══════════════════════════════════════════
// 3. CONNECTION STATUS
// ═══════════════════════════════════════════
// GET /api/v1/integrations/google/status
googleRouter.get('/status', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const connections = db.findGoogleConnectionsByUserId(req.user.id);
  const activeConn = connections.find((c) => c.status === 'active');
  const userLinks = db.findGoogleLocationLinksByUserId(req.user.id);

  // Return safe info without any tokens
  res.json({
    success: true,
    data: {
      connected: Boolean(activeConn),
      connection: activeConn
        ? {
            id: activeConn.id,
            provider: activeConn.provider,
            google_email: activeConn.google_email || 'Connected Google Account',
            google_account_id: activeConn.google_account_id,
            status: activeConn.status,
            connected_at: activeConn.connected_at,
            linked_locations_count: userLinks.length,
            last_synced_at: userLinks[0]?.last_synced_at
          }
        : null,
      connections: connections.map((c) => ({
        id: c.id,
        provider: c.provider,
        google_email: c.google_email,
        google_account_id: c.google_account_id,
        status: c.status,
        connected_at: c.connected_at
      }))
    }
  });
});

// ═══════════════════════════════════════════
// 4. DISCONNECT
// ═══════════════════════════════════════════
// POST /api/v1/integrations/google/disconnect
googleRouter.post('/disconnect', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { connection_id } = req.body;
  const connections = db.findGoogleConnectionsByUserId(req.user.id);

  let targetConn = connection_id
    ? connections.find((c) => c.id === connection_id)
    : connections[0];

  if (!targetConn) {
    res.status(404).json({ success: false, message: 'No Google connection found to disconnect.' });
    return;
  }

  db.disconnectGoogleConnection(targetConn.id);

  db.logAudit({
    user_id: req.user.id,
    action: 'google.disconnected',
    entity_type: 'google_connection',
    entity_id: targetConn.id
  });

  res.json({
    success: true,
    message: 'Google account disconnected successfully. Stored reviews and analytics are preserved.'
  });
});

// ═══════════════════════════════════════════
// 5. LOCATION DISCOVERY
// ═══════════════════════════════════════════
// GET /api/v1/integrations/google/locations
googleRouter.get('/locations', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { connection_id } = req.query;
  const connections = db.findGoogleConnectionsByUserId(req.user.id);
  const activeConn = connection_id
    ? connections.find((c) => c.id === connection_id)
    : connections.find((c) => c.status === 'active');

  if (!activeConn) {
    res.status(400).json({
      success: false,
      message: 'No active Google account connection found. Please connect your Google account first.'
    });
    return;
  }

  try {
    const locations = await GoogleBusinessProfileService.getLocations(activeConn.id);
    res.json({
      success: true,
      data: locations
    });
  } catch (err: any) {
    console.error('[GoogleLocations] Error discovering locations:', err);
    res.status(500).json({
      success: false,
      message: `Failed to fetch Google Business Profile locations: ${err.message}`
    });
  }
});

// ═══════════════════════════════════════════
// 6. LOCATION LINKS CRUD
// ═══════════════════════════════════════════
// GET /api/v1/integrations/google/location-links
googleRouter.get('/location-links', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { business_id } = req.query;
  let links = db.findGoogleLocationLinksByUserId(req.user.id);

  if (business_id) {
    links = links.filter((l) => l.business_id === business_id);
  }

  res.json({
    success: true,
    data: links
  });
});

// POST /api/v1/integrations/google/location-links
googleRouter.post('/location-links', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const {
    business_location_id,
    google_location_id,
    google_connection_id,
    google_account_id,
    google_location_name,
    google_maps_url
  } = req.body;

  if (!business_location_id || !google_location_id) {
    res.status(422).json({
      success: false,
      message: 'business_location_id and google_location_id are required.'
    });
    return;
  }

  // 1. Verify business_location_id belongs to a business owned by authenticated user
  const loc = db.findLocationById(business_location_id);
  if (!loc) {
    res.status(404).json({ success: false, message: 'ReviewFlow business location not found.' });
    return;
  }

  const biz = db.findBusinessById(loc.business_id);
  if (!biz || biz.user_id !== req.user.id) {
    res.status(403).json({ success: false, message: 'Access denied: You do not own this business location.' });
    return;
  }

  // 2. Resolve Google Connection
  const userConns = db.findGoogleConnectionsByUserId(req.user.id);
  const activeConn = google_connection_id
    ? userConns.find((c) => c.id === google_connection_id)
    : userConns.find((c) => c.status === 'active');

  if (!activeConn) {
    res.status(400).json({ success: false, message: 'No valid active Google connection found.' });
    return;
  }

  // 3. Create or update link
  const link = db.createGoogleLocationLink({
    business_id: biz.id,
    business_location_id,
    google_connection_id: activeConn.id,
    google_account_id: google_account_id || activeConn.google_account_id || 'accounts/default',
    google_location_id,
    google_location_name,
    google_maps_url,
    sync_status: 'idle'
  });

  db.logAudit({
    user_id: req.user.id,
    action: 'google.location_linked',
    entity_type: 'google_location_link',
    entity_id: link.id
  });

  // Automatically dispatch background review sync
  SyncGoogleReviewsJob.dispatch(link.id);

  res.status(201).json({
    success: true,
    message: 'Google location linked successfully. Initial review sync queued.',
    data: link
  });
});

// DELETE /api/v1/integrations/google/location-links/:id
googleRouter.delete('/location-links/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const link = db.findGoogleLocationLinkById(id);

  if (!link) {
    res.status(404).json({ success: false, message: 'Location link not found.' });
    return;
  }

  // Verify ownership
  const biz = db.findBusinessById(link.business_id);
  if (!biz || biz.user_id !== req.user.id) {
    res.status(403).json({ success: false, message: 'Access denied: You do not own this location link.' });
    return;
  }

  db.deleteGoogleLocationLink(id);

  db.logAudit({
    user_id: req.user.id,
    action: 'google.location_unlinked',
    entity_type: 'google_location_link',
    entity_id: id
  });

  res.json({
    success: true,
    message: 'Google location unlinked. Synced reviews have been preserved.'
  });
});

// ═══════════════════════════════════════════
// 7. MANUAL REVIEW SYNC DISPATCH
// ═══════════════════════════════════════════
// POST /api/v1/google/reviews/sync
googleRouter.post('/sync-reviews', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { business_location_id, google_location_link_id } = req.body;

  let link = google_location_link_id
    ? db.findGoogleLocationLinkById(google_location_link_id)
    : business_location_id
    ? db.findGoogleLocationLinkByLocationId(business_location_id)
    : db.findGoogleLocationLinksByUserId(req.user.id)[0];

  if (!link) {
    res.status(404).json({
      success: false,
      message: 'No linked Google location found to synchronize. Please link a location first.'
    });
    return;
  }

  // Ownership verification
  const biz = db.findBusinessById(link.business_id);
  if (!biz || biz.user_id !== req.user.id) {
    res.status(403).json({ success: false, message: 'Access denied.' });
    return;
  }

  const dispatchResult = SyncGoogleReviewsJob.dispatch(link.id);

  res.json({
    success: true,
    message: dispatchResult.message,
    data: {
      location_link_id: link.id,
      queued: dispatchResult.queued
    }
  });
});
