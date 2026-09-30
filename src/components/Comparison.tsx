import React from 'react';

interface ComparisonProps {
  standalone?: boolean;
  onStartFree?: () => void;
}

export const Comparison: React.FC<ComparisonProps> = ({ standalone = false, onStartFree }) => {
  const tableRows = [
    {
      feature: 'AI Review Draft Suggestions',
      desc: "Helps customers draft authentic feedback without writer's block",
      basicText: 'Blank Text Box',
      rfText: '3 Instant AI Drafts'
    },
    {
      feature: 'Language Support & Reviewer Chooser',
      desc: 'Multi-language generation with on-screen language dropdown',
      basicText: 'Single Language Only',
      rfText: '24+ Languages + Chooser'
    },
    {
      feature: 'SEO Keyword, Staff & Service Injection',
      desc: 'Injects your high-ranking business keywords into review drafts',
      basicText: 'None (Generic Text)',
      rfText: 'Custom Keywords & Staff'
    },
    {
      feature: 'Natural Human-Style Writing & Emojis',
      desc: 'Drafts written with natural conversational tone and appropriate emojis',
      basicText: 'Plain / None',
      rfText: 'Human Tone + Emojis'
    },
    {
      feature: 'Negative Feedback Interceptor (1–3 Stars)',
      desc: 'Routes poor customer ratings to private manager feedback',
      basicText: 'Goes Public on Google',
      rfText: 'Private Offline Form'
    },
    {
      feature: '1-Tap Copy & Auto-Redirect',
      desc: 'Copies AI review draft to clipboard and opens Google Review popup',
      basicText: 'Manual Typing',
      rfText: '1-Tap Copy & Open Google'
    },
    {
      feature: 'Review Customization & Length Limits',
      desc: 'Configure review character count, tone, and active services',
      basicText: 'Not Configurable',
      rfText: 'Full Business Controls'
    },
    {
      feature: 'Real-Time Interaction Tracking',
      desc: 'Track QR scans, generated drafts, clicks, and copied reviews',
      basicText: 'Zero Tracking',
      rfText: 'Deep Activity Metrics'
    },
    {
      feature: 'Printable Designer Standees',
      desc: 'Custom A6 flyers and table tent cards ready for print',
      basicText: 'Raw Square QR Only',
      rfText: 'Ready-to-Print Standees'
    }
  ];

  return (
    <div className="font-sans text-slate-900">
      {/* ═══════ HERO (Shown when on dedicated vs-normal-qr page) ═══════ */}
      {standalone && (
        <section className="pt-28 pb-10 sm:pt-36 sm:pb-14 px-4 bg-gradient-to-b from-[#F8FCF9] via-white to-[#F3FAF5] border-b border-slate-200">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Copy */}
              <div className="lg:col-span-7 space-y-4 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold uppercase tracking-wide">
                  <i className="fa-solid fa-code-compare"></i> Smart QR Comparison
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
                  Normal QR Codes Only Redirect.<br />
                  <span className="bg-gradient-to-r from-[#34A853] to-[#15803D] bg-clip-text text-transparent">
                    ReviewFlow AI Helps Customers Write.
                  </span>
                </h1>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
                  Compare a basic Google review QR code with an AI-powered review funnel that guides customers, personalizes review drafts, supports multiple languages, and tracks engagement.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={onStartFree}
                    className="px-6 py-3 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-[#34A853] to-[#2D9248] rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:-translate-y-0.5"
                  >
                    Start 24-Hour Free Trial <i className="fa-solid fa-arrow-right text-xs"></i>
                  </button>
                  <a
                    href="#comparison-table"
                    className="px-5 py-3 text-xs sm:text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <i className="fa-solid fa-table-columns text-emerald-600"></i> View Comparison
                  </a>
                </div>
              </div>

              {/* Right Visual Flow Card */}
              <div className="lg:col-span-5 flex items-center justify-center gap-2 sm:gap-3 p-4 bg-white/80 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black uppercase text-slate-400 mb-1">Basic QR</span>
                  <div className="w-10 h-10 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center text-base mb-1.5">
                    <i className="fa-solid fa-qrcode"></i>
                  </div>
                  <strong className="text-xs text-slate-900 block font-bold leading-tight">Scan &rarr; Google</strong>
                  <span className="text-[10px] text-slate-500 mt-0.5">Blank review box</span>
                </div>

                <div className="text-slate-400 text-sm shrink-0">
                  <i className="fa-solid fa-arrow-right"></i>
                </div>

                <div className="flex-1 p-3.5 bg-emerald-50/70 border border-emerald-300 rounded-xl text-center flex flex-col items-center justify-center shadow-sm">
                  <span className="text-[10px] font-black uppercase text-emerald-700 mb-1">ReviewFlow AI</span>
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-base mb-1.5 shadow-inner">
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                  </div>
                  <strong className="text-xs text-slate-900 block font-bold leading-tight">Scan &rarr; Smart Funnel</strong>
                  <span className="text-[10px] text-emerald-800 font-medium mt-0.5">AI drafts + guidance</span>
                  <div className="flex flex-wrap justify-center gap-1 mt-2">
                    <span className="text-[9px] font-bold text-emerald-800 bg-white px-1.5 py-0.5 rounded-full border border-emerald-200">24+ Langs</span>
                    <span className="text-[9px] font-bold text-emerald-800 bg-white px-1.5 py-0.5 rounded-full border border-emerald-200">1-Tap Copy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════ SUMMARY COMPARISON CARDS ═══════ */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest block mb-1">
            Quick Comparison
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Static QR vs Smart Review Experience
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            The difference is not the QR itself—it is what happens after the customer scans it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-14 items-stretch">
          {/* Traditional QR Card */}
          <div className="bg-[#FAFBFC] border border-slate-200 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md w-fit mb-3">
                <span>Traditional Flow</span>
                <i className="fa-solid fa-arrow-right text-[8px]"></i>
                <span>Google Review Box</span>
              </div>

              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-red-100 text-red-700 border border-red-200 mb-2">
                <i className="fa-solid fa-xmark"></i> Basic QR Code
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-1">
                Traditional Static QR Code
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-5">
                A generic barcode that sends customers straight to an empty Google review text box with zero assistance.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="grid grid-cols-[28px_1fr] gap-2.5 items-start p-2.5 rounded-xl border border-red-100 bg-white">
                  <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 text-xs">
                    <i className="fa-solid fa-xmark"></i>
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">Writer's Block</strong>
                    <span className="text-[11px] leading-snug">Customers land on a blank Google review box and must write the complete review themselves.</span>
                  </div>
                </li>

                <li className="grid grid-cols-[28px_1fr] gap-2.5 items-start p-2.5 rounded-xl border border-red-100 bg-white">
                  <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 text-xs">
                    <i className="fa-solid fa-xmark"></i>
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">Generic Review Content</strong>
                    <span className="text-[11px] leading-snug">Short or vague reviews may not naturally mention useful business services, products, staff, or keywords.</span>
                  </div>
                </li>

                <li className="grid grid-cols-[28px_1fr] gap-2.5 items-start p-2.5 rounded-xl border border-red-100 bg-white">
                  <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 text-xs">
                    <i className="fa-solid fa-xmark"></i>
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">No Guided Language Experience</strong>
                    <span className="text-[11px] leading-snug">A standard QR code does not provide an integrated review-language chooser or AI-generated drafts.</span>
                  </div>
                </li>

                <li className="grid grid-cols-[28px_1fr] gap-2.5 items-start p-2.5 rounded-xl border border-red-100 bg-white">
                  <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 text-xs">
                    <i className="fa-solid fa-xmark"></i>
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">Direct Google Review Flow</strong>
                    <span className="text-[11px] leading-snug">Customers are sent directly to the Google review screen without a private feedback step in the QR flow.</span>
                  </div>
                </li>

                <li className="grid grid-cols-[28px_1fr] gap-2.5 items-start p-2.5 rounded-xl border border-red-100 bg-white">
                  <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 text-xs">
                    <i className="fa-solid fa-xmark"></i>
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">No Funnel Interaction Tracking</strong>
                    <span className="text-[11px] leading-snug">A basic static QR does not provide ReviewFlow-style tracking for generated drafts, copy actions, and funnel interactions.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* ReviewFlow AI Card */}
          <div className="bg-gradient-to-b from-white to-emerald-50/30 border-2 border-emerald-500 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl shadow-emerald-500/10">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md w-fit mb-3">
                <span>ReviewFlow AI</span>
                <i className="fa-solid fa-arrow-right text-[8px]"></i>
                <span>Guided AI Funnel</span>
              </div>

              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200 mb-2">
                <i className="fa-solid fa-wand-magic-sparkles"></i> ReviewFlow AI Funnel
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-1">
                ReviewFlow AI Smart Funnel
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-5">
                An intelligent guided funnel that generates personalized, human-style review drafts in seconds.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="grid grid-cols-[28px_1fr] gap-2.5 items-start p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold">
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">3 Human-Style AI Drafts</strong>
                    <span className="text-[11px] text-slate-600 leading-snug">Customers instantly get three natural review options instead of facing an empty text box.</span>
                  </div>
                </li>

                <li className="grid grid-cols-[28px_1fr] gap-2.5 items-start p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold">
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">Keywords, Services, Products &amp; Staff</strong>
                    <span className="text-[11px] text-slate-600 leading-snug">Review drafts can naturally use the business details you configure for more relevant feedback.</span>
                  </div>
                </li>

                <li className="grid grid-cols-[28px_1fr] gap-2.5 items-start p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold">
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">24+ Languages with Customer Choice</strong>
                    <span className="text-[11px] text-slate-600 leading-snug">Customers can choose their preferred review language directly inside the review funnel.</span>
                  </div>
                </li>

                <li className="grid grid-cols-[28px_1fr] gap-2.5 items-start p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold">
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">Private 1–3 Star Feedback Routing</strong>
                    <span className="text-[11px] text-slate-600 leading-snug">Low-rating customers can be routed to private feedback instead of being sent directly to Google.</span>
                  </div>
                </li>

                <li className="grid grid-cols-[28px_1fr] gap-2.5 items-start p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold">
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">Review Interaction Tracking</strong>
                    <span className="text-[11px] text-slate-600 leading-snug">Track funnel activity including review generation, copy actions, clicks, and other customer interactions.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ═══════ DETAILED COMPARISON TABLE ═══════ */}
        <div id="comparison-table" className="pt-6">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest block mb-1">
              Feature Breakdown
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
              Side-by-Side Capabilities
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              A detailed point-by-point comparison between basic QR codes and ReviewFlow AI.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <th className="py-3.5 px-5 font-extrabold text-slate-900 w-[40%]">Feature / Capability</th>
                    <th className="py-3.5 px-4 font-extrabold text-slate-600 w-[30%]">Basic Review QR Code</th>
                    <th className="py-3.5 px-4 font-extrabold text-emerald-900 bg-emerald-50/70 border-x border-emerald-200 w-[30%]">
                      ReviewFlow AI
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tableRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-5">
                        <strong className="block text-slate-900 font-bold">{row.feature}</strong>
                        <small className="block text-[11px] text-slate-500 font-normal mt-0.5">{row.desc}</small>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
                          <i className="fa-solid fa-xmark text-xs"></i> {row.basicText}
                        </span>
                      </td>
                      <td className="py-3 px-4 bg-emerald-50/30 border-x border-emerald-200">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <i className="fa-solid fa-check text-xs"></i> {row.rfText}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ═══════ DEEP DIVE HIGHLIGHT CARDS ═══════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-lg mb-4">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <h4 className="text-base font-extrabold text-slate-900 mb-1.5">
              Bypasses Writer's Block
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Most customers intend to give 5 stars but leave when faced with writing a full paragraph. ReviewFlow AI creates 3 personalized drafts ready to copy with a single tap.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-lg mb-4">
              <i className="fa-solid fa-language"></i>
            </div>
            <h4 className="text-base font-extrabold text-slate-900 mb-1.5">
              24+ Languages &amp; Chooser
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Customers can select their preferred language directly on the review screen. The AI crafts natural regional feedback, unlocking demographic segments English-only codes miss.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-lg mb-4">
              <i className="fa-solid fa-magnifying-glass-chart"></i>
            </div>
            <h4 className="text-base font-extrabold text-slate-900 mb-1.5">
              Supercharges Local SEO
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Google favors listings whose reviews mention specific staff, dishes, or services. ReviewFlow AI automatically weaves your target keywords into customer drafts.
            </p>
          </div>
        </div>

        {/* ═══════ BOTTOM CTA BANNER ═══════ */}
        <div className="mt-14 bg-gradient-to-br from-[#166534] via-[#15803D] to-[#0F291E] rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Upgrade from Basic QR Codes Today
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
              Join thousands of smart local businesses using ReviewFlow AI to turn daily visitors into genuine, 5-star Google reviews effortlessly.
            </p>
            <div className="pt-3">
              <button
                onClick={onStartFree}
                className="px-7 py-3.5 bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer mx-auto"
              >
                Start 24-Hour Free Trial <i className="fa-solid fa-arrow-right text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
