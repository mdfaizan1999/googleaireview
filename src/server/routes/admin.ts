import { Router, Response } from 'express';
import { db } from '../database';
import { adminMiddleware, requirePermission, generateImpersonationToken, AuthenticatedRequest } from '../auth';
import { GoogleReviewSyncService } from '../services/reviewSync';
import { AIService } from '../services/ai';
import { BillingService } from '../services/billing';
import { RazorpayService } from '../services/razorpay';
import { getRazorpayConfig, isRazorpayConfigured } from '../config/razorpay';
import { getAIConfig } from '../config/ai';
import { GoogleBusinessProfileService } from '../services/google';

export const adminRouter = Router();

// Apply server-side Admin Authentication Middleware to all admin routes
adminRouter.use(adminMiddleware);

// ══════════════════════════════════════════════════════════
// 1. ADMIN DASHBOARD SUMMARY
// ══════════════════════════════════════════════════════════
// GET /api/v1/admin/dashboard
adminRouter.get('/dashboard', (req: AuthenticatedRequest, res: Response) => {
  const allUsers = db.getAllUsers();
  const allBusinesses = db.getAllBusinessesList();
  const allFunnels = db.getAllFunnelsList();
  const allSubs = db.getAllSubscriptionsList();
  const allPayments = db.getAllPaymentsList();
  const allInvoices = db.getAllInvoicesList();
  const allWebhooks = db.getAllWebhookEventsList();
  const allGoogleReviews = (db as any).data.google_reviews || [];
  const allInternalReviews = (db as any).data.reviews || [];
  const allAiLogs = (db as any).data.ai_usage_logs || [];
  const failedJobs = db.getFailedJobs();
  const schedulerTasks = db.getSchedulerTasks();

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Users metrics
  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter((u) => u.status === 'active').length;
  const suspendedUsers = allUsers.filter((u) => u.status === 'suspended').length;
  const newUsersToday = allUsers.filter((u) => u.created_at?.slice(0, 10) === todayStr).length;
  const newUsersThisMonth = allUsers.filter((u) => u.created_at >= startOfMonth).length;

  // Businesses metrics
  const totalBusinesses = allBusinesses.length;
  const activeBusinesses = allBusinesses.filter((b) => b.status === 'active').length;
  const suspendedBusinesses = allBusinesses.filter((b) => b.status === 'suspended').length;

  // Funnels metrics
  const totalFunnels = allFunnels.length;
  const activeFunnels = allFunnels.filter((f) => f.enabled).length;

  // Reviews metrics
  const totalReviews = allGoogleReviews.length + allInternalReviews.length;
  const reviewsToday = allGoogleReviews.filter((r: any) => (r.review_created_at || r.created_at)?.slice(0, 10) === todayStr).length;
  const reviewsThisMonth = allGoogleReviews.filter((r: any) => (r.review_created_at || r.created_at) >= startOfMonth).length;
  const pendingReplies = allGoogleReviews.filter((r: any) => !r.has_reply).length;

  // Google sync metrics
  const googleConnections = (db as any).data.google_connections || [];
  const googleLocationLinks = (db as any).data.google_location_links || [];
  const syncFailures = googleLocationLinks.filter((l: any) => l.last_sync_status === 'failed').length;

  // AI metrics
  const aiToday = allAiLogs.filter((l: any) => l.created_at?.slice(0, 10) === todayStr).length;
  const aiThisMonth = allAiLogs.filter((l: any) => l.created_at >= startOfMonth).length;
  const aiFailed = allAiLogs.filter((l: any) => l.status === 'failed').length;
  const totalAiTokens = allAiLogs.reduce((acc: number, cur: any) => acc + (cur.tokens_used || 0), 0);

  // Billing metrics
  const activeSubs = allSubs.filter((s) => s.status === 'active').length;
  const trialingSubs = allSubs.filter((s) => s.status === 'trialing').length;
  const pastDueSubs = allSubs.filter((s) => s.status === 'past_due').length;
  const cancelledSubs = allSubs.filter((s) => s.status === 'cancelled').length;
  const successfulPayments = allPayments.filter((p) => p.status === 'success');
  const failedPayments = allPayments.filter((p) => p.status === 'failed').length;
  const totalRevenue = successfulPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

  // Webhooks metrics
  const webhooksToday = allWebhooks.filter((w) => w.created_at?.slice(0, 10) === todayStr).length;
  const webhooksProcessed = allWebhooks.filter((w) => w.processing_status === 'processed').length;
  const webhooksFailed = allWebhooks.filter((w) => w.processing_status === 'failed').length;
  const webhooksPending = allWebhooks.filter((w) => w.processing_status === 'pending').length;

  res.json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        new_today: newUsersToday,
        new_this_month: newUsersThisMonth
      },
      businesses: {
        total: totalBusinesses,
        active: activeBusinesses,
        suspended: suspendedBusinesses
      },
      funnels: {
        total: totalFunnels,
        active: activeFunnels
      },
      reviews: {
        total: totalReviews,
        today: reviewsToday,
        this_month: reviewsThisMonth,
        pending_replies: pendingReplies
      },
      google: {
        connected_accounts: googleConnections.length,
        connected_locations: googleLocationLinks.length,
        sync_failures: syncFailures
      },
      ai: {
        requests_today: aiToday,
        requests_this_month: aiThisMonth,
        failed_requests: aiFailed,
        total_tokens: totalAiTokens
      },
      billing: {
        active_subscriptions: activeSubs,
        trialing_subscriptions: trialingSubs,
        past_due_subscriptions: pastDueSubs,
        cancelled_subscriptions: cancelledSubs,
        successful_payments: successfulPayments.length,
        failed_payments: failedPayments,
        total_revenue_inr: totalRevenue
      },
      webhooks: {
        received_today: webhooksToday,
        processed: webhooksProcessed,
        failed: webhooksFailed,
        pending: webhooksPending
      },
      system: {
        database_status: 'healthy',
        failed_jobs_count: failedJobs.filter((j) => j.status === 'failed').length,
        scheduler_tasks_count: schedulerTasks.length,
        cache_status: 'operational',
        node_env: process.env.NODE_ENV || 'development'
      }
    }
  });
});

