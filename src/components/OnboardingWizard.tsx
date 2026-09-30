import React, { useState, useEffect, useRef } from 'react';

interface OnboardingWizardProps {
  onComplete: () => void;
  onBackToHome: () => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

interface PlaceResult {
  place_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pin_code: string;
  rating?: number;
  category?: string;
}

const mockPlacesDatabase: PlaceResult[] = [
  {
    place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
    name: 'The Artisan Coffee House & Roastery',
    address: '42 MG Road, 12th Main, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pin_code: '560038',
    rating: 4.8,
    category: 'Restaurant & Cafe'
  },
  {
    place_id: 'ChIJP3Sa8ziYEmsRUKgyF81frY5',
    name: 'Apex Dental Care & Implant Clinic',
    address: 'Shop 14, Lotus Plaza, Linking Road, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pin_code: '400050',
    rating: 4.9,
    category: 'Dental & Medical Clinic'
  },
  {
    place_id: 'ChIJL5Sb7ziZEmsRUKhyE82frY6',
    name: 'Iron Forge Fitness Gym & Crossfit',
    address: 'Plot 88, Sector 29, Galleria Market Road',
    city: 'Gurugram',
    state: 'Haryana',
    pin_code: '122002',
    rating: 4.7,
    category: 'Gym & Fitness Center'
  },
  {
    place_id: 'ChIJK4Sa9ziAEmsRUKiyD83frY7',
    name: 'Luxe Salon & Aesthetics Spa',
    address: '15 Anna Salai, Opposite Panagal Park, T. Nagar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pin_code: '600017',
    rating: 4.9,
    category: 'Beauty Salon & Spa'
  },
  {
    place_id: 'ChIJM2Sa6ziBEmsRUKjyC84frY8',
    name: 'Golden Crust Bakehouse & Patisserie',
    address: '22 Park Street, Camac Street Junction',
    city: 'Kolkata',
    state: 'West Bengal',
    pin_code: '700016',
    rating: 4.8,
    category: 'Restaurant & Cafe'
  }
];

const indianLanguageList = [
  { value: 'Hindi', native: 'हिन्दी', search: 'hindi हिन्दी' },
  { value: 'Hinglish', native: 'Hindi in English Script', search: 'hinglish latin romanized' },
  { value: 'Marathi', native: 'मराठी', search: 'marathi मराठी' },
  { value: 'Gujarati', native: 'ગુજરાતી', search: 'gujarati ગુજરાતી' },
  { value: 'Bengali', native: 'বাংলা', search: 'bengali বাংলা' },
  { value: 'Tamil', native: 'தமிழ்', search: 'tamil தமிழ்' },
  { value: 'Telugu', native: 'తెలుగు', search: 'telugu తెలుగు' },
  { value: 'Kannada', native: 'ಕನ್ನಡ', search: 'kannada ಕನ್ನಡ' },
  { value: 'Malayalam', native: 'മലയാളം', search: 'malayalam മലയാളം' },
  { value: 'Punjabi', native: 'ਪੰਜਾਬੀ', search: 'punjabi ਪੰਜਾਬੀ' },
  { value: 'Odia', native: 'ଓଡ଼ିଆ', search: 'odia ଓଡ଼ିଆ' },
  { value: 'Assamese', native: 'অসমীয়া', search: 'assamese অসমীয়া' },
  { value: 'Urdu', native: 'اردو', search: 'urdu اردو' },
  { value: 'Sanskrit', native: 'संस्कृतम्', search: 'sanskrit संस्कृतम्' },
  { value: 'Maithili', native: 'मैथिली', search: 'maithili मैथिली' },
  { value: 'Konkani', native: 'कोंकणी', search: 'konkani कोंकणी' },
  { value: 'Sindhi', native: 'सिन्धी / سنڌي', search: 'sindhi' },
  { value: 'Nepali', native: 'नेपाली', search: 'nepali नेपाली' },
  { value: 'Dogri', native: 'डोगरी', search: 'dogri डोगरी' },
  { value: 'Kashmiri', native: 'कॉशुर / كأشُر', search: 'kashmiri' },
  { value: 'Bodo', native: 'बड़ो', search: 'bodo' },
  { value: 'Manipuri', native: 'মৈতৈলোন্', search: 'manipuri meitei' },
  { value: 'Santali', native: 'संथाली / ᱥᱟᱱᱛᱟᱲᱤ', search: 'santali' }
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  onComplete,
  onBackToHome,
  onNotify
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [setupMode, setSetupMode] = useState<'auto' | 'manual'>('auto');

  // Step 1 - Autocomplete
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);

