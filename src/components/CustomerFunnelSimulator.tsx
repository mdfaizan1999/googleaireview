import React, { useState } from 'react';
import confetti from 'canvas-confetti';

interface SimulatorProps {
  onNotify: (msg: string, type?: 'success' | 'info') => void;
}

export const CustomerFunnelSimulator: React.FC<SimulatorProps> = ({ onNotify }) => {
  const [businessName, setBusinessName] = useState('Urban Spice Bistro & Cafe');
  const [rating, setRating] = useState<number>(5);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedStaff, setSelectedStaff] = useState('Rohit (Server)');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Delicious Food', 'Great Hospitality', 'Quick Service']);
  const [tone, setTone] = useState<'enthusiastic' | 'detailed' | 'concise'>('enthusiastic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDraftIndex, setActiveDraftIndex] = useState(0);
  const [privateFeedbackSubmitted, setPrivateFeedbackSubmitted] = useState(false);
  const [privateFeedbackText, setPrivateFeedbackText] = useState('');
  const [copiedDraft, setCopiedDraft] = useState<number | null>(null);

  const availableTags = [
    'Delicious Food',
    'Great Hospitality',
    'Quick Service',
    'Clean Ambience',
    'Super Friendly Staff',
    'Value for Money',
    'Cozy Seating',
    'Must-Visit Spot'
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi हिन्दी' },
    { code: 'hinglish', name: 'Hinglish' },
    { code: 'es', name: 'Spanish Español' },
    { code: 'fr', name: 'French Français' },
    { code: 'ar', name: 'Arabic العربية' }
  ];

  // Helper to generate tailored drafts
  const getDrafts = () => {
    const staffMention = selectedStaff ? ` Special mention to ${selectedStaff} who took such great care of us!` : '';
    const tagsJoined = selectedTags.slice(0, 2).join(' and ');

    if (selectedLanguage === 'Hindi हिन्दी') {
      return [
        `यहाँ का अनुभव बहुत ही शानदार रहा! खाना बेहद स्वादिष्ट था और सर्विस बहुत तेज़ थी।${staffMention} सभी दोस्तों और परिवार के लिए अत्यधिक अनुशंसित! ⭐️⭐️⭐️⭐️⭐️`,
        `${businessName} वाकई में एक बेहतरीन जगह है! ${tagsJoined} का कोई मुकाबला नहीं। हम निश्चित रूप से जल्द ही दोबारा आएंगे। 👍❤️`,
        `5 स्टार सर्विस! सफाई और माहौल बहुत बढ़िया था। ${staffMention} थैंक यू पूरी टीम को! ✨`
      ];
    }

    if (selectedLanguage === 'Hinglish') {
      return [
        `Kya baat hai! Seriously loved the experience at ${businessName}. ${tagsJoined} ekdum top notch tha. ${staffMention} 10/10 recommend to everyone! 🔥👌`,
        `Amazing vibes aur super fast service! Khana was so fresh & flavorful. Specially liked the hospitality. Definitely coming back soon! ⭐⭐⭐⭐⭐`,
        `Best place in town! Affordable pricing, great atmosphere aur bohot polite staff. Rohit bhai made our evening truly memorable! 🙌✨`
      ];
    }

    if (selectedLanguage === 'Spanish Español') {
      return [
        `¡Una experiencia absolutamente increíble en ${businessName}! La comida estuvo deliciosa y el servicio impecable.${staffMention} ¡Altamente recomendado! ⭐⭐⭐⭐⭐`,
        `El mejor lugar de la zona. Excelente ambiente y gran atención al detalle. ¡Volveremos muy pronto sin duda alguna! 👏✨`,
        `Servicio de 5 estrellas. Todo el personal fue muy amable y servicial. ¡Una joya total! 👌`
      ];
    }

    // Default English
    return [
      `Had a fantastic time at ${businessName}! The ${tagsJoined.toLowerCase() || 'service'} exceeded all expectations.${staffMention} Everything was served fresh and with a smile. Highly recommend to everyone in the area! ⭐⭐⭐⭐⭐`,
      `Such a pleasant surprise! The atmosphere was cozy, welcoming, and the quality was top-notch. ${selectedTags.includes('Clean Ambience') ? 'Extremely clean and organized. ' : ''}Thank you to the entire team for such great hospitality! 🙌💫`,
      `Easily a 5-star experience! From the moment we walked in to checkout, everything was smooth and hassle-free.${staffMention} Will definitely be bringing my friends back soon. 10/10! 🔥`
    ];
  };

  const drafts = getDrafts();

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedDraft(index);
    onNotify('Review draft copied to clipboard! Ready to paste into Google.', 'success');
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
    setTimeout(() => setCopiedDraft(null), 2500);
  };

  const handlePrivateFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPrivateFeedbackSubmitted(true);
    onNotify('Private feedback sent to manager! Google rating protected.', 'info');
  };

  return (
    <section id="funnel-demo" className="py-16 px-4 bg-slate-50/70 border-b border-slate-200">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot"></span>
            Interactive Live Sandbox
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Experience What Your <span className="text-[#34A853]">Customer Sees</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Test how customers interact with your smart QR review link. Notice how 4–5 star ratings trigger instant AI drafts while 1–3 star ratings route to private feedback.
          </p>
        </div>

        {/* Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Controls / Explainer */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-sliders text-emerald-600"></i>
                Simulator Controls
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-medium"
                  placeholder="e.g. Spice Garden Bistro"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Staff Member / Attendant
                </label>
                <input
                  type="text"
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-medium"
                  placeholder="e.g. Rohit (Manager), Dr. Meera"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Language Selection
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.name)}
                      className={`px-2.5 py-1.5 text-xs rounded-lg font-medium border text-left transition-colors cursor-pointer ${
                        selectedLanguage === lang.name
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Experience Tags (Selected Injects into AI)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 text-[11px] rounded-full border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Smart Routing Callout */}
            <div className={`p-4 rounded-xl border transition-all ${
              rating <= 3 
                ? 'bg-amber-50/80 border-amber-200 text-amber-900' 
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            }`}>
              <div className="flex items-start gap-2.5">
                <i className={`fa-solid ${rating <= 3 ? 'fa-shield-halved text-amber-600' : 'fa-wand-magic-sparkles text-emerald-600'} text-lg mt-0.5`}></i>
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wide">
                    {rating <= 3 ? 'Negative Feedback Shield Engaged' : 'Google 5-Star Booster Active'}
                  </h4>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    {rating <= 3 
                      ? 'Because the customer selected 1–3 stars, they are NOT directed to Google. Instead, an internal private feedback form captures their complaints offline so you can resolve them.' 
                      : 'Because the customer selected 4 or 5 stars, ReviewFlow AI prompts them with human-like drafts and guides them directly to Google Maps.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Mobile Phone Device Mockup */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-[370px] bg-slate-900 rounded-[42px] p-3 shadow-2xl border-4 border-slate-800 relative">
              {/* Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-b-xl z-30"></div>

              {/* Mobile Screen */}
              <div className="bg-white rounded-[32px] overflow-hidden min-h-[580px] flex flex-col relative text-slate-900">
                {/* Status Bar */}
                <div className="bg-slate-50 px-6 pt-3 pb-2 flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-100">
                  <span className="font-bold">9:41</span>
                  <div className="flex items-center gap-1.5">
                    <i className="fa-solid fa-signal text-[9px]"></i>
                    <i className="fa-solid fa-wifi text-[9px]"></i>
                    <i className="fa-solid fa-battery-full text-[10px]"></i>
                  </div>
                </div>

                {/* Mobile Header */}
                <div className="p-4 text-center bg-gradient-to-b from-emerald-50/70 to-white border-b border-slate-100">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 shadow-sm">
                    <i className="fa-solid fa-utensils text-lg"></i>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                    {businessName}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    How was your experience with us today?
                  </p>

                  {/* Rating Stars Selection */}
                  <div className="flex justify-center items-center gap-2 mt-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => {
                          setRating(star);
                          setPrivateFeedbackSubmitted(false);
                        }}
                        className={`text-2xl transition-transform hover:scale-125 focus:outline-none cursor-pointer ${
                          star <= rating ? 'text-amber-400' : 'text-slate-200'
                        }`}
                        title={`${star} Star`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <span className="inline-block text-[11px] font-bold text-slate-600 mt-1">
                    {rating === 5 && 'Outstanding! (5/5)'}
                    {rating === 4 && 'Good Experience (4/5)'}
                    {rating === 3 && 'Average (3/5)'}
                    {rating === 2 && 'Needs Improvement (2/5)'}
                    {rating === 1 && 'Poor Experience (1/5)'}
                  </span>
                </div>

                {/* Dynamic Screen Content Based on Rating */}
                <div className="p-4 flex-1 overflow-y-auto">
                  {rating <= 3 ? (
                    /* Negative Feedback Routing Form */
                    <div className="space-y-3.5">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-1 text-sm">
                          <i className="fa-solid fa-heart-crack"></i>
                        </div>
                        <h4 className="text-xs font-bold text-amber-900">
                          We are sorry to hear that!
                        </h4>
                        <p className="text-[10px] text-amber-800 mt-0.5">
                          Please let the owner know directly so we can resolve this right away.
                        </p>
                      </div>

                      {privateFeedbackSubmitted ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
                          <i className="fa-solid fa-circle-check text-emerald-600 text-2xl"></i>
                          <h5 className="font-bold text-xs text-emerald-900">
                            Thank You for Your Feedback!
                          </h5>
                          <p className="text-[11px] text-emerald-700 leading-snug">
                            Your message has been sent directly to the owner. We will get in touch with you shortly.
                          </p>
                          <button
                            onClick={() => {
                              setRating(5);
                              setPrivateFeedbackSubmitted(false);
                            }}
                            className="mt-2 text-[10px] font-bold text-emerald-800 underline"
                          >
                            Switch to 5-star view
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handlePrivateFeedbackSubmit} className="space-y-2.5">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-1">
                              What went wrong?
                            </label>
                            <textarea
                              rows={3}
                              required
                              value={privateFeedbackText}
                              onChange={(e) => setPrivateFeedbackText(e.target.value)}
                              placeholder="Please describe what happened so our management can fix it..."
                              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-normal"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-1">
                              Your Phone / Email (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 9876543210 for callback"
                              className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                          >
                            Submit Private Feedback
                          </button>
                        </form>
                      )}
                    </div>
                  ) : (
                    /* 4-5 Stars: AI Generated Review Flow */
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700">
                          AI Draft Options ({selectedLanguage})
                        </span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                          ✨ Tap to Copy
                        </span>
                      </div>

                      {/* Draft Cards */}
                      <div className="space-y-2.5">
                        {drafts.map((draft, idx) => (
                          <div
                            key={idx}
                            onClick={() => setActiveDraftIndex(idx)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                              activeDraftIndex === idx
                                ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                                Draft Option {idx + 1}
                              </span>
                              <div className="flex text-amber-400 text-[10px]">
                                ★★★★★
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-700 leading-relaxed font-normal">
                              "{draft}"
                            </p>
                            <div className="mt-2.5 flex justify-end">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(draft, idx);
                                }}
                                className={`px-3 py-1 rounded-md text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                  copiedDraft === idx
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800'
                                }`}
                              >
                                {copiedDraft === idx ? (
                                  <>
                                    <i className="fa-solid fa-check"></i> Copied!
                                  </>
                                ) : (
                                  <>
                                    <i className="fa-regular fa-copy"></i> Copy Draft
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Final Google Action Button */}
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            handleCopy(drafts[activeDraftIndex], activeDraftIndex);
                            onNotify('Redirecting to Google Maps review dialog...', 'info');
                          }}
                          className="w-full py-3 bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white font-extrabold text-xs rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/>
                          </svg>
                          Copy &amp; Post on Google Maps
                        </button>
                        <p className="text-[10px] text-center text-slate-400 mt-1">
                          Opens official Google Business review dialog in 1 tap
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
