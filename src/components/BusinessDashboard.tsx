import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BusinessAnalyticsView } from './BusinessAnalyticsView';
import { GoogleReviewsView } from './GoogleReviewsView';
import { NegativeReviewsView } from './NegativeReviewsView';
import { ReviewSettingsView } from './ReviewSettingsView';
import { PhysicalStandView } from './PhysicalStandView';
import { AiSeoAnalyzerView } from './AiSeoAnalyzerView';
import { AddOnServicesView } from './AddOnServicesView';
import { BillingPlansView } from './BillingPlansView';
import { AccountSettingsView } from './AccountSettingsView';
import { FunnelsManagementView } from './FunnelsManagementView';
import { QrManagementView } from './QrManagementView';
import { AdminPortalView } from './AdminPortalView';

interface BusinessDashboardProps {
  businessName?: string;
  businessAddress?: string;
  businessCategory?: string;
  initialTab?: 'dashboard' | 'reviews' | 'analytics' | 'feedback' | 'funnels' | 'qr-manager' | 'settings' | 'stand' | 'seo' | 'services' | 'billing' | 'account' | 'admin';
  onNavigate: (view: any) => void;
  onSignOut: () => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
  businessName = 'Muzaffarabad azad jamu and kashmir',
  businessAddress = '9F4G+2Q8, Domail Muzaffarabad',
  businessCategory = 'Other',
  initialTab = 'dashboard',
  onNavigate,
  onSignOut,
  onNotify
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reviews' | 'analytics' | 'feedback' | 'funnels' | 'qr-manager' | 'settings' | 'stand' | 'seo' | 'services' | 'billing' | 'account' | 'qr' | 'admin'>(initialTab);
  const [standModalOpen, setStandModalOpen] = useState(false);

  // Real Analytics & Funnel State
  const [dashLoading, setDashLoading] = useState(true);
  const [dashError, setDashError] = useState<string | null>(null);
  const [totalData, setTotalData] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [timeseries7d, setTimeseries7d] = useState<any[]>([]);
  const [activeFunnelsCount, setActiveFunnelsCount] = useState(1);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      setDashLoading(true);
      setDashError(null);

      const today = new Date();
      const to = today.toISOString().slice(0, 10);
      const sevenDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const thirtyDaysAgo = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      const [totRes, moRes, wkRes, tsRes, fnlRes, statsRes] = await Promise.allSettled([
        api.analytics.getOverview({ from: '2020-01-01', to }),
        api.analytics.getOverview({ from: thirtyDaysAgo, to }),
        api.analytics.getOverview({ from: sevenDaysAgo, to }),
        api.analytics.getTimeSeries({ from: sevenDaysAgo, to }),
        api.funnels.list(),
        api.dashboard.getStats()
      ]);

