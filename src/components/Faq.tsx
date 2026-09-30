import React, { useState } from 'react';

export const Faq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does ReviewFlow AI work?',
      a: 'ReviewFlow AI provides your business with a customized review funnel and QR code. Happy customers get AI-generated draft reviews tailored to your service, staff, and keywords to post on Google in seconds. Dissatisfied customers (1–3 stars) are routed to a private offline feedback form so you can resolve complaints privately before they hurt your Google rating.'
    },
    {
      q: 'Can I customize my QR flyer designs?',
      a: 'Yes. The flyer customizer allows you to change color themes, upload custom logos, set custom headlines, and download templates as print-ready, high-resolution A6 PDFs or PNGs for checkout counters and tables.'
    },
    {
      q: 'Can AI generate replies to customer reviews?',
      a: 'Yes. When you receive a new review on Google, our AI drafts a professional, personalized, and context-appropriate reply that you can approve and publish with one click directly from your dashboard.'
    },
    {
      q: 'Is this compliant with Google’s Review Policies?',
      a: 'Yes. ReviewFlow AI facilitates natural customer feedback without incentives, gates, or fabricated accounts. Customers post from their own personal Google accounts voluntarily using suggested wording that eliminates writer’s block.'
    },
    {
      q: 'What languages are supported for review generation?',
      a: 'ReviewFlow AI supports over 24 languages including English, Hindi, Hinglish, Spanish, French, Arabic, German, Tamil, Telugu, and more. Customers can choose their preferred dialect on their phone.'
    },
    {
      q: 'How quickly can I get my business onboarded?',
      a: 'Setup takes under 5 minutes. Simply register, type in your Google Business Profile name, configure your staff/service tags, and print your ready-to-use QR standee.'
    }
  ];

  return (
    <section id="faq" className="py-20 px-4 max-w-4xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold uppercase tracking-wider mb-3">
          <i className="fa-regular fa-circle-question"></i>
          Help Center
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Frequently Asked <span className="bg-gradient-to-r from-[#34A853] to-[#15803D] bg-clip-text text-transparent">Questions</span>
        </h2>
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
          Answers to common questions about setting up your ReviewFlow AI review funnel.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {faqs.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`border rounded-2xl transition-all overflow-hidden ${
                isOpen ? 'border-emerald-500 bg-white shadow-sm ring-2 ring-emerald-500/10' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer gap-4"
              >
                <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2.5">
                  <i className="fa-regular fa-circle-question text-emerald-600 text-sm shrink-0"></i>
                  {item.q}
                </span>
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-transform shrink-0 ${
                    isOpen ? 'bg-emerald-100 text-emerald-800 rotate-45' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <i className="fa-solid fa-plus"></i>
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-fadeIn">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
