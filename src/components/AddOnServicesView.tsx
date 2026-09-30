import React from 'react';

interface AddOnServicesViewProps {
  onBackToDashboard: () => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

interface GrowthService {
  id: string;
  no: string;
  title: string;
  description: string;
  tone: 'blue' | 'purple' | 'orange' | 'teal' | 'indigo' | 'rose';
  icon: string;
  result: string;
  idealFor: string;
  problems: string[];
  benefits: string[];
  deliverables: string[];
  whatsappMessage: string;
}

const servicesList: GrowthService[] = [
  {
    id: 'gmb-opt',
    no: 'SERVICE 01',
    title: 'GMB Profile Optimization',
    description: 'Turn your Google Business Profile into a stronger local discovery and conversion asset.',
    tone: 'blue',
    icon: 'fa-star',
    result: 'A stronger, more complete profile that helps customers understand your business faster and gives Google better signals about your services, location, and relevance.',
    idealFor: 'Established businesses that already have a Google Business Profile but are not getting enough visibility, calls, direction requests, or enquiries.',
    problems: [
      'Profile is complete but still not performing well',
      'Wrong or weak primary and secondary categories',
      'Business description is not optimized for local intent',
      'Services, photos, Q&A, and profile information are underused'
    ],
    benefits: [
      'Improve local relevance and profile quality',
      'Make your business easier to understand at a glance',
      'Create a more professional and trustworthy first impression',
      'Build a stronger foundation for Maps and local SEO'
    ],
    deliverables: [
      'Keyword-rich description optimization',
      'Category & sub-category refinement',
      'Service area & location targeting',
      'Photo & video optimization',
      'Q&A section management',
      'Review response strategy'
    ],
    whatsappMessage: "Hi! I'm interested in the GMB Profile Optimization service."
  },
  {
    id: 'gmb-setup',
    no: 'SERVICE 02',
    title: 'GMB Setup & Verification',
    description: 'Get your Google Business Profile created and configured correctly from the beginning.',
    tone: 'purple',
    icon: 'fa-shield-halved',
    result: 'A properly structured business profile with the essential information, branding, categories, hours, and verification steps prepared for a professional launch.',
    idealFor: 'New businesses, businesses without a Google profile, or owners who need help completing setup and verification properly.',
    problems: [
      'You do not yet have a Google Business Profile',
      'The setup process feels confusing or incomplete',
      'Business details, hours, categories, or location are incorrect',
      'You need help preparing for available verification methods'
    ],
    benefits: [
      'Start with a properly configured business profile',
      'Avoid common setup mistakes and missing information',
      'Present accurate details to potential customers',
      'Create a solid base for future optimization and local growth'
    ],
    deliverables: [
      'Complete profile creation',
      'Address & phone verification',
      'Business hours setup',
      'Logo & branding upload',
      'Postcard & video verification',
      'Multi-location setup'
    ],
    whatsappMessage: "Hi! I'm interested in the GMB Setup & Verification service."
  },
  {
    id: 'local-seo',
    no: 'SERVICE 03',
    title: 'Local SEO Services',
    description: 'Improve your wider local search presence beyond the Google Business Profile itself.',
    tone: 'orange',
    icon: 'fa-magnifying-glass-chart',
    result: 'A more complete local SEO foundation that connects your website, business information, local keywords, citations, and content around the areas you want to target.',
    idealFor: 'Businesses that want to compete for location-based searches and build stronger local visibility across Google.',
    problems: [
      'Competitors appear above you for important local searches',
      'Your website is not optimized around local search intent',
      'Business citations are weak, inconsistent, or missing',
      'You lack a clear local content and authority strategy'
    ],
    benefits: [
      'Strengthen visibility for relevant local searches',
      'Improve consistency of business information online',
      'Support both website and Google Business Profile growth',
      'Build a longer-term local search foundation'
    ],
    deliverables: [
      'Local keyword research',
      'Citation building (50+ directories)',
      'Local link building',
      'Schema markup implementation',
      'Content strategy development',
      'Monthly ranking reports'
    ],
    whatsappMessage: "Hi! I'm interested in the Local SEO Services service."
  },
  {
    id: 'maps-ranking',
    no: 'SERVICE 04',
    title: 'Google Maps Ranking',
    description: 'Focus specifically on improving your presence across Google Maps and local pack search results.',
    tone: 'teal',
    icon: 'fa-location-dot',
    result: 'A more focused Maps optimization strategy built around local relevance, competitive gaps, search visibility, and customer engagement signals.',
    idealFor: 'Location-based businesses that depend on nearby customers, calls, visits, directions, and Google Maps discovery.',
    problems: [
      'Your business is difficult to find on Google Maps',
      'Competitors dominate local pack results',
      'Your visibility drops outside your immediate location',
      'You are not tracking how rankings change across nearby areas'
    ],
    benefits: [
      'Understand where your Maps visibility is weak',
      'Identify local competitor gaps and opportunities',
      'Improve profile engagement and local relevance',
      'Build a clearer strategy around high-value service areas'
    ],
    deliverables: [
      'Geo-grid rank tracking',
      'Proximity-based optimization',
      'Competitor gap analysis',
      'Review velocity improvement',
      'Local pack CTR optimization',
      'Maps engagement enhancement'
    ],
    whatsappMessage: "Hi! I'm interested in the Google Maps Ranking service."
  },
  {
    id: 'posts-mgmt',
    no: 'SERVICE 05',
    title: 'Google Posts Management',
    description: 'Keep your Google Business Profile active with regular posts, offers, announcements, and updates.',
    tone: 'indigo',
    icon: 'fa-calendar-check',
    result: 'A more active and current profile that regularly communicates offers, events, services, announcements, and useful business updates to potential customers.',
    idealFor: 'Busy business owners who want an active Google profile but do not have time to create and publish consistent updates.',
    problems: [
      'Your Google profile looks inactive or outdated',
      'You rarely publish offers, updates, or announcements',
      'You do not have time to create regular business posts',
      'Your CTAs and post content are not planned consistently'
    ],
    benefits: [
      'Keep your profile fresh and active',
      'Promote offers, events, and important updates',
      'Give customers more reasons to engage with your business',
      'Maintain a more professional ongoing presence'
    ],
    deliverables: [
      'Weekly promotional posts',
      'Event & announcement publishing',
      'Custom graphics creation',
      'CTA button optimization',
      'Performance tracking',
      'Seasonal campaigns'
    ],
    whatsappMessage: "Hi! I'm interested in the Google Posts Management service."
  },
  {
    id: 'web-design',
    no: 'SERVICE 06',
    title: 'Website Design & Redesign',
    description: 'Create a professional business website designed to turn visitors into enquiries and customers.',
    tone: 'rose',
    icon: 'fa-desktop',
    result: 'A cleaner, faster, mobile-friendly website that presents your services professionally and gives visitors clear paths to contact, enquire, book, or take action.',
    idealFor: 'Businesses with no website, an outdated website, poor mobile usability, slow loading, or a site that does not clearly convert visitors.',
    problems: [
      'Your current website looks outdated or unprofessional',
      'Visitors do not understand your services quickly',
      'The site is slow or difficult to use on mobile',
      'There are weak or confusing calls to action'
    ],
    benefits: [
      'Build stronger trust with potential customers',
      'Present your services more clearly',
      'Improve mobile usability and conversion flow',
      'Create a better foundation for local SEO and campaigns'
    ],
    deliverables: [
      'Mobile-responsive design',
      'Local SEO optimized structure',
      'Fast-loading performance',
      'Online booking & forms',
      'Service & pricing pages',
      'Ongoing maintenance'
    ],
    whatsappMessage: "Hi! I'm interested in the Website Design & Redesign service."
  }
];

export const AddOnServicesView: React.FC<AddOnServicesViewProps> = ({
  onBackToDashboard,
  onNotify
}) => {
  const getToneClasses = (tone: string) => {
    switch (tone) {
      case 'blue':
        return {
          gradient: 'from-blue-600 to-blue-800',
          bgSoft: 'bg-blue-50/70',
          borderSoft: 'border-blue-200',
          textAccent: 'text-blue-600',
          btnHover: 'hover:text-blue-600 hover:bg-blue-50'
        };
      case 'purple':
        return {
          gradient: 'from-purple-600 to-purple-800',
          bgSoft: 'bg-purple-50/70',
          borderSoft: 'border-purple-200',
          textAccent: 'text-purple-600',
          btnHover: 'hover:text-purple-600 hover:bg-purple-50'
        };
      case 'orange':
        return {
          gradient: 'from-orange-600 to-amber-700',
          bgSoft: 'bg-orange-50/70',
          borderSoft: 'border-orange-200',
          textAccent: 'text-orange-600',
          btnHover: 'hover:text-orange-600 hover:bg-orange-50'
        };
      case 'teal':
        return {
          gradient: 'from-teal-600 to-emerald-800',
          bgSoft: 'bg-teal-50/70',
          borderSoft: 'border-teal-200',
          textAccent: 'text-teal-600',
          btnHover: 'hover:text-teal-600 hover:bg-teal-50'
        };
      case 'indigo':
        return {
          gradient: 'from-indigo-600 to-indigo-800',
          bgSoft: 'bg-indigo-50/70',
          borderSoft: 'border-indigo-200',
          textAccent: 'text-indigo-600',
          btnHover: 'hover:text-indigo-600 hover:bg-indigo-50'
        };
      case 'rose':
        return {
          gradient: 'from-rose-600 to-pink-800',
          bgSoft: 'bg-rose-50/70',
          borderSoft: 'border-rose-200',
          textAccent: 'text-rose-600',
          btnHover: 'hover:text-rose-600 hover:bg-rose-50'
        };
      default:
        return {
          gradient: 'from-emerald-600 to-green-800',
          bgSoft: 'bg-emerald-50',
          borderSoft: 'border-emerald-200',
          textAccent: 'text-emerald-600',
          btnHover: 'hover:text-emerald-600 hover:bg-emerald-50'
        };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-left max-w-7xl mx-auto">
      {/* ═══════ TOP BAR ═══════ */}
      <div className="flex items-center justify-between pb-1">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-700 cursor-pointer transition-colors"
        >
          <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
        </button>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#22c55e]"></span>
          Business Growth Services
        </div>
      </div>

      {/* ═══════ HERO BANNER ═══════ */}
      <section className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-emerald-50/20 to-white border border-emerald-200/80 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              <i className="fa-solid fa-chart-line"></i> Done-for-you growth support
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Professional Services to Help Your Business <span className="text-emerald-600">Get Found &amp; Grow</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              Choose the support your business needs &mdash; from Google Business Profile setup and optimization to Local SEO, Google Maps visibility, Google Posts, and website design. Our goal is to make the process simple, practical, and focused on real business growth.
            </p>
            <div className="flex items-center gap-3 flex-wrap pt-2">
              <a
                href="#services-catalog"
                className="px-4 py-2.5 bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 hover:-translate-y-0.5"
              >
                <span>Explore Services</span> &darr;
              </a>
              <a
                href="https://wa.me/919707842047?text=Hi!%20I%27d%20like%20to%20discuss%20which%20business%20growth%20service%20is%20right%20for%20me."
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                Talk to a Specialist
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-2.5">
            <div className="p-3 bg-white/90 border border-slate-200 rounded-2xl shadow-xs flex items-start gap-3 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 text-xs">
                <i className="fa-solid fa-check"></i>
              </div>
              <div>
                <strong className="text-xs text-slate-900 block font-bold">Choose Only What You Need</strong>
                <span className="text-[11px] text-slate-500 leading-tight block">Each service is separate, so you can start with the area that matters most.</span>
              </div>
            </div>

            <div className="p-3 bg-white/90 border border-slate-200 rounded-2xl shadow-xs flex items-start gap-3 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 text-xs">
                <i className="fa-solid fa-arrows-split-up-and-left"></i>
              </div>
              <div>
                <strong className="text-xs text-slate-900 block font-bold">Clear &amp; Practical Support</strong>
                <span className="text-[11px] text-slate-500 leading-tight block">We keep the process straightforward so you always know what service you are getting.</span>
              </div>
            </div>

            <div className="p-3 bg-white/90 border border-slate-200 rounded-2xl shadow-xs flex items-start gap-3 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 text-xs">
                <i className="fa-brands fa-whatsapp"></i>
              </div>
              <div>
                <strong className="text-xs text-slate-900 block font-bold">Direct WhatsApp Enquiry</strong>
                <span className="text-[11px] text-slate-500 leading-tight block">Ask questions or discuss your requirements before choosing a service.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ BENEFITS STRIP ═══════ */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm shrink-0">
            <i className="fa-solid fa-clock"></i>
          </div>
          <div>
            <strong className="text-xs text-slate-900 font-bold block">Save Time</strong>
            <span className="text-[11px] text-slate-500">Let specialists handle the work while you focus on your business.</span>
          </div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm shrink-0">
            <i className="fa-solid fa-arrow-trend-up"></i>
          </div>
          <div>
            <strong className="text-xs text-slate-900 font-bold block">Improve Visibility</strong>
            <span className="text-[11px] text-slate-500">Build a stronger presence across local search, Maps, and your website.</span>
          </div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm shrink-0">
            <i className="fa-solid fa-sliders"></i>
          </div>
          <div>
            <strong className="text-xs text-slate-900 font-bold block">Flexible Services</strong>
            <span className="text-[11px] text-slate-500">Pick one service or combine multiple services based on your goals.</span>
          </div>
        </div>
      </section>

      {/* ═══════ 6 DONE-FOR-YOU GROWTH SERVICES ═══════ */}
      <section id="services-catalog" className="space-y-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-extrabold text-emerald-700 tracking-wider block mb-0.5">
            Business Growth Services
          </span>
          <h2 className="text-lg font-black text-slate-900">
            Done-for-You Growth Services Built for Local Businesses
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Whether you need a stronger Google Business Profile, better Maps visibility, ongoing local SEO, regular Google Posts, or a professional website, choose the service that matches your current growth goal. Every option clearly explains the problem it solves, the business benefit, and exactly what you receive.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {servicesList.map((svc) => {
            const toneCls = getToneClasses(svc.tone);
            const waUrl = `https://wa.me/919707842047?text=${encodeURIComponent(svc.whatsappMessage)}`;

            return (
              <article
                key={svc.id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                {/* Header Strip with Accent Gradient */}
                <div className={`p-5 sm:p-6 bg-gradient-to-r ${toneCls.gradient} text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden`}>
                  <div className="flex items-center gap-3.5 z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center text-xl shrink-0 backdrop-blur-xs">
                      <i className={`fa-solid ${svc.icon}`}></i>
                    </div>
                    <div>
                      <span className="text-[10px] font-black tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded-full inline-block mb-1">
                        {svc.no}
                      </span>
                      <h3 className="text-lg font-black text-white leading-tight">{svc.title}</h3>
                      <p className="text-xs text-white/80 mt-0.5 max-w-xl">{svc.description}</p>
                    </div>
                  </div>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="z-10 px-4 py-2 bg-white text-slate-900 rounded-xl font-extrabold text-xs shadow-md hover:bg-slate-50 transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <i className="fa-brands fa-whatsapp text-emerald-600 text-sm"></i> Discuss on WhatsApp
                  </a>
                </div>

                {/* Body Content */}
                <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col">
                  {/* Main Business Result */}
                  <div className={`p-3.5 rounded-2xl ${toneCls.bgSoft} border ${toneCls.borderSoft} flex items-start gap-3 text-xs leading-relaxed`}>
                    <div className="w-8 h-8 rounded-xl bg-white text-slate-800 border border-slate-200 flex items-center justify-center shrink-0 text-sm shadow-xs mt-0.5">
                      <i className="fa-solid fa-bullseye"></i>
                    </div>
                    <div>
                      <strong className="text-slate-900 font-bold block text-xs">Main Business Result</strong>
                      <span className="text-slate-700">{svc.result}</span>
                    </div>
                  </div>

                  {/* Ideal For */}
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2">
                    <i className="fa-solid fa-user-check text-slate-400 mt-0.5"></i>
                    <span><strong>Ideal for:</strong> {svc.idealFor}</span>
                  </div>

                  {/* Problems vs Benefits */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Problems This Solves */}
                    <div className="p-3.5 bg-orange-50/60 border border-orange-200 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-orange-900">
                        <i className="fa-solid fa-circle-exclamation text-orange-600"></i>
                        <span>Problems This Solves</span>
                      </div>
                      <ul className="space-y-1.5 text-[11px] text-orange-950">
                        {svc.problems.map((prob, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2">
                            <span className="text-orange-500 font-bold">&bull;</span>
                            <span>{prob}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Business Benefits */}
                    <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-900">
                        <i className="fa-solid fa-circle-check text-emerald-600"></i>
                        <span>Business Benefits</span>
                      </div>
                      <ul className="space-y-1.5 text-[11px] text-emerald-950">
                        {svc.benefits.map((ben, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2">
                            <span className="text-emerald-500 font-bold">&bull;</span>
                            <span>{ben}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Deliverables */}
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between items-center">
                      <strong className="text-xs font-bold text-slate-900">What’s Included in This Service</strong>
                      <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        6 deliverables
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {svc.deliverables.map((del, dIdx) => (
                        <div key={dIdx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs font-medium text-slate-700">
                          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                            ✓
                          </span>
                          <span className="truncate">{del}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                        <i className="fa-solid fa-shield-halved text-emerald-600"></i> Clear Scope
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                        <i className="fa-brands fa-whatsapp text-emerald-600"></i> Direct Discussion
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                        <i className="fa-solid fa-bolt text-emerald-600"></i> Fast Turnaround
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <span>Discuss This Service</span> &rarr;
                      </a>
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-xl bg-[#25D366] hover:bg-[#20BD5B] text-white flex items-center justify-center text-sm shadow-xs transition-all"
                        title="Chat on WhatsApp"
                      >
                        <i className="fa-brands fa-whatsapp"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Multi-Service Note */}
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 text-center flex items-center justify-center gap-2">
          <i className="fa-brands fa-whatsapp text-emerald-600 text-base"></i>
          <span>Need more than one service? Discuss your business goals with us on WhatsApp and choose the right custom combination.</span>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS PROCESS ═══════ */}
      <section className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-xs">
        <div>
          <span className="text-[10px] uppercase font-extrabold text-emerald-700 tracking-wider block mb-0.5">
            How It Works
          </span>
          <h2 className="text-base font-black text-slate-900">Simple Process, No Confusion</h2>
          <p className="text-xs text-slate-400">Start with a quick discussion, choose the service that fits your goal, and then move forward with the work.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
              01
            </span>
            <h3 className="text-xs font-bold text-slate-900">Choose a Service</h3>
            <p className="text-[11px] text-slate-500 leading-normal">
              Review the options above and select the service that best matches your current requirement.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
              02
            </span>
            <h3 className="text-xs font-bold text-slate-900">Discuss Your Business</h3>
            <p className="text-[11px] text-slate-500 leading-normal">
              Contact us on WhatsApp and share the basic details, goals, or problems you want to solve.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
              03
            </span>
            <h3 className="text-xs font-bold text-slate-900">Start the Work</h3>
            <p className="text-[11px] text-slate-500 leading-normal">
              Once the scope is clear, our specialists execute and deliver the selected service for your business.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════ BOTTOM CTA ═══════ */}
      <section className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <small className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">Need help choosing?</small>
          <h2 className="text-lg font-black text-white">Not Sure Which Service Is Right for Your Business?</h2>
          <p className="text-xs text-emerald-100 max-w-xl">
            Tell us what you want to improve and we will help you understand which available service best matches your goal.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <a
            href="https://wa.me/919707842047?text=Hi!%20I%27m%20not%20sure%20which%20business%20growth%20service%20I%20need.%20Can%20you%20help%20me%20choose%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20BD5B] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <i className="fa-brands fa-whatsapp text-sm"></i> Ask on WhatsApp
          </a>
          <button
            onClick={onBackToDashboard}
            className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </section>
    </div>
  );
};
