import React, { useState } from 'react';

interface AgencyProps {
  standalone?: boolean;
  onNavigateToPricing?: () => void;
  onNavigateToSignIn?: () => void;
}

export const AgencyApplication: React.FC<AgencyProps> = ({
  standalone = false,
  onNavigateToPricing,
  onNavigateToSignIn
}) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pwdError, setPwdError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPwdError(true);
      return;
    }
    setPwdError(false);
    setSubmitted(true);
  };

  const handleConfirmChange = (val: string) => {
    setConfirmPassword(val);
    if (password && val && password !== val) {
      setPwdError(true);
    } else {
      setPwdError(false);
    }
  };

  return (
    <div className={`font-sans text-slate-900 ${standalone ? 'pt-28 pb-16 sm:pt-36 sm:pb-20' : 'py-16'} px-4 max-w-6xl mx-auto`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* ── LEFT: VALUE PROPOSITION ── */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-extrabold uppercase tracking-wide">
            <i className="fa-solid fa-briefcase"></i> Multi-Business &amp; Agency Portal
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Scale Google Reviews for <br />
            <span className="bg-gradient-to-r from-[#34A853] to-[#15803D] bg-clip-text text-transparent">
              All Your Locations
            </span>
          </h1>

          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Designed for marketing agencies, multi-location franchises, and brand managers seeking a centralized Google review acceleration system.
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-base shrink-0 shadow-inner">
                <i className="fa-solid fa-layer-group"></i>
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 mb-0.5">
                  Centralized Multi-Location Console
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Manage dozens of client or branch listings from a single intuitive agency dashboard.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-base shrink-0 shadow-inner">
                <i className="fa-solid fa-qrcode"></i>
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 mb-0.5">
                  Dedicated QR Flyers &amp; Standees
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Generate isolated QR standees, tracking links, and custom AI prompt rules for each location.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-base shrink-0 shadow-inner">
                <i className="fa-solid fa-chart-pie"></i>
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 mb-0.5">
                  Cross-Location Analytics
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Monitor scans, drafted reviews, conversion rates, and negative feedback across all accounts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-base shrink-0 shadow-inner">
                <i className="fa-brands fa-whatsapp"></i>
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 mb-0.5">
                  VIP Dedicated Onboarding Support
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Direct WhatsApp &amp; priority concierge setup for rapid assistance and capacity scaling.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: APPLICATION CARD ── */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 relative">
          {submitted ? (
            <div className="text-center py-6 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto shadow-inner">
                <i className="fa-solid fa-check"></i>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Application Received!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                Thank you, <strong>{name}</strong>! Your multi-business application has been submitted. Our team reviews accounts rapidly and will reach out via WhatsApp &amp; Email within 4 business hours.
              </p>

              <div className="pt-2 space-y-2 max-w-xs mx-auto">
                <a
                  href={`https://wa.me/919707842047?text=${encodeURIComponent(`Hi! I just applied for the ReviewFlow AI Agency Plan for ${company || name}. Please review my credentials.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fa-brands fa-whatsapp text-base"></i> Fast-Track on WhatsApp
                </a>
                <button
                  onClick={() => setSubmitted(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Submit Another Location
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
                Apply for Multi-Business Access
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Fill out the details below to request your multi-business agency credentials.
              </p>

              {/* Fast Human Review Notice */}
              <div className="bg-amber-50/90 border border-amber-200 border-l-4 border-l-amber-500 rounded-xl p-3 mb-5 text-xs text-amber-900 leading-relaxed">
                <strong className="text-amber-950 font-bold flex items-center gap-1.5 mb-0.5">
                  <i className="fa-solid fa-shield-halved text-amber-600"></i> Fast Human Review:
                </strong>
                Multi-Business accounts are approved manually to ensure optimal server resources. We review applications rapidly.
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Agency / Business Name
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Acme Media Group"
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@acmemedia.com"
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      WhatsApp / Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 97000 00000"
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Choose Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full text-xs p-2.5 pr-9 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      aria-label="Toggle password visibility"
                    >
                      <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => handleConfirmChange(e.target.value)}
                      placeholder="Re-enter password"
                      className={`w-full text-xs p-2.5 pr-9 border rounded-xl focus:outline-none font-medium ${
                        pwdError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-emerald-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      aria-label="Toggle confirm password visibility"
                    >
                      <i className={`fa-regular ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {pwdError && (
                    <span className="text-[11px] text-red-600 font-bold block mt-1">
                      Passwords do not match.
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={pwdError}
                  className="w-full py-3 bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-3 hover:-translate-y-0.5"
                >
                  Submit Agency Application <i className="fa-solid fa-arrow-right text-xs"></i>
                </button>
              </form>

              <div className="mt-4 text-center text-xs text-slate-500 pt-3 border-t border-slate-100">
                Looking for a single business plan?{' '}
                <button
                  type="button"
                  onClick={onNavigateToPricing}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  View Standard Plans
                </button>
                {' '}&bull;{' '}
                <button
                  type="button"
                  onClick={onNavigateToSignIn}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
