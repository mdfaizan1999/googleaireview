import React from 'react';

export const StatsStrip: React.FC = () => {
  const stats = [
    { value: '84.6%', label: 'Avg. Conversion Rate' },
    { value: '1,200+', label: 'Active Businesses' },
    { value: '5★', label: 'Average Google Rating' },
    { value: '<5 min', label: 'Setup Time' }
  ];

  return (
    <section className="bg-gradient-to-r from-[#34A853] via-[#2D9248] to-[#15803D] py-12 px-4 text-white relative overflow-hidden">
      {/* Subtle Dot Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center relative z-10">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-1">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-mono tabular-nums">
              {stat.value}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-emerald-100">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
