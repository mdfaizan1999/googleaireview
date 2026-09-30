import React from 'react';

interface CtaSectionProps {
  onStartFree: () => void;
  onExploreDemo: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onStartFree, onExploreDemo }) => {
  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-[#34A853] via-[#2D9248] to-[#15803D] rounded-3xl p-8 sm:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-emerald-600/20">
        {/* Decorative background circles */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 pointer-events-none blur-xl"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/10 pointer-events-none blur-xl"></div>

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-extrabold uppercase tracking-wider">
            <i className="fa-solid fa-rocket"></i> Get Started Today
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Start Growing More Reviews Today
          </h2>

          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-normal">
            Set up your customized review funnel in under five minutes. No credit card required. Cancel anytime.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-3">
            <button
              onClick={onStartFree}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-emerald-800 hover:bg-emerald-50 font-black text-sm rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-rocket text-emerald-600"></i>
              Get Started Free
            </button>
            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto px-6 py-3.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-play text-xs"></i>
              See How It Works
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
