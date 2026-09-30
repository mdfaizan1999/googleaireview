import React, { useState } from 'react';

interface PhysicalStandViewProps {
  businessName?: string;
  onNavigateToDigitalQR: () => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

interface ProductItem {
  id: string;
  name: string;
  badge: { text: string; icon: string; style: string };
  price: number;
  originalPrice: number;
  savePercent: number;
  unitText: string;
  description: string;
  features: string[];
  dispatchNote: string;
  images: string[];
}

const products: ProductItem[] = [
  {
    id: 'plastic_stand',
    name: 'QR Code Plastic Stand',
    badge: { text: 'Most Popular', icon: 'fa-bolt', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    price: 499,
    originalPrice: 899,
    savePercent: 44,
    unitText: '/ unit',
    description: 'Crystal-clear scratch-resistant acrylic L-stand. Ideal for cash counters, billing desks, and reception areas.',
    features: [
      'Premium high-clarity transparent acrylic',
      'Scratch & waterproof UV-cure print',
      'Angled ergonomic tilt for easy mobile scans'
    ],
    dispatchNote: 'Prepaid Order • Fast Dispatch in 24h',
    images: [
      'https://reviewflowai.in/uploads/products/plastic1.jpeg',
      'https://reviewflowai.in/uploads/products/plastic2.jpeg',
      'https://reviewflowai.in/uploads/products/plastic3.jpeg'
    ]
  },
  {
    id: 'wooden_stand',
    name: 'QR Code Acrylic Stand',
    badge: { text: 'Premium Executive', icon: 'fa-gem', style: 'bg-slate-900 text-white border-slate-700' },
    price: 699,
    originalPrice: 1199,
    savePercent: 42,
    unitText: '/ unit',
    description: 'Polished solid mahogany wood base with acrylic cardholder. Perfect for upscale salons, luxury hotels, clinics & cafes.',
    features: [
      'Hand-finished natural weighted wood base',
      'Ultra high-definition vibrant color print',
      'Weighted anti-topple counter design'
    ],
    dispatchNote: 'Prepaid Order • Fast Dispatch in 24h',
    images: [
      'https://reviewflowai.in/uploads/products/acralic1.jpeg',
      'https://reviewflowai.in/uploads/products/acralic2.jpeg',
      'https://reviewflowai.in/uploads/products/acralic3.jpeg'
    ]
  },
  {
    id: 'paper_tent',
    name: 'QR Code Paper Tent (Pack of 10+)',
    badge: { text: 'Multi-Table Pack', icon: 'fa-layer-group', style: 'bg-blue-50 text-blue-700 border-blue-200' },
    price: 499,
    originalPrice: 999,
    savePercent: 50,
    unitText: '/ pack (10 pcs)',
    description: 'Self-standing laminated heavy cardstock tents. Lightweight, foldable, and ideal for multi-table restaurant dining.',
    features: [
      'Value pack of 10+ folded paper tents',
      '350 GSM matte laminated spill-proof cardstock',
      'Dual-sided 360° QR code customer visibility'
    ],
    dispatchNote: 'Pack of 10+ • Free Shipping',
    images: [
      'https://reviewflowai.in/uploads/products/Paper1.jpeg',
      'https://reviewflowai.in/uploads/products/Paper2.jpeg',
      'https://reviewflowai.in/uploads/products/Paper3.jpeg'
    ]
  }
];

export const PhysicalStandView: React.FC<PhysicalStandViewProps> = ({
  businessName = 'Muzaffarabad azad jamu and kashmir',
  onNavigateToDigitalQR,
  onNotify
}) => {
  // Slide index per product
  const [slideIndexes, setSlideIndexes] = useState<Record<string, number>>({
    plastic_stand: 0,
    wooden_stand: 0,
    paper_tent: 0
  });

  // Checkout flow state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem>(products[0]);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);

  // Step 1 Form fields
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('harsh');
  const [mobileNumber, setMobileNumber] = useState('+91 8877307350');
  const [shopName, setShopName] = useState('');
  const [businessDisplayName, setBusinessDisplayName] = useState(businessName);
  const [addressLine, setAddressLine] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');

  // Step 2 Form fields
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const moveSlide = (productId: string, direction: number, maxImages: number) => {
    setSlideIndexes(prev => {
      const current = prev[productId] || 0;
      let next = current + direction;
      if (next >= maxImages) next = 0;
      if (next < 0) next = maxImages - 1;
      return { ...prev, [productId]: next };
    });
  };

  const handleOpenCheckout = (product: ProductItem) => {
    setSelectedProduct(product);
    setQuantity(1);
    setCheckoutStep(1);
    setCheckoutOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('laba.das@federal');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !mobileNumber || !shopName || !businessDisplayName || !addressLine || !city || !state || !pinCode) {
      onNotify('Please complete all required delivery details.', 'warning');
      return;
    }
    setCheckoutStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber || utrNumber.trim().length < 8) {
      onNotify('Please enter a valid 12-digit UPI transaction reference / UTR number.', 'warning');
      return;
    }
    setOrderConfirmed(true);
    onNotify(`Order confirmed for ${selectedProduct.name}! Verification in progress.`, 'success');
  };

