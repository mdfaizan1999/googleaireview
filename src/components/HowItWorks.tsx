import React from 'react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '1',
      title: 'Scan QR or Tap Link',
      desc: 'Customers scan your custom A6 standee or tap your direct review funnel link on their smartphone at checkout.'
    },
    {
      step: '2',
      title: 'Choose Experience & Language',
      desc: 'Customer selects their rating, staff member, service, product, and preferred language from 24+ options.'
    },
    {
      step: '3',
      title: 'AI Generates Natural Drafts',
      desc: 'AI creates 3 tailored, human-like drafts with your targeted keywords, staff names, and natural emojis.'
    },
    {
      step: '4',
      title: '1-Tap Copy & Post to Google',
      desc: 'Customer taps "Copy & Post" and is automatically redirected directly to your official Google review dialog.'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 bg-slate-50 border-y border-slate-200">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase tracking-wider mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot"></span>
            The 4-Step Review Funnel
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            How ReviewFlow AI <span className="bg-gradient-to-r from-[#34A853] to-[#15803D] bg-clip-text text-transparent">Drives 10x More Reviews</span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            A frictionless, guided mobile experience that turns daily happy customers into authentic 5-star Google reviews in under 30 seconds.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-7 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 z-0"></div>

          {steps.map((item, index) => (
            <div
              key={index}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div className="w-14 h-14 rounded-full bg-white border-2 border-emerald-300 text-emerald-700 font-black text-lg flex items-center justify-center shadow-md group-hover:bg-gradient-to-r group-hover:from-emerald-500 group-hover:to-green-600 group-hover:text-white group-hover:border-transparent group-hover:scale-110 transition-all duration-200 mb-5">
                {item.step}
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs font-normal">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