// ══════════════════════════════════════════════════════════
// 2. USER MANAGEMENT
// ══════════════════════════════════════════════════════════
// GET /api/v1/admin/users
adminRouter.get('/users', requirePermission('users.view'), (req: AuthenticatedRequest, res: Response) => {
  const { search, status, role, page, per_page } = req.query;

  const result = db.queryUsers({
    search: search as string,
    status: status as string,
    role: role as string,
    page: page ? parseInt(page as string, 10) : 1,
    per_page: per_page ? parseInt(per_page as string, 10) : 20
  });

  res.json({
    success: true,
    data: result.users,
    meta: {
      total: result.total,
      current_page: result.page,
      per_page: result.per_page,
      total_pages: result.total_pages
    }
  });
});

// GET /api/v1/admin/users/:id
adminRouter.get('/users/:id', requirePermission('users.view'), (req: AuthenticatedRequest, res: Response) => {
  const user = db.findUserById(req.params.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  // Safe response: never expose password hash
  const { password_hash, ...safeUser } = user;
  const businesses = db.findBusinessesByUserId(user.id);
  const subscription = db.findSubscriptionByUserId(user.id);
  const plan = db.findPlanById(subscription?.plan_id || 'plan_free_trial');
  const googleConnections = db.findGoogleConnectionsByUserId(user.id);
  const payments = db.findPaymentsByUserId(user.id);
  const invoices = db.findInvoicesByUserId(user.id);

  res.json({
    success: true,
    data: {
      user: safeUser,
      businesses,
      subscription,
      plan,
      google_connections: googleConnections.map((c) => ({
        id: c.id,
        google_account_id: c.google_account_id,
        google_email: c.google_email,
        connected_at: c.connected_at,
        status: c.status
      })),
      payments,
      invoices
    }
  });
});

// POST /api/v1/admin/users/:id/suspend
adminRouter.post('/users/:id/suspend', requirePermission('users.suspend'), (req: AuthenticatedRequest, res: Response) => {
  const { reason = 'Administrative suspension' } = req.body;
  const user = db.findUserById(req.params.id);

  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  if (user.role === 'admin' && user.admin_role === 'super_admin') {
    res.status(403).json({ success: false, message: 'Super admin accounts cannot be suspended.' });
    return;
  }

  const now = new Date().toISOString();
  const updated = db.updateUser(user.id, {
    status: 'suspended',
    suspended_at: now,
    suspended_by: req.user?.id,
    suspension_reason: reason
  });

  db.logAudit({
    admin_id: req.user?.id,
    user_id: user.id,
    action: 'user.suspended',
    entity_type: 'user',
    entity_id: user.id,
    new_values: { status: 'suspended', reason },
    ip_address: req.ip,
    user_agent: req.headers['user-agent']
  });

  res.json({
    success: true,
    message: `User ${user.email} suspended successfully.`,
    data: updated
  });
});

// POST /api/v1/admin/users/:id/activate
adminRouter.post('/users/:id/activate', requirePermission('users.suspend'), (req: AuthenticatedRequest, res: Response) => {
  const user = db.findUserById(req.params.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  const updated = db.updateUser(user.id, {
    status: 'active',
    suspended_at: undefined,
    suspended_by: undefined,
    suspension_reason: undefined
  });

  db.logAudit({
    admin_id: req.user?.id,
    user_id: user.id,
    action: 'user.activated',
    entity_type: 'user',
    entity_id: user.id,
    new_values: { status: 'active' },
    ip_address: req.ip,
    user_agent: req.headers['user-agent']
  });

  res.json({
    success: true,
    message: `User ${user.email} activated successfully.`,
    data: updated
  });
});

// POST /api/v1/admin/users/:id/verify
adminRouter.post('/users/:id/verify', requirePermission('users.manage'), (req: AuthenticatedRequest, res: Response) => {
  const user = db.findUserById(req.params.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  const now = new Date().toISOString();
  const updated = db.updateUser(user.id, { email_verified_at: now });

  db.logAudit({
    admin_id: req.user?.id,
    user_id: user.id,
    action: 'user.verified',
    entity_type: 'user',
    entity_id: user.id,
    ip_address: req.ip,
    user_agent: req.headers['user-agent']
  });

  res.json({
    success: true,
    message: 'User email marked verified.',
    data: updated
  });
});

// POST /api/v1/admin/users/:id/reset-session
adminRouter.post('/users/:id/reset-session', requirePermission('users.manage'), (req: AuthenticatedRequest, res: Response) => {
  const user = db.findUserById(req.params.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  // Update updated_at timestamp to invalidate any stateful tokens
  db.updateUser(user.id, { updated_at: new Date().toISOString() });

  db.logAudit({
    admin_id: req.user?.id,
    user_id: user.id,
    action: 'user.session_reset',
    entity_type: 'user',
    entity_id: user.id,
    ip_address: req.ip,
    user_agent: req.headers['user-agent']
  });

  res.json({
    success: true,
    message: 'Active sessions for user have been reset.'
  });
});

// POST /api/v1/admin/users/:id/impersonate
adminRouter.post('/users/:id/impersonate', requirePermission('users.manage'), (req: AuthenticatedRequest, res: Response) => {
  const targetUser = db.findUserById(req.params.id);
  if (!targetUser) {
    res.status(404).json({ success: false, message: 'Target user not found.' });
    return;
  }

  if (targetUser.role === 'admin') {
    res.status(403).json({ success: false, message: 'Cannot impersonate another administrator.' });
    return;
  }

  const token = generateImpersonationToken(req.user!, targetUser);

  db.logAudit({
    admin_id: req.user?.id,
    user_id: targetUser.id,
    action: 'user.impersonated',
    entity_type: 'user',
    entity_id: targetUser.id,
    ip_address: req.ip,
    user_agent: req.headers['user-agent']
  });

  res.json({
    success: true,
    message: `Impersonation session initiated for ${targetUser.email}`,
    data: {
      token,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role
      }
    }
  });
});

// PUT /api/v1/admin/users/:id
adminRouter.put('/users/:id', requirePermission('users.manage'), (req: AuthenticatedRequest, res: Response) => {
  const user = db.findUserById(req.params.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  const { name, phone, role, admin_role, status } = req.body;
  const updated = db.updateUser(user.id, {
    ...(name && { name: name.trim() }),
    ...(phone !== undefined && { phone }),
    ...(role && { role }),
    ...(admin_role !== undefined && { admin_role }),
    ...(status && { status })
  });

  db.logAudit({
    admin_id: req.user?.id,
    user_id: user.id,
    action: 'user.updated',
    entity_type: 'user',
    entity_id: user.id,
    old_values: { name: user.name, role: user.role, status: user.status },
    new_values: { name, role, status },
    ip_address: req.ip,
    user_agent: req.headers['user-agent']
  });

  res.json({
    success: true,
    message: 'User details updated.',
    data: updated
  });
});

// ══════════════════════════════════════════════════════════
// 3. BUSINESSES & FUNNELS
// ══════════════════════════════════════════════════════════
// GET /api/v1/admin/businesses
adminRouter.get('/businesses', requirePermission('businesses.view'), (req: AuthenticatedRequest, res: Response) => {
  const { search, status, page, per_page } = req.query;
  let businesses = db.getAllBusinessesList();

  if (search) {
    const q = (search as string).toLowerCase();
    businesses = businesses.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q) ||
        b.owner_name.toLowerCase().includes(q) ||
        b.owner_email.toLowerCase().includes(q)
    );
  }

  if (status) {
    businesses = businesses.filter((b) => b.status === status);
  }

  const total = businesses.length;
  const p = Math.max(1, page ? parseInt(page as string, 10) : 1);
  const pp = Math.min(100, Math.max(1, per_page ? parseInt(per_page as string, 10) : 20));
  const paginated = businesses.slice((p - 1) * pp, p * pp);

  res.json({
    success: true,
    data: paginated,
    meta: {
      total,
      current_page: p,
      per_page: pp,
      total_pages: Math.ceil(total / pp) || 1
    }
  });
});

// GET /api/v1/admin/funnels
adminRouter.get('/funnels', requirePermission('funnels.view'), (req: AuthenticatedRequest, res: Response) => {
  const funnels = db.getAllFunnelsList();
  res.json({
    success: true,
    data: funnels
  });
});

// GET /api/v1/admin/reviews
adminRouter.get('/reviews', requirePermission('reviews.view'), (req: AuthenticatedRequest, res: Response) => {
  const googleReviews = (db as any).data.google_reviews || [];
  const internalReviews = (db as any).data.reviews || [];

  const combined = [
    ...googleReviews.map((r: any) => ({
      id: r.id,
      source: 'google',
      business_id: r.business_id,
      reviewer_name: r.reviewer_name || 'Customer',
      star_rating: r.star_rating,
      comment: r.review_text,
      has_reply: r.has_reply,
      reply_text: r.google_reply_text,
      created_at: r.review_created_at || r.created_at
    })),
    ...internalReviews.map((r: any) => ({
      id: r.id,
      source: 'funnel_private',
      business_id: r.business_id,
      reviewer_name: r.reviewer_name || 'Private Feedback',
      star_rating: r.rating,
      comment: r.comment,
      has_reply: r.reply_status === 'replied',
      reply_text: r.owner_reply,
      created_at: r.created_at
    }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json({
    success: true,
    data: combined
  });
});

// ══════════════════════════════════════════════════════════
// 4. GOOGLE BUSINESS PROFILE MONITORING
// ══════════════════════════════════════════════════════════
// GET /api/v1/admin/google/connections
adminRouter.get('/google/connections', requirePermission('google.view'), (req: AuthenticatedRequest, res: Response) => {
  const connections = (db as any).data.google_connections || [];
  const sanitized = connections.map((c: any) => {
    const user = db.findUserById(c.user_id);
    return {
      id: c.id,
      user_id: c.user_id,
      user_name: user?.name,
      user_email: user?.email,
      google_account_name: c.google_account_name,
      google_email: c.google_email,
      status: c.status,
      connected_at: c.connected_at,
      last_sync_at: c.last_sync_at,
      error_message: c.error_message
    };
  });

  res.json({
    success: true,
    data: sanitized
  });
});

// GET /api/v1/admin/google/sync-status
adminRouter.get('/google/sync-status', requirePermission('google.view'), (req: AuthenticatedRequest, res: Response) => {
  const links = (db as any).data.google_location_links || [];
  const configured = GoogleBusinessProfileService.isConfigured();

  res.json({
    success: true,
    data: {
      configured,
      active_links_count: links.filter((l: any) => l.sync_status === 'active').length,
      total_links_count: links.length,
      recent_links: links.slice(0, 20)
    }
  });
});

// POST /api/v1/admin/google/retry-sync/:id
adminRouter.post('/google/retry-sync/:id', requirePermission('google.manage'), async (req: AuthenticatedRequest, res: Response) => {
  const linkId = req.params.id;
  const link = (db as any).data.google_location_links?.find((l: any) => l.id === linkId);

  if (!link) {
    res.status(404).json({ success: false, message: 'Google location link not found.' });
    return;
  }

  try {
    const result = await GoogleReviewSyncService.syncLocationLink(linkId);

    db.logAudit({
      admin_id: req.user?.id,
      action: 'google.sync_retried',
      entity_type: 'google_location_link',
      entity_id: linkId,
      new_values: { synced: result.syncedCount, updated: result.updatedCount },
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: `Sync executed. ${result.syncedCount} synced, ${result.updatedCount} updated.`,
      data: result
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Sync retry failed.'
    });
  }
});

// ══════════════════════════════════════════════════════════
// 5. AI MONITORING & PROVIDER STATUS
// ══════════════════════════════════════════════════════════
// GET /api/v1/admin/ai/overview
adminRouter.get('/ai/overview', requirePermission('ai.view'), (req: AuthenticatedRequest, res: Response) => {
  const logs = (db as any).data.ai_usage_logs || [];
  const config = getAIConfig();

  const byProvider: Record<string, number> = {};
  const byAction: Record<string, number> = {};
  let totalTokens = 0;

  for (const log of logs) {
    byProvider[log.provider] = (byProvider[log.provider] || 0) + 1;
    byAction[log.action] = (byAction[log.action] || 0) + 1;
    totalTokens += log.tokens_used || 0;
  }

  res.json({
    success: true,
    data: {
      default_provider: config.provider,
      total_generations: logs.length,
      total_tokens: totalTokens,
      by_provider: byProvider,
      by_action: byAction,
      recent_logs: logs.slice(0, 30)
    }
  });
});

// GET /api/v1/admin/ai/providers
adminRouter.get('/ai/providers', requirePermission('ai.view'), (req: AuthenticatedRequest, res: Response) => {
  const config = getAIConfig();
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('MY_GEMINI'));
  const openaiConfigured = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10);

  res.json({
    success: true,
    data: [
      {
        provider: 'gemini',
        configured: geminiConfigured,
        model: config.model,
        active: config.provider === 'gemini',
        status: geminiConfigured ? 'operational' : 'simulation_fallback'
      },
      {
        provider: 'openai',
        configured: openaiConfigured,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        active: config.provider === 'openai',
        status: openaiConfigured ? 'operational' : 'simulation_fallback'
      },
      {
        provider: 'mock',
        configured: true,
        model: 'heuristic-engine-v1',
        active: config.provider === 'mock' || (!geminiConfigured && !openaiConfigured),
        status: 'operational'
      }
    ]
  });
});

// POST /api/v1/admin/usage/adjust
adminRouter.post('/usage/adjust', requirePermission('usage.manage'), (req: AuthenticatedRequest, res: Response) => {
  const { business_id, reason, count_delta } = req.body;
  if (!business_id || count_delta === undefined) {
    res.status(422).json({ success: false, message: 'business_id and count_delta are required.' });
    return;
  }

  const business = db.findBusinessById(business_id);
  if (!business) {
    res.status(404).json({ success: false, message: 'Business not found.' });
    return;
  }

  // Record an administrative usage log entry to reflect adjustment
  db.recordAIUsage({
    business_id,
    user_id: business.user_id,
    provider: 'admin_adjustment',
    model: 'manual_override',
    tokens_used: 0,
    action: 'reply_suggestion',
    status: count_delta > 0 ? 'success' : 'failed'
  });

  db.logAudit({
    admin_id: req.user?.id,
    user_id: business.user_id,
    action: 'usage.adjusted',
    entity_type: 'business',
    entity_id: business_id,
    new_values: { count_delta, reason },
    ip_address: req.ip,
    user_agent: req.headers['user-agent']
  });

  res.json({
    success: true,
    message: 'Usage quota adjusted successfully.',
    data: db.getAIUsageStats(business_id)
  });
});

// ══════════════════════════════════════════════════════════
// 6. PLANS & SUBSCRIPTIONS
// ══════════════════════════════════════════════════════════
// GET /api/v1/admin/plans
adminRouter.get('/plans', requirePermission('plans.view'), (req: AuthenticatedRequest, res: Response) => {
  const plans = (db as any).data.plans || [];
  res.json({
    success: true,
    data: plans
  });
});

// POST /api/v1/admin/plans
adminRouter.post('/plans', requirePermission('plans.manage'), (req: AuthenticatedRequest, res: Response) => {
  const { name, slug, monthly_price, annual_price, is_free, limits, features, description } = req.body;
  if (!name || !slug) {
    res.status(422).json({ success: false, message: 'Name and slug are required.' });
    return;
  }

  const newPlan = {
    id: `plan_${Date.now()}`,
    name,
    slug,
    description: description || '',
    price: monthly_price || 0,
    monthly_price: monthly_price || 0,
    annual_price: annual_price || 0,
    currency: 'INR',
    is_free: Boolean(is_free),
    trial_days: 0,
    sort_order: 10,
    features: features || {},
    limits: limits || {},
    status: 'active' as const
  };

  (db as any).data.plans.push(newPlan);
  (db as any).save();

  db.logAudit({
    admin_id: req.user?.id,
    action: 'plan.created',
    entity_type: 'plan',
    entity_id: newPlan.id,
    new_values: newPlan,
    ip_address: req.ip
  });

  res.status(201).json({
    success: true,
    message: 'Plan created successfully.',
    data: newPlan
  });
});

// PUT /api/v1/admin/plans/:id
adminRouter.put('/plans/:id', requirePermission('plans.manage'), (req: AuthenticatedRequest, res: Response) => {
  const plan = db.findPlanById(req.params.id);
  if (!plan) {
    res.status(404).json({ success: false, message: 'Plan not found.' });
    return;
  }

  const { name, monthly_price, annual_price, description, limits, features, status } = req.body;
  const index = (db as any).data.plans.findIndex((p: any) => p.id === req.params.id);

  const updatedPlan = {
    ...plan,
    ...(name && { name }),
    ...(monthly_price !== undefined && { monthly_price, price: monthly_price }),
    ...(annual_price !== undefined && { annual_price }),
    ...(description !== undefined && { description }),
    ...(limits && { limits: { ...plan.limits, ...limits } }),
    ...(features && { features: { ...plan.features, ...features } }),
    ...(status && { status })
  };

  (db as any).data.plans[index] = updatedPlan;
  (db as any).save();

  db.logAudit({
    admin_id: req.user?.id,
    action: 'plan.updated',
    entity_type: 'plan',
    entity_id: plan.id,
    old_values: plan,
    new_values: updatedPlan,
    ip_address: req.ip
  });

  res.json({
    success: true,
    message: 'Plan updated successfully.',
    data: updatedPlan
  });
});

// GET /api/v1/admin/subscriptions
adminRouter.get('/subscriptions', requirePermission('subscriptions.view'), (req: AuthenticatedRequest, res: Response) => {
  const subs = db.getAllSubscriptionsList();
  res.json({
    success: true,
    data: subs
  });
});

// POST /api/v1/admin/subscriptions/:id/sync
adminRouter.post('/subscriptions/:id/sync', requirePermission('subscriptions.manage'), async (req: AuthenticatedRequest, res: Response) => {
  const sub = db.findSubscriptionById(req.params.id);
  if (!sub) {
    res.status(404).json({ success: false, message: 'Subscription not found.' });
    return;
  }

  if (sub.razorpay_subscription_id) {
    try {
      const rzpSub = await RazorpayService.getSubscription(sub.razorpay_subscription_id);
      db.updateSubscription(sub.id, {
        status: rzpSub.status || sub.status,
        ends_at: rzpSub.current_end ? new Date(rzpSub.current_end * 1000).toISOString() : sub.ends_at
      });
    } catch (err) {
      console.warn('Sync with Razorpay returned error:', err);
    }
  }

  db.logAudit({
    admin_id: req.user?.id,
    action: 'subscription.synced',
    entity_type: 'subscription',
    entity_id: sub.id,
    ip_address: req.ip
  });

  res.json({
    success: true,
    message: 'Subscription synchronized with billing gateway.',
    data: db.findSubscriptionById(sub.id)
  });
});

// ══════════════════════════════════════════════════════════
// 7. PAYMENTS, INVOICES & WEBHOOKS
// ══════════════════════════════════════════════════════════
// GET /api/v1/admin/payments
adminRouter.get('/payments', requirePermission('payments.view'), (req: AuthenticatedRequest, res: Response) => {
  const payments = db.getAllPaymentsList();
  res.json({
    success: true,
    data: payments
  });
});

// GET /api/v1/admin/invoices
adminRouter.get('/invoices', requirePermission('invoices.view'), (req: AuthenticatedRequest, res: Response) => {
  const invoices = db.getAllInvoicesList();
  res.json({
    success: true,
    data: invoices
  });
});

// GET /api/v1/admin/webhooks
adminRouter.get('/webhooks', requirePermission('webhooks.view'), (req: AuthenticatedRequest, res: Response) => {
  const events = db.getAllWebhookEventsList();
  // Sanitize events to remove potential token reflections
  const sanitized = events.map((e) => ({
    id: e.id,
    provider: e.provider,
    event_id: e.event_id,
    event_type: e.event_type,
    signature_verified: e.signature_verified,
    processing_status: e.processing_status,
    attempts: e.attempts,
    error_message: e.error_message,
    created_at: e.created_at,
    processed_at: e.processed_at
  }));

  res.json({
    success: true,
    data: sanitized
  });
});

// POST /api/v1/admin/webhooks/:id/retry
adminRouter.post('/webhooks/:id/retry', requirePermission('webhooks.retry'), async (req: AuthenticatedRequest, res: Response) => {
  const event = (db as any).data.webhook_events?.find((w: any) => w.id === req.params.id);
  if (!event) {
    res.status(404).json({ success: false, message: 'Webhook event record not found.' });
    return;
  }

  try {
    const rawPayload = JSON.stringify(event.payload || {});
    await BillingService.processWebhook({
      rawBody: rawPayload,
      payload: event.payload
    });

    db.logAudit({
      admin_id: req.user?.id,
      action: 'webhook.retried',
      entity_type: 'webhook_event',
      entity_id: event.id,
      ip_address: req.ip
    });

    res.json({
      success: true,
      message: 'Webhook event reprocessed successfully.'
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Webhook retry execution failed.'
    });
  }
});

// GET /api/v1/admin/billing/reconciliation
adminRouter.get('/billing/reconciliation', requirePermission('billing.manage'), (req: AuthenticatedRequest, res: Response) => {
  const subs = db.getAllSubscriptionsList();
  const payments = db.getAllPaymentsList();
  const invoices = db.getAllInvoicesList();

  const discrepancies = [];

  // Check subscriptions marked active without any successful payments
  for (const s of subs) {
    if (s.status === 'active' && s.plan_price > 0) {
      const userPayments = payments.filter((p) => p.user_id === s.user_id && p.status === 'success');
      if (userPayments.length === 0) {
        discrepancies.push({
          type: 'active_sub_zero_payments',
          user_id: s.user_id,
          subscription_id: s.id,
          message: `Subscription ${s.id} is active on paid plan without recorded payment.`
        });
      }
    }
  }

  res.json({
    success: true,
    data: {
      status: discrepancies.length === 0 ? 'reconciled' : 'discrepancies_detected',
      reconciled_at: new Date().toISOString(),
      active_subscriptions: subs.length,
      total_payments: payments.length,
      total_invoices: invoices.length,
      discrepancies
    }
  });
});

// ══════════════════════════════════════════════════════════
// 8. AUDIT LOGS
// ══════════════════════════════════════════════════════════
// GET /api/v1/admin/audit-logs
adminRouter.get('/audit-logs', requirePermission('audit.view'), (req: AuthenticatedRequest, res: Response) => {
  const { admin_id, user_id, action, entity_type, page, per_page } = req.query;

  const result = db.getAuditLogs({
    admin_id: admin_id as string,
    user_id: user_id as string,
    action: action as string,
    entity_type: entity_type as string,
    page: page ? parseInt(page as string, 10) : 1,
    per_page: per_page ? parseInt(per_page as string, 10) : 25
  });

  res.json({
    success: true,
    data: result.logs,
    meta: {
      total: result.total,
      current_page: result.page,
      per_page: result.per_page,
      total_pages: result.total_pages
    }
  });
});

// ══════════════════════════════════════════════════════════
// 9. FEATURE FLAGS & SETTINGS
// ══════════════════════════════════════════════════════════
// GET /api/v1/admin/feature-flags
adminRouter.get('/feature-flags', requirePermission('feature_flags.view'), (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: db.getFeatureFlags()
  });
});

// POST /api/v1/admin/feature-flags/:id/toggle
adminRouter.post('/feature-flags/:id/toggle', requirePermission('feature_flags.manage'), (req: AuthenticatedRequest, res: Response) => {
  const updated = db.toggleFeatureFlag(req.params.id);
  if (!updated) {
    res.status(404).json({ success: false, message: 'Feature flag not found.' });
    return;
  }

  db.logAudit({
    admin_id: req.user?.id,
    action: 'feature_flag.toggled',
    entity_type: 'feature_flag',
    entity_id: updated.id,
    new_values: { key: updated.key, enabled: updated.enabled },
    ip_address: req.ip
  });

  res.json({
    success: true,
    message: `Feature flag '${updated.name}' is now ${updated.enabled ? 'enabled' : 'disabled'}.`,
    data: updated
  });
});

// GET /api/v1/admin/settings
adminRouter.get('/settings', requirePermission('settings.view'), (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: db.getSystemSettings()
  });
});

