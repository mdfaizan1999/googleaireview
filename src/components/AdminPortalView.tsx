import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface AdminPortalViewProps {
  onBackToDashboard?: () => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  onBackToDashboard,
  onNotify
}) => {
  // Navigation tabs
  const [activeSection, setActiveSection] = useState<
    | 'dashboard'
    | 'users'
    | 'businesses'
    | 'funnels'
    | 'reviews'
    | 'google'
    | 'ai'
    | 'plans'
    | 'subscriptions'
    | 'payments'
    | 'invoices'
    | 'webhooks'
    | 'audit'
    | 'feature_flags'
    | 'settings'
    | 'system'
  >('dashboard');

  // Loading states
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Search & Global state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Section Specific Data
  const [users, setUsers] = useState<any[]>([]);
  const [usersMeta, setUsersMeta] = useState<any>({ total: 0, current_page: 1 });
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');
  const [selectedUserDetail, setSelectedUserDetail] = useState<any | null>(null);
  const [suspendModalUser, setSuspendModalUser] = useState<any | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [funnels, setFunnels] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [googleConnections, setGoogleConnections] = useState<any[]>([]);
  const [googleSyncStatus, setGoogleSyncStatus] = useState<any>(null);
  const [aiOverview, setAiOverview] = useState<any>(null);
  const [aiProviders, setAiProviders] = useState<any[]>([]);
  const [showUsageAdjustModal, setShowUsageAdjustModal] = useState(false);
  const [adjustBizId, setAdjustBizId] = useState('');
  const [adjustDelta, setAdjustDelta] = useState(50);
  const [adjustReason, setAdjustReason] = useState('Customer Support Courtesy Credit');

  const [plans, setPlans] = useState<any[]>([]);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [reconciliation, setReconciliation] = useState<any | null>(null);

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [selectedAuditLog, setSelectedAuditLog] = useState<any | null>(null);

  const [featureFlags, setFeatureFlags] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [failedJobs, setFailedJobs] = useState<any[]>([]);
  const [schedulerTasks, setSchedulerTasks] = useState<any[]>([]);

  // Load Dashboard Data
  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getDashboard();
      if (res.data) setDashboardData(res.data);
    } catch (err: any) {
      onNotify('Failed to load admin metrics: ' + (err.message || 'Unauthorized'), 'warning');
    } finally {
      setLoading(false);
    }
  };

  // Load Section Data based on active tab
  const loadSectionData = async () => {
    try {
      setLoading(true);
      switch (activeSection) {
        case 'dashboard':
          await loadDashboard();
          break;
        case 'users': {
          const res = await api.admin.getUsers({ search: userSearch, status: userStatusFilter });
          if (res.data) {
            setUsers(res.data);
            setUsersMeta(res.meta || {});
          }
          break;
        }
        case 'businesses': {
          const res = await api.admin.getBusinesses();
          if (res.data) setBusinesses(res.data);
          break;
        }
        case 'funnels': {
          const res = await api.admin.getFunnels();
          if (res.data) setFunnels(res.data);
          break;
        }
        case 'reviews': {
          const res = await api.admin.getReviews();
          if (res.data) setReviews(res.data);
          break;
        }
        case 'google': {
          const [connRes, syncRes] = await Promise.all([
            api.admin.getGoogleConnections(),
            api.admin.getGoogleSyncStatus()
          ]);
          if (connRes.data) setGoogleConnections(connRes.data);
          if (syncRes.data) setGoogleSyncStatus(syncRes.data);
          break;
        }
        case 'ai': {
          const [overRes, provRes] = await Promise.all([
            api.admin.getAiOverview(),
            api.admin.getAiProviders()
          ]);
          if (overRes.data) setAiOverview(overRes.data);
          if (provRes.data) setAiProviders(provRes.data);
          break;
        }
        case 'plans': {
          const res = await api.admin.getPlans();
          if (res.data) setPlans(res.data);
          break;
        }
        case 'subscriptions': {
          const [subRes, recRes] = await Promise.all([
            api.admin.getSubscriptions(),
            api.admin.getBillingReconciliation()
          ]);
          if (subRes.data) setSubscriptions(subRes.data);
          if (recRes.data) setReconciliation(recRes.data);
          break;
        }
        case 'payments': {
          const [payRes, invRes] = await Promise.all([
            api.admin.getPayments(),
            api.admin.getInvoices()
          ]);
          if (payRes.data) setPayments(payRes.data);
          if (invRes.data) setInvoices(invRes.data);
          break;
        }
        case 'webhooks': {
          const res = await api.admin.getWebhooks();
          if (res.data) setWebhooks(res.data);
          break;
        }
        case 'audit': {
          const res = await api.admin.getAuditLogs({ action: auditActionFilter });
          if (res.data) setAuditLogs(res.data);
          break;
        }
        case 'feature_flags': {
          const res = await api.admin.getFeatureFlags();
          if (res.data) setFeatureFlags(res.data);
          break;
        }
        case 'settings': {
          const res = await api.admin.getSettings();
          if (res.data) setSettings(res.data);
          break;
        }
        case 'system': {
          const [hRes, jRes, sRes] = await Promise.all([
            api.admin.getSystemHealth(),
            api.admin.getFailedJobs(),
            api.admin.getSchedulerTasks()
          ]);
          if (hRes.data) setSystemHealth(hRes.data);
          if (jRes.data) setFailedJobs(jRes.data);
          if (sRes.data) setSchedulerTasks(sRes.data);
          break;
        }
      }
    } catch (err: any) {
      onNotify(err.message || 'Failed to load administrative dataset.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSectionData();
  }, [activeSection, userStatusFilter]);

  // Global Admin Search Handler
  const handleGlobalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const res = await api.admin.search(searchQuery.trim());
      setSearchResults(res.data);
    } catch (err: any) {
      onNotify('Search error: ' + err.message, 'warning');
    } finally {
      setIsSearching(false);
    }
  };

  // Actions
  const handleSuspendUser = async () => {
    if (!suspendModalUser) return;
    try {
      await api.admin.suspendUser(suspendModalUser.id, suspendReason || 'Violation of platform terms');
      onNotify(`User ${suspendModalUser.email} has been suspended.`, 'info');
      setSuspendModalUser(null);
      setSuspendReason('');
      loadSectionData();
    } catch (err: any) {
      onNotify(err.message || 'Suspension failed.', 'warning');
    }
  };

  const handleActivateUser = async (id: string) => {
    try {
      await api.admin.activateUser(id);
      onNotify('User account activated.', 'success');
      loadSectionData();
    } catch (err: any) {
      onNotify(err.message || 'Activation failed.', 'warning');
    }
  };

  const handleImpersonate = async (id: string) => {
    try {
      const res = await api.admin.impersonateUser(id);
      if (res.data?.token) {
        onNotify(`Impersonation session established for ${res.data.user.name}.`, 'success');
        // Set impersonation token and redirect
        localStorage.setItem('reviewflow_token', res.data.token);
        if (onBackToDashboard) onBackToDashboard();
      }
    } catch (err: any) {
      onNotify(err.message || 'Impersonation failed.', 'warning');
    }
  };

  const handleResetSession = async (id: string) => {
    try {
      await api.admin.resetUserSession(id);
      onNotify('User active sessions invalidated successfully.', 'info');
    } catch (err: any) {
      onNotify(err.message || 'Session reset failed.', 'warning');
    }
  };

  const handleToggleFeatureFlag = async (id: string) => {
    try {
      const res = await api.admin.toggleFeatureFlag(id);
      onNotify(res.message || 'Feature flag toggled.', 'success');
      loadSectionData();
    } catch (err: any) {
      onNotify(err.message || 'Failed to toggle flag.', 'warning');
    }
  };

  const handleRetryWebhook = async (id: string) => {
    try {
      await api.admin.retryWebhook(id);
      onNotify('Webhook re-delivered and processed idempotently.', 'success');
      loadSectionData();
    } catch (err: any) {
      onNotify(err.message || 'Webhook retry failed.', 'warning');
    }
  };

  const handleRetryGoogleSync = async (linkId: string) => {
    try {
      const res = await api.admin.retryGoogleSync(linkId);
      onNotify(res.message || 'Google sync executed.', 'success');
      loadSectionData();
    } catch (err: any) {
      onNotify(err.message || 'Sync retry failed.', 'warning');
    }
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;
    try {
      await api.admin.updatePlan(editingPlan.id, editingPlan);
      onNotify(`Plan '${editingPlan.name}' updated successfully.`, 'success');
      setEditingPlan(null);
      loadSectionData();
    } catch (err: any) {
      onNotify(err.message || 'Failed to update plan.', 'warning');
    }
  };

  const handleAdjustUsage = async () => {
    if (!adjustBizId) {
      onNotify('Please select or specify a Business ID.', 'warning');
      return;
    }
    try {
      await api.admin.adjustUsage({
        business_id: adjustBizId,
        count_delta: Number(adjustDelta),
        reason: adjustReason
      });
      onNotify('AI Usage quota successfully adjusted.', 'success');
      setShowUsageAdjustModal(false);
      loadSectionData();
    } catch (err: any) {
      onNotify(err.message || 'Failed to adjust usage.', 'warning');
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
      await api.admin.updateSettings(settings);
      onNotify('Platform settings saved successfully.', 'success');
    } catch (err: any) {
      onNotify(err.message || 'Failed to save settings.', 'warning');
    }
  };

  const triggerExport = (resource: string) => {
    const token = localStorage.getItem('reviewflow_token');
    const url = `/api/v1/admin/export/${resource}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `reviewflow_${resource}_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        onNotify(`Exported ${resource} dataset successfully.`, 'success');
      })
      .catch((err) => onNotify('Export failed: ' + err.message, 'warning'));
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users & Accounts', icon: '👥' },
    { id: 'businesses', label: 'Businesses & Branches', icon: '🏢' },
    { id: 'funnels', label: 'Review Funnels', icon: '⚡' },
    { id: 'reviews', label: 'Synced Reviews', icon: '⭐' },
    { id: 'google', label: 'Google GBP Monitor', icon: '🌐' },
    { id: 'ai', label: 'AI Monitor & Quota', icon: '🤖' },
    { id: 'plans', label: 'Plans & Pricing', icon: '🏷️' },
    { id: 'subscriptions', label: 'Subscriptions', icon: '🔄' },
    { id: 'payments', label: 'Payments & Invoices', icon: '💳' },
    { id: 'webhooks', label: 'Razorpay Webhooks', icon: '🪝' },
    { id: 'audit', label: 'Audit Trail Logs', icon: '🛡️' },
    { id: 'feature_flags', label: 'Feature Flags', icon: '🚩' },
    { id: 'system', label: 'System Health & Queues', icon: '⚙️' },
    { id: 'settings', label: 'Platform Settings', icon: '🔧' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white text-left">
      {/* ═══════ TOP COMMAND BAR ═══════ */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-white shadow-md shadow-emerald-500/20">
            RF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-sm sm:text-base tracking-tight">
                ReviewFlow AI Control Center
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Super Admin
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Operations &amp; Security Layer v1.0</p>
          </div>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleGlobalSearch} className="hidden md:flex items-center relative w-80">
          <input
            type="text"
            placeholder="Search users, businesses, subscriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
          />
          <button
            type="submit"
            className="absolute right-2 text-xs text-slate-400 hover:text-white"
          >
            {isSearching ? '...' : '🔍'}
          </button>
        </form>

        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <span>Exit Admin</span>
              <span>→</span>
            </button>
          )}
        </div>
      </header>

      {/* ═══════ SEARCH POPUP OVERLAY ═══════ */}
      {searchResults && (
        <div className="p-4 bg-slate-900 border-b border-slate-800 max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="text-xs font-black uppercase text-emerald-400">Search Results for "{searchQuery}"</span>
            <button onClick={() => setSearchResults(null)} className="text-xs text-slate-400 hover:text-white">✕ Close</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="font-bold text-slate-400 mb-1">Users ({searchResults.users?.length || 0})</div>
              {searchResults.users?.map((u: any) => (
                <div key={u.id} className="p-1.5 bg-slate-800 rounded-lg mb-1">
                  <div className="font-bold text-white">{u.title}</div>
                  <div className="text-[11px] text-slate-400">{u.subtitle}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="font-bold text-slate-400 mb-1">Businesses ({searchResults.businesses?.length || 0})</div>
              {searchResults.businesses?.map((b: any) => (
                <div key={b.id} className="p-1.5 bg-slate-800 rounded-lg mb-1">
                  <div className="font-bold text-white">{b.title}</div>
                  <div className="text-[11px] text-slate-400">{b.subtitle}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="font-bold text-slate-400 mb-1">Subscriptions ({searchResults.subscriptions?.length || 0})</div>
              {searchResults.subscriptions?.map((s: any) => (
                <div key={s.id} className="p-1.5 bg-slate-800 rounded-lg mb-1">
                  <div className="font-bold text-white">{s.title}</div>
                  <div className="text-[11px] text-emerald-400">{s.subtitle}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="font-bold text-slate-400 mb-1">Payments ({searchResults.payments?.length || 0})</div>
              {searchResults.payments?.map((p: any) => (
                <div key={p.id} className="p-1.5 bg-slate-800 rounded-lg mb-1">
                  <div className="font-bold text-white">{p.title}</div>
                  <div className="text-[11px] text-slate-400">{p.subtitle}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ MAIN TWO-COLUMN LAYOUT ═══════ */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-56 sm:w-64 border-r border-slate-800 bg-slate-900/60 p-3 shrink-0 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase text-slate-500 px-3 py-1">Operations</div>
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                  activeSection === item.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-800 mt-4 text-[11px] space-y-2">
            <div className="font-bold text-slate-300">Quick Data Exports</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => triggerExport('users')}
                className="px-2 py-1 bg-slate-700/60 hover:bg-slate-700 rounded-lg text-slate-300 text-center"
              >
                Users ⤓
              </button>
              <button
                onClick={() => triggerExport('businesses')}
                className="px-2 py-1 bg-slate-700/60 hover:bg-slate-700 rounded-lg text-slate-300 text-center"
              >
                Biz ⤓
              </button>
              <button
                onClick={() => triggerExport('subscriptions')}
                className="px-2 py-1 bg-slate-700/60 hover:bg-slate-700 rounded-lg text-slate-300 text-center"
              >
                Subs ⤓
              </button>
              <button
                onClick={() => triggerExport('audit_logs')}
                className="px-2 py-1 bg-slate-700/60 hover:bg-slate-700 rounded-lg text-slate-300 text-center"
              >
                Audit ⤓
              </button>
            </div>
          </div>
        </aside>

        {/* Content View Area */}
        <main className="flex-1 p-5 sm:p-8 overflow-y-auto bg-slate-950">
          {loading && (
            <div className="mb-4 text-xs font-bold text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Synchronizing authoritative administrative records...
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              SECTION 1: DASHBOARD OVERVIEW
          ══════════════════════════════════════════════════════ */}
          {activeSection === 'dashboard' && dashboardData && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">System Operations Overview</h2>
                <p className="text-xs text-slate-400 mt-0.5">Real-time health, business funnels, and revenue metrics.</p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Users</div>
                  <div className="text-2xl font-black text-white mt-1">{dashboardData.users.total}</div>
                  <div className="text-[11px] text-emerald-400 mt-0.5">+{dashboardData.users.new_today} today</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Active Businesses</div>
                  <div className="text-2xl font-black text-white mt-1">{dashboardData.businesses.active}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{dashboardData.funnels.active} active funnels</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Active Subscriptions</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">{dashboardData.billing.active_subscriptions}</div>
                  <div className="text-[11px] text-amber-400 mt-0.5">{dashboardData.billing.past_due_subscriptions} past due</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Revenue (₹)</div>
                  <div className="text-2xl font-black text-white mt-1">₹{dashboardData.billing.total_revenue_inr.toLocaleString('en-IN')}</div>
                  <div className="text-[11px] text-emerald-400 mt-0.5">{dashboardData.billing.successful_payments} verified charges</div>
                </div>
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300">Google Sync Health</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400">
                      Active
                    </span>
                  </div>
                  <div className="text-sm">
                    <strong>{dashboardData.google.connected_locations}</strong> Locations linked
                  </div>
                  <div className="text-xs text-slate-400">
                    Failures detected: <span className="text-rose-400 font-bold">{dashboardData.google.sync_failures}</span>
                  </div>
                  <button
                    onClick={() => setActiveSection('google')}
                    className="w-full py-1.5 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl"
                  >
                    View GBP Connections
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300">AI Assistant Operations</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-400">
                      Gemini / OpenAI
                    </span>
                  </div>
                  <div className="text-sm">
                    <strong>{dashboardData.ai.requests_this_month}</strong> AI generations this month
                  </div>
                  <div className="text-xs text-slate-400">
                    Failed requests: <span className="text-rose-400 font-bold">{dashboardData.ai.failed_requests}</span>
                  </div>
                  <button
                    onClick={() => setActiveSection('ai')}
                    className="w-full py-1.5 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl"
                  >
                    Manage AI Quota &amp; Status
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300">Razorpay Webhook Stream</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400">
                      HMAC Verified
                    </span>
                  </div>
                  <div className="text-sm">
                    <strong>{dashboardData.webhooks.received_today}</strong> Events received today
                  </div>
                  <div className="text-xs text-slate-400">
                    Failed events: <span className="text-rose-400 font-bold">{dashboardData.webhooks.failed}</span>
                  </div>
                  <button
                    onClick={() => setActiveSection('webhooks')}
                    className="w-full py-1.5 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl"
                  >
                    Inspect Webhook Logs
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              SECTION 2: USER MANAGEMENT
          ══════════════════════════════════════════════════════ */}
          {activeSection === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white">Users &amp; Accounts</h2>
                  <p className="text-xs text-slate-400">Manage registered businesses, roles, and account statuses.</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Filter by name, email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadSectionData()}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <button
                    onClick={loadSectionData}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 rounded-xl text-white"
                  >
                    Filter
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Plan / Status</th>
                        <th className="py-3 px-4">Businesses</th>
                        <th className="py-3 px-4">Registered</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/40">
                          <td className="py-3 px-4">
                            <div className="font-bold text-white">{u.name}</div>
                            <div className="text-[11px] text-slate-400">{u.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                              {u.admin_role || u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-white">{u.plan_name}</div>
                            <span
                              className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded-md ${
                                u.status === 'active'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-rose-500/20 text-rose-400'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-white">{u.business_count}</span> businesses &bull; {u.location_count} branches
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5">
                            {u.status === 'suspended' ? (
                              <button
                                onClick={() => handleActivateUser(u.id)}
                                className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg"
                              >
                                Activate
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSuspendModalUser(u);
                                  setSuspendReason('');
                                }}
                                className="px-2.5 py-1 text-[11px] font-bold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 rounded-lg"
                              >
                                Suspend
                              </button>
                            )}

                            <button
                              onClick={() => handleResetSession(u.id)}
                              className="px-2.5 py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                            >
                              Reset Session
                            </button>

                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleImpersonate(u.id)}
                                className="px-2.5 py-1 text-[11px] font-bold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg"
                              >
                                Access
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              SECTION 3: BUSINESSES
          ══════════════════════════════════════════════════════ */}
          {activeSection === 'businesses' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-white">Businesses &amp; Branches</h2>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Business</th>
                      <th className="py-3 px-4">Owner</th>
                      <th className="py-3 px-4">Branches</th>
                      <th className="py-3 px-4">Funnels</th>
                      <th className="py-3 px-4">Total Reviews</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {businesses.map((b) => (
                      <tr key={b.id}>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{b.name}</div>
                          <div className="text-[11px] text-slate-400">{b.category}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{b.owner_name}</div>
                          <div className="text-[11px] text-slate-400">{b.owner_email}</div>
                        </td>
                        <td className="py-3 px-4 font-bold text-white">{b.location_count}</td>
                        <td className="py-3 px-4 font-bold text-white">{b.funnel_count}</td>
                        <td className="py-3 px-4 font-bold text-white">{b.review_count}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400">
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              SECTION 4: FUNNELS
          ══════════════════════════════════════════════════════ */}
          {activeSection === 'funnels' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-white">Review Funnels &amp; QR Standees</h2>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Funnel Name</th>
                      <th className="py-3 px-4">Business</th>
                      <th className="py-3 px-4">Slug / Link</th>
                      <th className="py-3 px-4">Views</th>
                      <th className="py-3 px-4">Scans</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {funnels.map((f) => (
                      <tr key={f.id}>
                        <td className="py-3 px-4 font-bold text-white">{f.name}</td>
                        <td className="py-3 px-4">{f.business_name}</td>
                        <td className="py-3 px-4 font-mono text-emerald-400">/r/{f.slug}</td>
                        <td className="py-3 px-4 font-bold">{f.views_count}</td>
                        <td className="py-3 px-4 font-bold">{f.scans_count}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400">
                            {f.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              SECTION 5: REVIEWS
          ══════════════════════════════════════════════════════ */}
          {activeSection === 'reviews' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-white">Synced Reviews &amp; Feedback Stream</h2>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Reviewer</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4">Comment</th>
                      <th className="py-3 px-4">Source</th>
                      <th className="py-3 px-4">Reply Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {reviews.map((r) => (
                      <tr key={r.id}>
                        <td className="py-3 px-4 font-bold text-white">{r.reviewer_name}</td>
                        <td className="py-3 px-4 font-bold text-amber-400">{'★'.repeat(r.star_rating || 5)}</td>
                        <td className="py-3 px-4 max-w-sm truncate text-slate-300">{r.comment || 'No text provided'}</td>
                        <td className="py-3 px-4 uppercase text-[10px] font-bold">{r.source}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${r.has_reply ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {r.has_reply ? 'Replied' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              SECTION 6: GOOGLE GBP MONITOR
          ══════════════════════════════════════════════════════ */}
          {activeSection === 'google' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-white">Google Business Profile Integration Monitor</h2>
                  <p className="text-xs text-slate-400">OAuth connections, location links, and automated synchronization heartbeat.</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-4 space-y-4">
                <h3 className="text-sm font-bold text-white">Connected Accounts</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-4">User</th>
                        <th className="py-2.5 px-4">Google Email</th>
                        <th className="py-2.5 px-4">Connected At</th>
                        <th className="py-2.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {googleConnections.map((c) => (
                        <tr key={c.id}>
                          <td className="py-3 px-4 font-bold text-white">{c.user_name} ({c.user_email})</td>
                          <td className="py-3 px-4 font-mono text-emerald-400">{c.google_email}</td>
                          <td className="py-3 px-4">{new Date(c.connected_at).toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400">
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              SECTION 7: AI MONITOR & USAGE QUOTA
          ══════════════════════════════════════════════════════ */}
          {activeSection === 'ai' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-white">AI Assistant Diagnostics &amp; Providers</h2>
                  <p className="text-xs text-slate-400">LLM provider statuses, latency metrics, and quota allocations.</p>
                </div>
                <button
                  onClick={() => setShowUsageAdjustModal(true)}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md"
                >
                  Adjust Quota Override
                </button>
              </div>

              {/* Provider Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {aiProviders.map((p) => (
                  <div key={p.provider} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase text-white">{p.provider}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${p.configured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Model: <span className="font-mono text-slate-200">{p.model}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Keys: {p.configured ? 'Server Vault Active' : 'Offline / Heuristic Engine'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Generation Logs */}
              {aiOverview && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white">Recent AI Operations</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-slate-800/60 rounded-xl">
                      <div className="text-lg font-black text-white">{aiOverview.total_generations}</div>
                      <div className="text-[10px] uppercase text-slate-400">Total Calls</div>
                    </div>
                    <div className="p-3 bg-slate-800/60 rounded-xl">
                      <div className="text-lg font-black text-emerald-400">{aiOverview.total_tokens.toLocaleString()}</div>
                      <div className="text-[10px] uppercase text-slate-400">Total Tokens</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              SECTION 8: PLANS & PRICING
          ══════════════════════════════════════════════════════ */}
          {activeSection === 'plans' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-white">Plans &amp; Commercial Entitlements</h2>
                  <p className="text-xs text-slate-400">Manage plan limits, monthly/annual prices, and feature flags.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {plans.map((p) => (
                  <div key={p.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-black text-white">{p.name}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400">
                        {p.status}
                      </span>
                    </div>
                    <div className="text-xl font-black text-white">
                      ₹{p.monthly_price}/mo <span className="text-xs text-slate-400">or ₹{p.annual_price}/yr</span>
                    </div>
                    <div className="text-xs text-slate-400 space-y-1">
                      <div>Locations: <strong>{p.limits?.locations || 1}</strong></div>
                      <div>Funnels: <strong>{p.limits?.funnels || 2}</strong></div>
                      <div>QR Codes: <strong>{p.limits?.qr_codes || 2}</strong></div>
                      <div>AI Generations: <strong>{p.limits?.ai_generations || 20}</strong></div>
                    </div>
                    <button
                      onClick={() => setEditingPlan({ ...p })}
                      className="w-full py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl mt-2"
                    >
                      Edit Plan Limits
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              SECTION 9: SUBSCRIPTIONS & RECONCILIATION
          ══════════════════════════════════════════════════════ */}
          {activeSection === 'subscriptions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-white">Subscriptions &amp; Billing Reconciliation</h2>
                  <p className="text-xs text-slate-400">Manage active Razorpay subscription state machines and detect mismatches.</p>
                </div>
              </div>

              {reconciliation && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">Reconciliation Status: </span>
                    <span className="text-emerald-400 uppercase font-black">{reconciliation.status}</span>
                  </div>
                  <div className="text-slate-400">
                    Discrepancies found: <strong>{reconciliation.discrepancies?.length || 0}</strong>
                  </div>
                </div>
              )}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Plan</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Gateway Sub ID</th>
                      <th className="py-3 px-4">Expires / Renews</th>
                      <th className="py-3 px-4 text-right">Sync</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {subscriptions.map((s) => (
                      <tr key={s.id}>
                        <td className="py-3 px-4 font-bold text-white">{s.user_name}</td>
                        <td className="py-3 px-4">{s.plan_name}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${s.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{s.razorpay_subscription_id || s.id}</td>
                        <td className="py-3 px-4">{new Date(s.ends_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={async () => {
                              await api.admin.syncSubscription(s.id);
                              onNotify('Subscription synced with Razorpay.', 'success');
                              loadSectionData();
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                          >
                            Sync Gateway
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              SECTION 10: PAYMENTS & INVOICES
          ══════════════════════════════════════════════════════ */}
          {activeSection === 'payments' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-white">Payments &amp; Tax Invoices Ledger</h2>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Payment ID</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td className="py-3 px-4 font-mono font-bold text-white">{p.razorpay_payment_id || p.id}</td>
                        <td className="py-3 px-4 font-bold text-white">₹{p.amount}</td>
                        <td className="py-3 px-4 uppercase">{p.payment_method || 'RAZORPAY'}</td>
                        <td className="py-3 px-4">{new Date(p.paid_at || p.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${p.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              SECTION 11: RAZORPAY WEBHOOKS
          ══════════════════════════════════════════════════════ */}
          {activeSection === 'webhooks' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-white">Razorpay Webhooks Monitor</h2>
                  <p className="text-xs text-slate-400">HMAC SHA-256 signature verified deliveries with idempotent retry capability.</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Event ID</th>
                      <th className="py-3 px-4">Event Type</th>
                      <th className="py-3 px-4">Signature</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Received</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {webhooks.map((w) => (
                      <tr key={w.id}>
                        <td className="py-3 px-4 font-mono text-slate-400">{w.event_id}</td>
                        <td className="py-3 px-4 font-bold text-white">{w.event_type}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${w.signature_verified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {w.signature_verified ? 'Verified' : 'Simulated'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${w.processing_status === 'processed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {w.processing_status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{new Date(w.created_at).toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleRetryWebhook(w.id)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                          >
                            Retry
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              SECTION 12: AUDIT LOGS
          ══════════════════════════════════════════════════════ */}
          {activeSection === 'audit' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-white">Immutable Audit Trail Logs</h2>
                  <p className="text-xs text-slate-400">Append-only security records for administrative and critical tenant operations.</p>
                </div>
                <input
                  type="text"
                  placeholder="Filter by action (e.g. user.suspended)..."
                  value={auditActionFilter}
                  onChange={(e) => setAuditActionFilter(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadSectionData()}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Resource</th>
                      <th className="py-3 px-4">Admin / User ID</th>
                      <th className="py-3 px-4">IP Address</th>
                      <th className="py-3 px-4 text-right">Payload</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="py-3 px-4 text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">{log.action}</td>
                        <td className="py-3 px-4 uppercase">{log.entity_type}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{log.admin_id || log.user_id || 'System'}</td>
                        <td className="py-3 px-4 font-mono text-[11px]">{log.ip_address || '127.0.0.1'}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedAuditLog(log)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              SECTION 13: FEATURE FLAGS
          ══════════════════════════════════════════════════════ */}
          {activeSection === 'feature_flags' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Platform Feature Flags</h2>
                <p className="text-xs text-slate-400">Server-enforced runtime switches for beta capabilities and service releases.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featureFlags.map((flag) => (
                  <div key={flag.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{flag.name}</span>
                        <span className="font-mono text-[10px] text-slate-500">{flag.key}</span>
                      </div>
                      <p className="text-xs text-slate-400 max-w-md">{flag.description}</p>
                    </div>

                    <button
                      onClick={() => handleToggleFeatureFlag(flag.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                        flag.enabled
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {flag.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              SECTION 14: SYSTEM HEALTH & QUEUES
          ══════════════════════════════════════════════════════ */}
          {activeSection === 'system' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">System Health, Queues &amp; Scheduler</h2>
                <p className="text-xs text-slate-400">Heartbeat monitors for background cron processes, queues, and database engines.</p>
              </div>

              {systemHealth && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Uptime</div>
                    <div className="text-xl font-black text-white mt-1">{Math.floor(systemHealth.uptime_seconds / 60)} mins</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Database Engine</div>
                    <div className="text-xl font-black text-emerald-400 mt-1">{systemHealth.services.database.status}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Razorpay Gateway</div>
                    <div className="text-xl font-black text-emerald-400 mt-1">{systemHealth.services.razorpay_gateway.status}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Cache Subsystem</div>
                    <div className="text-xl font-black text-white mt-1">{systemHealth.services.cache.status}</div>
                  </div>
                </div>
              )}

              {/* Scheduler Tasks Heartbeat */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white">Automated Scheduled Tasks</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-4">Task Name</th>
                        <th className="py-2.5 px-4">Interval</th>
                        <th className="py-2.5 px-4">Last Run</th>
                        <th className="py-2.5 px-4">Duration</th>
                        <th className="py-2.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {schedulerTasks.map((t) => (
                        <tr key={t.id}>
                          <td className="py-3 px-4 font-bold text-white">{t.task_name}</td>
                          <td className="py-3 px-4">Every {t.interval_minutes} mins</td>
                          <td className="py-3 px-4">{new Date(t.last_run).toLocaleTimeString()}</td>
                          <td className="py-3 px-4 font-mono">{t.last_duration_ms} ms</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400">
                              {t.last_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              SECTION 15: SETTINGS
          ══════════════════════════════════════════════════════ */}
          {activeSection === 'settings' && settings && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-xl font-black text-white">Platform Operational Settings</h2>
                <p className="text-xs text-slate-400">Configure global grace periods, timezone defaults, and support contacts.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Support Email Address</label>
                  <input
                    type="email"
                    value={settings.support_email}
                    onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Billing Grace Period (Days)</label>
                  <input
                    type="number"
                    value={settings.billing_grace_period_days}
                    onChange={(e) => setSettings({ ...settings, billing_grace_period_days: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Default AI Provider Engine</label>
                  <select
                    value={settings.default_ai_provider}
                    onChange={(e) => setSettings({ ...settings, default_ai_provider: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="gemini">Google Gemini (Recommended)</option>
                    <option value="openai">OpenAI ChatGPT</option>
                    <option value="mock">Heuristic Engine (Mock)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div>
                    <div className="font-bold text-white">Allow Public Registration</div>
                    <div className="text-[11px] text-slate-500">Enable or freeze new merchant signups</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.new_registration_enabled}
                    onChange={(e) => setSettings({ ...settings, new_registration_enabled: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500"
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSaveSettings}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-md shadow-emerald-600/30"
                  >
                    Save Operational Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ═══════ SUSPEND USER MODAL ═══════ */}
      {suspendModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-white">Suspend User: {suspendModalUser.name}</h3>
            <p className="text-xs text-slate-400">
              Suspended users cannot sign in or generate new AI drafts. Existing business data, funnels, and billing records are non-destructively preserved.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Reason for Suspension</label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Specify violation or operational reason..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white h-20"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSuspendModalUser(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendUser}
                className="px-4 py-2 text-xs font-black bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-md"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ EDIT PLAN MODAL ═══════ */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Edit Plan Limits: {editingPlan.name}</h3>
              <button onClick={() => setEditingPlan(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Monthly Price (₹)</label>
                <input
                  type="number"
                  value={editingPlan.monthly_price}
                  onChange={(e) => setEditingPlan({ ...editingPlan, monthly_price: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Annual Price (₹)</label>
                <input
                  type="number"
                  value={editingPlan.annual_price}
                  onChange={(e) => setEditingPlan({ ...editingPlan, annual_price: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Max Locations</label>
                <input
                  type="number"
                  value={editingPlan.limits?.locations || 1}
                  onChange={(e) => setEditingPlan({ ...editingPlan, limits: { ...editingPlan.limits, locations: Number(e.target.value) } })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Max Funnels</label>
                <input
                  type="number"
                  value={editingPlan.limits?.funnels || 2}
                  onChange={(e) => setEditingPlan({ ...editingPlan, limits: { ...editingPlan.limits, funnels: Number(e.target.value) } })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Max QR Codes</label>
                <input
                  type="number"
                  value={editingPlan.limits?.qr_codes || 2}
                  onChange={(e) => setEditingPlan({ ...editingPlan, limits: { ...editingPlan.limits, qr_codes: Number(e.target.value) } })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">AI Generations / Mo</label>
                <input
                  type="number"
                  value={editingPlan.limits?.ai_generations || 50}
                  onChange={(e) => setEditingPlan({ ...editingPlan, limits: { ...editingPlan.limits, ai_generations: Number(e.target.value) } })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button onClick={() => setEditingPlan(null)} className="px-4 py-2 font-bold text-slate-400">Cancel</button>
              <button onClick={handleSavePlan} className="px-5 py-2 font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ AUDIT LOG DETAILS MODAL ═══════ */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Audit Record: {selectedAuditLog.action}</h3>
              <button onClick={() => setSelectedAuditLog(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-1 text-slate-300">
              <div><strong>Timestamp:</strong> {new Date(selectedAuditLog.created_at).toLocaleString()}</div>
              <div><strong>Admin ID:</strong> {selectedAuditLog.admin_id || 'System'}</div>
              <div><strong>Target User ID:</strong> {selectedAuditLog.user_id || 'None'}</div>
              <div><strong>Resource:</strong> {selectedAuditLog.entity_type} ({selectedAuditLog.entity_id})</div>
              <div><strong>IP Address:</strong> {selectedAuditLog.ip_address}</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 overflow-x-auto">
              <pre className="text-[11px] font-mono text-emerald-400">
                {JSON.stringify(selectedAuditLog.new_values || selectedAuditLog.old_values || {}, null, 2)}
              </pre>
            </div>
            <div className="text-right">
              <button onClick={() => setSelectedAuditLog(null)} className="px-4 py-2 font-bold bg-slate-800 text-white rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ USAGE ADJUST MODAL ═══════ */}
      {showUsageAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Manual AI Quota Adjustment</h3>
              <button onClick={() => setShowUsageAdjustModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Target Business ID</label>
              <input
                type="text"
                placeholder="e.g. biz_001"
                value={adjustBizId}
                onChange={(e) => setAdjustBizId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Credit Count Delta</label>
              <input
                type="number"
                value={adjustDelta}
                onChange={(e) => setAdjustDelta(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Audit Reason</label>
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowUsageAdjustModal(false)} className="px-4 py-2 font-bold text-slate-400">Cancel</button>
              <button onClick={handleAdjustUsage} className="px-5 py-2 font-black bg-purple-600 hover:bg-purple-500 text-white rounded-xl">Apply Adjustment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
