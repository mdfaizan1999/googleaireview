import React from 'react';
import { ViewType } from '../types';

interface FeaturesProps {
  onNavigate: (view: ViewType) => void;
  onOpenAuth: (mode: 'signin' | 'register') => void;
}

export const Features: React.FC<FeaturesProps> = ({ onNavigate, onOpenAuth }) => {
  const featureList = [
    {
      icon: 'fa-solid fa-filter',
      color: 'bg-emerald-100 text-emerald-700',
      title: 'Smart Review Funnels',
      desc: 'Prevent negative comments before they reach your listings. Route dissatisfied customers to private feedback forms automatically so you can resolve issues offline.',
      action: 'Try Live Funnel',
      view: 'home' as ViewType,
      anchor: 'funnel-demo'
    },
    {
      icon: 'fa-solid fa-print',
      color: 'bg-blue-100 text-blue-700',
      title: 'Printed QR Flyers',
      desc: 'Generate customized, professional A6 flyer designs and table tent signs for checkout counters, dining tables, reception desks, and physical receipts.',
      action: 'Customize Flyer',
      view: 'flyer-tool' as ViewType
    },
    {
      icon: 'fa-solid fa-wand-magic-sparkles',
      color: 'bg-purple-100 text-purple-700',
      title: 'Human-Like AI Review Assistant',
      desc: 'Provide customers with natural, emoji-rich review drafts that mimic real experiences, mention key staff members, and boost local Google ranking.',
      action: 'View AI Assistant',
      view: 'vs-normal-qr' as ViewType
    },
    {
      icon: 'fa-solid fa-reply',
      color: 'bg-amber-100 text-amber-700',
      title: 'AI Suggested Replies',
      desc: 'Draft personalized, contextually appropriate responses instantly to improve local engagement and show customers you care about their loyalty.',
      action: 'See Inbox Demo',
      view: 'home' as ViewType,
      anchor: 'showcase'
    },
    {
      icon: 'fa-solid fa-chart-line',
      color: 'bg-cyan-100 text-cyan-700',
      title: 'Reputation Analytics',
      desc: 'Track monthly scan volumes, click redirections, feedback logs, and listing performance trends in one unified, operator-friendly console.',
      action: 'View Dashboard Tour',
      view: 'home' as ViewType,
      anchor: 'showcase'
    },
    {
      icon: 'fa-solid fa-stethoscope',
      color: 'bg-rose-100 text-rose-700',
      title: 'AI SEO Analyzer',
      desc: 'Instant 20+ point SEO diagnostic audit for your Google Business Profile with a 0–100 Health Score and actionable local ranking recommendations.',
      action: 'Launch Free Audit',
      view: 'analyzer' as ViewType
    }
  ];

  const handleFeatureClick = (feat: typeof featureList[0]) => {
    if (feat.view === 'home' && feat.anchor) {
      onNavigate('home');
      setTimeout(() => {
        const el = document.getElementById(feat.anchor!);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      onNavigate(feat.view);
    }
  };

  return (
    <section id="features" className="py-20 px-4 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold uppercase tracking-wider mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot"></span>
          Platform Features
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Reputation Systems that <span className="bg-gradient-to-r from-[#34A853] to-[#15803D] bg-clip-text text-transparent">Generate Real Value</span>
        </h2>
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
          Lower the friction for customers to leave reviews while giving operators complete control over customer sentiment.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featureList.map((feat, index) => (
          <div
            key={index}
            className="group bg-white border border-slate-200 rounded-2xl p-7 flex flex-col justify-between hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 relative overflow-hidden"
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>

            <div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg mb-5 ${feat.color} group-hover:scale-105 transition-transform shadow-sm`}>
                <i className={feat.icon}></i>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight group-hover:text-emerald-800 transition-colors">
                {feat.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed font-normal">
                {feat.desc}
              </p>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100">
              <button
                onClick={() => handleFeatureClick(feat)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors cursor-pointer"
              >
                <span>{feat.action}</span>
                <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
