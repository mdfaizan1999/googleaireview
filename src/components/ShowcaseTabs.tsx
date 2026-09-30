import React, { useState } from 'react';

interface ShowcaseTabsProps {
  onStartFree: () => void;
}

export const ShowcaseTabs: React.FC<ShowcaseTabsProps> = ({ onStartFree }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'inbox' | 'qr' | 'drafts'>('analytics');
  const [aiReplyDraft, setAiReplyDraft] = useState('');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);

  const handleGenerateReply = () => {
    setIsGeneratingReply(true);
    setTimeout(() => {
      setAiReplyDraft("Hi Rajesh! Thank you so much for the glowing 5-star review! We're thrilled that you enjoyed our signature dishes and that Rohit took such good care of your table. We can't wait to welcome you and your family back soon! Warm regards, The Management");
      setIsGeneratingReply(false);
    }, 600);
  };

  return (
    <section id="showcase" className="py-20 px-4 bg-slate-50 border-y border-slate-200">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase tracking-wider mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot"></span>
            Console Showcase
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Explore Your <span className="bg-gradient-to-r from-[#34A853] to-[#15803D] bg-clip-text text-transparent">Reputation Hub</span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            A centralized workspace to simplify listing management, flyer generation, review sentiment, and performance monitoring.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700'
            }`}
          >
            <i className="fa-solid fa-chart-bar"></i> Performance Analytics
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'inbox'
                ? 'bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700'
            }`}
          >
            <i className="fa-solid fa-inbox"></i> Reviews Inbox
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700'
            }`}
          >
            <i className="fa-solid fa-qrcode"></i> QR Flyer Customizer
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'drafts'
                ? 'bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700'
            }`}
          >
            <i className="fa-solid fa-wand-magic-sparkles"></i> AI Draft Assistant
          </button>
        </div>

        {/* Tab Card Content */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg min-h-[380px] transition-all">
          {/* 1. Analytics */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fadeIn">
              <div className="space-y-4">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Real-Time Funnel Analytics
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed font-normal">
                  Track metrics like scan frequency, redirection rates, and conversion percentages to optimize your review funnel performance across each checkout counter.
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-semibold">
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-emerald-500"></i>
                    Track conversion rates by week, month, or custom dates
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-emerald-500"></i>
                    Access customer sentiment and trend breakdowns
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-emerald-500"></i>
                    Monitor Google listing rating growth history automatically
                  </li>
                </ul>
                <div className="pt-2">
                  <button
                    onClick={onStartFree}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    Start Free Trial <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </button>
                </div>
              </div>

              {/* Preview UI Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <i className="fa-solid fa-chart-column text-emerald-600"></i> Funnel Scans &amp; Clicks
                  </span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                    <i className="fa-solid fa-arrow-trend-up"></i> +28.4% this month
                  </span>
                </div>

                {/* Simulated Bar Graph */}
                <div className="h-28 flex items-end gap-2.5 border-b border-slate-200 pb-2">
                  {[
                    { day: 'Mon', h: '35%', count: 42 },
                    { day: 'Tue', h: '50%', count: 68 },
                    { day: 'Wed', h: '45%', count: 59 },
                    { day: 'Thu', h: '65%', count: 85 },
                    { day: 'Fri', h: '82%', count: 112 },
                    { day: 'Sat', h: '95%', count: 148 },
                    { day: 'Sun', h: '88%', count: 130 }
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <span className="text-[9px] font-mono text-slate-400 font-bold">{bar.count}</span>
                      <div
                        style={{ height: bar.h }}
                        className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all hover:opacity-90"
                      />
                      <span className="text-[10px] text-slate-500 font-semibold">{bar.day}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 bg-white rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Total Scans</div>
                    <div className="text-base font-extrabold text-slate-900 font-mono">644</div>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Copied Drafts</div>
                    <div className="text-base font-extrabold text-emerald-600 font-mono">545</div>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Conversion</div>
                    <div className="text-base font-extrabold text-slate-900 font-mono">84.6%</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Reviews Inbox */}
          {activeTab === 'inbox' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fadeIn">
              <div className="space-y-4">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Centralized Reviews Inbox
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed font-normal">
                  Track all incoming customer reviews, reply using 1-click context-aware AI suggestions, and view private offline feedback in one unified inbox.
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-semibold">
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-emerald-500"></i>
                    Sync reviews automatically from your Google Business Profile
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-emerald-500"></i>
                    Submit AI-crafted replies directly to Google with one tap
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-emerald-500"></i>
                    Monitor and resolve private 1–3 star inquiries offline
                  </li>
                </ul>
                <div className="pt-2">
                  <button
                    onClick={onStartFree}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    Get Started Free <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </button>
                </div>
              </div>

              {/* Review Card with AI Reply */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                      RK
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Rajesh Kumar</div>
                      <div className="text-[10px] text-slate-400">2 hours ago · Verified Local Guide</div>
                    </div>
                  </div>
                  <div className="text-amber-400 text-xs font-bold">★★★★★</div>
                </div>

                <p className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-slate-100">
                  "Incredible food and hospitality! Rohit was so attentive and helped us select the best chef specials. Will be visiting every weekend!"
                </p>

                {/* AI Reply generator */}
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                      <i className="fa-solid fa-wand-magic-sparkles text-emerald-600"></i> AI Suggested Response
                    </span>
                    <button
                      onClick={handleGenerateReply}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                    >
                      {isGeneratingReply ? 'Drafting...' : 'Regenerate'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {aiReplyDraft || "Hi Rajesh! Thank you so much for the glowing 5-star review! We're thrilled that you enjoyed our signature dishes and that Rohit took such good care of your table. We can't wait to welcome you back!"}
                  </p>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => alert('Reply published to Google Maps profile!')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-sm cursor-pointer"
                    >
                      <i className="fa-solid fa-paper-plane mr-1"></i> Post Reply to Google
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. QR Flyer */}
          {activeTab === 'qr' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fadeIn">
              <div className="space-y-4">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  QR Flyer Customization Panel
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed font-normal">
                  Customize flyer colors to match your brand. Choose print-ready A6 templates or table tents tailored for checkout counters and tables.
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-semibold">
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-emerald-500"></i>
                    Real-time brand color matching options
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-emerald-500"></i>
                    Download high-resolution 300 DPI vector PDFs
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-emerald-500"></i>
                    Customizable standee headers, QR codes, and taglines
                  </li>
                </ul>
                <div className="pt-2">
                  <button
                    onClick={onStartFree}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    Open Standee Studio <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </button>
                </div>
              </div>

              {/* Standee Mockup */}
              <div className="flex justify-center">
                <div className="w-52 bg-white border-2 border-emerald-500 rounded-2xl p-5 text-center shadow-xl">
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                    Rate Us on
                  </div>
                  <div className="text-base font-bold text-[#4285F4] mb-2 tracking-tight">
                    Google
                  </div>
                  <div className="w-32 h-32 bg-slate-100 rounded-xl mx-auto flex items-center justify-center border border-slate-200 shadow-inner mb-3">
                    <i className="fa-solid fa-qrcode text-5xl text-slate-800"></i>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 block">
                    Scan to leave feedback
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">
                    Takes only 20 seconds
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. AI Draft Assistant */}
          {activeTab === 'drafts' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fadeIn">
              <div className="space-y-4">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  AI Review Generation Drafts
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed font-normal">
                  Lower the friction of leaving reviews. Provide customers with pre-written drafts incorporating industry keywords and emojis.
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-semibold">
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-emerald-500"></i>
                    3 human-crafted draft options generated per customer visit
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-emerald-500"></i>
                    24+ languages supported including Hindi &amp; Hinglish
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-emerald-500"></i>
                    Injects staff, products &amp; services seamlessly into reviews
                  </li>
                </ul>
                <div className="pt-2">
                  <button
                    onClick={onStartFree}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    Test Draft Engine <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </button>
                </div>
              </div>

              {/* Sample Draft Cards */}
              <div className="space-y-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-sm">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                    <i className="fa-solid fa-wand-magic-sparkles mr-1"></i> Draft Option 1 (English)
                  </span>
                  <p className="text-xs text-slate-700 italic leading-relaxed">
                    "Extremely helpful staff! They answered all my questions and the service was quick. 😊 Highly recommend to everyone in the neighborhood!"
                  </p>
                </div>
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 shadow-sm">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                    <i className="fa-solid fa-wand-magic-sparkles mr-1"></i> Draft Option 2 (Hinglish)
                  </span>
                  <p className="text-xs text-slate-800 italic leading-relaxed">
                    "Great experience overall — very clean, professional aur team bohot polite thi. Rohit took special care of our order. ⭐⭐⭐⭐⭐"
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
