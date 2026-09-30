import React, { useState } from 'react';

export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = '919707842047';

  const quickPrompts = [
    'Hi! I want a live demo of ReviewFlow AI.',
    'I want to purchase the Source Code (₹9,999).',
    'What are the pricing details for 5+ locations?',
    'How does the negative feedback filter work?'
  ];

  const handleOpenWhatsApp = (customMsg?: string) => {
    const text = encodeURIComponent(customMsg || 'Hi! I need help with ReviewFlow AI.');
    window.open(`https://wa.me/${phoneNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Card */}
      {isOpen && (
        <div className="mb-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn text-slate-900">
          {/* Header */}
          <div className="bg-[#128C7E] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg">
                <i className="fa-brands fa-whatsapp"></i>
              </div>
              <div>
                <h4 className="font-extrabold text-sm leading-tight">ReviewFlow Support</h4>
                <p className="text-[10px] text-emerald-100 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                  Typically replies in 5 minutes
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white text-sm w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-slate-50 space-y-3">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm text-xs text-slate-700 leading-relaxed">
              👋 Hi there! Welcome to ReviewFlow AI. How can we help you boost your Google reviews today?
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Inquiries:
              </span>
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleOpenWhatsApp(prompt)}
                  className="w-full text-left p-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span className="truncate">{prompt}</span>
                  <i className="fa-solid fa-arrow-right text-[9px] text-slate-400 ml-1"></i>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-3 bg-white border-t border-slate-100">
            <button
              onClick={() => handleOpenWhatsApp()}
              className="w-full py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-brands fa-whatsapp text-sm"></i>
              Start Chat on WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center text-2xl shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer relative"
        aria-label="Chat on WhatsApp"
      >
        <i className={`fa-brands ${isOpen ? 'fa-whatsapp' : 'fa-whatsapp'}`}></i>
        {!isOpen && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-300 border-2 border-white rounded-full"></span>
        )}
      </button>
    </div>
  );
};
