import React, { useState, useRef, useEffect } from 'react';

interface ReviewSettingsViewProps {
  businessName?: string;
  businessAddress?: string;
  businessCategory?: string;
  onSave?: (settings: any) => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

interface LanguageOption {
  value: string;
  native: string;
  search: string;
  group: 'Indian Languages' | 'General / Global';
}

const allLanguages: LanguageOption[] = [
  { value: 'Hindi', native: 'हिन्दी', search: 'hindi हिन्दी devanagari', group: 'Indian Languages' },
  { value: 'Hinglish', native: 'Hindi in English Script', search: 'hinglish latin romanized', group: 'Indian Languages' },
  { value: 'Marathi', native: 'मराठी', search: 'marathi मराठी devanagari', group: 'Indian Languages' },
  { value: 'Gujarati', native: 'ગુજરાતી', search: 'gujarati ગુજરાતી', group: 'Indian Languages' },
  { value: 'Bengali', native: 'বাংলা', search: 'bengali বাংলা', group: 'Indian Languages' },
  { value: 'Tamil', native: 'தமிழ்', search: 'tamil தமிழ்', group: 'Indian Languages' },
  { value: 'Telugu', native: 'తెలుగు', search: 'telugu తెలుగు', group: 'Indian Languages' },
  { value: 'Kannada', native: 'ಕನ್ನಡ', search: 'kannada ಕನ್ನಡ', group: 'Indian Languages' },
  { value: 'Malayalam', native: 'മലയാളം', search: 'malayalam മലയാളം', group: 'Indian Languages' },
  { value: 'Punjabi', native: 'ਪੰਜਾਬੀ', search: 'punjabi ਪੰਜਾਬੀ gurmukhi', group: 'Indian Languages' },
  { value: 'Odia', native: 'ଓଡ଼ିଆ', search: 'odia ଓଡ଼ିଆ', group: 'Indian Languages' },
  { value: 'Assamese', native: 'অসমীয়া', search: 'assamese অসমীয়া', group: 'Indian Languages' },
  { value: 'Urdu', native: 'اردو', search: 'urdu اردو arabic-persian', group: 'Indian Languages' },
  { value: 'Sanskrit', native: 'संस्कृतम्', search: 'sanskrit संस्कृतम्', group: 'Indian Languages' },
  { value: 'Maithili', native: 'मैथिली', search: 'maithili मैथिली', group: 'Indian Languages' },
  { value: 'Konkani', native: 'कोंकणी', search: 'konkani कोंकणी', group: 'Indian Languages' },
  { value: 'Sindhi', native: 'सिन्धी / سنڌي', search: 'sindhi devanagari arabic', group: 'Indian Languages' },
  { value: 'Nepali', native: 'नेपाली', search: 'nepali नेपाली', group: 'Indian Languages' },
  { value: 'Dogri', native: 'डोगरी', search: 'dogri डोगरी', group: 'Indian Languages' },
  { value: 'Kashmiri', native: 'कॉशुर / كأشُر', search: 'kashmiri', group: 'Indian Languages' },
  { value: 'Bodo', native: 'बड़ो', search: 'bodo', group: 'Indian Languages' },
  { value: 'Manipuri', native: 'মৈতৈলোন্', search: 'manipuri meitei', group: 'Indian Languages' },
  { value: 'Santali', native: 'संथाली / ᱥᱟᱱᱛᱟᱲᱤ', search: 'santali ol chiki', group: 'Indian Languages' },
  { value: 'English', native: 'English', search: 'english global latin', group: 'General / Global' },
];

export const ReviewSettingsView: React.FC<ReviewSettingsViewProps> = ({
  businessName = 'Muzaffarabad azad jamu and kashmir',
  businessAddress = '9F4G+2Q8, Domail Muzaffarabad',
  businessCategory = 'Other',
  onSave,
  onNotify
}) => {
  // Navigation active tab
  const [activeSection, setActiveSection] = useState<'core-profile' | 'contact-info' | 'ai-customization' | 'ai-formatting'>('core-profile');

  // Form states
  const [businessType, setBusinessType] = useState(businessCategory || 'Other');
  const [customCategory, setCustomCategory] = useState('Establishment');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');

  // Tags
  const [services, setServices] = useState<string[]>(['Customer Service', 'Fast Delivery']);
  const [serviceInput, setServiceInput] = useState('');
  const [products, setProducts] = useState<string[]>(['Specialty Menu', 'Gift Hamper']);
  const [productInput, setProductInput] = useState('');
  const [staff, setStaff] = useState<string[]>(['Rahul', 'Priya']);
  const [staffInput, setStaffInput] = useState('');
  const [description, setDescription] = useState('');

  // Default Language Combobox
  const [defaultLanguage, setDefaultLanguage] = useState('English');
  const [langComboboxOpen, setLangComboboxOpen] = useState(false);
  const [langSearchQuery, setLangSearchQuery] = useState('');
  const comboboxRef = useRef<HTMLDivElement>(null);

  // Reviewer Language Selection Toggle
  const [allowCustomerLang, setAllowCustomerLang] = useState(false);
  const [customerLangs, setCustomerLangs] = useState<string[]>(['English', 'Hindi']);

  // Formatting & Style
  const [reviewLength, setReviewLength] = useState(200);
  const [useEmojis, setUseEmojis] = useState('1');

  // Close combobox on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setLangComboboxOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Tag Handlers
  const handleAddTag = (
    type: 'services' | 'products' | 'staff',
    val: string,
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    setInput: React.Dispatch<React.SetStateAction<string>>,
    currentList: string[]
  ) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    if (currentList.length >= 5) {
      onNotify(`Maximum 5 ${type} allowed.`, 'warning');
      return;
    }
    if (!currentList.some(item => item.toLowerCase() === trimmed.toLowerCase())) {
      setList([...currentList, trimmed]);
      setInput('');
    }
  };

