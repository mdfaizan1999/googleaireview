import React from 'react';

export const TrustBar: React.FC = () => {
  const items = [
    'Human-Like AI Review Drafts',
    'No Technical Setup Required',
    'Instant Dashboard Sync',
    'Negative Feedback Filter',
    'Print-Ready QR Flyers'
  ];

  return (
    <section className="bg-white border-y border-slate-100 py-3.5 px-4">
      <div className="max-w-5xl mx-auto flex items-center justify-center gap-4 sm:gap-8 flex-wrap text-center">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <i className="fa-solid fa-circle-check text-emerald-500 text-xs"></i>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
