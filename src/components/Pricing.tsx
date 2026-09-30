import React from 'react';

interface PricingProps {
  standalone?: boolean;
  onSelectPlan: (plan: string) => void;
  onStartFree: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ standalone = false, onSelectPlan, onStartFree }) => {
  const standardFeatures = [
    'Human-Like AI Written Reviews',
    'Custom Keywords, Services, Products & Staff',
    'Emoji Support & Multiple Review Styles',
    'Personalized AI Review Suggestions',
    'Smart & Customizable Google Review QR Code',
    'Printable QR Standee & Direct Review Link',
    'AI-Powered Review Replies in Hinglish',
    'Review, Rating & Growth Analytics',
    'AI Google Business Profile Analyzer',
    'Customer Review Tracking',
    'No Review Drop / Loss Guarantee',
    '100% Ad-Free Funnel Experience',
    'Priority Support'
  ];

  const agencyFeatures = [
    'Multi-Business Centralized Dashboard',
    'Configurable Business Capacity Limit',
    'Separate AI Customization & Languages per Location',
    'Individual QR Flyers & Printable Downloads',
    'Private Negative Feedback Routing (1–3 Stars)',
    'Cross-Business Conversion & Activity Analytics',
    'Option to Bring Your Own AI API Keys',
    'Dedicated WhatsApp Support & Onboarding'
  ];

  return (
    <div className="font-sans text-slate-900">
      {/* ═══════ HERO (Shown when standalone or styled on page) ═══════ */}
      <section className={`pricing-hero text-center px-4 max-w-4xl mx-auto ${standalone ? 'pt-28 pb-10 sm:pt-36 sm:pb-12' : 'pt-6 pb-8'}`}>
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-800 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Simple &amp; Transparent Plans
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            Turn More Customers Into <span className="bg-gradient-to-r from-[#34A853] to-[#15803D] bg-clip-text text-transparent">Google Reviews</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-5 font-normal">
            Start free for 24 hours, then select the plan that matches your business growth. Scale easily with automated AI drafts, smart QR standees, and centralized multi-business tools.
          </p>
          <div className="flex justify-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              <i className="fa-solid fa-check text-emerald-600"></i> No credit card for 24-hour trial
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              <i className="fa-solid fa-check text-emerald-600"></i> Single &amp; Multi-Business Options
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              <i className="fa-solid fa-check text-emerald-600"></i> Upgrade or chat anytime
            </span>
          </div>
        </div>
      </section>

      {/* ═══════ PRICING CARDS SECTION ═══════ */}
      <section className="px-4 pb-16 max-w-6xl mx-auto">
        {/* ── 24-HOUR FREE TRIAL HIGHLIGHT CONTAINER ── */}
        <div className="bg-gradient-to-br from-white via-emerald-50/50 to-white border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 mb-12 shadow-xl shadow-emerald-500/10 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-emerald-100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#34A853] to-[#2D9248] text-white flex items-center justify-center text-xl shadow-md shrink-0">
                <i className="fa-solid fa-gift"></i>
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-1">
                  <i className="fa-solid fa-check"></i> No Credit Card Required
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  24 Hours Free Trial — Explore Everything Risk-Free
                </h3>
              </div>
            </div>
            <button
              onClick={onStartFree}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              Start 24-Hour Free Trial <i className="fa-solid fa-arrow-right text-xs"></i>
            </button>
          </div>

          {/* Trial Feature Points Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-5 mb-4">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-start gap-2.5 shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 text-xs">
                <i className="fa-solid fa-wand-magic-sparkles"></i>
              </div>
              <div className="text-xs text-slate-600 leading-snug">
                <strong className="block text-slate-900 font-bold mb-0.5">AI Review Generator</strong>
                3 human-like drafts in 24+ languages
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-start gap-2.5 shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 text-xs">
                <i className="fa-solid fa-qrcode"></i>
              </div>
              <div className="text-xs text-slate-600 leading-snug">
                <strong className="block text-slate-900 font-bold mb-0.5">Smart QR Standee</strong>
                Printable A6 flyer &amp; direct link
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-start gap-2.5 shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 text-xs">
                <i className="fa-solid fa-sliders"></i>
              </div>
              <div className="text-xs text-slate-600 leading-snug">
                <strong className="block text-slate-900 font-bold mb-0.5">Keywords &amp; Staff</strong>
                Inject custom products &amp; services
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-start gap-2.5 shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 text-xs">
                <i className="fa-solid fa-chart-line"></i>
              </div>
              <div className="text-xs text-slate-600 leading-snug">
                <strong className="block text-slate-900 font-bold mb-0.5">Click &amp; Copy Analytics</strong>
                Track scans, generations &amp; copies
              </div>
            </div>
          </div>

          {/* Transparent Exclusions Note */}
          <div className="bg-white/90 border border-dashed border-emerald-300 rounded-xl p-3 text-xs text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span>
              <i className="fa-solid fa-circle-info text-emerald-600 mr-1.5"></i>
              The 24-hour free trial gives you full access to test review collection. <strong>Priority Support, Ad-Free Funnel, and Review Drop Guarantee</strong> are activated upon upgrading to a paid plan.
            </span>
            <span className="font-bold text-emerald-800 whitespace-nowrap">
              <i className="fa-solid fa-bolt text-emerald-600 mr-1"></i> Instant activation · Cancel anytime
            </span>
          </div>
        </div>

        {/* ── 3 MAIN PLAN COLUMNS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* 1. FLEXIBLE MONTHLY PLAN */}
          <article className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-slate-300 hover:shadow-lg transition-all" id="plan-monthly">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-50 text-amber-800 border border-amber-200">
                  Flexible Monthly
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">Best for starting out</span>
              </div>

              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-lg mb-3">
                <i className="fa-solid fa-calendar-check"></i>
              </div>

              <h2 className="text-xl font-extrabold text-slate-900 mb-0.5">Monthly Plan</h2>
              <p className="text-xs text-slate-500 mb-4">Monthly billing · 1 business · Full access</p>

              <div className="flex items-baseline gap-1 mb-4 pb-3 border-b border-slate-100">
                <span className="text-lg font-bold text-slate-600">₹</span>
                <span className="text-4xl font-black text-slate-900 font-mono tracking-tight">199</span>
                <span className="text-xs text-slate-500 font-semibold">/ month</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-5 text-xs text-slate-600 leading-relaxed">
                <strong className="block text-slate-900 font-bold mb-0.5">Full platform capabilities</strong>
                <span>Deploy AI-assisted review drafting, customizable QR standees, and full growth analytics.</span>
              </div>

              <ul className="space-y-2.5 mb-6 text-xs text-slate-700">
                {standardFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-[9px] mt-0.5">
                      <i className="fa-solid fa-check"></i>
                    </span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <button
                onClick={() => onSelectPlan('Monthly Plan (₹199)')}
                className="w-full py-3 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                Choose Monthly Plan <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-2">
                Pay monthly and cancel or upgrade anytime.
              </p>
            </div>
          </article>

          {/* 2. YEARLY PLAN (BEST VALUE) */}
          <article className="bg-gradient-to-b from-white to-emerald-50/40 border-2 border-emerald-500 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl shadow-emerald-500/15 relative lg:-translate-y-2" id="plan-yearly">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-green-500 text-white font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md whitespace-nowrap flex items-center gap-1">
              <i className="fa-solid fa-crown text-[9px]"></i> Recommended / Best Value
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-3 mt-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Best Value · Save 50%
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">Best for established growth</span>
              </div>

              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-lg mb-3">
                <i className="fa-solid fa-crown"></i>
              </div>

              <h2 className="text-xl font-extrabold text-slate-900 mb-0.5">Yearly Plan</h2>
              <p className="text-xs text-slate-500 mb-4">1 year · 1 business · Maximum savings</p>

              <div className="flex items-baseline gap-1 mb-4 pb-3 border-b border-emerald-100">
                <span className="text-lg font-bold text-slate-600">₹</span>
                <span className="text-4xl font-black text-slate-900 font-mono tracking-tight">1199</span>
                <span className="text-xs text-slate-500 font-semibold">/ year</span>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-5 text-xs text-emerald-900 flex items-center justify-between">
                <div>
                  <span className="block text-[11px] opacity-80">Annual membership</span>
                  <strong className="font-extrabold">Lower effective cost per month</strong>
                </div>
                <i className="fa-solid fa-chart-line text-emerald-600 text-base"></i>
              </div>

              <ul className="space-y-2.5 mb-6 text-xs text-slate-900 font-semibold">
                {standardFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-[9px] mt-0.5">
                      <i className="fa-solid fa-check"></i>
                    </span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <button
                onClick={() => onSelectPlan('Yearly Plan (₹1,199)')}
                className="w-full py-3.5 text-xs font-black text-white bg-gradient-to-r from-[#34A853] to-[#2D9248] rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                Choose Yearly Plan <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </button>
              <p className="text-[11px] text-emerald-800 text-center font-bold mt-2">
                Most chosen plan by active local businesses.
              </p>
            </div>
          </article>

          {/* 3. AGENCY / MULTI-BUSINESS PLAN */}
          <article className="bg-white border-2 border-purple-200 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:shadow-lg transition-all relative overflow-hidden" id="plan-agency">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-purple-50 text-purple-700 border border-purple-200">
                  Multi-Business
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">For agencies &amp; chains</span>
              </div>

              <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center text-lg mb-3">
                <i className="fa-solid fa-building"></i>
              </div>

              <h2 className="text-xl font-extrabold text-purple-900 mb-0.5">Multi-Business Plan</h2>
              <p className="text-xs text-slate-500 mb-4">Multiple locations · Centralized dashboard</p>

              <div className="flex items-baseline gap-1 mb-4 pb-3 border-b border-purple-100">
                <span className="text-3xl font-black text-purple-700 tracking-tight">Custom</span>
                <span className="text-xs text-slate-500 font-semibold">/ Tailored capacity</span>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-5 text-xs text-purple-900 flex items-center justify-between">
                <div>
                  <span className="block text-[11px] opacity-80">Centralized management</span>
                  <strong className="font-extrabold">Scale across unlimited locations</strong>
                </div>
                <i className="fa-solid fa-layer-group text-purple-600 text-base"></i>
              </div>

              <ul className="space-y-2.5 mb-6 text-xs text-slate-700">
                {agencyFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 text-[9px] mt-0.5">
                      <i className="fa-solid fa-check"></i>
                    </span>
                    <span className={idx < 2 ? 'font-bold text-slate-900' : ''}>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <a
                href="https://wa.me/919707842047?text=Hi!%20I'm%20interested%20in%20the%20Multi-Business%20/%20Agency%20Plan%20for%20ReviewFlow%20AI.%20Please%20share%20pricing%20and%20business%20capacity%20details."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fa-brands fa-whatsapp text-sm"></i> Chat With Us on WhatsApp
              </a>
              <p className="text-[11px] text-slate-400 text-center mt-2">
                Custom pricing &amp; account limits tailored for you.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* ═══════ FEATURE COMPARISON TABLE ═══════ */}
      <section className="px-4 pb-20 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest block mb-1">
            Plan Breakdown
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            Compare Features Across Plans
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Pick the right plan based on how many locations you manage and how fast you want to scale.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[620px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="py-3.5 px-5 font-extrabold text-slate-900 w-[42%]">Feature</th>
                  <th className="py-3.5 px-4 font-extrabold text-center">Monthly Plan</th>
                  <th className="py-3.5 px-4 font-extrabold text-center bg-emerald-50/50 text-emerald-900">Yearly Plan</th>
                  <th className="py-3.5 px-4 font-extrabold text-center">Multi-Business Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-5 font-bold text-slate-900">Business Locations Allowed</td>
                  <td className="py-3 px-4 text-center font-medium text-slate-600">1 Location</td>
                  <td className="py-3 px-4 text-center font-medium text-emerald-900 bg-emerald-50/20">1 Location</td>
                  <td className="py-3 px-4 text-center font-bold text-purple-900">Multiple (Custom Limit)</td>
                </tr>

                {standardFeatures.map((feat, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-3 px-5 font-medium text-slate-800">{feat}</td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-bold">
                      <i className="fa-solid fa-check"></i>
                    </td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-bold bg-emerald-50/20">
                      <i className="fa-solid fa-check"></i>
                    </td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-bold">
                      <i className="fa-solid fa-check"></i>
                    </td>
                  </tr>
                ))}

                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-5 font-medium text-slate-800">Central Multi-Location Management</td>
                  <td className="py-3 px-4 text-center text-slate-300">
                    <i className="fa-solid fa-minus"></i>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-300 bg-emerald-50/20">
                    <i className="fa-solid fa-minus"></i>
                  </td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">
                    <i className="fa-solid fa-check"></i>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-5 font-medium text-slate-800">Bring Your Own AI Keys</td>
                  <td className="py-3 px-4 text-center text-slate-300">
                    <i className="fa-solid fa-minus"></i>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-300 bg-emerald-50/20">
                    <i className="fa-solid fa-minus"></i>
                  </td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">
                    <i className="fa-solid fa-check"></i>
                  </td>
                </tr>

                <tr className="bg-slate-50/80 font-bold">
                  <td className="py-3.5 px-5 text-slate-900">Pricing / Billing Cycle</td>
                  <td className="py-3.5 px-4 text-center text-slate-700">₹199 / month</td>
                  <td className="py-3.5 px-4 text-center text-emerald-800 bg-emerald-100/50 font-black">₹1199 / year</td>
                  <td className="py-3.5 px-4 text-center text-purple-800 font-black">Custom on WhatsApp</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">
          <i className="fa-solid fa-circle-info text-blue-500 mr-1.5"></i>
          All accounts start with our 24-hour free trial. Upgrade anytime to unlock ad-free funnels and full support.
        </div>
      </section>
    </div>
  );
};
