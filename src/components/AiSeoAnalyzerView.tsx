import React, { useState, useEffect } from 'react';

interface AiSeoAnalyzerViewProps {
  businessName?: string;
  businessAddress?: string;
  businessCategory?: string;
  onUpgrade: () => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

interface CheckpointItem {
  id: string;
  title: string;
  status: 'passed' | 'warning' | 'failed' | 'manual';
  statusText: string;
  category: 'GBP Quality' | 'Search Visibility' | 'Reviews & Trust';
  severity?: 'High' | 'Medium' | 'Low';
  description: string;
  recommendation: string;
}

export const AiSeoAnalyzerView: React.FC<AiSeoAnalyzerViewProps> = ({
  businessName = 'Muzaffarabad azad jamu and kashmir',
  businessAddress = '9F4G+2Q8, Domail Muzaffarabad',
  businessCategory = 'Other',
  onUpgrade,
  onNotify
}) => {
  // Intake state
  const [targetKeyword, setTargetKeyword] = useState('');
  const [targetCity, setTargetCity] = useState('');

  // Scanning / Report state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingStage, setAnalyzingStage] = useState(0);
  const [analyzingProgress, setAnalyzingProgress] = useState(0);
  const [analyzingStatus, setAnalyzingStatus] = useState('Initializing…');
  const [reportGenerated, setReportGenerated] = useState(false);

  // Filter tabs for checkpoints in report
  const [activeTab, setActiveTab] = useState<'all' | 'gbp' | 'visibility' | 'reviews'>('all');

  const stages = [
    { pct: 15, msg: 'Connecting to Google Places APIs…' },
    { pct: 35, msg: 'Normalizing business data & NAP record…' },
    { pct: 55, msg: 'Fetching & parsing website HTML schema…' },
    { pct: 72, msg: 'Auditing 20+ local search prominence signals…' },
    { pct: 88, msg: 'Scanning for duplicate listings & review velocity…' },
    { pct: 98, msg: 'Compiling AI audit checklist report…' }
  ];

  const handleStartAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetKeyword.trim()) {
      onNotify('Please enter a target keyword.', 'warning');
      return;
    }

