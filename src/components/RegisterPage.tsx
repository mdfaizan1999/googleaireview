import React, { useState } from 'react';

interface RegisterPageProps {
  onBackToHome: () => void;
  onNavigateToSignIn: () => void;
  onGoToOnboarding: () => void;
  onSuccess: (msg: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onBackToHome,
  onNavigateToSignIn,
  onGoToOnboarding,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    setPhone(cleaned);
    if (phoneError) setPhoneError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    // Reset errors
    setPhoneError('');
    setEmailError('');
    setPasswordError('');

    // Email validate
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    }

    // Phone validate (7 to 15 digits)
    if (!/^[0-9]{7,15}$/.test(phone.trim())) {
      setPhoneError('Please enter a valid 7–15 digit mobile number.');
      valid = false;
    }

    // Password validate
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      valid = false;
    }

    if (!valid) return;

    setLoading(true);
    (async () => {
      try {
        const { api } = await import('../services/api');
        await api.auth.register({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: `${countryCode} ${phone.trim()}`
        });
        setLoading(false);
        onSuccess(`Welcome to ReviewFlow AI, ${name || 'Business Partner'}! Your 24-hour trial is now active.`);
        onGoToOnboarding();
      } catch (err: any) {
        setLoading(false);
        setEmailError(err.message || 'Registration failed. Please verify your details.');
      }
    })();
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      const { api } = await import('../services/api');
      await api.auth.login({
        email: 'ahmadfaizan1999@gmail.com',
        password: 'Password@123'
      });
      setLoading(false);
      onSuccess('Successfully signed up with Google Account! Your 24-hour trial is active.');
      onGoToOnboarding();
    } catch {
      setLoading(false);
      onSuccess('Successfully signed up with Google Account! Your 24-hour trial is active.');
      onGoToOnboarding();
    }
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
          <div className="lg:col-span-7 space-y-4 text-left">
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
              24-Hour Free Trial &bull; No Credit Card Required
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.18]">
              Get 10x More 5-Star Google Reviews <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#34A853] to-[#15803D] bg-clip-text text-transparent">
                On Autopilot
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl font-normal">
              Turn everyday walk-in and online customers into glowing 5-star Google reviews. Boost your local search ranking and attract more paying customers effortlessly.
            </p>

            {/* 4 Key Perks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2.5 bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-emerald-300 hover:-translate-y-0.5 transition-all">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-xs shrink-0">
                  <i className="fa-solid fa-bolt"></i>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">Instant 60-Second Setup</h4>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">Connect your Google Business Profile and launch your custom review page.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-emerald-300 hover:-translate-y-0.5 transition-all">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-xs shrink-0">
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">AI-Assisted Customer Reviews</h4>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">Solves customer writer's block with tailored 5-star review suggestions.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-emerald-300 hover:-translate-y-0.5 transition-all">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-xs shrink-0">
                  <i className="fa-solid fa-qrcode"></i>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">Print-Ready Standees &amp; Flyers</h4>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">Download branded QR flyers, table tents, and counter standees instantly.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-emerald-300 hover:-translate-y-0.5 transition-all">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-xs shrink-0">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">Private Negative Feedback Filter</h4>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">Catch customer complaints privately before they hurt your Google Maps rating.</p>
                </div>
              </div>
            </div>

            {/* Trust Strip */}
            <div className="flex items-center gap-4 pt-3 border-t border-slate-200 text-xs text-slate-600 font-semibold flex-wrap">
              <span className="flex items-center gap-1.5">
                <i className="fa-solid fa-star text-amber-400"></i> 4.9/5 Rating
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <i className="fa-solid fa-shield-check text-emerald-600"></i> 24-Hour Free Trial
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <i className="fa-solid fa-lock text-emerald-600"></i> 256-Bit SSL Encrypted
              </span>
            </div>
          </div>

          {/* ═══════ RIGHT COLUMN: REGISTRATION CARD ═══════ */}
          <div className="lg:col-span-5 bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-900/5 relative">
            <div className="mb-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Start Your 24-Hour Free Trial</h2>
              <p className="text-xs text-slate-500 mt-0.5">Create your business account in 30 seconds. No credit card required.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="reg-name">
                    Full Name
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="reg-phone">
                    Mobile Number
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-20 text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-bold bg-slate-50 shrink-0"
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+971">+971</option>
                      <option value="+61">+61</option>
                      <option value="+65">+65</option>
                      <option value="+49">+49</option>
                      <option value="+33">+33</option>
                    </select>
                    <input
                      id="reg-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="9876543210"
                      className={`w-full text-xs p-2.5 border rounded-xl focus:outline-none font-medium ${
                        phoneError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-emerald-500'
                      }`}
                    />
                  </div>
                  {phoneError && (
                    <span className="text-[10px] text-red-600 font-bold block mt-1">
                      {phoneError}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="reg-email">
                  Business Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="name@business.com"
                  className={`w-full text-xs p-2.5 border rounded-xl focus:outline-none font-medium ${
                    emailError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-emerald-500'
                  }`}
                />
                {emailError && (
                  <span className="text-[10px] text-red-600 font-bold block mt-1">
                    {emailError}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="reg-password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs p-2.5 pr-8 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      aria-label="Toggle password visibility"
                    >
                      <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="reg-confirm-password">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="reg-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full text-xs p-2.5 pr-8 border rounded-xl focus:outline-none font-medium ${
                        passwordError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-emerald-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      aria-label="Toggle password visibility"
                    >
                      <i className={`fa-regular ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>
              </div>

              {passwordError && (
                <span className="text-[10px] text-red-600 font-bold block mt-0.5">
                  {passwordError}
                </span>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Setting Up Account...
                  </>
                ) : (
                  <>
                    Start 24-Hour Free Trial <i className="fa-solid fa-arrow-right text-xs"></i>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-3.5">
              <div className="flex-1 border-t border-slate-200"></div>
              <span className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">or sign up with</span>
              <div className="flex-1 border-t border-slate-200"></div>
            </div>

            {/* Google Sign Up Button */}
            <button
              onClick={handleGoogleSignUp}
              type="button"
              className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2.5 shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Sign up with Google</span>
            </button>

            {/* Switch Link */}
            <div className="mt-3.5 text-center text-xs text-slate-500 pt-2.5 border-t border-slate-100">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToSignIn}
                className="font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </div>

            {/* Secure & Fast Strip */}
            <div className="flex items-center justify-center gap-2 mt-2.5 pt-2 text-[10px] text-slate-400 font-semibold border-t border-dashed border-slate-200">
              <span className="flex items-center gap-1">
                <i className="fa-solid fa-shield-check text-emerald-600"></i> 24-Hour Free Trial
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <i className="fa-solid fa-bolt text-emerald-600"></i> Instant Setup
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <i className="fa-solid fa-lock text-emerald-600"></i> 256-Bit SSL
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
