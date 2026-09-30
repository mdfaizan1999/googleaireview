import React, { useState } from 'react';

interface ReferralProps {
  standalone?: boolean;
  onNavigateToReferral?: () => void;
}

interface PlanOption {
  id: 'monthly' | 'yearly' | 'agency';
  name: string;
  price: number;
  comm: number;
}

export const ReferralProgram: React.FC<ReferralProps> = ({ standalone = false, onNavigateToReferral }) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanOption>({
    id: 'monthly',
    name: 'Monthly Plan',
    price: 199,
    comm: 79.6
  });

  const [salesCount, setSalesCount] = useState<number>(10);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [partnerMode, setPartnerMode] = useState<'signup' | 'signin'>('signup');
  const [partnerName, setPartnerName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerUpi, setPartnerUpi] = useState('');
  const [customCode, setCustomCode] = useState('PARTNER40');
  const [isRegistered, setIsRegistered] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const plans: PlanOption[] = [
    { id: 'monthly', name: 'Monthly Plan', price: 199, comm: 79.6 },
    { id: 'yearly', name: 'Yearly Plan', price: 1199, comm: 479.6 },
    { id: 'agency', name: 'Multi-Business Plan', price: 4999, comm: 1999.6 }
  ];

  const totalComm = salesCount * selectedPlan.comm;

  const formatCurrency = (val: number) => {
    return '₹' + val.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistered(true);
  };

  const handleCopyLink = () => {
    const url = `https://reviewflowai.in/?ref=${encodeURIComponent(customCode || 'partner40')}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="site-main font-sans text-slate-900">
      {/* ═══════ HERO SECTION ═══════ */}
      <div className={`relative px-4 bg-gradient-to-b from-[#FAFCFA] via-emerald-50/20 to-white border-b border-slate-200 overflow-hidden ${
        standalone ? 'pt-28 pb-16 sm:pt-36 sm:pb-20' : 'pt-16 pb-12 sm:pt-20 sm:pb-16'
      }`}>
        {/* Subtle Dot Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: 'radial-gradient(#CBD5E1 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px'
          }}
        />

        <section className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold uppercase tracking-wide mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Dedicated Partner Program &bull; Flat 40% Commission
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-5 text-balance">
            Recommend ReviewFlow AI. <br />
            Earn <span className="bg-gradient-to-r from-[#34A853] to-[#15803D] bg-clip-text text-transparent">40% On Every Subscription</span>.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Share our AI-powered Google Review funnel with local businesses, agencies, and retail stores. When they purchase any subscription within 48 hours of clicking your link, you earn a 40% cash payout.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3.5 flex-wrap mb-14">
            <button
              onClick={() => {
                setPartnerMode('signup');
                setPartnerModalOpen(true);
              }}
              className="px-7 py-3.5 text-sm sm:text-base font-extrabold text-white bg-gradient-to-r from-[#34A853] to-[#2D9248] rounded-xl hover:shadow-xl hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 shadow-md"
            >
              Join Referral Program Free <i className="fa-solid fa-arrow-right text-xs"></i>
            </button>
            <button
              onClick={() => {
                setPartnerMode('signin');
                setPartnerModalOpen(true);
              }}
              className="px-6 py-3.5 text-sm sm:text-base font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-emerald-300 hover:text-emerald-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              Partner Sign In
            </button>
          </div>

          {/* Perk Highlights Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm hover:-translate-y-1 hover:border-emerald-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg mx-auto mb-3 shadow-inner">
                <i className="fa-solid fa-percent"></i>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mb-0.5">40%</div>
              <div className="text-xs text-slate-500 font-semibold">Direct Cash Commission</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm hover:-translate-y-1 hover:border-emerald-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg mx-auto mb-3 shadow-inner">
                <i className="fa-solid fa-clock"></i>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mb-0.5">48 Hours</div>
              <div className="text-xs text-slate-500 font-semibold">Cookie Tracking Window</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm hover:-translate-y-1 hover:border-emerald-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg mx-auto mb-3 shadow-inner">
                <i className="fa-solid fa-wallet"></i>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mb-0.5">₹1,000</div>
              <div className="text-xs text-slate-500 font-semibold">Low Minimum Payout</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm hover:-translate-y-1 hover:border-emerald-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg mx-auto mb-3 shadow-inner">
                <i className="fa-solid fa-building-columns"></i>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mb-0.5">UPI &amp; Bank</div>
              <div className="text-xs text-slate-500 font-semibold">Direct Account Transfers</div>
            </div>
          </div>
        </section>
      </div>

      {/* ═══════ INTERACTIVE LIVE COMMISSION CALCULATOR ═══════ */}
      <section className="py-20 px-4 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest block mb-2">
              Instant Earnings Estimator
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Live Commission Calculator
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Select a subscription plan and adjust the number of referred businesses to see your exact 40% cash payout.
            </p>
          </div>

          <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-lg space-y-8">
            {/* 1. Plan Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                1. Select Target Subscription Plan:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {plans.map((p) => {
                  const isActive = selectedPlan.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlan(p)}
                      className={`relative bg-white border-2 rounded-2xl p-4 text-center cursor-pointer transition-all ${
                        isActive
                          ? 'border-emerald-500 bg-emerald-50/40 shadow-md -translate-y-1'
                          : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute -top-3 right-3 bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm">
                          ✓ Selected
                        </span>
                      )}
                      <div className="text-sm font-extrabold text-slate-900 mb-1">{p.name}</div>
                      <div className="text-2xl font-black text-emerald-600 font-mono mb-1.5">
                        ₹{p.price.toLocaleString('en-IN')}
                      </div>
                      <div className="inline-block text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full font-mono">
                        You Earn: ₹{p.comm.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Sales Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-800">
                  Number of Referred Businesses:
                </span>
                <span className="text-xl font-black text-emerald-600 font-mono">
                  {salesCount} {salesCount === 1 ? 'Account' : 'Accounts'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={salesCount}
                onChange={(e) => setSalesCount(parseInt(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono font-semibold">
                <span>1 Client</span>
                <span>25 Clients</span>
                <span>50 Clients</span>
                <span>75 Clients</span>
                <span>100 Clients</span>
              </div>
            </div>

            {/* 3. Dynamic Result Display Box */}
            <div className="bg-gradient-to-r from-[#166534] via-[#15803D] to-[#22C55E] rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-700/20 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left space-y-1">
                <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-100">
                  Your Total 40% Cash Commission
                </div>
                <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                  {formatCurrency(totalComm)}
                </div>
                <div className="text-xs text-emerald-100 font-medium pt-1">
                  {salesCount} {salesCount === 1 ? 'account' : 'accounts'} &times; ₹{selectedPlan.comm.toFixed(2)} (40% of ₹{selectedPlan.price.toLocaleString('en-IN')} {selectedPlan.name})
                </div>
              </div>

              <div>
                <button
                  onClick={() => {
                    setPartnerMode('signup');
                    setPartnerModalOpen(true);
                  }}
                  className="w-full md:w-auto px-7 py-3.5 bg-white text-emerald-800 hover:bg-emerald-50 font-black text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 whitespace-nowrap"
                >
                  Claim Your 40% Link <i className="fa-solid fa-arrow-right text-xs"></i>
                </button>
              </div>
            </div>

            {/* 4. Quick Benchmark Cards */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Earnings Benchmark ({selectedPlan.name}):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 10, 20, 50].map((num) => (
                  <div key={num} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <div className="text-xs font-bold text-slate-500 mb-0.5">{num} {num === 1 ? 'Referral' : 'Referrals'}</div>
                    <div className="text-base font-black text-emerald-700 font-mono">
                      {formatCurrency(num * selectedPlan.comm)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS 3-STEP GUIDE ═══════ */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest block mb-2">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            How the Partner Program Works
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            No business setup or technical knowledge needed. Start earning within minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white border border-slate-200 rounded-2xl p-7 text-center shadow-sm hover:-translate-y-1 hover:border-emerald-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 text-xl font-black flex items-center justify-center mx-auto mb-4">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Join Free &amp; Get Your Code</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
              Sign up on our dedicated partner page. Instantly receive your unique partner code and customizable referral tracking link.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-7 text-center shadow-sm hover:-translate-y-1 hover:border-emerald-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 text-xl font-black flex items-center justify-center mx-auto mb-4">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Share with Local Businesses</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
              Share via WhatsApp, social media, or in person. When they visit your link, our 48-hour tracking cookie connects their account to you.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-7 text-center shadow-sm hover:-translate-y-1 hover:border-emerald-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 text-xl font-black flex items-center justify-center mx-auto mb-4">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Receive 40% Direct Payout</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
              When the business purchases any plan, 40% is instantly credited to your ledger. Request payouts to your UPI or Bank starting at ₹1,000.
            </p>
          </div>
        </div>

        {/* Call to Action Banner */}
        <div className="bg-gradient-to-br from-white via-emerald-50/50 to-white border-2 border-emerald-500 rounded-3xl p-8 sm:p-12 text-center shadow-xl shadow-emerald-500/10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-3">
            <i className="fa-solid fa-wand-magic-sparkles"></i> Separate Partner Portal
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            Ready to Start Earning 40% Commissions?
          </h3>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-6">
            Join our network of partners recommending ReviewFlow AI to businesses across India. Fast approvals, instant tracking, and direct bank payouts.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => {
                setPartnerMode('signup');
                setPartnerModalOpen(true);
              }}
              className="px-7 py-3 bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              Create Partner Account <i className="fa-solid fa-arrow-right text-xs"></i>
            </button>
            <button
              onClick={() => {
                setPartnerMode('signin');
                setPartnerModalOpen(true);
              }}
              className="px-6 py-3 bg-white border border-slate-300 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
            >
              Partner Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ═══════ PARTNER FAQ SECTION ═══════ */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest block mb-2">
              Partner FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Everything you need to know about the ReviewFlow AI Referral Partner Program.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                <i className="fa-solid fa-circle-question text-emerald-600"></i>
                How is the Referral Program separated from normal user accounts?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Referral Partners have their own dedicated authentication and dashboard. As a partner, you do not need to register a business, set up Google places, or purchase a subscription. You can focus 100% on sharing your link and earning commissions.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                <i className="fa-solid fa-circle-question text-emerald-600"></i>
                When and how do I get paid?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Once your available commission balance reaches the ₹1,000 minimum limit, you can submit a withdrawal request directly from your dashboard. Payouts are transferred to your saved UPI ID or Bank Account via NEFT/IMPS within 24–48 business hours.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                <i className="fa-solid fa-circle-question text-emerald-600"></i>
                How does the 48-hour referral tracking window work?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                When a business owner clicks your referral link, a 48-hour tracking cookie is saved in their browser. If they register or purchase any subscription plan within 48 hours, the 40% commission is automatically attributed and credited to your partner account.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                <i className="fa-solid fa-circle-question text-emerald-600"></i>
                Can I customize my referral code?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Yes! You can customize your referral code into a branded word or name (e.g. <strong>RAHUL40</strong>) from the "Referral Links" tab inside your partner dashboard, provided it hasn't been taken by another partner.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ PARTNER REGISTRATION / LOGIN MODAL ═══════ */}
      {partnerModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-slate-900 animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => {
                setPartnerModalOpen(false);
                setIsRegistered(false);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            {isRegistered ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto shadow-inner">
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <h3 className="text-xl font-black text-slate-900">Partner Account Active!</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Welcome aboard, <strong>{partnerName || 'Partner'}</strong>! Your flat 40% affiliate tracking link is ready:
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Your Unique Referral Tracking URL:
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-xs text-emerald-800 bg-white p-2 rounded-lg border border-slate-200 break-all">
                    <span>https://reviewflowai.in/?ref={customCode.toLowerCase()}</span>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedLink ? '✓ Copied to Clipboard!' : 'Copy Partner Link'}
                  </button>
                </div>

                <div className="text-[11px] text-slate-500 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <i className="fa-solid fa-money-bill-transfer text-emerald-600 mr-1"></i>
                  Payouts will be sent directly to <strong>{partnerUpi || 'Your UPI/Bank Account'}</strong>.
                </div>

                <button
                  onClick={() => {
                    setPartnerModalOpen(false);
                    setIsRegistered(false);
                  }}
                  className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#34A853] to-[#2D9248] text-white flex items-center justify-center mx-auto mb-2 shadow-sm">
                    <i className="fa-solid fa-gift"></i>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {partnerMode === 'signup' ? 'Join 40% Partner Program' : 'Partner Portal Sign In'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {partnerMode === 'signup'
                      ? 'No subscription required · Instant tracking code'
                      : 'Access your clicks, referrals, and commission ledger'}
                  </p>
                </div>

                <form onSubmit={handlePartnerSubmit} className="space-y-3.5">
                  {partnerMode === 'signup' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        placeholder="e.g. Faizan Ahmad"
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                      placeholder="partner@example.com"
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  {partnerMode === 'signup' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          UPI ID / Bank Phone for Payouts
                        </label>
                        <input
                          type="text"
                          required
                          value={partnerUpi}
                          onChange={(e) => setPartnerUpi(e.target.value)}
                          placeholder="e.g. 9876543210@paytm or UPI ID"
                          className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Desired Referral Code
                        </label>
                        <input
                          type="text"
                          required
                          value={customCode}
                          onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                          placeholder="e.g. FAIZAN40"
                          className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-mono font-bold"
                        />
                      </div>
                    </>
                  )}

                  {partnerMode === 'signin' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {partnerMode === 'signup' ? (
                      <>
                        Create Partner Account &amp; Claim 40% Link <i className="fa-solid fa-arrow-right text-xs"></i>
                      </>
                    ) : (
                      <>
                        Sign In to Partner Portal <i className="fa-solid fa-arrow-right text-xs"></i>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-5 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
                  {partnerMode === 'signup' ? (
                    <span>
                      Already registered as a partner?{' '}
                      <button
                        type="button"
                        onClick={() => setPartnerMode('signin')}
                        className="font-bold text-emerald-700 hover:underline cursor-pointer"
                      >
                        Partner Sign In
                      </button>
                    </span>
                  ) : (
                    <span>
                      New to the Referral Program?{' '}
                      <button
                        type="button"
                        onClick={() => setPartnerMode('signup')}
                        className="font-bold text-emerald-700 hover:underline cursor-pointer"
                      >
                        Join Free (40% Commission)
                      </button>
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