  const totalPayable = selectedProduct.price * quantity;

  return (
    <div className="space-y-4 animate-fadeIn text-left max-w-7xl mx-auto">
      {/* ═══════ SAAS HERO HEADER ═══════ */}
      <section className="relative overflow-hidden p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 shadow-xs text-xl">
            <i className="fa-solid fa-store"></i>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                Physical QR Stands
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                <i className="fa-solid fa-truck-fast"></i> 7–10 Day Delivery
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                <i className="fa-solid fa-qrcode"></i> Custom Google Link
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Turn walk-in visitors into 5-star Google reviews with custom-branded, high-durability countertop displays.
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToDigitalQR}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-emerald-700 font-extrabold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <i className="fa-solid fa-palette text-emerald-600"></i>
          Digital QR Center
        </button>
      </section>

      {/* ═══════ IF CHECKOUT OPEN: 2-STEP INTERACTIVE CHECKOUT ═══════ */}
      {checkoutOpen ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl animate-fadeIn space-y-5">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setCheckoutOpen(false);
                setOrderConfirmed(false);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs cursor-pointer transition-all"
            >
              <i className="fa-solid fa-arrow-left"></i> Back to Formats
            </button>
            <div className="text-right">
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block">
                Step-by-Step Checkout
              </span>
              <h2 className="text-base font-black text-slate-900">
                Complete Your QR Stand Order
              </h2>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className={`flex items-center gap-2 text-xs font-black ${checkoutStep === 1 ? 'text-emerald-700' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${checkoutStep === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                1
              </span>
              Shipping &amp; Recipient Info
            </div>
            <div className="flex-1 h-0.5 bg-slate-200 mx-4"></div>
            <div className={`flex items-center gap-2 text-xs font-black ${checkoutStep === 2 ? 'text-emerald-700' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${checkoutStep === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                2
              </span>
              Prepaid UPI Payment
            </div>
          </div>

          {/* Order Confirmed State */}
          {orderConfirmed ? (
            <div className="p-8 text-center space-y-4 bg-emerald-50/40 border border-emerald-200 rounded-2xl">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl mx-auto">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">Order Received &amp; Verification in Progress!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Thank you, <strong>{customerName}</strong>! Your order for <strong>{quantity}x {selectedProduct.name}</strong> (UTR: <code className="font-mono bg-white px-1.5 py-0.5 rounded border">{utrNumber}</code>) has been submitted. Our concierge team is verifying the transaction and will dispatch your custom-manufactured stand in 24–48 hours.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCheckoutOpen(false);
                    setOrderConfirmed(false);
                  }}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-extrabold text-xs cursor-pointer shadow-md hover:bg-emerald-700"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : checkoutStep === 1 ? (
            /* STEP 1: Shipping and Delivery */
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              {/* Product Summary Bar */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">
                    Selected Stand Model
                  </span>
                  <div className="text-sm font-black text-slate-900">{selectedProduct.name}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Unit Price</span>
                    <div className="text-sm font-black text-slate-900">₹{selectedProduct.price}</div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-xs p-1.5 border border-slate-300 bg-white rounded-lg font-black text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">10-Digit Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shop / Outlet Name *</label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="Shop #12, Ground Floor"
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Business Display Name *</label>
                  <input
                    type="text"
                    required
                    value={businessDisplayName}
                    onChange={(e) => setBusinessDisplayName(e.target.value)}
                    placeholder="e.g. Cafe Delight"
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Delivery Address *</label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="Street name, Area, Building name, Flat number"
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nearby Landmark</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Opposite Hospital"
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">6-Digit PIN *</label>
                  <input
                    type="text"
                    required
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="e.g. 110001"
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Order Total Summary Box */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Total Payable Amount:</span>
                  <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1 mt-0.5">
                    <i className="fa-solid fa-circle-check"></i> Includes 18% GST &amp; Free Express Delivery
                  </div>
                </div>
                <span className="text-2xl font-black text-emerald-800">₹{totalPayable.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(false)}
                  className="flex-1 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-2 py-3 bg-gradient-to-r from-[#16A34A] to-[#15803D] text-white rounded-xl font-extrabold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  Proceed to Payment &amp; QR &rarr;
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: Payment and UTR */
            <form onSubmit={handleConfirmOrder} className="space-y-4">
              <div className="p-4 bg-emerald-50 border-l-4 border-l-emerald-600 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-950 font-medium leading-relaxed">
                <i className="fa-solid fa-shield-halved text-emerald-600 text-base mt-0.5"></i>
                <span>This is a prepaid order. Your physical stand will be custom-manufactured with your verified Google review QR link upon transaction verification.</span>
              </div>

              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <i className="fa-solid fa-qrcode text-emerald-600 text-lg"></i>
                  <h3 className="text-sm font-black text-slate-900">Scan &amp; Pay via any UPI App</h3>
                </div>

                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Please complete the payment of <strong>₹{totalPayable.toLocaleString('en-IN')}</strong> to the UPI ID or scan the QR code below. Once payment is completed, enter the UTR / Transaction Reference Number below.
                </p>

                {/* QR Code Container */}
                <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm inline-block mx-auto">
                  <img
                    src="https://reviewflowai.in/uploads/img/payment_qr_1783167408.jpeg"
                    alt="UPI QR Code"
                    className="w-48 h-48 object-contain mx-auto"
                  />
                  <span className="text-[10px] text-slate-500 font-bold block mt-2">
                    GPay &bull; PhonePe &bull; Paytm &bull; BHIM &bull; Cred
                  </span>
                </div>

                {/* Copyable UPI Box */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex flex-col items-center max-w-sm mx-auto">
                  <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider">
                    Official Merchant UPI ID
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="text-base font-black text-slate-900 flex items-center gap-2 mt-0.5 cursor-pointer hover:text-blue-700"
                  >
                    laba.das@federal
                    <i className="fa-regular fa-copy text-xs text-blue-600"></i>
                  </button>
                  <span className="text-[10px] text-blue-600 font-bold mt-1">
                    {copiedUpi ? '✓ Copied to clipboard!' : 'Click UPI ID above to copy'}
                  </span>
                </div>

                {/* Amount to transfer */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between max-w-sm mx-auto text-left">
                  <span className="text-xs font-bold text-slate-700">Total Order Amount:</span>
                  <span className="text-lg font-black text-emerald-800">₹{totalPayable.toLocaleString('en-IN')}</span>
                </div>

                {/* UTR Input */}
                <div className="max-w-sm mx-auto text-left">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Transaction Reference ID (12-digit UTR) *
                  </label>
                  <input
                    type="text"
                    required
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 423891234567"
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-mono tracking-wider outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Find the 12-digit UTR / UPI Ref ID in your payment receipt on GPay, PhonePe or Paytm.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutStep(1)}
                  className="flex-1 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-50"
                >
                  &larr; Back to Details
                </button>
                <button
                  type="submit"
                  className="flex-2 py-3 bg-gradient-to-r from-[#16A34A] to-[#15803D] text-white rounded-xl font-extrabold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <i className="fa-solid fa-circle-check"></i> Submit &amp; Confirm Order
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* ═══════ CATALOG VIEW: 3 FORMATS ═══════ */
        <div className="space-y-4">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div>
              <span className="text-[10px] uppercase font-extrabold text-emerald-700 tracking-wider block mb-0.5">
                Display Collection
              </span>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">Choose Your Physical QR Display</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                  3 Formats
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Select the display style that best fits your counter, reception desk, or table setup.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
                <i className="fa-solid fa-qrcode text-emerald-600"></i> Custom Review QR
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
                <i className="fa-solid fa-truck-fast text-emerald-600"></i> 7–10 Day Delivery
              </span>
            </div>
          </div>

          {/* 3 Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((prod) => {
              const currentSlide = slideIndexes[prod.id] || 0;
              return (
                <div
                  key={prod.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Top Badge */}
                  <div className="mb-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${prod.badge.style}`}>
                      <i className={`fa-solid ${prod.badge.icon}`}></i> {prod.badge.text}
                    </span>
                  </div>

                  {/* Image Slider Frame */}
                  <div className="relative w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-200 mb-3 group">
                    <div className="w-full flex items-center justify-center p-2 min-h-[220px]">
                      <img
                        src={prod.images[currentSlide]}
                        alt={prod.name}
                        className="w-full h-48 object-contain rounded-lg"
                      />
                    </div>

                    {/* Navigation Arrows */}
                    <button
                      type="button"
                      onClick={() => moveSlide(prod.id, -1, prod.images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center text-xs cursor-pointer opacity-80 hover:opacity-100 transition-all"
                    >
                      &#10094;
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSlide(prod.id, 1, prod.images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center text-xs cursor-pointer opacity-80 hover:opacity-100 transition-all"
                    >
                      &#10095;
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
                      {prod.images.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSlideIndexes(prev => ({ ...prev, [prod.id]: i }))}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${currentSlide === i ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-2 flex-1 flex flex-col">
                    <h3 className="text-sm font-black text-slate-900 leading-snug">{prod.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{prod.description}</p>

                    <ul className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 my-2 text-[11px] text-slate-700">
                      {prod.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[9px] flex items-center justify-center shrink-0">
                            ✓
                          </span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 mb-3">
                        <i className="fa-solid fa-box-open"></i> {prod.dispatchNote}
                      </span>

                      {/* Pricing & CTA */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-slate-900">₹{prod.price}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{prod.unitText}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 line-through">
                            ₹{prod.originalPrice} (Save {prod.savePercent}%)
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenCheckout(prod)}
                          className="px-4 py-2 bg-gradient-to-r from-[#16A34A] to-[#15803D] text-white rounded-xl font-extrabold text-xs shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer hover:-translate-y-0.5"
                        >
                          <i className="fa-solid fa-bag-shopping"></i> Order Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ═══════ SAAS BENEFITS STRIP ═══════ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-sm shrink-0">
                <i className="fa-solid fa-bullseye"></i>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Custom Google Link</h4>
                <p className="text-[11px] text-slate-400">Pre-encoded with verified review link</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-sm shrink-0">
                <i className="fa-solid fa-award"></i>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Premium Quality</h4>
                <p className="text-[11px] text-slate-400">Scratch-resistant &amp; waterproof</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-sm shrink-0">
                <i className="fa-solid fa-truck-fast"></i>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Fast Tracked Delivery</h4>
                <p className="text-[11px] text-slate-400">Doorstep shipping with tracking</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-sm shrink-0">
                <i className="fa-solid fa-headset"></i>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Dedicated Support</h4>
                <p className="text-[11px] text-slate-400">Direct WhatsApp help for all orders</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
