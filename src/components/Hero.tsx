import React, { useState } from 'react';

interface HeroProps {
  onStartFree: () => void;
  onExploreDemo: () => void;
  onOpenVideoModal?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartFree, onExploreDemo }) => {
  const [videoActive, setVideoActive] = useState(true);

  return (
    <section className="relative pt-28 pb-12 sm:pt-36 sm:pb-16 px-4 overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-white">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `linear-gradient(rgba(52,168,83,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(52,168,83,0.08) 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse 80% 65% at 50% 10%, #000 20%, transparent 80%)'
        }}
      />

      {/* Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center z-10">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide uppercase mb-6 shadow-sm">
          <i className="fa-solid fa-robot text-emerald-600"></i>
          AI-Powered Google Review Growth System
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] mb-5 text-balance">
          Turn Happy Customers Into <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#34A853] to-[#15803D] bg-clip-text text-transparent">
            5-Star Google Reviews
          </span>
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
          Guide happy customers to draft natural, emoji-rich reviews at checkout in seconds. 
          Built-in negative feedback filter protects your Google profile automatically.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-4">
          <button
            onClick={onStartFree}
            className="w-full sm:w-auto px-7 py-3.5 text-sm sm:text-base font-extrabold text-white bg-gradient-to-r from-[#34A853] to-[#2D9248] rounded-xl hover:shadow-xl hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer shadow-md"
          >
            <i className="fa-solid fa-rocket"></i>
            Launch My Business Free
          </button>
          <button
            onClick={onExploreDemo}
            className="w-full sm:w-auto px-6 py-3.5 text-sm sm:text-base font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-emerald-300 hover:text-emerald-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <i className="fa-solid fa-play text-emerald-600 text-xs"></i>
            Try Interactive Live Demo
          </button>
        </div>

        {/* Guarantee Notes */}
        <p className="text-xs text-slate-500 flex items-center justify-center flex-wrap gap-2 mb-8">
          <span className="inline-flex items-center gap-1">
            <i className="fa-solid fa-circle-check text-emerald-500"></i> No credit card required
          </span>
          <span className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1">
            <i className="fa-solid fa-circle-check text-emerald-500"></i> Setup in 5 minutes
          </span>
          <span className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1">
            <i className="fa-solid fa-circle-check text-emerald-500"></i> Cancel anytime
          </span>
        </p>

        {/* Floating Review Pills */}
        <div className="flex items-center justify-center gap-3 flex-wrap mb-10">
          <div className="inline-flex items-center gap-2 bg-white/95 border border-slate-200/90 rounded-full py-1.5 pl-1.5 pr-3 shadow-sm hover:shadow-md transition-shadow animate-float-pill">
            <div className="w-6 h-6 rounded-full bg-[#4285F4] text-white font-extrabold text-[10px] flex items-center justify-center">
              RK
            </div>
            <span className="text-amber-400 text-xs tracking-tighter">★★★★★</span>
            <span className="text-xs font-semibold text-slate-700">"Amazing service &amp; food!"</span>
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>

          <div className="inline-flex items-center gap-2 bg-white/95 border border-slate-200/90 rounded-full py-1.5 pl-1.5 pr-3 shadow-sm hover:shadow-md transition-shadow animate-float-pill [animation-delay:1s]">
            <div className="w-6 h-6 rounded-full bg-[#34A853] text-white font-extrabold text-[10px] flex items-center justify-center">
              PM
            </div>
            <span className="text-amber-400 text-xs tracking-tighter">★★★★★</span>
            <span className="text-xs font-semibold text-slate-700">"Highly recommend Priya!"</span>
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>

          <div className="inline-flex items-center gap-2 bg-white/95 border border-slate-200/90 rounded-full py-1.5 pl-1.5 pr-3 shadow-sm hover:shadow-md transition-shadow animate-float-pill [animation-delay:2s]">
            <div className="w-6 h-6 rounded-full bg-[#EA4335] text-white font-extrabold text-[10px] flex items-center justify-center">
              AS
            </div>
            <span className="text-amber-400 text-xs tracking-tighter">★★★★★</span>
            <span className="text-xs font-semibold text-slate-700">"Best clinic in Bangalore 😍"</span>
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
        </div>

        {/* Video Player Display Container */}
        <div id="demo-video" className="max-w-3xl mx-auto p-2 sm:p-3 bg-white/90 border border-slate-200/90 rounded-2xl shadow-2xl backdrop-blur-md">
          <div className="relative pb-[56.25%] h-0 rounded-xl overflow-hidden bg-slate-900">
            {videoActive ? (
              <iframe
                src="https://www.youtube.com/embed/n1Zt8X14yz8?rel=0&modestbranding=1"
                title="ReviewFlow AI Platform Walkthrough Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 w-full h-full border-0"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 bg-gradient-to-br from-slate-900 to-slate-800">
                <button
                  onClick={() => setVideoActive(true)}
                  className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 mb-4 cursor-pointer"
                >
                  <i className="fa-solid fa-play text-xl ml-1"></i>
                </button>
                <h3 className="font-bold text-lg">Watch 2-Minute Product Overview</h3>
                <p className="text-slate-300 text-xs">Learn how smart review funnels prevent 1-star reviews</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