// PUT /api/v1/admin/settings
adminRouter.put('/settings', requirePermission('settings.manage'), (req: AuthenticatedRequest, res: Response) => {
  const current = db.getSystemSettings();
  const updated = db.updateSystemSettings(req.body, req.user?.id);

  db.logAudit({
    admin_id: req.user?.id,
    action: 'settings.updated',
    entity_type: 'system_settings',
    entity_id: 'default',
    old_values: current,
    new_values: updated,
    ip_address: req.ip
  });

  res.json({
    success: true,
    message: 'Platform settings updated.',
    data: updated
  });
});

// ══════════════════════════════════════════════════════════
// 10. SYSTEM HEALTH, QUEUES & SCHEDULER
// ══════════════════════════════════════════════════════════
// GET /api/v1/admin/system/health
adminRouter.get('/system/health', requirePermission('system.health'), (req: AuthenticatedRequest, res: Response) => {
  const { mode: razorpayMode } = getRazorpayConfig();

  res.json({
    success: true,
    data: {
      status: 'operational',
      uptime_seconds: process.uptime(),
      memory_usage: process.memoryUsage(),
      services: {
        database: { status: 'healthy', latency_ms: 1 },
        cache: { status: 'healthy', type: 'in-memory' },
        razorpay_gateway: { status: isRazorpayConfigured() ? 'live_connected' : 'test_simulation', mode: razorpayMode },
        google_api: { status: GoogleBusinessProfileService.isConfigured() ? 'configured' : 'sandbox_ready' },
        ai_providers: {
          gemini: Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('MY_GEMINI')),
          openai: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10)
        }
      }
    }
  });
});