  // Step 1 - Manual
  const [manualName, setManualName] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualReviewLink, setManualReviewLink] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualWebsite, setManualWebsite] = useState('');

  // Step 2 - Details
  const [businessType, setBusinessType] = useState('Restaurant & Cafe');
  const [customCategory, setCustomCategory] = useState('');
  const [monthlyCustomers, setMonthlyCustomers] = useState('50-200');
  const [discoverySource, setDiscoverySource] = useState('Google Search');

  // Step 2 - Tags
  const [products, setProducts] = useState<string[]>(['Specialty Coffee', 'Woodfired Pizza']);
  const [productInput, setProductInput] = useState('');
  const [staff, setStaff] = useState<string[]>(['Rahul', 'Priya']);
  const [staffInput, setStaffInput] = useState('');

  // Step 2 - Language Combobox
  const [language, setLanguage] = useState('English');
  const [langComboboxOpen, setLangComboboxOpen] = useState(false);
  const [langQuery, setLangQuery] = useState('');
  const [reviewLength, setReviewLength] = useState(200);

  // Step 3 - Flyer state
  const [showFlyerPreview, setShowFlyerPreview] = useState(false);

  const comboboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setLangComboboxOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search logic
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length >= 2) {
      setSearching(true);
      const timer = setTimeout(() => {
        setSearching(false);
        const q = query.toLowerCase();
        const matches = mockPlacesDatabase.filter(
          p => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q) || p.city.toLowerCase().includes(q)
        );
        if (matches.length > 0) {
          setSuggestions(matches);
        } else {
          setSuggestions([
            {
              place_id: `custom_${Date.now()}`,
              name: query,
              address: 'Commercial Hub, Main Street',
              city: 'Central City',
              state: 'Metro',
              pin_code: '110001',
              rating: 4.8,
              category: 'Retail Shop & E-Commerce'
            }
          ]);
        }
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setSearching(false);
    }
  };

  const handleSelectPlace = (place: PlaceResult) => {
    setSelectedPlace(place);
    setSearchQuery('');
    setSuggestions([]);
    if (place.category) {
      setBusinessType(place.category);
    }
  };

  // Tag inputs logic
  const handleAddProduct = () => {
    const val = productInput.trim();
    if (!val) return;
    if (products.length >= 5) {
      onNotify('Maximum 5 products allowed', 'warning');
      return;
    }
    if (!products.some(p => p.toLowerCase() === val.toLowerCase())) {
      setProducts([...products, val]);
      setProductInput('');
    }
  };

  const handleRemoveProduct = (idx: number) => {
    setProducts(products.filter((_, i) => i !== idx));
  };

  const handleAddStaff = () => {
    const val = staffInput.trim();
    if (!val) return;
    if (staff.length >= 5) {
      onNotify('Maximum 5 staff names allowed', 'warning');
      return;
    }
    if (!staff.some(s => s.toLowerCase() === val.toLowerCase())) {
      setStaff([...staff, val]);
      setStaffInput('');
    }
  };

  const handleRemoveStaff = (idx: number) => {
    setStaff(staff.filter((_, i) => i !== idx));
  };

  const isStep1Valid = setupMode === 'auto'
    ? !!selectedPlace
    : !!(manualName.trim() && manualAddress.trim() && manualReviewLink.trim());

  const activeBusinessName = setupMode === 'auto'
    ? (selectedPlace?.name || 'Your Business')
    : (manualName || 'Your Business');

  const reviewFunnelUrl = `https://reviewflowai.in/r/${encodeURIComponent(activeBusinessName.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 font-sans flex items-center justify-center p-3 sm:p-6 pt-24 sm:pt-28 relative">
      {/* Background ambient gradient glow */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 z-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 50% 0%, rgba(52, 168, 83, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 80% 90%, rgba(52, 168, 83, 0.04) 0%, transparent 50%)
          `
        }}
      />

      <div className="w-full max-w-[650px] relative z-10 mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#34A853] to-[#2D9248] flex items-center justify-center mx-auto mb-1.5 shadow-md shadow-emerald-500/25">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="white" />
            </svg>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Set Up Your Business</h1>
          <p className="text-xs text-slate-400 font-medium">Onboarding Wizard · 2 minutes</p>
        </div>

        {/* Step Indicators (Premium Redesign) */}
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-4 py-2 mb-3.5 shadow-sm">
          {/* Step 1 */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
              step === 1
                ? 'bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white shadow-sm scale-105'
                : step > 1
                ? 'bg-[#34A853] text-white'
                : 'bg-slate-100 text-slate-400 border border-slate-200'
            }`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <div className="flex flex-col text-left leading-tight min-w-0">
              <span className={`text-[9px] uppercase font-bold tracking-wider ${step === 1 ? 'text-emerald-700' : 'text-slate-400'}`}>Step 1</span>
              <span className={`text-xs font-bold truncate ${step === 1 ? 'text-slate-900' : step > 1 ? 'text-emerald-800' : 'text-slate-400'}`}>
                Find Business
              </span>
            </div>
          </div>

          <div className="h-0.5 w-8 sm:w-16 bg-slate-200 mx-2 rounded relative overflow-hidden shrink-0">
            <div className={`h-full bg-gradient-to-r from-[#34A853] to-[#2D9248] transition-all duration-300 ${step >= 2 ? 'w-full' : 'w-0'}`} />
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
              step === 2
                ? 'bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white shadow-sm scale-105'
                : step > 2
                ? 'bg-[#34A853] text-white'
                : 'bg-slate-100 text-slate-400 border border-slate-200'
            }`}>
              {step > 2 ? '✓' : '2'}
            </div>
            <div className="flex flex-col text-left leading-tight min-w-0">
              <span className={`text-[9px] uppercase font-bold tracking-wider ${step === 2 ? 'text-emerald-700' : 'text-slate-400'}`}>Step 2</span>
              <span className={`text-xs font-bold truncate ${step === 2 ? 'text-slate-900' : step > 2 ? 'text-emerald-800' : 'text-slate-400'}`}>
                Profile Info
              </span>
            </div>
          </div>

          <div className="h-0.5 w-8 sm:w-16 bg-slate-200 mx-2 rounded relative overflow-hidden shrink-0">
            <div className={`h-full bg-gradient-to-r from-[#34A853] to-[#2D9248] transition-all duration-300 ${step === 3 ? 'w-full' : 'w-0'}`} />
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-2 shrink-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
              step === 3
                ? 'bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white shadow-sm scale-105'
                : 'bg-slate-100 text-slate-400 border border-slate-200'
            }`}>
              3
            </div>
            <div className="flex flex-col text-left leading-tight hidden sm:flex">
              <span className={`text-[9px] uppercase font-bold tracking-wider ${step === 3 ? 'text-emerald-700' : 'text-slate-400'}`}>Step 3</span>
              <span className={`text-xs font-bold ${step === 3 ? 'text-slate-900' : 'text-slate-400'}`}>
                Get QR Code
              </span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xl shadow-slate-900/5">
          {/* ═══════ STEP 1: FIND YOUR BUSINESS ═══════ */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mb-0.5">Step 1: Find Your Business</h3>
                <p className="text-xs text-slate-400">
                  Search for your Google Business Profile to automatically pull in your details for a faster setup.
                </p>
              </div>

              {/* Instructional Banner */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 border-l-4 border-l-emerald-600 rounded-xl p-3 flex gap-3 items-start text-xs text-left">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">How to find your business:</p>
                  <ol className="text-slate-600 list-decimal pl-4 space-y-0.5 text-[11px] leading-relaxed">
                    <li>Type your <strong>business name</strong> in the search box below.</li>
                    <li>Select the correct result from the <strong>dropdown list</strong>.</li>
                    <li>Confirm the details in the <strong>preview card</strong> that appears.</li>
                    <li>Click <strong>Next Step &rarr;</strong> to continue.</li>
                  </ol>
                  <p className="text-[11px] text-emerald-800 font-semibold pt-0.5">
                    💡 Can't find your business? Use <strong>Manual Setup</strong> mode to enter details yourself.
                  </p>
                </div>
              </div>

              {/* Setup Mode Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSetupMode('auto')}
                  className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                    setupMode === 'auto'
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                      setupMode === 'auto' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <i className="fa-solid fa-magnifying-glass"></i>
                    </div>
                    <div>
                      <strong className="block text-xs text-slate-900">Automatic Setup</strong>
                      <span className="text-[10px] text-slate-400">Google Business Search</span>
                    </div>
                  </div>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    setupMode === 'auto' ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                  }`}>✓</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSetupMode('manual')}
                  className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                    setupMode === 'manual'
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                      setupMode === 'manual' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <i className="fa-solid fa-pen-to-square"></i>
                    </div>
                    <div>
                      <strong className="block text-xs text-slate-900">Manual Setup</strong>
                      <span className="text-[10px] text-slate-400">Custom Review URL</span>
                    </div>
                  </div>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    setupMode === 'manual' ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                  }`}>✓</span>
                </button>
              </div>

              {/* Automatic Search Container */}
              {setupMode === 'auto' ? (
                <div className="space-y-3 text-left">
                  <div className="relative">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Search Business Name or Address
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Type your business name (e.g. Cafe, Clinic, Dental)..."
                      className="w-full text-xs p-2.5 pl-8 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    />
                    <i className="fa-solid fa-search absolute left-2.5 top-8 text-slate-400 text-xs pointer-events-none"></i>

                    {/* Suggestions Box */}
                    {searching && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 p-3 flex items-center gap-2 text-xs text-slate-500">
                        <div className="w-3.5 h-3.5 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
                        <span>Searching for business information...</span>
                      </div>
                    )}

                    {suggestions.length > 0 && !searching && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-64 overflow-y-auto divide-y divide-slate-100">
                        {suggestions.map((item) => (
                          <div
                            key={item.place_id}
                            onClick={() => handleSelectPlace(item)}
                            className="p-3 hover:bg-emerald-50/70 cursor-pointer transition-colors text-left"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                                {item.name}
                              </span>
                              {item.pin_code && (
                                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                  📍 PIN: {item.pin_code}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1 pl-4 space-y-0.5">
                              <div><strong className="text-slate-400">Address:</strong> {item.address}</div>
                              <div className="flex gap-2 flex-wrap items-center pt-0.5">
                                <span><strong className="text-slate-400">City:</strong> <span className="bg-slate-100 px-1.5 py-0.2 rounded font-semibold text-slate-700">{item.city}</span></span>
                                <span><strong className="text-slate-400">State:</strong> <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">{item.state}</span></span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Preview Card */}
                  {selectedPlace && (
                    <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-3.5 space-y-1.5 text-left animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          {selectedPlace.name}
                          {selectedPlace.rating && (
                            <span className="text-amber-600 font-extrabold text-[11px]">
                              ★ {selectedPlace.rating}
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedPlace(null)}
                          className="px-2 py-0.5 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 cursor-pointer"
                        >
                          ✕ Remove
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-600">{selectedPlace.address}, {selectedPlace.city}, {selectedPlace.state}</p>
                      <div className="flex gap-2 flex-wrap pt-1">
                        <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-500">
                          Place ID: {selectedPlace.place_id}
                        </span>
                        {selectedPlace.pin_code && (
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                            Pin Code: {selectedPlace.pin_code}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Manual Entry Container */
                <div className="space-y-3 text-left">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="E.g. Joe's Cafe"
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Address / Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={manualAddress}
                      onChange={(e) => setManualAddress(e.target.value)}
                      placeholder="E.g. 123 Main St, Indiranagar, Bengaluru"
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Custom Review Link *
                    </label>
                    <input
                      type="url"
                      required
                      value={manualReviewLink}
                      onChange={(e) => setManualReviewLink(e.target.value)}
                      placeholder="https://search.google.com/local/writereview?placeid=..."
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Paste your Google Review Link, Facebook Review Link, or custom destination link.
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Website (Optional)
                      </label>
                      <input
                        type="url"
                        value={manualWebsite}
                        onChange={(e) => setManualWebsite(e.target.value)}
                        placeholder="https://joescafe.com"
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={manualPhone}
                        onChange={(e) => setManualPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!isStep1Valid}
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white font-extrabold text-xs rounded-xl shadow-md disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  Next Step &rarr;
                </button>
              </div>
            </div>
          )}

          {/* ═══════ STEP 2: PROFILE INFO & AI CUSTOMIZATION ═══════ */}
          {step === 2 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep(3);
                onNotify('Your review funnel and QR Code are generated successfully!', 'success');
              }}
              className="space-y-3.5 text-left animate-fadeIn"
            >
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mb-0.5">Step 2: Tell Us More</h3>
                <p className="text-xs text-slate-400">
                  Select your industry and estimate your customer volume so we can personalize your dashboard experience.
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 leading-relaxed font-medium">
                💡 This information is used by our AI to generate more personalized customer review options matching your business. You can update or change these details at any time from the <strong>Review Settings</strong> page.
              </div>

              <div className="form-group">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Business Type / Industry
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold bg-white cursor-pointer"
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
                  <option value="Other">Other (Specify)</option>
                </select>
              </div>

              {businessType === 'Other' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Specify Your Industry
                  </label>
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="E.g. Pet Grooming Shop"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Estimated Monthly Customers
                  </label>
                  <select
                    value={monthlyCustomers}
                    onChange={(e) => setMonthlyCustomers(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium bg-white"
                  >
                    <option value="1-50">1 – 50 customers</option>
                    <option value="50-200">50 – 200 customers</option>
                    <option value="200-500">200 – 500 customers</option>
                    <option value="500+">500+ customers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    How did you hear about us?
                  </label>
                  <select
                    value={discoverySource}
                    onChange={(e) => setDiscoverySource(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium bg-white"
                  >
                    <option value="Google Search">Google Search</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Word of Mouth">Word of Mouth / Referral</option>
                    <option value="Advertisement">Advertisement</option>
                  </select>
                </div>
              </div>

              {/* Tag Input: Products */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Top Products or Services (Max 5)
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">{products.length}/5</span>
                </div>
                <div className="border border-slate-300 rounded-xl p-2 min-h-[44px] flex flex-wrap gap-1.5 items-center bg-white focus-within:border-emerald-500">
                  {products.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(idx)}
                        className="text-emerald-500 hover:text-red-500 cursor-pointer text-xs"
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
                          handleAddProduct();
                        }
                      }}
                      onBlur={handleAddProduct}
                      placeholder="Type item and press Enter..."
                      className="flex-1 min-w-[120px] text-xs outline-none bg-transparent"
                    />
                  )}
                </div>
                {products.length >= 5 && (
                  <span className="text-[10px] text-amber-600 font-semibold mt-0.5 block">
                    ⚠️ Maximum of 5 products or services reached.
                  </span>
                )}
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Enter your top 5 products or services (separated by comma or enter).
                </span>
              </div>

              {/* Tag Input: Staff */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Staff Names (Max 5)
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">{staff.length}/5</span>
                </div>
                <div className="border border-slate-300 rounded-xl p-2 min-h-[44px] flex flex-wrap gap-1.5 items-center bg-white focus-within:border-emerald-500">
                  {staff.map((name, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      {name}
                      <button
                        type="button"
                        onClick={() => handleRemoveStaff(idx)}
                        className="text-emerald-500 hover:text-red-500 cursor-pointer text-xs"
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
                          handleAddStaff();
                        }
                      }}
                      onBlur={handleAddStaff}
                      placeholder="Type staff name and press Enter..."
                      className="flex-1 min-w-[120px] text-xs outline-none bg-transparent"
                    />
                  )}
                </div>
                {staff.length >= 5 && (
                  <span className="text-[10px] text-amber-600 font-semibold mt-0.5 block">
                    ⚠️ Maximum of 5 staff names reached.
                  </span>
                )}
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Add name of staff members so the AI can feature them in generated reviews.
                </span>
              </div>

              {/* Language & Length */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Searchable Combobox Component */}
                <div className="relative" ref={comboboxRef}>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Review Language
                  </label>
                  <button
                    type="button"
                    onClick={() => setLangComboboxOpen(!langComboboxOpen)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl flex items-center justify-between text-xs font-semibold bg-white cursor-pointer hover:border-slate-400"
                  >
                    <span>{language}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>

                  {langComboboxOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-2 max-h-60 overflow-y-auto">
                      <div className="relative mb-2">
                        <input
                          type="text"
                          value={langQuery}
                          onChange={(e) => setLangQuery(e.target.value)}
                          placeholder="Search language (Hindi, Marathi, English...)"
                          className="w-full text-xs p-1.5 pl-6 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                        />
                        <i className="fa-solid fa-search absolute left-2 top-2 text-[10px] text-slate-400"></i>
                      </div>

                      <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 bg-slate-50 rounded">
                        Indian Languages
                      </div>
                      <div className="space-y-0.5 mt-1">
                        {indianLanguageList
                          .filter(l => l.search.toLowerCase().includes(langQuery.toLowerCase()) || l.value.toLowerCase().includes(langQuery.toLowerCase()))
                          .map(item => (
                            <div
                              key={item.value}
                              onClick={() => {
                                setLanguage(item.value);
                                setLangComboboxOpen(false);
                              }}
                              className={`p-1.5 text-xs rounded-lg cursor-pointer flex justify-between items-center ${
                                language === item.value ? 'bg-emerald-100 text-emerald-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <span>{item.value}</span>
                              <span className="text-[11px] text-slate-400 font-normal">{item.native}</span>
                            </div>
                          ))}
                      </div>

                      <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 bg-slate-50 rounded mt-2">
                        General / Global
                      </div>
                      <div className="space-y-0.5 mt-1">
                        <div
                          onClick={() => {
                            setLanguage('English');
                            setLangComboboxOpen(false);
                          }}
                          className={`p-1.5 text-xs rounded-lg cursor-pointer flex justify-between items-center ${
                            language === 'English' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>English</span>
                          <span className="text-[11px] text-slate-400 font-normal">English</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Supports all 22 Eighth Schedule Indian languages + Hinglish + Global.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Review Length (Chars)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="600"
                    required
                    value={reviewLength}
                    onChange={(e) => setReviewLength(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Target review length (recommended: 200–350).
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  &larr; Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  Generate My Funnel &rarr;
                </button>
              </div>
            </form>
          )}

          {/* ═══════ STEP 3: QR CODE & FLYER READY ═══════ */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn text-center">
              <h3 className="text-xl font-black text-slate-900 flex items-center justify-center gap-2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Your QR Code Is Ready
              </h3>
              <p className="text-xs text-slate-400">
                Your review funnel has been successfully configured! Access your QR code flyer and our AI-powered features below.
              </p>

              {/* Section 1: Magic Review QR Box */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 text-left shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">
                    ✓
                  </span>
                  Magic Review QR
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  QR code review funnel is active. Display it on tables, receipts, or counters to instantly gather 5-star Google reviews from customers.
                </p>

                {/* QR Display Layout */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(reviewFunnelUrl)}`}
                      alt="Review QR Code"
                      className="w-32 h-32 rounded-lg"
                    />
                    <span className="text-[10px] font-bold text-emerald-700 mt-2 flex items-center gap-1">
                      <i className="fa-solid fa-wand-magic-sparkles text-[9px]"></i> AI Powered
                    </span>
                  </div>

                  <div className="space-y-2 text-left flex-1 w-full">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Direct Review Link
                      </span>
                      <div className="flex gap-1.5 mt-0.5">
                        <input
                          type="text"
                          readOnly
                          value={reviewFunnelUrl}
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 select-all font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(reviewFunnelUrl);
                            onNotify('Review link copied to clipboard!', 'success');
                          }}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer shrink-0 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-1 pt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>🏢 <strong>Business:</strong> {activeBusinessName}</div>
                      <div>🌐 <strong>Language:</strong> {language}</div>
                      <div>✨ <strong>AI Keywords:</strong> {products.slice(0, 3).join(', ')}</div>
                    </div>
                  </div>
                </div>

                {/* Flyer Preview Toggle */}
                <div className="pt-2 border-t border-slate-100 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setShowFlyerPreview(!showFlyerPreview)}
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-file-pdf"></i>
                    {showFlyerPreview ? 'Hide Flyer Preview' : 'Show A6 Standee Flyer Preview'}
                  </button>

                  {showFlyerPreview && (
                    <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl w-full max-w-xs flex flex-col items-center animate-fadeIn text-center">
                      <div className="bg-white border-2 border-emerald-500 rounded-xl p-4 shadow-md w-full space-y-2">
                        <div className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">Leave Us A Review</div>
                        <h4 className="text-sm font-black text-slate-900">{activeBusinessName}</h4>
                        <div className="flex justify-center text-amber-400 text-xs">★★★★★</div>
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(reviewFunnelUrl)}`}
                          alt="Flyer QR"
                          className="w-28 h-28 mx-auto rounded-lg border border-slate-200 p-1"
                        />
                        <p className="text-[9px] text-slate-500 leading-tight">
                          Scan with your camera to leave a quick 5-star Google review with 1-tap AI assistance!
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="mt-3 px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 cursor-pointer"
                      >
                        <i className="fa-solid fa-print"></i> Print Flyer
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Go to Dashboard CTA */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onComplete}
                  className="w-full py-3 bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  Go to Dashboard
                </button>
                <p className="text-[11px] text-slate-400 mt-2">
                  Your QR code and all features are ready in the dashboard.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
