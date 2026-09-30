import React, { useState } from 'react';

interface BusinessAnalyticsViewProps {
  onUpgrade: () => void;
  onBackToDashboard?: () => void;
}

interface TrackedReviewPayload {
  action: string;
  date: string;
  lang: string;
  rating: number;
  text: string;
}

export const BusinessAnalyticsView: React.FC<BusinessAnalyticsViewProps> = ({
  onUpgrade
}) => {
  const [period, setPeriod] = useState<'7' | '30' | '90' | 'all'>('7');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<TrackedReviewPayload | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Period label mapper
  const periodLabelMap: Record<string, string> = {
    '7': 'Last 7 Days',
    '30': 'Last 30 Days',
    '90': 'Last 90 Days',
    'all': 'All Time'
  };

  const handleOpenModal = (review: TrackedReviewPayload) => {
    setSelectedReview(review);
    setModalOpen(true);
  };

  const handleCopyText = () => {
    if (!selectedReview) return;
    navigator.clipboard.writeText(selectedReview.text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="space-y-4 animate-fadeIn text-left">
      {/* ═══════ HEADER ═══════ */}
      <section className="relative overflow-hidden p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#34A853] to-[#2D9248] text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19V9"/>
              <path d="M10 19V5"/>
              <path d="M16 19v-7"/>
              <path d="M22 19V3"/>
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-extrabold text-emerald-700 tracking-wider mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Performance &bull; Insights
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
              Business Analytics
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Track customer activity, review funnel performance and conversion trends.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#22c55e]"></span>
            Live Data
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-xs">
            {periodLabelMap[period]}
          </div>
        </div>
      </section>

      {/* ═══════ TRIAL BANNER ═══════ */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-200 border-l-4 border-l-amber-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-200/80 text-amber-800 flex items-center justify-center text-sm shrink-0">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-950">
              Free Trial &mdash; <span className="text-red-600 font-extrabold">1 day remaining</span>
            </h4>
            <p className="text-[11px] text-amber-800 leading-tight mt-0.5">
              Upgrade to unlock advanced analytics, custom export reports, and automated AI review responses.
            </p>
          </div>
        </div>

        <button
          onClick={onUpgrade}
          className="px-3.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs shadow-xs hover:shadow transition-all shrink-0 cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
        >
          <i className="fa-solid fa-bolt"></i> Upgrade Plan
        </button>
      </div>

      {/* ═══════ PERIOD FILTER TOOLBAR ═══════ */}
      <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {(['7', '30', '90', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                period === p
                  ? 'bg-white text-emerald-800 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p === 'all' ? 'All Time' : `${p} Days`}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5 px-2">
          <span>Showing data for</span>
          <strong className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-extrabold text-[11px] border border-emerald-200">
            {periodLabelMap[period]}
          </strong>
        </div>
      </div>

      {/* ═══════ GOOGLE TRACKING TRANSPARENCY NOTICE ═══════ */}
      <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] border-l-4 border-l-[#16A34A] shadow-xs flex gap-3 items-start">
        <span className="text-base leading-none shrink-0 mt-0.5">ℹ️</span>
        <div className="space-y-1">
          <h4 className="text-xs font-extrabold text-[#166534]">
            Tracked Review Actions &amp; Submission Attempts
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed">
            Google does not provide third-party webhooks to confirm when a customer completes their final review submission on Google Maps. The data below records verified customer review draft copies, selections, and review submission attempts (redirects to the Google Review composer) initiated through ReviewFlow AI.
          </p>
        </div>
      </div>

      {/* ═══════ 4 KPI CARDS ═══════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Funnel Visits */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[135px]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-xs">
                <i className="fa-solid fa-chart-simple"></i>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Funnel Visits
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900">0</div>
          </div>
          <span className="text-[11px] text-slate-400 block pt-1">
            0 clicks + 0 QR scans
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400"></div>
        </div>

        {/* KPI 2: Generated Reviews */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[135px]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center text-xs">
                <i className="fa-solid fa-wand-magic-sparkles"></i>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Generated Reviews
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900">0</div>
          </div>
          <span className="text-[11px] text-slate-400 block pt-1">
            AI draft options created for customers
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-400"></div>
        </div>

        {/* KPI 3: Copied & Clicked */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[135px]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-xs">
                <i className="fa-solid fa-clipboard-check"></i>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Copied &amp; Clicked
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900">0</div>
          </div>
          <span className="text-[11px] text-slate-400 block pt-1">
            0 clicked &bull; 0 copied
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500"></div>
        </div>

        {/* KPI 4: Submission Attempts */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#34A853] to-[#258744] text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[135px]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-xs">
                <i className="fa-solid fa-arrow-up-right-from-square"></i>
              </div>
              <span className="text-[10px] uppercase font-bold text-white/80 tracking-wider">
                Submission Attempts
              </span>
            </div>
            <div className="text-2xl font-black text-white">0</div>
          </div>
          <span className="text-[11px] text-white/70 block pt-1">
            0% redirect rate to Google composer
          </span>
          <div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-white/10 pointer-events-none"></div>
        </div>
      </div>

      {/* ═══════ FUNNEL JOURNEY PIPELINE ═══════ */}
      <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div>
          <div className="text-[10px] uppercase font-extrabold text-emerald-700 tracking-wider">Customer Journey</div>
          <h2 className="text-base font-black text-slate-900">Review Funnel Pipeline</h2>
          <p className="text-xs text-slate-400">
            Track customer progression from funnel entry to Google review composer redirect.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Step 1 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-emerald-600 flex items-center justify-center text-xs shadow-xs">
                <i className="fa-solid fa-qrcode"></i>
              </div>
              <span className="text-[10px] font-black text-slate-400 tracking-wider">STEP 01</span>
            </div>
            <div className="text-xs font-bold text-slate-600 mb-0.5">Funnel Visits</div>
            <div className="text-2xl font-black text-emerald-600">0</div>
            <p className="text-[10px] text-slate-400 mt-2">Customers entering the review funnel</p>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-emerald-100/40 pointer-events-none"></div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-blue-600 flex items-center justify-center text-xs shadow-xs">
                <i className="fa-solid fa-wand-magic-sparkles"></i>
              </div>
              <span className="text-[10px] font-black text-slate-400 tracking-wider">STEP 02</span>
            </div>
            <div className="text-xs font-bold text-slate-600 mb-0.5">AI Reviews Generated</div>
            <div className="text-2xl font-black text-blue-600">0</div>
            <p className="text-[10px] text-slate-400 mt-2"><strong>0%</strong> of visits generated AI options</p>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-blue-100/40 pointer-events-none"></div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-purple-600 flex items-center justify-center text-xs shadow-xs">
                <i className="fa-solid fa-copy"></i>
              </div>
              <span className="text-[10px] font-black text-slate-400 tracking-wider">STEP 03</span>
            </div>
            <div className="text-xs font-bold text-slate-600 mb-0.5">Drafts Copied &amp; Clicked</div>
            <div className="text-2xl font-black text-purple-600">0</div>
            <p className="text-[10px] text-slate-400 mt-2"><strong>0%</strong> of generated drafts chosen</p>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-purple-100/40 pointer-events-none"></div>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-teal-600 flex items-center justify-center text-xs shadow-xs">
                <i className="fa-solid fa-arrow-up-right-from-square"></i>
              </div>
              <span className="text-[10px] font-black text-slate-400 tracking-wider">STEP 04</span>
            </div>
            <div className="text-xs font-bold text-slate-600 mb-0.5">Google Submission Attempts</div>
            <div className="text-2xl font-black text-teal-600">0</div>
            <p className="text-[10px] text-slate-400 mt-2"><strong>0%</strong> continued to Google Review composer</p>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-teal-100/40 pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* ═══════ CHART + TRACKED REVIEWS ═══════ */}
      <div className="space-y-4">
        {/* Trend Analysis Chart Card */}
        <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-[10px] uppercase font-extrabold text-emerald-700 tracking-wider">Trend Analysis</div>
              <h3 className="text-base font-black text-slate-900">Funnel Activity Trends</h3>
              <p className="text-xs text-slate-400">Daily visits, generated drafts, draft copies, and Google submission attempts.</p>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 flex-wrap">
              <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></i> Visits</span>
              <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></i> Generated Drafts</span>
              <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></i> Drafts Copied</span>
              <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></i> Submission Attempts</span>
            </div>
          </div>

          <div className="h-56 w-full pt-2">
            <svg viewBox="0 0 700 180" className="w-full h-full overflow-visible">
              <line x1="40" y1="30" x2="680" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="40" y1="75" x2="680" y2="75" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="40" y1="120" x2="680" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="40" y1="150" x2="680" y2="150" stroke="#e2e8f0" strokeWidth="1.5" />

              {/* Blue: Visits */}
              <path
                d="M 60 150 Q 160 148, 260 142 T 460 135 T 660 128"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Purple: Generated Drafts */}
              <path
                d="M 60 150 Q 160 149, 260 145 T 460 140 T 660 134"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Green: Drafts Copied */}
              <path
                d="M 60 150 Q 160 149, 260 147 T 460 144 T 660 139"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Amber: Submission Attempts */}
              <path
                d="M 60 150 Q 160 150, 260 148 T 460 146 T 660 142"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'].map((d, i) => (
                <text
                  key={d}
                  x={60 + i * 100}
                  y="170"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="11"
                  fontWeight="600"
                >
                  {d}
                </text>
              ))}
            </svg>
          </div>
        </section>

        {/* Tracked Review Actions Card */}
        <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-extrabold text-emerald-700 tracking-wider">Review Tracking Log</div>
              <h3 className="text-base font-black text-slate-900">Tracked Review Actions</h3>
              <p className="text-xs text-slate-400">Exact review drafts copied by reviewers and redirected to Google.</p>
            </div>

            <button
              onClick={() => handleOpenModal({
                action: '⚡ Google Redirect',
                date: 'Just now',
                lang: 'English',
                rating: 5,
                text: 'The hospitality and service here are truly world-class. From the warm welcome to the delicious coffee and relaxing ambiance, every detail was perfect. Highly recommended to anyone visiting the area!'
              })}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Preview Sample Review Draft &rarr;
            </button>
          </div>

          <div className="border border-dashed border-slate-200 rounded-xl p-10 text-center space-y-2 bg-slate-50/50">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-sm">
              <i className="fa-solid fa-comments"></i>
            </div>
            <h4 className="text-xs font-bold text-slate-700">No tracked review actions yet</h4>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              When customers click or copy AI review drafts, the exact text and tracking data will appear here.
            </p>
          </div>
        </section>
      </div>

      {/* ═══════ FULL REVIEW DRAFT TEXT MODAL ═══════ */}
      {modalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-fadeIn text-left">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedReview.action}
                </span>
                <h3 className="text-sm font-black text-slate-900 mt-1">Tracked Review Draft</h3>
                <small className="text-xs text-slate-400">
                  {selectedReview.date} &bull; Language: {selectedReview.lang} &bull; Rating: {'★'.repeat(selectedReview.rating)}
                </small>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg cursor-pointer p-1"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Exact Generated Review Text Copied by Reviewer:
              </label>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed font-medium">
                {selectedReview.text}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCopyText}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-regular fa-copy"></i>
                {copiedNotification ? '✓ Copied!' : 'Copy Text'}
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