  const handleRemoveTag = (
    index: number,
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    currentList: string[]
  ) => {
    setList(currentList.filter((_, i) => i !== index));
  };

  // Toggle Customer Language
  const toggleCustomerLang = (langValue: string) => {
    if (customerLangs.includes(langValue)) {
      if (customerLangs.length > 1) {
        setCustomerLangs(customerLangs.filter(l => l !== langValue));
      } else {
        onNotify('Please keep at least 1 offered language.', 'warning');
      }
    } else {
      if (customerLangs.length < 5) {
        setCustomerLangs([...customerLangs, langValue]);
      } else {
        onNotify('Maximum 5 reviewer languages allowed.', 'warning');
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const settingsData = {
      businessType,
      customCategory,
      website,
      phone,
      services,
      products,
      staff,
      description,
      defaultLanguage,
      allowCustomerLang,
      customerLangs,
      reviewLength,
      useEmojis: useEmojis === '1'
    };
    if (onSave) onSave(settingsData);
    onNotify('Review Settings successfully saved and synchronized!', 'success');
  };

  const filteredLanguages = allLanguages.filter(l =>
    l.value.toLowerCase().includes(langSearchQuery.toLowerCase()) ||
    l.native.toLowerCase().includes(langSearchQuery.toLowerCase()) ||
    l.search.toLowerCase().includes(langSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fadeIn text-left max-w-5xl mx-auto">
      {/* ═══════ HERO HEADER ═══════ */}
      <section className="relative overflow-hidden p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#34A853] to-[#2D9248] text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
              Review Settings
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure business details, AI review customization, multilingual preferences, and formatting options all in one place.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#22c55e]"></span>
          <div className="min-w-0">
            <small className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-tight">
              Active Business Profile
            </small>
            <strong className="text-xs text-slate-900 font-bold truncate block max-w-[200px]">
              {businessName}
            </strong>
          </div>
        </div>
      </section>

      {/* ═══════ RESPONSIVE SECTION NAVIGATION ═══════ */}
      <nav className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white/80 p-1.5 rounded-2xl border border-slate-200 shadow-xs backdrop-blur-md sticky top-3 z-30">
        <button
          type="button"
          onClick={() => setActiveSection('core-profile')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'core-profile'
              ? 'bg-emerald-700 text-white shadow-xs font-black'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🏢</span>
          <span>Business Details</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('contact-info')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'contact-info'
              ? 'bg-emerald-700 text-white shadow-xs font-black'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>📞</span>
          <span>Contact Info</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('ai-customization')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'ai-customization'
              ? 'bg-emerald-700 text-white shadow-xs font-black'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>⚡</span>
          <span>AI Customization</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('ai-formatting')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'ai-formatting'
              ? 'bg-emerald-700 text-white shadow-xs font-black'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>⚙️</span>
          <span>Review Style</span>
        </button>
      </nav>

      {/* ═══════ MAIN FORM ═══════ */}
      <form onSubmit={handleFormSubmit} className="space-y-4">

        {/* ═══════ SECTION 1: CORE BUSINESS PROFILE ═══════ */}
        <section id="core-profile" className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-lg shrink-0">
              🏢
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Core Business Details</h2>
              <p className="text-xs text-slate-400">Essential business profile information synchronized with Google Maps.</p>
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex gap-2.5 items-start">
            <span className="text-sm">ℹ️</span>
            <div>
              <strong>Google Places Connected Profile:</strong> Your business name and address are synchronized with Google Maps. The industry category helps the AI engine select relevant terminology.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Business Name <span className="text-slate-400 font-normal">(Google Verified)</span>
              </label>
              <input
                type="text"
                readOnly
                value={businessName}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-semibold cursor-default"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Synced directly from your Google Business Profile.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Google Maps Address <span className="text-slate-400 font-normal">(Verified Location)</span>
              </label>
              <input
                type="text"
                readOnly
                value={businessAddress}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-semibold cursor-default"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">The physical location customers visit or review.</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Business Type / Industry Category
            </label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Restaurant & Cafe">Restaurant &amp; Cafe</option>
              <option value="Dental & Medical Clinic">Dental &amp; Medical Clinic</option>
              <option value="Gym & Fitness Center">Gym &amp; Fitness Center</option>
              <option value="Real Estate & Property">Real Estate &amp; Property</option>
              <option value="Legal & Professional Services">Legal &amp; Professional Services</option>
              <option value="Retail Shop & E-Commerce">Retail Shop &amp; E-Commerce</option>
              <option value="Hotel & Hospitality">Hotel &amp; Hospitality</option>
              <option value="Beauty Salon & Spa">Beauty Salon &amp; Spa</option>
              <option value="Construction & Contracting">Construction &amp; Contracting</option>
              <option value="Auto Repair & Car Dealer">Auto Repair &amp; Car Dealer</option>
              <option value="Education & Tutoring">Education &amp; Tutoring</option>
              <option value="Other">Other</option>
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Determines the industry vocabulary, tone, and context used by the AI review generator.
            </span>
          </div>

          {businessType === 'Other' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Specify Custom Industry</label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Organic Bakery, Pet Grooming, Architecture Studio"
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-medium outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Describe your specific industry so the AI understands your unique niche.
              </span>
            </div>
          )}
        </section>

        {/* ═══════ SECTION 2: CONTACT DETAILS ═══════ */}
        <section id="contact-info" className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-lg shrink-0">
              📞
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Contact Information</h2>
              <p className="text-xs text-slate-400">Website and phone channels for customers and AI review context.</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex gap-2.5 items-start">
            <span className="text-sm">💡</span>
            <div>
              <strong>Optional Details:</strong> Providing your website or phone helps AI understand your digital presence and appointment booking options.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Website URL <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourbusiness.com"
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-medium outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Your primary business website or social landing page.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-medium outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Public customer support or booking phone number.</span>
            </div>
          </div>
        </section>

        {/* ═══════ SECTION 3: AI REVIEW CUSTOMIZATION & LANGUAGE ═══════ */}
        <section id="ai-customization" className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center text-lg shrink-0">
              ⚡
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">AI Review Customization &amp; Language</h2>
              <p className="text-xs text-slate-400">Personalize keywords, products, staff names, and default review language.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex gap-2 items-start">
              <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center shrink-0">01</span>
              <div>
                <strong className="block text-xs text-slate-800 font-bold">Add Real Services</strong>
                <p className="text-[11px] text-slate-500">AI mentions actual offerings customers experience.</p>
              </div>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex gap-2 items-start">
              <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center shrink-0">02</span>
              <div>
                <strong className="block text-xs text-slate-800 font-bold">Feature Products &amp; Staff</strong>
                <p className="text-[11px] text-slate-500">Makes generated drafts feel personal and authentic.</p>
              </div>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex gap-2 items-start">
              <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center shrink-0">03</span>
              <div>
                <strong className="block text-xs text-slate-800 font-bold">Native Language Fluency</strong>
                <p className="text-[11px] text-slate-500">Generates natural colloquial reviews in local languages.</p>
              </div>
            </div>
          </div>

          {/* Tags: Services */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">
                Key Services / Highlights
              </label>
              <span className="text-[10px] text-slate-400 font-mono">{services.length}/5</span>
            </div>
            <div className="p-2 border border-slate-300 rounded-xl min-h-[44px] flex flex-wrap gap-1.5 items-center bg-white focus-within:border-emerald-500">
              {services.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx, setServices, services)}
                    className="text-emerald-500 hover:text-red-500 cursor-pointer"
                  >
                    &times;
                  </button>
                </span>
              ))}
              {services.length < 5 && (
                <input
                  type="text"
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddTag('services', serviceInput, setServices, setServiceInput, services);
                    }
                  }}
                  onBlur={() => handleAddTag('services', serviceInput, setServices, setServiceInput, services)}
                  placeholder="Type service and press Enter..."
                  className="flex-1 min-w-[140px] text-xs outline-none bg-transparent"
                />
              )}
            </div>
            {services.length >= 5 && (
              <span className="text-[10px] text-amber-600 font-bold mt-1 block">⚠️ Maximum 5 items allowed.</span>
            )}
            <span className="text-[10px] text-slate-400 mt-1 block">Top services customers frequently hire or praise.</span>
          </div>

          {/* Tags: Products */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">
                Top Products / Specialties
              </label>
              <span className="text-[10px] text-slate-400 font-mono">{products.length}/5</span>
            </div>
            <div className="p-2 border border-slate-300 rounded-xl min-h-[44px] flex flex-wrap gap-1.5 items-center bg-white focus-within:border-emerald-500">
              {products.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx, setProducts, products)}
                    className="text-emerald-500 hover:text-red-500 cursor-pointer"
                  >
                    &times;
                  </button>
                </span>
              ))}
              {products.length < 5 && (
                <input
                  type="text"
                  value={productInput}
                  onChange={(e) => setProductInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddTag('products', productInput, setProducts, setProductInput, products);
                    }
                  }}
                  onBlur={() => handleAddTag('products', productInput, setProducts, setProductInput, products)}
                  placeholder="Type product and press Enter..."
                  className="flex-1 min-w-[140px] text-xs outline-none bg-transparent"
                />
              )}
            </div>
            {products.length >= 5 && (
              <span className="text-[10px] text-amber-600 font-bold mt-1 block">⚠️ Maximum 5 items allowed.</span>
            )}
            <span className="text-[10px] text-slate-400 mt-1 block">Popular items or dishes you want highlighted in customer reviews.</span>
          </div>

          {/* Tags: Staff */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">
                Staff Names to Feature
              </label>
              <span className="text-[10px] text-slate-400 font-mono">{staff.length}/5</span>
            </div>
            <div className="p-2 border border-slate-300 rounded-xl min-h-[44px] flex flex-wrap gap-1.5 items-center bg-white focus-within:border-emerald-500">
              {staff.map((name, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  {name}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx, setStaff, staff)}
                    className="text-emerald-500 hover:text-red-500 cursor-pointer"
                  >
                    &times;
                  </button>
                </span>
              ))}
              {staff.length < 5 && (
                <input
                  type="text"
                  value={staffInput}
                  onChange={(e) => setStaffInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddTag('staff', staffInput, setStaff, setStaffInput, staff);
                    }
                  }}
                  onBlur={() => handleAddTag('staff', staffInput, setStaff, setStaffInput, staff)}
                  placeholder="Type staff name and press Enter..."
                  className="flex-1 min-w-[140px] text-xs outline-none bg-transparent"
                />
              )}
            </div>
            {staff.length >= 5 && (
              <span className="text-[10px] text-amber-600 font-bold mt-1 block">⚠️ Maximum 5 items allowed.</span>
            )}
            <span className="text-[10px] text-slate-400 mt-1 block">Recognize exceptional team members by name in review options.</span>
          </div>

          {/* Custom Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Custom Business Description &amp; Atmosphere <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your atmosphere, unique selling proposition, hospitality, or special features..."
              className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:border-emerald-500 h-20 resize-none font-medium"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Provides deeper context for the AI when crafting conversational reviews.
            </span>
          </div>

          {/* Searchable Language Combobox (Single Select) */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Default Review Language
            </label>
            <div className="relative" ref={comboboxRef}>
              <button
                type="button"
                onClick={() => setLangComboboxOpen(!langComboboxOpen)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-800 cursor-pointer hover:border-slate-400"
              >
                <span>{defaultLanguage}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {langComboboxOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-2 max-h-60 overflow-y-auto animate-fadeIn">
                  <div className="relative mb-2">
                    <input
                      type="text"
                      value={langSearchQuery}
                      onChange={(e) => setLangSearchQuery(e.target.value)}
                      placeholder="Search language (Hindi, Marathi, Bengali, Tamil, English)..."
                      className="w-full text-xs p-2 pl-7 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 font-medium"
                    />
                    <i className="fa-solid fa-search absolute left-2 top-2.5 text-xs text-slate-400"></i>
                  </div>

                  <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 bg-slate-50 rounded">
                    Indian Languages
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {filteredLanguages
                      .filter(l => l.group === 'Indian Languages')
                      .map(opt => (
                        <div
                          key={opt.value}
                          onClick={() => {
                            setDefaultLanguage(opt.value);
                            setLangComboboxOpen(false);
                            if (!customerLangs.includes(opt.value) && customerLangs.length < 5) {
                              setCustomerLangs([...customerLangs, opt.value]);
                            }
                          }}
                          className={`p-1.5 text-xs rounded-lg cursor-pointer flex justify-between items-center ${
                            defaultLanguage === opt.value
                              ? 'bg-emerald-100 text-emerald-800 font-bold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>{opt.value}</span>
                          <span className="text-[11px] text-slate-400">{opt.native}</span>
                        </div>
                      ))}
                  </div>

                  <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 bg-slate-50 rounded mt-2">
                    General / Global
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {filteredLanguages
                      .filter(l => l.group === 'General / Global')
                      .map(opt => (
                        <div
                          key={opt.value}
                          onClick={() => {
                            setDefaultLanguage(opt.value);
                            setLangComboboxOpen(false);
                          }}
                          className={`p-1.5 text-xs rounded-lg cursor-pointer flex justify-between items-center ${
                            defaultLanguage === opt.value
                              ? 'bg-emerald-100 text-emerald-800 font-bold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>{opt.value}</span>
                          <span className="text-[11px] text-slate-400">{opt.native}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              The primary language used by the AI engine when generating review drafts for your business.
            </span>
          </div>

          {/* Reviewer Language Multi-Choice Toggle & Chips */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>🌐</span>
                  <span>Allow Reviewers to Choose Language</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Let customers pick their preferred language on the review page before generating AI drafts.
                </p>
              </div>

              {/* iOS style toggle */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowCustomerLang}
                  onChange={(e) => setAllowCustomerLang(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {allowCustomerLang && (
              <div className="pt-3 border-t border-slate-200 animate-fadeIn space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Languages Offered to Reviewers</span>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                    {customerLangs.length}/5 selected
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Tap to select 2 to 5 languages you want to offer to reviewers on your customer review funnel.
                </p>

                <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto p-1">
                  {allLanguages.map((item) => {
                    const isSelected = customerLangs.includes(item.value);
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => toggleCustomerLang(item.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-700 text-white font-bold shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-400'
                        }`}
                      >
                        {isSelected && <span>✓</span>}
                        <span>{item.value}</span>
                        <small className="opacity-75 font-normal">({item.native})</small>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ═══════ SECTION 4: AI REVIEW FORMATTING & STYLE ═══════ */}
        <section id="ai-formatting" className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center text-lg shrink-0">
              ⚙️
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">AI Review Formatting &amp; Style</h2>
              <p className="text-xs text-slate-400">Control draft length and emoji formatting for natural, human-written reviews.</p>
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex gap-2.5 items-start">
            <span className="text-sm">✨</span>
            <div>
              <strong>Natural Google Review Algorithm:</strong> Real customer reviews vary naturally between 150 to 350 characters with subtle emojis. Keeping length balanced helps reviews look organic and authentic.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Review Length (Characters) <span className="text-slate-400 font-normal">(Recommended: 200 - 350)</span>
              </label>
              <input
                type="number"
                min="50"
                max="600"
                step="10"
                value={reviewLength}
                onChange={(e) => setReviewLength(Number(e.target.value))}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-semibold outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Approximate character count per review draft (min: 50, max: 600).</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Emoji Usage in Review Drafts <span className="text-slate-400 font-normal">(E.g., 👍 😊 🌟 ✨)</span>
              </label>
              <select
                value={useEmojis}
                onChange={(e) => setUseEmojis(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="1">Enable Natural Emojis (1-2 per review)</option>
                <option value="0">Disable Emojis (Plain text only)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">When enabled, AI weaves 1-2 natural emojis into the text.</span>
            </div>
          </div>
        </section>

        {/* ═══════ BOTTOM SAVE ACTION ═══════ */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <strong className="text-sm font-black text-slate-900 block">Ready to apply changes?</strong>
            <span className="text-xs text-slate-400">
              Your new AI customization and language settings will apply instantly to all incoming review requests.
            </span>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-[#34A853] to-[#258744] text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 hover:-translate-y-0.5"
          >
            <span>💾 Save All Review Settings</span>
          </button>
        </div>

      </form>
    </div>
  );
};
