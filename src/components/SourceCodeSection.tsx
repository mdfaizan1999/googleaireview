import React, { useState } from 'react';

interface SourceCodeProps {
  standalone?: boolean;
}

export const SourceCodeSection: React.FC<SourceCodeProps> = ({ standalone = false }) => {
  const [selectedTab, setSelectedTab] = useState<'stack' | 'modules' | 'license'>('stack');
  const [inquiryModal, setInquiryModal] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="source-code" className={standalone ? 'py-12 max-w-5xl mx-auto px-4' : 'py-20 px-4 max-w-6xl mx-auto'}>
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-3xl p-6 sm:p-12 text-white shadow-2xl relative overflow-hidden border border-slate-700">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl mx-auto text-center mb-10 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <i className="fa-solid fa-code"></i> Developer &amp; Agency Edition
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
            Launch Your Own SaaS with <br />
            <span className="text-[#34A853]">ReviewFlow AI Full Source Code</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Get the complete, production-ready source code of ReviewFlow AI. Self-host on your own servers, white-label it for clients, or launch your own multi-tenant review agency.
          </p>

          <div className="mt-6 inline-flex items-baseline gap-2 bg-white/10 px-5 py-2.5 rounded-2xl border border-white/15">
            <span className="text-xs text-slate-400 uppercase font-bold">One-Time Lifetime License:</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">₹9,999</span>
            <span className="text-xs text-slate-300">/ Unlimited Domains</span>
          </div>
        </div>

        {/* Feature Tabs */}
        <div className="flex justify-center gap-2 mb-8 relative z-10">
          <button
            onClick={() => setSelectedTab('stack')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedTab === 'stack' ? 'bg-emerald-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            <i className="fa-solid fa-layer-group mr-1.5"></i> Tech Stack
          </button>
          <button
            onClick={() => setSelectedTab('modules')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedTab === 'modules' ? 'bg-emerald-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            <i className="fa-solid fa-cubes mr-1.5"></i> Included Modules
          </button>
          <button
            onClick={() => setSelectedTab('license')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedTab === 'license' ? 'bg-emerald-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            <i className="fa-solid fa-certificate mr-1.5"></i> Resell Rights
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative z-10 max-w-4xl mx-auto">
          {selectedTab === 'stack' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="font-bold text-white block mb-1">
                  <i className="fa-brands fa-php text-indigo-400 mr-1.5"></i> Full PHP &amp; React / Node
                </span>
                Clean, modular MVC architecture with zero bloated dependencies. Extremely fast load times.
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="font-bold text-white block mb-1">
                  <i className="fa-solid fa-credit-card text-emerald-400 mr-1.5"></i> Razorpay &amp; Stripe Gateways
                </span>
                Pre-integrated recurring subscriptions, webhooks, invoice generation, and customer auto-provisioning.
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="font-bold text-white block mb-1">
                  <i className="fa-solid fa-wand-magic-sparkles text-amber-400 mr-1.5"></i> Gemini &amp; OpenAI API Ready
                </span>
                Plug in your own API keys. Structured prompting pipeline for high-converting reviews in 24+ languages.
              </div>
            </div>
          )}

          {selectedTab === 'modules' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <i className="fa-solid fa-check text-emerald-400 mt-1 shrink-0"></i>
                <span><strong>Multi-Tenant Operator Portal:</strong> Businesses log in, customize QR standees, view feedback, and manage reviews.</span>
              </div>
              <div className="flex items-start gap-2">
                <i className="fa-solid fa-check text-emerald-400 mt-1 shrink-0"></i>
                <span><strong>Negative Feedback Shield:</strong> Auto-routes 1–3 star ratings to private offline feedback forms to protect ratings.</span>
              </div>
              <div className="flex items-start gap-2">
                <i className="fa-solid fa-check text-emerald-400 mt-1 shrink-0"></i>
                <span><strong>Printable PDF Standee Engine:</strong> Generates crisp 300 DPI vector QR flyers in A6 format instantly.</span>
              </div>
              <div className="flex items-start gap-2">
                <i className="fa-solid fa-check text-emerald-400 mt-1 shrink-0"></i>
                <span><strong>Super-Admin Console:</strong> Manage all businesses, subscription renewals, payments, and system settings.</span>
              </div>
            </div>
          )}

          {selectedTab === 'license' && (
            <div className="text-xs text-slate-300 space-y-2">
              <p>
                ✓ <strong>100% Unencrypted Source Code:</strong> You receive the entire uncompiled and unencrypted codebase with full documentation.
              </p>
              <p>
                ✓ <strong>White-Label Freedom:</strong> Rebrand to your own agency name, logo, domain, and charging model. You keep 100% of customer subscription revenues.
              </p>
              <p>
                ✓ <strong>Lifetime Updates &amp; Setup Guide:</strong> Includes step-by-step deployment guide for cPanel, VPS, Ubuntu, or Docker hosting.
              </p>
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 relative z-10">
          <a
            href="https://wa.me/919707842047?text=Hi!%20I'm%20interested%20in%20purchasing%20the%20ReviewFlow%20AI%20Source%20Code%20for%20₹9,999.%20Please%20send%20the%20purchase%20and%20download%20details."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-7 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <i className="fa-brands fa-whatsapp text-base"></i> Buy Source Code on WhatsApp (₹9,999)
          </a>
          <button
            onClick={() => setInquiryModal(true)}
            className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <i className="fa-solid fa-envelope"></i> Request Demo &amp; Documentation
          </button>
        </div>
      </div>

      {/* Inquiry Modal */}
      {inquiryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-slate-900 relative">
            <button
              onClick={() => setInquiryModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-1">
              Source Code Inquiry
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Enter your details to receive the architectural documentation and live agency demo credentials.
            </p>

            {submitted ? (
              <div className="text-center py-6 space-y-3">
                <i className="fa-solid fa-circle-check text-emerald-600 text-4xl"></i>
                <h4 className="font-extrabold text-slate-900 text-base">Inquiry Received!</h4>
                <p className="text-xs text-slate-600">
                  Our engineering team will WhatsApp you the complete documentation and zip repository details within 15 minutes.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setInquiryModal(false);
                  }}
                  className="mt-3 px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="e.g. Faizan Ahmad"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp / Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Submit Inquiry &amp; Request Demo Access
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