      if (totRes.status === 'fulfilled' && totRes.value?.data) {
        setTotalData(totRes.value.data);
      }
      if (moRes.status === 'fulfilled' && moRes.value?.data) {
        setMonthlyData(moRes.value.data);
      }
      if (wkRes.status === 'fulfilled' && wkRes.value?.data) {
        setWeeklyData(wkRes.value.data);
      }
      if (tsRes.status === 'fulfilled' && tsRes.value?.data) {
        setTimeseries7d(tsRes.value.data);
      }
      if (fnlRes.status === 'fulfilled' && fnlRes.value?.data) {
        const funnels = fnlRes.value.data;
        const active = funnels.filter((f: any) => f.enabled !== false).length;
        setActiveFunnelsCount(Math.max(1, active));
      }
      if (statsRes.status === 'fulfilled' && statsRes.value?.data?.recent_reviews) {
        setRecentReviews(statsRes.value.data.recent_reviews);
      }
    } catch (err: any) {
      setDashError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setDashLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Avatar initial
  const avatarChar = businessName.trim().charAt(0).toUpperCase() || 'M';

  // Dynamic 7-day trend chart calculations
  const last7Days = timeseries7d.slice(-7);
  const maxDashMetric = Math.max(10, ...last7Days.map((p) => Math.max(p.page_views || 0, p.qr_scans || 0, p.rating_selected || 0, p.google_clicks || 0)));

  const getDashY = (val: number) => {
    const height = 90;
    const padding = 25;
    return padding + height - (val / maxDashMetric) * height;
  };

  const getDashPath = (key: 'page_views' | 'qr_scans' | 'rating_selected') => {
    if (last7Days.length === 0) return 'M 50 120 L 650 120';
    return last7Days
      .map((p, i) => {
        const x = 50 + (i / Math.max(1, last7Days.length - 1)) * 600;
        const y = getDashY(p[key] || 0);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const handleActionClick = (actionName: string) => {
    if (actionName === 'qr') {
      onNavigate('flyer-tool');
    } else if (actionName === 'pricing') {
      onNavigate('pricing');
    } else if (actionName === 'seo') {
      onNavigate('analyzer');
    } else {
      onNotify(`${actionName} tool loaded in console.`, 'info');
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fbfa] text-slate-900 font-sans flex flex-col lg:flex-row antialiased">
      {/* ═══════ MOBILE ADMIN HEADER ═══════ */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-40 px-4 flex items-center justify-between shadow-sm">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="12" x2="20" y2="12"></line>
            <line x1="4" y1="6" x2="20" y2="6"></line>
            <line x1="4" y1="18" x2="20" y2="18"></line>
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="white" />
            </svg>
          </div>
          <span className="font-extrabold text-slate-900 text-sm tracking-tight">
            ReviewFlow <span className="text-emerald-600">AI</span>
          </span>
        </div>

        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-sm">
          H
        </div>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 lg:hidden"
        />
      )}

      {/* ═══════ SIDEBAR SHELL ═══════ */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-60 z-50 bg-gradient-to-b from-[#34A853] via-[#2D9248] to-[#1e6b32] text-white flex flex-col transition-transform duration-300 ease-out lg:sticky lg:h-screen lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-inner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="white" />
              </svg>
            </div>
            <div>
              <div className="font-extrabold text-sm text-white leading-tight">ReviewFlow <span className="text-emerald-200">AI</span></div>
              <div className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">Business Console</div>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/80 hover:text-white p-1 cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* Main Navigation */}
          <div>
            <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider px-2.5 mb-1.5">
              Main Navigation
            </div>
            <div className="space-y-1">
              <button
                onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'dashboard' ? 'bg-white/20 text-white shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <i className="fa-solid fa-gauge-high w-4 text-center"></i>
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => { setActiveTab('reviews'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'reviews' ? 'bg-white/20 text-white shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <i className="fa-brands fa-google w-4 text-center"></i>
                  <span>Google Reviews</span>
                </div>
                <span className="text-[9px] font-bold bg-white/20 text-white px-1.5 py-0.2 rounded-full">Sync</span>
              </button>

              <button
                onClick={() => { setActiveTab('analytics'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'analytics' ? 'bg-white/20 text-white shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <i className="fa-solid fa-chart-line w-4 text-center"></i>
                <span>Analytics</span>
              </button>

              <button
                onClick={() => { setActiveTab('feedback'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'feedback' ? 'bg-white/20 text-white shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <i className="fa-solid fa-shield-halved w-4 text-center"></i>
                <span>Negative Reviews</span>
              </button>
            </div>
          </div>

          {/* Growth & QR Tools */}
          <div>
            <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider px-2.5 mb-1.5">
              Growth &amp; QR Tools
            </div>
            <div className="space-y-1">
              <button
                onClick={() => { setActiveTab('funnels'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  activeTab === 'funnels' ? 'bg-white/20 text-white shadow-sm font-bold' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <i className="fa-solid fa-filter w-4 text-center"></i>
                <span>Review Funnels</span>
              </button>

              <button
                onClick={() => { setActiveTab('qr-manager'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  activeTab === 'qr-manager' ? 'bg-white/20 text-white shadow-sm font-bold' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <i className="fa-solid fa-qrcode w-4 text-center"></i>
                <span>QR Codes &amp; Stands</span>
              </button>

              <button
                onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  activeTab === 'settings' ? 'bg-white/20 text-white shadow-sm font-bold' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <i className="fa-solid fa-sliders w-4 text-center"></i>
                <span>Review Settings</span>
              </button>

              <button
                onClick={() => { setActiveTab('stand'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  activeTab === 'stand' ? 'bg-white/20 text-white shadow-sm font-bold' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <i className="fa-solid fa-shop w-4 text-center"></i>
                  <span>Physical QR Stand</span>
                </div>
                <span className="text-[9px] font-black bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded-full">NEW</span>
              </button>

              <button
                onClick={() => { setActiveTab('seo'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  activeTab === 'seo' ? 'bg-white/20 text-white shadow-sm font-bold' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <i className="fa-solid fa-stethoscope w-4 text-center"></i>
                  <span>AI SEO Analyzer</span>
                </div>
                <span className="text-[9px] font-black bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded-full">AI</span>
              </button>

              <button
                onClick={() => { setActiveTab('services'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  activeTab === 'services' ? 'bg-white/20 text-white shadow-sm font-bold' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <i className="fa-solid fa-layer-group w-4 text-center"></i>
                <span>Add-On Services</span>
              </button>
            </div>
          </div>

          {/* Account & Plans */}
          <div>
            <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider px-2.5 mb-1.5">
              Account &amp; Plans
            </div>
            <div className="space-y-1">
              <button
                onClick={() => { setActiveTab('billing'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  activeTab === 'billing' ? 'bg-white/20 text-white shadow-sm font-bold' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <i className="fa-solid fa-credit-card w-4 text-center"></i>
                  <span>Billing &amp; Plans</span>
                </div>
                <span className="text-[9px] font-bold bg-white/20 text-white px-1.5 py-0.2 rounded-full">Free Trial</span>
              </button>

              <button
                onClick={() => { setActiveTab('admin'); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  activeTab === 'admin' ? 'bg-white/20 text-white shadow-sm font-bold' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <i className="fa-solid fa-shield-halved w-4 text-center text-amber-300"></i>
                  <span>Admin Operations</span>
                </div>
                <span className="text-[9px] font-black bg-rose-500 text-white px-1.5 py-0.2 rounded-full">ADMIN</span>
              </button>

              <button
                onClick={() => onNavigate('home')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all text-left cursor-pointer"
              >
                <i className="fa-solid fa-house w-4 text-center"></i>
                <span>Public Website</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="p-3 border-t border-white/10 space-y-2">
          <button
            type="button"
            onClick={() => { setActiveTab('account'); setSidebarOpen(false); }}
            className={`w-full p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
              activeTab === 'account' ? 'bg-white/20 border-white/30 shadow-sm' : 'bg-white/10 border-white/15 hover:bg-white/15'
            }`}
            title="Open Account Settings"
          >
            <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center font-black text-xs shrink-0">
              H
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="text-xs font-bold text-white truncate">harsh</div>
              <div className="text-[10px] text-white/70 uppercase">Business Owner</div>
            </div>
            <i className="fa-solid fa-gear text-white/60 text-xs"></i>
          </button>

          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-red-200 transition-colors text-left cursor-pointer"
          >
            <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ═══════ MAIN CONTENT AREA ═══════ */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 max-w-7xl mx-auto w-full">
        {activeTab === 'reviews' ? (
          <GoogleReviewsView
            businessName={businessName}
            onNotify={onNotify}
          />
        ) : activeTab === 'analytics' ? (
          <BusinessAnalyticsView
            onUpgrade={() => onNavigate('pricing')}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        ) : activeTab === 'feedback' ? (
          <NegativeReviewsView
            onUpgrade={() => onNavigate('pricing')}
            onNotify={onNotify}
          />
        ) : activeTab === 'funnels' ? (
          <FunnelsManagementView
            onNotify={onNotify}
            onNavigateToQr={() => setActiveTab('qr-manager')}
            onPreviewFunnel={(slug) => {
              window.open(`/r/${slug}`, '_blank');
            }}
          />
        ) : activeTab === 'qr-manager' ? (
          <QrManagementView
            onNotify={onNotify}
            onOpenDesigner={() => onNavigate('flyer-tool')}
          />
        ) : activeTab === 'settings' ? (
          <ReviewSettingsView
            businessName={businessName}
            businessAddress={businessAddress}
            businessCategory={businessCategory}
            onSave={(updated) => {
              onNotify('Review Settings saved successfully!', 'success');
            }}
            onNotify={onNotify}
          />
        ) : activeTab === 'stand' ? (
          <PhysicalStandView
            businessName={businessName}
            onNavigateToDigitalQR={() => onNavigate('flyer-tool')}
            onNotify={onNotify}
          />
        ) : activeTab === 'seo' ? (
          <AiSeoAnalyzerView
            businessName={businessName}
            businessAddress={businessAddress}
            businessCategory={businessCategory}
            onUpgrade={() => onNavigate('pricing')}
            onNotify={onNotify}
          />
        ) : activeTab === 'services' ? (
          <AddOnServicesView
            onBackToDashboard={() => setActiveTab('dashboard')}
            onNotify={onNotify}
          />
        ) : activeTab === 'billing' ? (
          <BillingPlansView
            ownerName="harsh"
            businessName={businessName}
            onNotify={onNotify}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
          />
        ) : activeTab === 'account' ? (
          <AccountSettingsView
            businessName={businessName}
            initialName="harsh"
            initialEmail="ahmadfaizan1999@gmail.com"
            initialPhone="+91 8877307350"
            onDeactivate={onSignOut}
            onDeleteAccount={onSignOut}
            onNotify={onNotify}
          />
        ) : activeTab === 'admin' ? (
          <AdminPortalView
            onBackToDashboard={() => setActiveTab('dashboard')}
            onNotify={onNotify}
          />
        ) : (
          <>
            {/* ═══════ HERO HEADER BANNER ═══════ */}
            <div className="rf-dash-hero p-5 rounded-2xl bg-white border border-slate-200 shadow-sm mb-4 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#34A853] to-[#248544] text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-600/20">
                    {avatarChar}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs"></span>
                </div>

                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate">
                      {businessName}
                    </h1>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#22c55e]"></span>
                      Live
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap text-xs text-slate-500">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                      {businessCategory}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 text-[11px] truncate">
                      <i className="fa-solid fa-location-dot text-emerald-600"></i>
                      {businessAddress}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50/70 border border-emerald-200 rounded-xl text-left">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                    <i className="fa-solid fa-heart-pulse"></i>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Review Funnel</span>
                    <strong className="text-xs text-slate-900 leading-tight">Active &amp; Ready</strong>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('flyer-tool')}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#34A853] to-[#258744] text-white rounded-xl font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:-translate-y-0.5"
                >
                  <span>Manage QR Tools</span>
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
              </div>
            </div>

            {/* ═══════ FREE TRIAL BANNER ═══════ */}
            <div className="bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-200 border-l-4 border-l-amber-500 rounded-xl p-3.5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-200/80 text-amber-800 flex items-center justify-center text-sm shrink-0">
                  <i className="fa-solid fa-clock"></i>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-950">
                    Free Trial &mdash; <span className="text-red-600 font-extrabold">1 day remaining</span>
                  </h4>
                  <p className="text-[11px] text-amber-800 leading-tight mt-0.5">
                    Upgrade to unlock AI Replies, remove ads, and get priority support.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('pricing')}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow transition-all shrink-0 cursor-pointer self-start sm:self-auto"
              >
                Upgrade Plan
              </button>
            </div>

            {/* ═══════ USAGE GUIDE: GO SLOW WITH REVIEWS ═══════ */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-5 shadow-sm text-left">
              <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#34A853] to-[#258744] text-white flex items-center justify-center text-base shadow-sm">
                    🐢
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-black text-slate-900">Slow &amp; Steady Wins the Review Game</h3>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        ✓ Smart Growth
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">A simple guide to collecting reviews naturally and consistently</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 border-l-4 border-l-amber-500 flex gap-2.5 items-start">
                  <span className="text-amber-600 text-sm">⚠️</span>
                  <div>
                    <h4 className="text-xs font-bold text-amber-950">Avoid sudden review spikes</h4>
                    <p className="text-[11px] text-amber-900 leading-relaxed mt-0.5">
                      If you normally get 1–2 reviews a day, suddenly getting 20–30 can look unusual to Google and may lead to new reviews being removed.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 border-l-4 border-l-emerald-600 flex gap-2.5 items-start">
                  <span className="text-emerald-700 text-sm">✓</span>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">The simple approach</h4>
                    <p className="text-[11px] text-emerald-900 leading-relaxed mt-0.5">
                      Ask for a few more reviews consistently instead of creating one big jump. Think <strong>small steps, steady growth.</strong> 🪜
                    </p>
                  </div>
                </div>
              </div>

              {/* Stepped Bar Progression Diagram */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="font-bold text-slate-700">Example of steady review growth</span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">📈 Keep Building</span>
                </div>
                <div className="flex items-end gap-2 h-20 pt-2 overflow-x-auto">
                  <div className="flex-1 min-w-[50px] text-center flex flex-col justify-end">
                    <div className="h-8 bg-emerald-200 rounded-t-lg flex items-center justify-center text-[10px] font-black text-emerald-900">
                      2-3
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold mt-1">Day 1</span>
                  </div>
                  <div className="flex-1 min-w-[50px] text-center flex flex-col justify-end">
                    <div className="h-11 bg-emerald-300 rounded-t-lg flex items-center justify-center text-[10px] font-black text-emerald-900">
                      3-4
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold mt-1">Day 2</span>
                  </div>
                  <div className="flex-1 min-w-[50px] text-center flex flex-col justify-end">
                    <div className="h-14 bg-emerald-400 rounded-t-lg flex items-center justify-center text-[10px] font-black text-emerald-950">
                      5-6
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold mt-1">Day 3</span>
                  </div>
                  <div className="flex-1 min-w-[50px] text-center flex flex-col justify-end">
                    <div className="h-17 bg-emerald-500 rounded-t-lg flex items-center justify-center text-[10px] font-black text-white">
                      7-8
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold mt-1">Day 4</span>
                  </div>
                  <span className="text-slate-300 font-bold text-sm pb-5">&rarr;</span>
                  <div className="flex-1 min-w-[65px] text-center flex flex-col justify-end">
                    <div className="h-20 bg-gradient-to-t from-emerald-700 to-green-600 rounded-t-lg flex items-center justify-center text-[10px] font-black text-white shadow-sm leading-tight p-1">
                      Keep going!
                    </div>
                    <span className="text-[10px] text-emerald-700 font-extrabold mt-1">Month End</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <span className="text-sm">🏆</span>
                <p>
                  <strong>Takeaway:</strong> grow your review volume gradually and consistently rather than making one large jump.
                </p>
              </div>
            </div>

            {/* ═══════ DASHBOARD ERROR BANNER ═══════ */}
            {dashError && (
              <div className="p-4 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation text-red-500"></i>
                  <span>{dashError}</span>
                </div>
                <button
                  onClick={fetchDashboardData}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg font-bold text-xs hover:bg-red-700 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* ═══════ 8 KPI METRIC CARDS ═══════ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left relative overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-xs mb-2">
                  <i className="fa-solid fa-qrcode"></i>
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">QR Scans</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{totalData?.qr_scans ?? 0}</div>
                <span className="text-[10px] text-slate-400 mt-1 block">Total scans</span>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400"></div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left relative overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-xs mb-2">
                  <i className="fa-solid fa-globe"></i>
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Funnel Visits</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{totalData?.page_views ?? 0}</div>
                <span className="text-[10px] text-slate-400 mt-1 block">Landing page visits</span>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400"></div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left relative overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center text-xs mb-2">
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">AI Generated</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{totalData?.rating_selected ?? 0}</div>
                <span className="text-[10px] text-slate-400 mt-1 block">AI review drafts</span>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-400"></div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left relative overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-xs mb-2">
                  <i className="fa-solid fa-check"></i>
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Reviews Selected</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{totalData?.feedback_completed ?? 0}</div>
                <span className="text-[10px] text-slate-400 mt-1 block">Chosen by customers</span>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500"></div>
              </div>

              <div className="bg-gradient-to-br from-[#34A853] to-[#258744] text-white p-4 rounded-2xl shadow-md text-left relative overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-xs mb-2">
                  <i className="fa-solid fa-chart-line"></i>
                </div>
                <div className="text-[10px] uppercase font-bold text-white/80 tracking-wider">Scan &rarr; Review</div>
                <div className="text-2xl font-black text-white mt-0.5">{totalData?.conversion_rates?.overall ?? 0}%</div>
                <span className="text-[10px] text-white/70 mt-1 block">Conversion rate</span>
                <div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-white/10 pointer-events-none"></div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left relative overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-xs mb-2">
                  <i className="fa-solid fa-calendar-days"></i>
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">This Month</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{monthlyData?.feedback_completed ?? 0}</div>
                <span className="text-[10px] text-slate-400 mt-1 block">Monthly selected</span>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500"></div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left relative overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-xs mb-2">
                  <i className="fa-solid fa-magnifying-glass-chart"></i>
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Monthly Scans</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{monthlyData?.qr_scans ?? 0}</div>
                <span className="text-[10px] text-slate-400 mt-1 block">Monthly QR scans</span>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400"></div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left relative overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-xs mb-2">
                  <i className="fa-solid fa-satellite-dish"></i>
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Funnel</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{activeFunnelsCount}</div>
                <span className="text-[10px] text-slate-400 mt-1 block">Live review funnel</span>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500"></div>
              </div>
            </div>

            {/* ═══════ ANALYTICS PERFORMANCE TRENDS CHART ═══════ */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-5 shadow-sm text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Analytics Engine</div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">Performance Trends</h3>
                  <p className="text-xs text-slate-400">
                    See how customers move from QR scan to funnel visit and selected review over the last 7 days.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full bg-[#34A853] inline-block"></i> QR Scans</span>
                  <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] inline-block"></i> Visits</span>
                  <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] inline-block"></i> Selected Reviews</span>
                </div>
              </div>

              {/* Clean Interactive SVG Trend Visualization */}
              <div className="h-44 w-full pt-3">
                <svg viewBox="0 0 700 160" className="w-full h-full overflow-visible">
                  {/* Grid lines */}
                  <line x1="0" y1="30" x2="700" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="0" y1="75" x2="700" y2="75" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="0" y1="120" x2="700" y2="120" stroke="#f1f5f9" strokeWidth="1" />

                  {/* Scans Curve (Green) */}
                  <path
                    d={getDashPath('qr_scans')}
                    fill="none"
                    stroke="#34A853"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Visits Curve (Blue) */}
                  <path
                    d={getDashPath('page_views')}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Selected Curve (Purple) */}
                  <path
                    d={getDashPath('rating_selected')}
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Day Labels */}
                  {last7Days.map((item, idx) => {
                    const label = item.date ? item.date.slice(5) : `D${idx + 1}`;
                    return (
                      <text
                        key={item.date || idx}
                        x={50 + (idx / Math.max(1, last7Days.length - 1)) * 600}
                        y="145"
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="11"
                        fontWeight="600"
                      >
                        {label}
                      </text>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* ═══════ LOWER GRID ═══════ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-left">
              {/* Left Column (Breakdown & Activity) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Performance Breakdown Table */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 mb-0.5">Review Performance Breakdown</h3>
                  <p className="text-xs text-slate-400 mb-3">Comparative activity across weekly, monthly, and lifetime intervals.</p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          <th className="py-2">Timeframe</th>
                          <th className="py-2 text-right">QR Scans</th>
                          <th className="py-2 text-right">Funnel Visits</th>
                          <th className="py-2 text-right">Reviews Gen</th>
                          <th className="py-2 text-right">Selected</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        <tr>
                          <td className="py-2.5 font-bold text-slate-900">Weekly</td>
                          <td className="py-2.5 text-right">{weeklyData?.qr_scans ?? 0}</td>
                          <td className="py-2.5 text-right">{weeklyData?.page_views ?? 0}</td>
                          <td className="py-2.5 text-right">{weeklyData?.rating_selected ?? 0}</td>
                          <td className="py-2.5 text-right font-extrabold text-emerald-600">{weeklyData?.feedback_completed ?? 0}</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-bold text-slate-900">Monthly</td>
                          <td className="py-2.5 text-right">{monthlyData?.qr_scans ?? 0}</td>
                          <td className="py-2.5 text-right">{monthlyData?.page_views ?? 0}</td>
                          <td className="py-2.5 text-right">{monthlyData?.rating_selected ?? 0}</td>
                          <td className="py-2.5 text-right font-extrabold text-emerald-600">{monthlyData?.feedback_completed ?? 0}</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-bold text-slate-900">Total</td>
                          <td className="py-2.5 text-right">{totalData?.qr_scans ?? 0}</td>
                          <td className="py-2.5 text-right">{totalData?.page_views ?? 0}</td>
                          <td className="py-2.5 text-right">{totalData?.rating_selected ?? 0}</td>
                          <td className="py-2.5 text-right font-extrabold text-emerald-600">{totalData?.feedback_completed ?? 0}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent QR Code Events */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 mb-0.5">Recent Activity Feed</h3>
                      <p className="text-xs text-slate-400">Real-time feed of client actions in your review loop.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      View Analytics &rarr;
                    </button>
                  </div>

                  {recentReviews && recentReviews.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {recentReviews.slice(0, 4).map((r: any) => (
                        <div key={r.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">{r.customer_name || 'Customer'}</span>
                              <span className="text-amber-500 font-bold">
                                {'★'.repeat(r.rating || 5)}
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px] truncate mt-0.5">{r.comment || 'Verified review submission'}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center space-y-1.5 bg-slate-50/50">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-sm">
                        <i className="fa-solid fa-chart-simple"></i>
                      </div>
                      <h4 className="text-xs font-bold text-slate-600">No recent activity yet</h4>
                      <p className="text-[11px] text-slate-400">Share your QR code flyer or preview the review funnel to start collecting analytics!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (Shortcuts, Physical Stand, Business Info) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Quick Actions Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                  <div className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Shortcuts</div>
                  <h3 className="text-sm font-black text-slate-900">Quick Actions</h3>

                  <div className="space-y-2">
                    <button
                      onClick={() => onNavigate('flyer-tool')}
                      className="w-full p-2.5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                          <i className="fa-solid fa-qrcode"></i>
                        </div>
                        <div>
                          <strong className="block text-xs text-slate-900 group-hover:text-emerald-800">QR Poster &amp; Tools</strong>
                          <span className="text-[10px] text-slate-400">Download, print or manage your QR funnel</span>
                        </div>
                      </div>
                      <i className="fa-solid fa-arrow-right text-xs text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all"></i>
                    </button>

                    <button
                      onClick={() => setActiveTab('reviews')}
                      className="w-full p-2.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                          <i className="fa-brands fa-google"></i>
                        </div>
                        <div>
                          <strong className="block text-xs text-slate-900 group-hover:text-blue-800">Google Reviews &amp; Replies</strong>
                          <span className="text-[10px] text-slate-400">Sync ratings &amp; publish owner replies</span>
                        </div>
                      </div>
                      <i className="fa-solid fa-arrow-right text-xs text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all"></i>
                    </button>

                    <button
                      onClick={() => setActiveTab('reviews')}
                      className="w-full p-2.5 bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs">
                          <i className="fa-solid fa-wand-magic-sparkles"></i>
                        </div>
                        <div>
                          <strong className="block text-xs text-slate-900 group-hover:text-purple-800">AI Review Assistant</strong>
                          <span className="text-[10px] text-slate-400">Generate reply drafts &amp; analyze sentiment</span>
                        </div>
                      </div>
                      <i className="fa-solid fa-arrow-right text-xs text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all"></i>
                    </button>
                  </div>
                </div>

                {/* Counter Stand Promo Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-green-50 border border-emerald-200 shadow-sm relative overflow-hidden">
                  <div className="w-9 h-9 rounded-xl bg-white border border-emerald-200 text-emerald-600 flex items-center justify-center text-sm shadow-xs mb-2">
                    <i className="fa-solid fa-shop"></i>
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mb-1">
                    Offline Growth
                  </span>
                  <h3 className="text-sm font-black text-slate-900">Get a Counter QR Stand</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1 mb-3">
                    Make it easier for customers to scan and leave 5-star Google feedback directly at your billing counter or table.
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-emerald-100">
                    <span className="text-base font-black text-slate-900">₹499</span>
                    <button
                      onClick={() => setActiveTab('stand')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      View QR Stand &rarr;
                    </button>
                  </div>
                </div>

                {/* Business Info Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Business Info</div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#34A853] to-[#258744] text-white flex items-center justify-center font-bold text-xs">
                      {avatarChar}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{businessName}</h4>
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                        {businessCategory}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                    <i className="fa-solid fa-location-dot text-emerald-600 text-xs"></i>
                    <span className="truncate">{businessAddress}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <div className="p-2 bg-slate-50 rounded-xl text-center">
                      <div className="text-base font-black text-slate-900">0</div>
                      <div className="text-[10px] text-slate-400">Total Clicks</div>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-xl text-center">
                      <div className="text-base font-black text-emerald-700">0%</div>
                      <div className="text-[10px] text-emerald-700">Conversion</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Physical Stand Modal */}
      {standModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-left text-slate-900 animate-fadeIn">
            <button
              onClick={() => setStandModalOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center cursor-pointer"
            >
              &times;
            </button>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl mb-3">
              <i className="fa-solid fa-shop"></i>
            </div>
            <h3 className="text-base font-black text-slate-900">Physical Counter Stand &amp; Standee</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Order a premium acrylic QR stand custom-printed with your business branding and Google review QR code.
            </p>
            <div className="my-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div>📐 <strong>Size:</strong> A6 Acrylic Standee (105 × 148 mm)</div>
              <div>✨ <strong>Material:</strong> UV-Resistant Gloss Acrylic</div>
              <div>🚚 <strong>Delivery:</strong> Free Express Delivery across India</div>
              <div>💰 <strong>Price:</strong> ₹499 (All Inclusive)</div>
            </div>
            <a
              href={`https://wa.me/919707842047?text=${encodeURIComponent(`Hi! I want to order the ₹499 Physical Counter Stand for ${businessName}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-brands fa-whatsapp text-sm"></i> Order on WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
