import React from 'react';

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      text: "Within the first month, our Google review count jumped from 18 to 67. The QR flyer system is incredibly easy — customers actually use it at checkout!",
      name: "Rajesh Kumar",
      role: "Restaurant Owner, Delhi",
      avatarBg: "bg-[#4285F4]",
      initials: "RK"
    },
    {
      text: "The negative feedback filter alone is worth it. We used to get occasional bad reviews — now unhappy customers go through the private form and we resolve issues before they go public.",
      name: "Priya Mehta",
      role: "Salon Owner, Mumbai",
      avatarBg: "bg-[#34A853]",
      initials: "PM"
    },
    {
      text: "Setup took literally 4 minutes. The AI-generated drafts are so natural — customers actually copy and post them. Our rating went from 3.8 to 4.6 in just 6 weeks.",
      name: "Arun Sharma",
      role: "Clinic Manager, Bangalore",
      avatarBg: "bg-[#EA4335]",
      initials: "AS"
    }
  ];

  return (
    <section className="py-20 px-4 bg-slate-50 border-y border-slate-200">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase tracking-wider mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot"></span>
            Customer Stories
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Trusted by <span className="bg-gradient-to-r from-[#34A853] to-[#15803D] bg-clip-text text-transparent">Local Businesses</span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            See how ReviewFlow AI is helping businesses across India grow their Google ratings and online visibility.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-emerald-300 transition-all"
            >
              <div>
                <div className="flex text-amber-400 text-sm gap-0.5 mb-4">
                  ★★★★★
                </div>
                <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed mb-6 font-normal">
                  "{t.text}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${t.avatarBg} text-white font-extrabold text-xs flex items-center justify-center shadow-sm`}>
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight">
                      {t.name}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {t.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Google</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
