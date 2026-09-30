import React, { useState } from 'react';

interface SignInPageProps {
  onBackToHome: () => void;
  onOpenRegister: () => void;
  onSuccess: (msg: string) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({
  onBackToHome,
  onOpenRegister,
  onSuccess
}) => {
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onSuccess(`Welcome back! Signed in successfully as ${emailOrUser || 'Business Operator'}.`);
      onBackToHome();
    }, 700);
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess('Successfully signed in with Google Account!');
      onBackToHome();
    }, 700);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFCFA] text-slate-900 font-sans relative flex items-center justify-center p-4 sm:p-6 lg:p-10 pt-24 sm:pt-28">
      {/* Ambient background glow & dot grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-60 z-0"
        style={{
          background: `
            radial-gradient(circle at 15% 15%, rgba(52, 168, 83, 0.08) 0%, transparent 45%),
            radial-gradient(circle at 85% 85%, rgba(59, 130, 246, 0.04) 0%, transparent 50%),
            radial-gradient(#CBD5E1 1.2px, transparent 1.2px)
          `,
          backgroundSize: '100% 100%, 100% 100%, 28px 28px'
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* ═══════ LEFT COLUMN: LANDING SHOWCASE ═══════ */}
          <div className="lg:col-span-7 space-y-4">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer group mb-1"
            >
              <i className="fa-solid fa-arrow-left text-[11px] group-hover:-translate-x-1 transition-transform"></i>
              Back to Homepage
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#34A853] to-[#2D9248] flex items-center justify-center text-white shadow-md shadow-emerald-500/25 shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="white" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-slate-900 leading-tight tracking-tight">
                  ReviewFlow <span className="text-[#34A853]">AI</span>
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 tracking-tight">
                  Helping customers share better reviews
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] font-extrabold text-emerald-800 tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#34A853]"></span>
              AI Google Review Platform &bull; Business Portal
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.18]">
              Grow Your Google Reviews &amp; <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#34A853] to-[#15803D] bg-clip-text text-transparent">
                Rank #1 Locally
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl font-normal">
              Log in to your business dashboard to manage AI review funnels, generate custom QR standees, monitor new customer feedback, and build online reputation.
            </p>

            {/* 4 Key Perks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2.5 bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-emerald-300 hover:-translate-y-0.5 transition-all">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-xs shrink-0">
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">1-Click AI Review Drafter</h4>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">Customers write detailed 5-star Google reviews in seconds using smart AI assistance.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-emerald-300 hover:-translate-y-0.5 transition-all">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-xs shrink-0">
                  <i className="fa-solid fa-qrcode"></i>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">Smart QR Standees &amp; Flyers</h4>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">Place on checkout counters or tables to collect customer reviews on the spot.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-emerald-300 hover:-translate-y-0.5 transition-all">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-xs shrink-0">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">Negative Review Firewall</h4>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">Route unhappy feedback to private inbox before it ever reaches public Google Maps.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-emerald-300 hover:-translate-y-0.5 transition-all">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-xs shrink-0">
                  <i className="fa-solid fa-chart-line"></i>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">Real-Time Growth Analytics</h4>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">Track scans, review completions, customer sentiment, and local search ranking.</p>
                </div>
              </div>
            </div>

            {/* Trust Strip */}
            <div className="flex items-center gap-4 pt-3 border-t border-slate-200 text-xs text-slate-600 font-semibold flex-wrap">
              <span className="flex items-center gap-1.5">
                <i className="fa-solid fa-star text-amber-400"></i> 4.9/5 Trusted by Businesses
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <i className="fa-solid fa-bolt text-emerald-600"></i> 3x More Reviews
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <i className="fa-solid fa-lock text-emerald-600"></i> 256-Bit SSL Secured
              </span>
            </div>
          </div>

          {/* ═══════ RIGHT COLUMN: AUTH CARD ═══════ */}
          <div className="lg:col-span-5 bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 relative">
            <div className="mb-5">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Business Login</h2>
              <p className="text-xs text-slate-500 mt-0.5">Enter your credentials to access your review dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="login-email">
                  Email or Username
                </label>
                <input
                  id="login-email"
                  type="text"
                  required
                  value={emailOrUser}
                  onChange={(e) => setEmailOrUser(e.target.value)}
                  placeholder="WebpressHub or name@business.com"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="login-password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-1.5 text-slate-600 font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded accent-emerald-600"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModal(true)}
                  className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Signing In...
                  </>
                ) : (
                  <>
                    Sign In to Dashboard <i className="fa-solid fa-arrow-right text-xs"></i>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-slate-200"></div>
              <span className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">or continue with</span>
              <div className="flex-1 border-t border-slate-200"></div>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2.5 shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>

            {/* Switch Link */}
            <div className="mt-4 text-center text-xs text-slate-500 pt-3 border-t border-slate-100">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onOpenRegister}
                className="font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Start 24-Hour Free Trial
              </button>
            </div>

            {/* Secure & Fast Strip */}
            <div className="flex items-center justify-center gap-2 mt-3 pt-2 text-[10px] text-slate-400 font-semibold border-t border-dashed border-slate-200">
              <span className="flex items-center gap-1">
                <i className="fa-solid fa-bolt text-emerald-600"></i> Instant Access
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <i className="fa-solid fa-lock text-emerald-600"></i> 256-Bit SSL Encrypted
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl relative text-slate-900 animate-fadeIn">
            <button
              onClick={() => {
                setForgotModal(false);
                setResetSent(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            {resetSent ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl mx-auto">
                  <i className="fa-solid fa-check"></i>
                </div>
                <h3 className="text-base font-bold text-slate-900">Reset Link Sent</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We've dispatched a password reset link to <strong>{resetEmail}</strong>. Please check your inbox and spam folder.
                </p>
                <button
                  onClick={() => {
                    setForgotModal(false);
                    setResetSent(false);
                  }}
                  className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">Reset Password</h3>
                <p className="text-xs text-slate-500">
                  Enter your registered work email to receive password reset instructions.
                </p>
                <div>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@business.com"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
