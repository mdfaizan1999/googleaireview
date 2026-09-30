import React, { useState, useEffect } from 'react';
import { ViewType } from '../types';

interface HeaderProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onOpenAuth: (mode: 'signin' | 'register') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (view: ViewType) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
          isScrolled
            ? 'h-16 bg-white/95 shadow-md shadow-slate-900/5 backdrop-blur-md'
            : 'h-[72px] bg-white/90 backdrop-blur-sm'
        } border-b border-slate-200`}
      >
        <div className="max-w-[1220px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          {/* Brand Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#34A853] to-[#2D9248] flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="white" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                ReviewFlow <span className="text-[#34A853]">AI</span>
              </span>
              <span className="text-[10px] font-medium text-emerald-700 tracking-tight leading-tight mt-0.5">
                Helping customers share better reviews
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <button
              onClick={() => handleNavClick('vs-normal-qr')}
              className={`text-[13px] font-semibold transition-colors py-1 cursor-pointer ${
                currentView === 'vs-normal-qr'
                  ? 'text-emerald-700 font-bold border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              AI vs Normal QR
            </button>
            <button
              onClick={() => handleNavClick('pricing')}
              className={`text-[13px] font-semibold transition-colors py-1 cursor-pointer ${
                currentView === 'pricing'
                  ? 'text-emerald-700 font-bold border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              Pricing
            </button>
            <button
              onClick={() => handleNavClick('source-code')}
              className={`text-[13px] font-semibold transition-colors py-1 cursor-pointer ${
                currentView === 'source-code'
                  ? 'text-emerald-700 font-bold border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              Source Code
            </button>
            <button
              onClick={() => handleNavClick('referral-program')}
              className={`text-[13px] font-semibold transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${
                currentView === 'referral-program'
                  ? 'text-emerald-700 font-bold border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              Referral Program
              <span className="bg-gradient-to-r from-emerald-600 to-green-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                40%
              </span>
            </button>
            <button
              onClick={() => handleNavClick('agency')}
              className={`text-[13px] font-semibold transition-colors py-1 cursor-pointer ${
                currentView === 'agency'
                  ? 'text-emerald-700 font-bold border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              Apply for Agency
            </button>
            <button
              onClick={() => handleNavClick('analyzer')}
              className={`text-[13px] font-semibold transition-colors py-1 flex items-center gap-1 cursor-pointer ${
                currentView === 'analyzer'
                  ? 'text-emerald-700 font-bold border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <i className="fa-solid fa-stethoscope text-emerald-600 text-xs"></i>
              AI SEO Analyzer
            </button>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={() => handleNavClick('signin')}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-sm"
            >
              Sign In
            </button>
            <button
              onClick={() => handleNavClick('register')}
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#34A853] to-[#2D9248] rounded-lg hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer hover:-translate-y-0.5"
            >
              Start Free
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>

          {/* Hamburger button (Mobile) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <span className={`w-5 h-0.5 bg-current transition-transform duration-200 ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`w-5 h-0.5 bg-current transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-5 h-0.5 bg-current transition-transform duration-200 ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden transition-opacity"
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[85%] max-w-[340px] bg-white z-50 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#34A853] to-[#2D9248] flex items-center justify-center text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="white" />
                </svg>
              </div>
              <span className="font-extrabold text-slate-900 text-lg">
                ReviewFlow <span className="text-[#34A853]">AI</span>
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            24-Hour Free Trial Available
          </div>

          <ul className="space-y-1 text-sm font-semibold text-slate-700">
            <li>
              <button
                onClick={() => handleNavClick('home')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 text-left transition-colors"
              >
                <i className="fa-solid fa-house text-slate-400 w-5 text-center"></i>
                Home Overview
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('vs-normal-qr')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 text-left transition-colors"
              >
                <i className="fa-solid fa-code-compare text-slate-400 w-5 text-center"></i>
                AI vs Normal QR
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('pricing')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 text-left transition-colors"
              >
                <i className="fa-solid fa-tag text-slate-400 w-5 text-center"></i>
                Pricing &amp; Plans
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('source-code')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 text-left transition-colors"
              >
                <i className="fa-solid fa-code text-slate-400 w-5 text-center"></i>
                Source Code (₹9,999)
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('referral-program')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 text-left transition-colors"
              >
                <i className="fa-solid fa-gift text-slate-400 w-5 text-center"></i>
                Referral Program (40%)
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('agency')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 text-left transition-colors"
              >
                <i className="fa-solid fa-briefcase text-slate-400 w-5 text-center"></i>
                Apply for Agency
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('analyzer')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 text-left transition-colors"
              >
                <i className="fa-solid fa-stethoscope text-slate-400 w-5 text-center"></i>
                AI SEO Analyzer
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('flyer-tool')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 text-left transition-colors"
              >
                <i className="fa-solid fa-qrcode text-slate-400 w-5 text-center"></i>
                QR Flyer Designer
              </button>
            </li>
          </ul>
        </div>

        <div className="pt-6 border-t border-slate-100 space-y-2.5">
          <button
            onClick={() => handleNavClick('register')}
            className="w-full py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#34A853] to-[#2D9248] rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            Start Free Trial <i className="fa-solid fa-arrow-right"></i>
          </button>
          <button
            onClick={() => handleNavClick('signin')}
            className="w-full py-2.5 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 flex items-center justify-center gap-2 cursor-pointer"
          >
            <i className="fa-solid fa-arrow-right-to-bracket text-slate-400"></i>
            Sign In to Account
          </button>
          <p className="text-[11px] text-center text-slate-400">
            No credit card required · Setup in 5 minutes
          </p>
        </div>
      </div>
    </>
  );
};