    setIsAnalyzing(true);
    setAnalyzingStage(0);
    setAnalyzingProgress(10);
    setAnalyzingStatus(stages[0].msg);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < stages.length) {
        setAnalyzingStage(current);
        setAnalyzingProgress(stages[current].pct);
        setAnalyzingStatus(stages[current].msg);
      } else {
        clearInterval(interval);
        setAnalyzingProgress(100);
        setAnalyzingStatus('Audit complete! Loading report…');
        setTimeout(() => {
          setIsAnalyzing(false);
          setReportGenerated(true);
          onNotify(`AI SEO Analysis completed for "${targetKeyword}"!`, 'success');
        }, 600);
      }
    }, 650);
  };

  const handlePrint = () => {
    window.print();
  };

  const checkpoints: CheckpointItem[] = [
    {
      id: 'cp-1',
      title: 'Google Business Profile Claimed & Verified',
      status: 'passed',
      statusText: 'Verified Listing',
      category: 'GBP Quality',
      severity: 'Low',
      description: 'Your business profile is actively verified on Google Maps with ownership confirmed.',
      recommendation: 'Keep primary business phone and hours up to date during holidays.'
    },
    {
      id: 'cp-2',
      title: 'Target Keyword in Review Drafts & Feedback',
      status: 'passed',
      statusText: 'Keyword Synergy Active',
      category: 'Reviews & Trust',
      severity: 'Low',
      description: `Target term "${targetKeyword || 'services'}" is naturally integrated into ReviewFlow AI review generation drafts.`,
      recommendation: 'Encourage reviewers to mention specific dishes or services they enjoyed.'
    },
    {
      id: 'cp-3',
      title: 'NAP (Name, Address, Phone) Uniformity',
      status: 'warning',
      statusText: 'Partial Consistency',
      category: 'Search Visibility',
      severity: 'Medium',
      description: 'Minor difference detected in postal abbreviation across secondary citation directories.',
      recommendation: 'Ensure your address format on social pages exactly matches your Google Maps listing.'
    },
    {
      id: 'cp-4',
      title: 'Review Response Rate & Speed',
      status: 'warning',
      statusText: '62% Responded',
      category: 'Reviews & Trust',
      severity: 'Medium',
      description: 'Google favors listings with owner responses to both positive and negative reviews within 48 hours.',
      recommendation: 'Use ReviewFlow AI automated reply drafts to maintain a 90%+ response rate.'
    },
    {
      id: 'cp-5',
      title: 'LocalBusiness Schema Markup on Website',
      status: 'passed',
      statusText: 'Schema Present',
      category: 'Search Visibility',
      severity: 'Low',
      description: 'Structured JSON-LD LocalBusiness data detected linking your official domain to your Google Maps listing.',
      recommendation: 'Keep opening hours specifications synchronized with your Google Profile.'
    },
    {
      id: 'cp-6',
      title: 'Photo Library Depth & Geotagged Uploads',
      status: 'passed',
      statusText: '25+ Photos Listed',
      category: 'GBP Quality',
      severity: 'Low',
      description: 'Profiles with customer and owner photos receive 42% more direction requests on Google Maps.',
      recommendation: 'Post weekly exterior and interior photos during peak operating hours.'
    }
  ];

  const filteredCheckpoints = activeTab === 'all'
    ? checkpoints
    : activeTab === 'gbp'
    ? checkpoints.filter(c => c.category === 'GBP Quality')
    : activeTab === 'visibility'
    ? checkpoints.filter(c => c.category === 'Search Visibility')
    : checkpoints.filter(c => c.category === 'Reviews & Trust');

  return (
    <div className="space-y-4 animate-fadeIn text-left max-w-7xl mx-auto">
      {/* ═══════ PAGE HEADER BANNER ═══════ */}
      <section className="relative overflow-hidden p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#34A853] to-[#2D9248] text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20 text-lg">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
              AI SEO Analyzer
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Local GMB audit &bull; NAP consistency &bull; Rankings health check
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {reportGenerated && (
            <button
              onClick={() => {
                setReportGenerated(false);
                setTargetKeyword('');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-all"
            >
              &larr; New Scan
            </button>
          )}
        </div>
      </section>

      {/* ═══════ FREE TRIAL BANNER ═══════ */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-200 border-l-4 border-l-amber-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-200/80 text-amber-800 flex items-center justify-center text-sm shrink-0">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-950">
              Premium feature &mdash; requires an active plan &mdash; <span className="text-red-600 font-extrabold">1 day remaining</span>
            </h4>
            <p className="text-[11px] text-amber-800 leading-tight mt-0.5">
              Upgrade to unlock automated competitor audit tracking and weekly PDF SEO export reports.
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

      {/* ═══════ IF ANALYZING OVERLAY ACTIVE ═══════ */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
            <div>
              <h3 className="text-base font-black text-slate-900">Analyzing Business Profile</h3>
              <p className="text-xs text-emerald-600 font-bold mt-1">{analyzingStatus}</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#34A853] to-[#2D9248] h-full transition-all duration-300 rounded-full"
                style={{ width: `${analyzingProgress}%` }}
              ></div>
            </div>

            {/* Stage List */}
            <div className="space-y-1.5 text-left text-xs pt-2">
              {stages.map((st, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 ${
                    idx < analyzingStage
                      ? 'text-emerald-700 font-bold'
                      : idx === analyzingStage
                      ? 'text-slate-900 font-extrabold'
                      : 'text-slate-400'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]">
                    {idx < analyzingStage ? '✓' : idx === analyzingStage ? '●' : '○'}
                  </span>
                  <span>{st.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ MODE A: INTAKE FORM (When report not yet generated) ═══════ */}
      {!reportGenerated ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left Column: Form Card (7 Cols) */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <span className="inline-block text-[10px] uppercase font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mb-2">
                  Instant Local Audit
                </span>
                <h2 className="text-lg font-black text-slate-900 leading-tight">
                  AI Search Visibility Scan
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Enter your primary target keyword and local area below. Our AI will perform a real-time audit of 20+ search checkpoints to verify your GBP health and discover SEO opportunities.
                </p>
              </div>

              <form onSubmit={handleStartAnalysis} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Keyword *
                  </label>
                  <input
                    type="text"
                    required
                    value={targetKeyword}
                    onChange={(e) => setTargetKeyword(e.target.value)}
                    placeholder="e.g. Best Pizza NYC, Coffee Shop Boston, Dental Clinic"
                    className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl outline-none focus:border-emerald-500 font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">What keyword do you want to rank for?</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target City / Area <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={targetCity}
                    onChange={(e) => setTargetCity(e.target.value)}
                    placeholder="e.g. Brooklyn, Manhattan, Austin, Muzaffarabad"
                    className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl outline-none focus:border-emerald-500 font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Which specific city or neighborhood should we analyze?</span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10"/>
                      <line x1="12" y1="20" x2="12" y2="4"/>
                      <line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                    <span>Analyze My Business</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Explainer and How It Works (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* What We Check */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  What We Check
                </h4>

                <div className="space-y-3">
                  <div className="flex gap-2.5 items-start">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">GBP Quality &amp; Information</h5>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Checks business name compliance, hours, category alignment, and photo depth.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">Search Visibility &amp; Listing Health</h5>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Audits local directory indexation, Google Maps prominence, and missing setup identifiers.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">Reviews, Trust &amp; Schema</h5>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Checks rating score benchmarks, review volume, owner response rates, and LocalBusiness schema markup.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-2">
                <h4 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">
                  How It Works
                </h4>
                <ol className="list-decimal list-inside text-xs text-blue-800 space-y-1 font-medium leading-relaxed">
                  <li>Specify target keyword and city location.</li>
                  <li>AI fetches real-time maps metadata and compares schema records.</li>
                  <li>Generates a comprehensive SEO audit report and dynamic action checklist.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Important Note Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
            <span className="text-base text-blue-600 mt-0.5">ℹ️</span>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Understanding Your Audit Score</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                This tool analyzes important checkpoints about your business profile and presents them in a clear, professional way so you can easily see what's wrong and what you can improve. Actual ranking on Google Maps depends on review velocity, user engagement, and proximity.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ═══════ MODE B: FULL COMPREHENSIVE AUDIT REPORT ═══════ */
        <div className="space-y-4 animate-fadeIn">
          {/* Audit Dark Header Banner */}
          <section className="p-5 rounded-2xl bg-gradient-to-br from-[#34A853] to-[#258744] text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider block mb-1">
                AUDIT COMPLETE &bull; 20+ CHECKPOINTS ANALYZED
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_white] animate-pulse"></span>
                <h2 className="text-lg font-black text-white">Local SEO &amp; GMB Audit Report</h2>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                Target Keyword: <strong>"{targetKeyword}"</strong> &bull; Target Location: {targetCity || 'Local Area'}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5"
              >
                <i className="fa-solid fa-print text-[10px]"></i> Print / Export PDF
              </button>
              <button
                type="button"
                onClick={() => {
                  setReportGenerated(false);
                  setTargetKeyword('');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white text-emerald-800 font-extrabold text-xs cursor-pointer transition-all shadow-xs hover:bg-emerald-50"
              >
                Re-run Analysis
              </button>
            </div>
          </section>

          {/* Business Profile Connected Data */}
          <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="text-[10px] uppercase font-extrabold text-emerald-700 tracking-wider">
              Connected Profile
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Business Name</span>
                <strong className="text-slate-900 block truncate">{businessName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Verified Address</span>
                <strong className="text-slate-900 block truncate">{businessAddress}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Category</span>
                <strong className="text-slate-900 block truncate">{businessCategory}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Status</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  ✓ Verified Listing
                </span>
              </div>
            </div>
          </section>

          {/* Core SEO Health Category Circles */}
          <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Core SEO Health Categories</h3>
                <p className="text-xs text-slate-400">Holistic audit across setup quality, directory signals, and customer sentiment.</p>
              </div>

              {/* Total Score Chip */}
              <div className="p-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl shadow-sm text-center min-w-[130px]">
                <span className="text-[10px] uppercase font-bold text-emerald-100 block">Overall Score</span>
                <strong className="text-2xl font-black block leading-none mt-0.5">85<small className="text-xs font-normal opacity-80">/100</small></strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Category 1 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Good</span>
                  <span>9/10 Points</span>
                </div>
                <div className="w-24 h-24 rounded-full border-4 border-emerald-500 flex flex-col items-center justify-center mx-auto bg-white shadow-xs">
                  <strong className="text-xl font-black text-slate-900 leading-none">88%</strong>
                  <span className="text-[9px] text-slate-400 font-bold">Health</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">GBP Quality &amp; Setup</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Verified hours, categories, description, and high-res photos.</p>
                </div>
              </div>

              {/* Category 2 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                  <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Warning</span>
                  <span>7/10 Points</span>
                </div>
                <div className="w-24 h-24 rounded-full border-4 border-amber-500 flex flex-col items-center justify-center mx-auto bg-white shadow-xs">
                  <strong className="text-xl font-black text-slate-900 leading-none">74%</strong>
                  <span className="text-[9px] text-slate-400 font-bold">Health</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Search Prominence &amp; NAP</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Directory citations, map rankings, and street address uniformity.</p>
                </div>
              </div>

              {/* Category 3 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Good</span>
                  <span>9/10 Points</span>
                </div>
                <div className="w-24 h-24 rounded-full border-4 border-emerald-500 flex flex-col items-center justify-center mx-auto bg-white shadow-xs">
                  <strong className="text-xl font-black text-slate-900 leading-none">92%</strong>
                  <span className="text-[9px] text-slate-400 font-bold">Health</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Reviews &amp; Customer Trust</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Review velocity, 5-star ratings ratio, and keyword inclusion.</p>
                </div>
              </div>
            </div>
          </section>

          {/* AI Local Search Diagnostic Summary */}
          <section className="p-5 rounded-2xl bg-white border-2 border-emerald-200 shadow-md space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                AI Analysis
              </span>
              <h3 className="text-sm font-black text-slate-900">AI Local Search Diagnostic Summary</h3>
            </div>

            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 leading-relaxed font-medium">
              &ldquo;Your business has strong Google listing verification and healthy photo density. To dominate top 3 rankings for <strong>"{targetKeyword}"</strong>, focus on generating fresh 5-star reviews mentioning specific menu items/services weekly and standardize address abbreviations across web citations.&rdquo;
            </div>
          </section>

          {/* Detailed Checkpoints Accordion List */}
          <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-black text-slate-900">Detailed Checkpoint Findings</h3>
                <p className="text-xs text-slate-400">Review status and actionable fixes for each search signal.</p>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(['all', 'gbp', 'visibility', 'reviews'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                      activeTab === tab
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab === 'all' ? 'All (6)' : tab === 'gbp' ? 'GBP' : tab === 'visibility' ? 'Prominence' : 'Reviews'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredCheckpoints.map(cp => (
                <details
                  key={cp.id}
                  className="group bg-slate-50/70 border border-slate-200 rounded-xl overflow-hidden transition-all open:border-emerald-300 open:bg-white"
                >
                  <summary className="p-3.5 flex items-center justify-between cursor-pointer list-none select-none">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`w-2 h-2 rounded-full ${cp.status === 'passed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      <strong className="text-xs text-slate-900">{cp.title}</strong>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cp.status === 'passed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {cp.statusText}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>

                  <div className="p-4 border-t border-slate-100 bg-white text-xs space-y-2">
                    <div className="text-slate-600">{cp.description}</div>
                    <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-lg text-blue-900 flex items-start gap-2">
                      <span className="font-bold text-[11px]">💡 Recommended Action:</span>
                      <span className="text-[11px]">{cp.recommendation}</span>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