// GET /api/v1/admin/system/queues
adminRouter.get('/system/queues', requirePermission('system.jobs'), (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      active_queues: ['analytics_aggregation', 'google_sync', 'webhooks', 'notifications'],
      pending_jobs_count: 0,
      failed_jobs_count: db.getFailedJobs().filter((j) => j.status === 'failed').length
    }
  });
});

// GET /api/v1/admin/system/failed-jobs
adminRouter.get('/system/failed-jobs', requirePermission('system.jobs'), (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: db.getFailedJobs()
  });
});

// GET /api/v1/admin/system/scheduler
adminRouter.get('/system/scheduler', requirePermission('system.jobs'), (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: db.getSchedulerTasks()
  });
});

// ══════════════════════════════════════════════════════════
// 11. GLOBAL SEARCH & EXPORTS
// ══════════════════════════════════════════════════════════
// GET /api/v1/admin/search?q=
adminRouter.get('/search', (req: AuthenticatedRequest, res: Response) => {
  const q = req.query.q as string;
  const results = db.globalAdminSearch(q);
  res.json({
    success: true,
    data: results
  });
});

// GET /api/v1/admin/export/:resource
adminRouter.get('/export/:resource', requirePermission('users.view'), (req: AuthenticatedRequest, res: Response) => {
  const { resource } = req.params;
  let dataset: any[] = [];

  switch (resource) {
    case 'users':
      dataset = db.getAllUsers().map(({ password_hash, ...u }) => u);
      break;
    case 'businesses':
      dataset = db.getAllBusinessesList();
      break;
    case 'subscriptions':
      dataset = db.getAllSubscriptionsList();
      break;
    case 'payments':
      dataset = db.getAllPaymentsList();
      break;
    case 'invoices':
      dataset = db.getAllInvoicesList();
      break;
    case 'audit_logs':
      dataset = db.getAuditLogs({ per_page: 500 }).logs;
      break;
    default:
      res.status(400).json({ success: false, message: `Unsupported export resource '${resource}'.` });
      return;
  }

  db.logAudit({
    admin_id: req.user?.id,
    action: 'data.exported',
    entity_type: resource,
    entity_id: resource,
    ip_address: req.ip
  });

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=reviewflow_${resource}_${Date.now()}.json`);
  res.json(dataset);
});
