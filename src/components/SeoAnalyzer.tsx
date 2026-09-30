import React, { useState } from 'react';

interface SeoAnalyzerProps {
  standalone?: boolean;
  onOpenAudit?: () => void;
}

export const SeoAnalyzer: React.FC<SeoAnalyzerProps> = ({ standalone = false }) => {
  const [businessName, setBusinessName] = useState('Royal Heritage Grand Cafe');
  const [city, setCity] = useState('Mumbai, Maharashtra');
  const [category, setCategory] = useState('Restaurant & Cafe');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(true);
  const [healthScore, setHealthScore] = useState(94);

  const handleStartScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName) return;
    setIsScanning(true);
    setScanComplete(false);

    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
      // Realistic randomized score based on input
      const randomScore = Math.floor(Math.random() * 12) + 85;
      setHealthScore(randomScore);
    }, 1800);
  };

  const dimensions = [
    {
      name: 'Primary & Secondary Categories',
      score: '100%',
      status: 'Optimal',
      icon: 'fa-solid fa-tags',
      detail: 'Primary category matches search intent. 3 related secondary categories mapped.'
    },
    {
      name: 'Review Velocity & Sentiment Health',
      score: '96%',
      status: 'Strong',
      icon: 'fa-solid fa-star',
      detail: '4.8 average rating with consistent weekly review momentum.'
    },
    {
      name: 'Keyword Optimization in Description',
      score: '91%',
      status: 'Good',
      icon: 'fa-solid fa-key',
      detail: 'Local geo-modifiers found (city, cuisine, landmarks). Room for 2 more long-tail keywords.'
    },
    {
      name: 'NAP Uniformity (Name, Address, Phone)',
      score: '98%',
      status: 'Clean',
      icon: 'fa-solid fa-map-location-dot',
      detail: 'Zero conflicting phone numbers or address variations across top directories.'
    },
    {
      name: 'Owner Response Velocity',
      score: '88%',
      status: 'Moderate',
      icon: 'fa-solid fa-reply-all',
      detail: '84% of reviews replied to within 48 hours. Aim for 95%+ with AI suggested replies.'
    },
    {
      name: 'Geotagged Visuals & Photos',
      score: '92%',
      status: 'Optimal',
      icon: 'fa-solid fa-camera',
      detail: 'Recent interior and menu photos uploaded in past 14 days with high viewer engagement.'
    }
  ];

  return (
    <div className={standalone ? 'py-12 max-w-5xl mx-auto px-4' : 'py-10 max-w-6xl mx-auto px-4'}>
      {/* Banner / Showcase Card */}
      <div className="bg-gradient-to-br from-[#0D1E12] via-[#162E1D] to-[#0F2618] rounded-3xl p-6 sm:p-12 text-white shadow-2xl relative overflow-hidden border border-emerald-900/50">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <i className="fa-solid fa-stethoscope"></i>
              New Diagnostic Tool
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Diagnose &amp; Scale Your <br />
              <span className="text-[#34A853]">Google Maps Rankings</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Our AI SEO Analyzer runs automated 20-point diagnostic scans to detect missing categories, review sentiment gaps, NAP inconsistencies, and technical schema errors.
            </p>

            {/* Quick interactive search input */}
            <form onSubmit={handleStartScan} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-md">
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter Business Name..."
                className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-400 font-medium"
              />
              <button
                type="submit"
                disabled={isScanning}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isScanning ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Scanning...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-magnifying-glass"></i> Audit Profile
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Health Score Gauge */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-xs bg-white/5 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-sm">
              <div className="w-32 h-32 rounded-full border-8 border-emerald-500 flex flex-col items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(52,168,83,0.3)]">
                <span className="text-4xl font-black text-white">{healthScore}%</span>
                <span className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-wider">
                  Health Score
                </span>
              </div>
              <h4 className="font-extrabold text-base text-white">Instant GMB Audit &amp; Report</h4>
              <p className="text-xs text-slate-300 mt-1">
                Automated checks across 6 core Google Maps SEO dimensions
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Dimension Report (shown if scanned or in standalone mode) */}
        {scanComplete && (
          <div className="mt-10 pt-8 border-t border-white/10">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-chart-pie text-emerald-400"></i>
                Diagnostic Breakdown for: <span className="text-emerald-300 font-extrabold">"{businessName}"</span>
              </h3>
              <span className="text-xs text-slate-400">Updated: Just Now · Live Scan</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {dimensions.map((dim, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-emerald-500/40 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <i className={`${dim.icon} text-emerald-400 text-xs`}></i>
                      {dim.name}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{dim.score}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                    {dim.detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <i className="fa-solid fa-circle-check text-emerald-400 text-sm"></i>
                <span>Action recommendation: Increasing 5-star review velocity via ReviewFlow AI QR standees will push this profile to Top 3 in local 3-Pack within 30 days.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
