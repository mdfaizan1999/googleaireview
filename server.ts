import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { authRouter } from './src/server/routes/auth';
import { businessesRouter } from './src/server/routes/businesses';
import { locationsRouter } from './src/server/routes/locations';
import { dashboardRouter } from './src/server/routes/dashboard';
import { analyticsRouter } from './src/server/routes/analytics';
import { billingRouter } from './src/server/routes/billing';
import { funnelsRouter } from './src/server/routes/funnels';
import { qrRouter } from './src/server/routes/qr';
import { publicRouter, handleQrRedirect } from './src/server/routes/public';
import { googleRouter } from './src/server/routes/google';
import { reviewsRouter } from './src/server/routes/reviews';
import { aiRouter } from './src/server/routes/ai';
import { adminRouter } from './src/server/routes/admin';
import { AnalyticsAggregationService } from './src/server/services/aggregation';
import { GoogleReviewSyncService } from './src/server/services/reviewSync';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(express.urlencoded({ extended: true }));

// CORS middleware allowing Authorization, Content-Type, Accept
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

// Razorpay Webhooks (dedicated mount)
app.post('/api/webhooks/razorpay', (req, res, next) => {
  // Delegate directly to billing webhook handler
  req.url = '/webhook';
  billingRouter(req, res, next);
});

// API Version 1 routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/businesses', businessesRouter);
app.use('/api/v1/locations', locationsRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/billing', billingRouter);
app.use('/api/v1/funnels', funnelsRouter);
app.use('/api/v1/qr', qrRouter);
app.use('/api/v1/integrations/google', googleRouter);
app.use('/api/v1/google', googleRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/public', publicRouter);

// Public QR Scan Redirection URL: /q/:shortCode
app.get('/q/:shortCode', handleQrRedirect);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'ReviewFlow AI Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ReviewFlow Server] Running on http://0.0.0.0:${PORT} in ${isProd ? 'production' : 'development'} mode`);

    // Run initial rolling window aggregation on startup
    try {
      const initResult = AnalyticsAggregationService.runRollingWindow();
      console.log(`[Analytics Scheduler] Initialized rolling aggregation: ${initResult.processedEvents} events, ${initResult.dailyRecordsUpserted} buckets.`);
    } catch (err) {
      console.error('[Analytics Scheduler] Initial aggregation failed:', err);
    }

    // Schedule automated rolling aggregation every 15 minutes
    setInterval(() => {
      try {
        AnalyticsAggregationService.runRollingWindow();
      } catch (err) {
        console.error('[Analytics Scheduler] Background aggregation failed:', err);
      }
    }, 15 * 60 * 1000);

    // Schedule automated Google reviews synchronization every 30 minutes
    setInterval(async () => {
      try {
        const syncResult = await GoogleReviewSyncService.syncAllActiveLinks();
        if (syncResult.linksProcessed > 0) {
          console.log(`[Google Sync Scheduler] Synced ${syncResult.totalSynced} reviews across ${syncResult.linksProcessed} locations.`);
        }
      } catch (err) {
        console.error('[Google Sync Scheduler] Background review sync failed:', err);
      }
    }, 30 * 60 * 1000);
  });
}

startServer();
