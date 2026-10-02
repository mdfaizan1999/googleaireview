// ReviewFlow AI Client-Side API Service

const TOKEN_KEY = 'reviewflow_auth_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export function removeStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export function isAuthenticated(): boolean {
  return Boolean(getStoredToken());
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isPublic = endpoint.startsWith('/api/public/') || endpoint === '/api/health';
  const token = !isPublic ? getStoredToken() : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Global 401 handling: clear invalid token and notify application (except during login attempts)
    if (response.status === 401 && !endpoint.includes('/api/v1/auth/login')) {
      removeStoredToken();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('reviewflow:unauthorized', {
            detail: { message: data.message || 'Authentication required. Please provide a valid Bearer token.' }
          })
        );
      }
    }

    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  auth: {
    async register(data: { name: string; email: string; password: string; phone?: string }) {
      const res = await request('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (res.data?.token) {
        setStoredToken(res.data.token);
      }
      return res;
    },

    async login(credentials: { email: string; password: string }) {
      const res = await request('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      if (res.data?.token) {
        setStoredToken(res.data.token);
      }
      return res;
    },

    async logout() {
      try {
        await request('/api/v1/auth/logout', { method: 'POST' });
      } finally {
        removeStoredToken();
      }
    },

    async getMe() {
      return request('/api/v1/auth/me');
    },

    async updateProfile(data: { phone?: string }) {
      return request('/api/v1/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    async changePassword(data: { current_password: string; new_password: string }) {
      return request('/api/v1/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async deactivate() {
      return request('/api/v1/auth/deactivate', {
        method: 'POST'
      });
    },

    async deleteAccount(confirmation: string) {
      return request('/api/v1/auth/delete', {
        method: 'POST',
        body: JSON.stringify({ confirmation })
      });
    }
  },

  businesses: {
    async list() {
      return request('/api/v1/businesses');
    },

    async get(id: string) {
      return request(`/api/v1/businesses/${id}`);
    },

    async create(data: any) {
      return request('/api/v1/businesses', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async update(id: string, data: any) {
      return request(`/api/v1/businesses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    async delete(id: string) {
      return request(`/api/v1/businesses/${id}`, {
        method: 'DELETE'
      });
    },

    async listLocations(businessId: string) {
      return request(`/api/v1/businesses/${businessId}/locations`);
    },

    async createLocation(businessId: string, data: any) {
      return request(`/api/v1/businesses/${businessId}/locations`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  },

  locations: {
    async list(businessId?: string) {
      if (businessId) {
        return request(`/api/v1/businesses/${businessId}/locations`);
      }
      return request('/api/v1/locations');
    },

    async get(id: string) {
      return request(`/api/v1/locations/${id}`);
    },

    async update(id: string, data: any) {
      return request(`/api/v1/locations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    async delete(id: string) {
      return request(`/api/v1/locations/${id}`, {
        method: 'DELETE'
      });
    }
  },

  funnels: {
    async list(params?: { business_id?: string; location_id?: string; status?: string; page?: number; per_page?: number }) {
      const query = new URLSearchParams();
      if (params?.business_id) query.set('business_id', params.business_id);
      if (params?.location_id) query.set('location_id', params.location_id);
      if (params?.status) query.set('status', params.status);
      if (params?.page) query.set('page', String(params.page));
      if (params?.per_page) query.set('per_page', String(params.per_page));
      const qs = query.toString();
      return request(`/api/v1/funnels${qs ? `?${qs}` : ''}`);
    },

    async get(id: string) {
      return request(`/api/v1/funnels/${id}`);
    },

    async create(data: any) {
      return request('/api/v1/funnels', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async update(id: string, data: any) {
      return request(`/api/v1/funnels/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    async delete(id: string) {
      return request(`/api/v1/funnels/${id}`, {
        method: 'DELETE'
      });
    }
  },

  qr: {
    async list(params?: { business_id?: string; funnel_id?: string; status?: string; page?: number; per_page?: number }) {
      const query = new URLSearchParams();
      if (params?.business_id) query.set('business_id', params.business_id);
      if (params?.funnel_id) query.set('funnel_id', params.funnel_id);
      if (params?.status) query.set('status', params.status);
      if (params?.page) query.set('page', String(params.page));
      if (params?.per_page) query.set('per_page', String(params.per_page));
      const qs = query.toString();
      return request(`/api/v1/qr${qs ? `?${qs}` : ''}`);
    },

    async get(id: string) {
      return request(`/api/v1/qr/${id}`);
    },

    async create(data: any) {
      return request('/api/v1/qr', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async update(id: string, data: any) {
      return request(`/api/v1/qr/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    async delete(id: string) {
      return request(`/api/v1/qr/${id}`, {
        method: 'DELETE'
      });
    },

    getDownloadUrl(id: string) {
      return `/api/v1/qr/${id}/download`;
    },

    getImageUrl(id: string) {
      return `/api/v1/qr/${id}/image`;
    }
  },

  public: {
    async getFunnel(slug: string) {
      return request(`/api/public/funnels/${slug}`);
    },

    async sendEvent(slug: string, data: any) {
      return request(`/api/public/funnels/${slug}/event`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async sendFeedback(slug: string, data: any) {
      return request(`/api/public/funnels/${slug}/feedback`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  },

  dashboard: {
    async getStats() {
      return request('/api/v1/dashboard/stats');
    }
  },

  analytics: {
    async getOverview(params?: { from?: string; to?: string; business_id?: string; location_id?: string; funnel_id?: string; compare?: boolean }) {
      const query = new URLSearchParams();
      if (params?.from) query.set('from', params.from);
      if (params?.to) query.set('to', params.to);
      if (params?.business_id) query.set('business_id', params.business_id);
      if (params?.location_id) query.set('location_id', params.location_id);
      if (params?.funnel_id) query.set('funnel_id', params.funnel_id);
      if (params?.compare) query.set('compare', 'true');
      const qs = query.toString();
      return request(`/api/v1/analytics/overview${qs ? `?${qs}` : ''}`);
    },

    async getTimeSeries(params?: { from?: string; to?: string; business_id?: string; location_id?: string; funnel_id?: string; granularity?: string }) {
      const query = new URLSearchParams();
      if (params?.from) query.set('from', params.from);
      if (params?.to) query.set('to', params.to);
      if (params?.business_id) query.set('business_id', params.business_id);
      if (params?.location_id) query.set('location_id', params.location_id);
      if (params?.funnel_id) query.set('funnel_id', params.funnel_id);
      if (params?.granularity) query.set('granularity', params.granularity);
      const qs = query.toString();
      return request(`/api/v1/analytics/timeseries${qs ? `?${qs}` : ''}`);
    },

    async getBusiness(businessId: string, params?: { from?: string; to?: string }) {
      const query = new URLSearchParams();
      if (params?.from) query.set('from', params.from);
      if (params?.to) query.set('to', params.to);
      const qs = query.toString();
      return request(`/api/v1/analytics/business/${businessId}${qs ? `?${qs}` : ''}`);
    },

    async getLocation(locationId: string, params?: { from?: string; to?: string }) {
      const query = new URLSearchParams();
      if (params?.from) query.set('from', params.from);
      if (params?.to) query.set('to', params.to);
      const qs = query.toString();
      return request(`/api/v1/analytics/location/${locationId}${qs ? `?${qs}` : ''}`);
    },

    async getFunnel(funnelId: string, params?: { from?: string; to?: string }) {
      const query = new URLSearchParams();
      if (params?.from) query.set('from', params.from);
      if (params?.to) query.set('to', params.to);
      const qs = query.toString();
      return request(`/api/v1/analytics/funnel/${funnelId}${qs ? `?${qs}` : ''}`);
    },

    async getQr(qrId: string, params?: { from?: string; to?: string }) {
      const query = new URLSearchParams();
      if (params?.from) query.set('from', params.from);
      if (params?.to) query.set('to', params.to);
      const qs = query.toString();
      return request(`/api/v1/analytics/qr/${qrId}${qs ? `?${qs}` : ''}`);
    },

    async getTopFunnels(params?: { business_id?: string; limit?: number }) {
      const query = new URLSearchParams();
      if (params?.business_id) query.set('business_id', params.business_id);
      if (params?.limit) query.set('limit', String(params.limit));
      const qs = query.toString();
      return request(`/api/v1/analytics/top-funnels${qs ? `?${qs}` : ''}`);
    },

    async getTopQr(params?: { business_id?: string; limit?: number }) {
      const query = new URLSearchParams();
      if (params?.business_id) query.set('business_id', params.business_id);
      if (params?.limit) query.set('limit', String(params.limit));
      const qs = query.toString();
      return request(`/api/v1/analytics/top-qr${qs ? `?${qs}` : ''}`);
    }
  },

  billing: {
    async getPlans() {
      return request('/api/v1/billing/plans');
    },

    async getStatus() {
      return request('/api/v1/billing/status');
    },

    async getSubscription() {
      return request('/api/v1/billing/subscription');
    },

    async checkout(data: { plan_id: string; interval?: 'monthly' | 'annual' }) {
      return request('/api/v1/billing/checkout', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async verifyPayment(data: {
      razorpay_payment_id: string;
      razorpay_subscription_id?: string;
      razorpay_signature?: string;
      plan_id: string;
      interval?: 'monthly' | 'annual';
    }) {
      return request('/api/v1/billing/verify', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async cancelSubscription(cancel_at_period_end: boolean = true) {
      return request('/api/v1/billing/cancel', {
        method: 'POST',
        body: JSON.stringify({ cancel_at_period_end })
      });
    },

    async reactivateSubscription() {
      return request('/api/v1/billing/reactivate', {
        method: 'POST'
      });
    },

    async getUsage() {
      return request('/api/v1/billing/usage');
    },

    async getInvoices() {
      return request('/api/v1/billing/invoices');
    },

    async getPayments() {
      return request('/api/v1/billing/payments');
    },

    async upgrade(data: { plan_id: string; utr?: string; gateway?: string }) {
      return request('/api/v1/billing/upgrade', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  },

  google: {
    async getConnectUrl(redirectUri?: string) {
      const qs = redirectUri ? `?redirect_uri=${encodeURIComponent(redirectUri)}` : '';
      return request(`/api/v1/integrations/google/connect${qs}`);
    },

    async getStatus() {
      return request('/api/v1/integrations/google/status');
    },

    async disconnect(connection_id?: string) {
      return request('/api/v1/integrations/google/disconnect', {
        method: 'POST',
        body: JSON.stringify({ connection_id })
      });
    },

    async getLocations(connection_id?: string) {
      const qs = connection_id ? `?connection_id=${connection_id}` : '';
      return request(`/api/v1/integrations/google/locations${qs}`);
    },

    async getLocationLinks(business_id?: string) {
      const qs = business_id ? `?business_id=${business_id}` : '';
      return request(`/api/v1/integrations/google/location-links${qs}`);
    },

    async linkLocation(data: {
      business_location_id: string;
      google_location_id: string;
      google_connection_id?: string;
      google_account_id?: string;
      google_location_name?: string;
      google_maps_url?: string;
    }) {
      return request('/api/v1/integrations/google/location-links', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async unlinkLocation(id: string) {
      return request(`/api/v1/integrations/google/location-links/${id}`, {
        method: 'DELETE'
      });
    },

    async syncReviews(data?: { business_location_id?: string; google_location_link_id?: string }) {
      return request('/api/v1/google/sync-reviews', {
        method: 'POST',
        body: JSON.stringify(data || {})
      });
    }
  },

  reviews: {
    async list(params?: {
      business_id?: string;
      location_id?: string;
      rating?: number;
      has_reply?: boolean;
      from?: string;
      to?: string;
      search?: string;
      page?: number;
      per_page?: number;
    }) {
      const query = new URLSearchParams();
      if (params?.business_id) query.set('business_id', params.business_id);
      if (params?.location_id) query.set('location_id', params.location_id);
      if (params?.rating) query.set('rating', String(params.rating));
      if (params?.has_reply !== undefined) query.set('has_reply', String(params.has_reply));
      if (params?.from) query.set('from', params.from);
      if (params?.to) query.set('to', params.to);
      if (params?.search) query.set('search', params.search);
      if (params?.page) query.set('page', String(params.page));
      if (params?.per_page) query.set('per_page', String(params.per_page));

      const qs = query.toString();
      return request(`/api/v1/reviews${qs ? `?${qs}` : ''}`);
    },

    async get(id: string) {
      return request(`/api/v1/reviews/${id}`);
    },

    async reply(id: string, reply: string) {
      return request(`/api/v1/reviews/${id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ reply })
      });
    },

    async updateReply(id: string, reply: string) {
      return request(`/api/v1/reviews/${id}/reply`, {
        method: 'PUT',
        body: JSON.stringify({ reply })
      });
    },

    async deleteReply(id: string) {
      return request(`/api/v1/reviews/${id}/reply`, {
        method: 'DELETE'
      });
    }
  },

  ai: {
    async generateReplySuggestion(reviewId: string, options?: { tone?: string; language?: string }) {
      return request(`/api/v1/ai/reviews/${reviewId}/reply-suggestion`, {
        method: 'POST',
        body: JSON.stringify(options || {})
      });
    },

    async analyzeReview(reviewId: string) {
      return request(`/api/v1/ai/reviews/${reviewId}/analyze`, {
        method: 'POST'
      });
    },

    async getSuggestions(reviewId: string) {
      return request(`/api/v1/ai/reviews/${reviewId}/suggestions`);
    },

    async updateSuggestion(suggestionId: string, data: { status?: string; suggestion?: string }) {
      return request(`/api/v1/ai/suggestions/${suggestionId}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    },

    async approveAndPublish(suggestionId: string, replyText?: string) {
      return request(`/api/v1/ai/suggestions/${suggestionId}/approve-and-publish`, {
        method: 'POST',
        body: JSON.stringify({ replyText })
      });
    },

    async getUsage(businessId?: string) {
      const query = businessId ? `?business_id=${businessId}` : '';
      return request(`/api/v1/ai/usage${query}`);
    }
  },

  admin: {
    async getDashboard() {
      return request('/api/v1/admin/dashboard');
    },

    async getUsers(params?: { search?: string; status?: string; role?: string; page?: number; per_page?: number }) {
      const query = new URLSearchParams();
      if (params?.search) query.set('search', params.search);
      if (params?.status) query.set('status', params.status);
      if (params?.role) query.set('role', params.role);
      if (params?.page) query.set('page', String(params.page));
      if (params?.per_page) query.set('per_page', String(params.per_page));
      const qs = query.toString();
      return request(`/api/v1/admin/users${qs ? `?${qs}` : ''}`);
    },

    async getUser(id: string) {
      return request(`/api/v1/admin/users/${id}`);
    },

    async suspendUser(id: string, reason?: string) {
      return request(`/api/v1/admin/users/${id}/suspend`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
    },

    async activateUser(id: string) {
      return request(`/api/v1/admin/users/${id}/activate`, {
        method: 'POST'
      });
    },

    async verifyUser(id: string) {
      return request(`/api/v1/admin/users/${id}/verify`, {
        method: 'POST'
      });
    },

    async resetUserSession(id: string) {
      return request(`/api/v1/admin/users/${id}/reset-session`, {
        method: 'POST'
      });
    },

    async impersonateUser(id: string) {
      return request(`/api/v1/admin/users/${id}/impersonate`, {
        method: 'POST'
      });
    },

    async updateUser(id: string, data: any) {
      return request(`/api/v1/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    async getBusinesses(params?: { search?: string; status?: string; page?: number; per_page?: number }) {
      const query = new URLSearchParams();
      if (params?.search) query.set('search', params.search);
      if (params?.status) query.set('status', params.status);
      if (params?.page) query.set('page', String(params.page));
      if (params?.per_page) query.set('per_page', String(params.per_page));
      const qs = query.toString();
      return request(`/api/v1/admin/businesses${qs ? `?${qs}` : ''}`);
    },

    async getFunnels() {
      return request('/api/v1/admin/funnels');
    },

    async getReviews() {
      return request('/api/v1/admin/reviews');
    },

    async getGoogleConnections() {
      return request('/api/v1/admin/google/connections');
    },

    async getGoogleSyncStatus() {
      return request('/api/v1/admin/google/sync-status');
    },

    async retryGoogleSync(id: string) {
      return request(`/api/v1/admin/google/retry-sync/${id}`, {
        method: 'POST'
      });
    },

    async getAiOverview() {
      return request('/api/v1/admin/ai/overview');
    },

    async getAiProviders() {
      return request('/api/v1/admin/ai/providers');
    },

    async adjustUsage(data: { business_id: string; reason: string; count_delta: number }) {
      return request('/api/v1/admin/usage/adjust', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async getPlans() {
      return request('/api/v1/admin/plans');
    },

    async createPlan(data: any) {
      return request('/api/v1/admin/plans', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async updatePlan(id: string, data: any) {
      return request(`/api/v1/admin/plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    async getSubscriptions() {
      return request('/api/v1/admin/subscriptions');
    },

    async syncSubscription(id: string) {
      return request(`/api/v1/admin/subscriptions/${id}/sync`, {
        method: 'POST'
      });
    },

    async getPayments() {
      return request('/api/v1/admin/payments');
    },

    async getInvoices() {
      return request('/api/v1/admin/invoices');
    },

    async getWebhooks() {
      return request('/api/v1/admin/webhooks');
    },

    async retryWebhook(id: string) {
      return request(`/api/v1/admin/webhooks/${id}/retry`, {
        method: 'POST'
      });
    },

    async getBillingReconciliation() {
      return request('/api/v1/admin/billing/reconciliation');
    },

    async getAuditLogs(params?: {
      admin_id?: string;
      user_id?: string;
      action?: string;
      entity_type?: string;
      page?: number;
      per_page?: number;
    }) {
      const query = new URLSearchParams();
      if (params?.admin_id) query.set('admin_id', params.admin_id);
      if (params?.user_id) query.set('user_id', params.user_id);
      if (params?.action) query.set('action', params.action);
      if (params?.entity_type) query.set('entity_type', params.entity_type);
      if (params?.page) query.set('page', String(params.page));
      if (params?.per_page) query.set('per_page', String(params.per_page));
      const qs = query.toString();
      return request(`/api/v1/admin/audit-logs${qs ? `?${qs}` : ''}`);
    },

    async getFeatureFlags() {
      return request('/api/v1/admin/feature-flags');
    },

    async toggleFeatureFlag(id: string) {
      return request(`/api/v1/admin/feature-flags/${id}/toggle`, {
        method: 'POST'
      });
    },

    async getSettings() {
      return request('/api/v1/admin/settings');
    },

    async updateSettings(data: any) {
      return request('/api/v1/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    async getSystemHealth() {
      return request('/api/v1/admin/system/health');
    },

    async getQueues() {
      return request('/api/v1/admin/system/queues');
    },

    async getFailedJobs() {
      return request('/api/v1/admin/system/failed-jobs');
    },

    async retryFailedJob(id: string) {
      return request(`/api/v1/admin/system/failed-jobs/${id}/retry`, {
        method: 'POST'
      });
    },

    async getSchedulerTasks() {
      return request('/api/v1/admin/system/scheduler');
    },

    async search(q: string) {
      return request(`/api/v1/admin/search?q=${encodeURIComponent(q)}`);
    }
  }
};
