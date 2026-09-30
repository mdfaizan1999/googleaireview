import React, { useState } from 'react';

export const Industries: React.FC = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<number>(0);

  const industries = [
    {
      name: 'Restaurants & Cafes',
      icon: 'fa-solid fa-utensils',
      color: 'text-emerald-600',
      sampleReview: 'The truffle pasta and mocktails were heavenly! Special thanks to chef and staff for celebrating my birthday with a warm dessert. Will definitely come back with friends!',
      keywords: 'Taste, Hygiene, Quick Table Service, Ambience, Hospitality'
    },
    {
      name: 'Salons & Spas',
      icon: 'fa-solid fa-scissors',
      color: 'text-pink-600',
      sampleReview: 'Priya gave me the most stylish haircut & balayage! Extremely polite, sanitized tools, and calming atmosphere. Best salon experience in the city.',
      keywords: 'Stylist Skill, Cleanliness, Hair Spa, Polite Staff, Punctual'
    },
    {
      name: 'Clinics & Doctors',
      icon: 'fa-solid fa-stethoscope',
      color: 'text-blue-600',
      sampleReview: 'Dr. Meera was so gentle and thorough explaining my treatment plan. Zero waiting time, spotless clinic, and caring support staff. Highly recommended!',
      keywords: 'Doctor Expertise, Painless Care, Modern Equipment, Courteous'
    },
    {
      name: 'Retail & Boutiques',
      icon: 'fa-solid fa-shirt',
      color: 'text-purple-600',
      sampleReview: 'Superb collection and very patient sales team! Helped me find the perfect festive outfit within my budget. Great discounts too.',
      keywords: 'Fabric Quality, Pricing, Helpful Staff, Trendy Collection'
    },
    {
      name: 'Hotels & Resorts',
      icon: 'fa-solid fa-hotel',
      color: 'text-amber-600',
      sampleReview: 'Spacious ocean-view room, delicious complimentary breakfast buffet, and rapid room service. Housekeeping made our anniversary stay memorable.',
      keywords: 'Room Hygiene, Scenic View, Courteous Staff, Fast Check-in'
    },
    {
      name: 'Auto Services',
      icon: 'fa-solid fa-car-side',
      color: 'text-cyan-600',
      sampleReview: 'Transparent billing and completed car servicing 1 hour before promised! Engine runs like new and interior was vacuumed clean.',
      keywords: 'Fair Estimate, On-Time Delivery, Genuine Spares, Professional'
    }
  ];

  return (
    <section id="industries" className="py-20 px-4 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold uppercase tracking-wider mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot"></span>
          Works For Every Business
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Built for <span className="bg-gradient-to-r from-[#34A853] to-[#15803D] bg-clip-text text-transparent">All Local Industries</span>
        </h2>
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
          Whether you run a restaurant, clinic, salon, or retail store — ReviewFlow AI adapts to your business type and customer vocabulary.
        </p>
      </div>

      {/* 6 Industry Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
        {industries.map((ind, i) => (
          <button
            key={i}
            onClick={() => setSelectedIndustry(i)}
            className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2.5 ${
              selectedIndustry === i
                ? 'bg-emerald-50 border-emerald-500 shadow-md -translate-y-1'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className={`text-2xl ${ind.color} transition-transform group-hover:scale-110`}>
              <i className={ind.icon}></i>
            </div>
            <span className={`text-xs font-bold ${selectedIndustry === i ? 'text-emerald-950 font-extrabold' : 'text-slate-700'}`}>
              {ind.name}
            </span>
          </button>
        ))}
      </div>

      {/* Interactive Detail Box for Chosen Industry */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm shadow-sm">
            <i className={industries[selectedIndustry].icon}></i>
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Tailored AI Review Strategy for {industries[selectedIndustry].name}
            </h4>
            <span className="text-[11px] text-emerald-700 font-semibold">
              Auto-injects targeted SEO terms into customer review drafts
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Sample AI-Generated Customer Draft
            </span>
            <span className="text-amber-400 text-xs">★★★★★</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
            "{industries[selectedIndustry].sampleReview}"
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
          <span>
            <strong>SEO Keywords Target:</strong> {industries[selectedIndustry].keywords}
          </span>
          <span className="text-emerald-700 font-bold flex items-center gap-1">
            <i className="fa-solid fa-check"></i> High Google Maps Ranking Signal
          </span>
        </div>
      </div>
    </section>
  );
};
