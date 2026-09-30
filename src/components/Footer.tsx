import React from 'react';
import { ViewType } from '../types';

interface FooterProps {
  onNavigate: (view: ViewType) => void;
  onOpenAuth: (mode: 'signin' | 'register') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAuth }) => {
  return (
    <footer className="bg-[#0D1E12] text-slate-400 pt-16 pb-8 px-4 font-sans relative overflow-hidden border-t border-emerald-950">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10 relative z-10">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#34A853] to-[#2D9248] flex items-center justify-center text-white shadow-md">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="white" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-white tracking-tight leading-none">
                ReviewFlow <span className="text-[#34A853]">AI</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">
                Helping customers share better reviews
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            AI-Powered Google Review Growth System — helping local businesses gather authentic 5-star reviews, resolve private feedback, and boost local search rankings.
          </p>

          <div className="pt-2">
            <a
              href="https://webpresshub.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span>Powered by</span>
              <span className="text-amber-400 font-bold">WebPressHub</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        </div>

        {/* 1. Solutions */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
            Solutions
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors cursor-pointer">
                Platform Features
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('vs-normal-qr')} className="hover:text-white transition-colors cursor-pointer">
                AI vs Normal QR
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('source-code')} className="hover:text-white transition-colors cursor-pointer">
                Source Code
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('analyzer')} className="hover:text-white transition-colors cursor-pointer">
                AI SEO Analyzer
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('flyer-tool')} className="hover:text-white transition-colors cursor-pointer">
                QR Flyer Designer
              </button>
            </li>
          </ul>
        </div>

        {/* 2. Plans & Scale */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
            Plans &amp; Scale
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onNavigate('source-code')} className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer">
                ★ Source Code (₹9,999)
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('pricing')} className="hover:text-white transition-colors cursor-pointer">
                Pricing &amp; Free Trial
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('agency')} className="hover:text-white transition-colors cursor-pointer">
                Multi-Business Plan
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('agency')} className="hover:text-white transition-colors cursor-pointer">
                Apply for Agency
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('register')} className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer">
                Start 24-Hour Free Trial
              </button>
            </li>
          </ul>
        </div>

        {/* 3. Portals & Access */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
            Access &amp; Legal
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onNavigate('signin')} className="hover:text-white transition-colors cursor-pointer">
                Operator Sign In
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('onboarding')} className="hover:text-white transition-colors cursor-pointer">
                Business Onboard
              </button>
            </li>
            <li>
              <a href="#faq" className="hover:text-white transition-colors">
                Support &amp; FAQ
              </a>
            </li>
            <li>
              <a href="https://wa.me/919707842047" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                WhatsApp Support Desk
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
        <p className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          &copy; {new Date().getFullYear()} ReviewFlow AI. All rights reserved.
        </p>

        <div className="flex items-center gap-4 text-slate-400">
          <span className="hover:text-slate-200 cursor-pointer">Privacy Policy</span>
          <span>·</span>
          <span className="hover:text-slate-200 cursor-pointer">Terms of Service</span>
          <span>·</span>
          <span className="hover:text-slate-200 cursor-pointer">Cookie Policy</span>
          <span>·</span>
          <span className="hover:text-slate-200 cursor-pointer">Sitemap</span>
        </div>
      </div>
    </footer>
  );
};
