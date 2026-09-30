import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface FlyerDesignerProps {
  onNotify?: (msg: string, type?: 'success' | 'info') => void;
}

export const QrFlyerDesigner: React.FC<FlyerDesignerProps> = ({ onNotify }) => {
  const [businessName, setBusinessName] = useState('Urban Spice Bistro');
  const [headline, setHeadline] = useState('Rate Us on Google');
  const [subtext, setSubtext] = useState('Scan to share your experience & help us grow!');
  const [colorTheme, setColorTheme] = useState<'emerald' | 'blue' | 'purple' | 'amber' | 'slate'>('emerald');
  const [targetUrl, setTargetUrl] = useState('https://reviewflowai.in/review/urban-spice');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [format, setFormat] = useState<'a6' | 'tent' | 'sticker'>('a6');
  const printableRef = useRef<HTMLDivElement>(null);

  // Generate QR code on input change
  useEffect(() => {
    QRCode.toDataURL(
      targetUrl,
      {
        width: 300,
        margin: 1,
        color: {
          dark: colorTheme === 'emerald' ? '#15803D' : colorTheme === 'blue' ? '#1D4ED8' : colorTheme === 'purple' ? '#6D28D9' : colorTheme === 'amber' ? '#B45309' : '#0F172A',
          light: '#FFFFFF'
        }
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [targetUrl, colorTheme]);

  const handlePrint = () => {
    window.print();
    if (onNotify) onNotify('Print dialog opened! Choose your printer or Save as PDF.', 'info');
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${businessName.toLowerCase().replace(/\s+/g, '-')}-qr-flyer.png`;
    a.click();
    if (onNotify) onNotify('QR Code asset downloaded successfully!', 'success');
  };

  const colorStyles = {
    emerald: {
      border: 'border-emerald-500',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      button: 'bg-emerald-600',
      accent: '#34A853'
    },
    blue: {
      border: 'border-blue-500',
      badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
      button: 'bg-blue-600',
      accent: '#2563EB'
    },
    purple: {
      border: 'border-purple-500',
      badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
      button: 'bg-purple-600',
      accent: '#7C3AED'
    },
    amber: {
      border: 'border-amber-500',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      button: 'bg-amber-600',
      accent: '#D97706'
    },
    slate: {
      border: 'border-slate-800',
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
      button: 'bg-slate-900',
      accent: '#0F172A'
    }
  };

  const currentStyle = colorStyles[colorTheme];

  return (
    <section id="flyer-designer" className="py-20 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold uppercase tracking-wider mb-3">
          <i className="fa-solid fa-print"></i>
          Marketing Material Generator
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Custom <span className="bg-gradient-to-r from-[#34A853] to-[#15803D] bg-clip-text text-transparent">Print-Ready QR Flyers</span>
        </h2>
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
          Design high-resolution table tents, checkout counter standees, and stickers matching your exact store branding.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Controls */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <i className="fa-solid fa-sliders text-emerald-600"></i>
            Flyer Customization Panel
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Card Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bottom Instruction Tagline
            </label>
            <input
              type="text"
              value={subtext}
              onChange={(e) => setSubtext(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Brand Accent Palette
            </label>
            <div className="flex gap-2.5">
              {[
                { id: 'emerald', label: 'Green', hex: '#34A853' },
                { id: 'blue', label: 'Blue', hex: '#2563EB' },
                { id: 'purple', label: 'Purple', hex: '#7C3AED' },
                { id: 'amber', label: 'Amber', hex: '#D97706' },
                { id: 'slate', label: 'Dark', hex: '#0F172A' }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColorTheme(c.id as any)}
                  className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                    colorTheme === c.id ? 'scale-110 border-slate-900 shadow-md' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                >
                  {colorTheme === c.id && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Standee Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setFormat('a6')}
                className={`py-2 text-xs font-bold rounded-xl border text-center transition-colors cursor-pointer ${
                  format === 'a6' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                A6 Standee
              </button>
              <button
                onClick={() => setFormat('tent')}
                className={`py-2 text-xs font-bold rounded-xl border text-center transition-colors cursor-pointer ${
                  format === 'tent' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Table Tent
              </button>
              <button
                onClick={() => setFormat('sticker')}
                className={`py-2 text-xs font-bold rounded-xl border text-center transition-colors cursor-pointer ${
                  format === 'sticker' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Sticker
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <i className="fa-solid fa-print"></i> Print Standee
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 py-2.5 bg-white border border-slate-300 hover:border-emerald-500 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <i className="fa-solid fa-download"></i> Download PNG
            </button>
          </div>
        </div>

        {/* Live Preview Display Card (Simulating high-res printed standee) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
            Live Print &amp; Standee Preview (A6 Format)
          </div>

          <div
            ref={printableRef}
            className={`w-[300px] sm:w-[320px] bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-4 ${currentStyle.border} text-center flex flex-col items-center justify-between min-h-[440px] relative transition-all duration-300`}
          >
            {/* Top Google branding */}
            <div>
              <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1">
                {headline}
              </div>
              <div className="flex items-center justify-center gap-0.5 text-2xl font-bold tracking-tight mb-2">
                <span style={{ color: '#4285F4' }}>G</span>
                <span style={{ color: '#EA4335' }}>o</span>
                <span style={{ color: '#FBBC05' }}>o</span>
                <span style={{ color: '#4285F4' }}>g</span>
                <span style={{ color: '#34A853' }}>l</span>
                <span style={{ color: '#EA4335' }}>e</span>
              </div>
              <div className="flex justify-center text-amber-400 text-sm gap-0.5 mb-2">
                ★★★★★
              </div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                {businessName}
              </h3>
            </div>

            {/* Generated QR container */}
            <div className="my-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner flex flex-col items-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Review QR Code"
                  className="w-44 h-44 rounded-xl shadow-sm"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-slate-400">
                  <i className="fa-solid fa-spinner fa-spin text-2xl"></i>
                </div>
              )}
              <span className="text-[10px] font-bold text-slate-600 mt-2 flex items-center gap-1">
                <i className="fa-solid fa-camera text-emerald-600"></i> Point Camera to Review
              </span>
            </div>

            {/* Footer notice */}
            <div className="w-full pt-2 border-t border-slate-100">
              <p className="text-[11px] text-slate-600 font-medium">
                {subtext}
              </p>
              <div className="text-[9px] text-slate-400 font-bold tracking-wider uppercase mt-1 flex items-center justify-center gap-1">
                <span>Powered by</span>
                <span className="text-emerald-700 font-extrabold">ReviewFlow AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
