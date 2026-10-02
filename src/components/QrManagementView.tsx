import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { QRCode, ReviewFunnel } from '../server/types';

interface QrManagementViewProps {
  businessId?: string;
  onNotify: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  onOpenDesigner?: () => void;
}

export const QrManagementView: React.FC<QrManagementViewProps> = ({
  businessId,
  onNotify,
  onOpenDesigner
}) => {
  const [qrs, setQrs] = useState<QRCode[]>([]);
  const [funnels, setFunnels] = useState<ReviewFunnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedFunnelId, setSelectedFunnelId] = useState('');
  const [foregroundColor, setForegroundColor] = useState('#166534');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQrs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.qr.list({
        business_id: businessId,
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      setQrs(res.data || []);

      // Also fetch funnels for create dropdown
      const fnlRes = await api.funnels.list({ business_id: businessId });
      setFunnels(fnlRes.data || []);
      if (fnlRes.data?.length > 0 && !selectedFunnelId) {
        setSelectedFunnelId(fnlRes.data[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load QR codes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQrs();
  }, [businessId, statusFilter]);

  const handleCreateQr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedFunnelId) {
      onNotify('Name and target funnel are required.', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      let targetBizId = businessId;
      if (!targetBizId) {
        const bizRes = await api.businesses.list();
        targetBizId = bizRes.data?.[0]?.id;
      }

      if (!targetBizId) {
        onNotify('Please create a business profile first.', 'warning');
        setIsSubmitting(false);
        return;
      }

      const res = await api.qr.create({
        business_id: targetBizId,
        funnel_id: selectedFunnelId,
        name: name.trim(),
        foreground_color: foregroundColor,
        background_color: backgroundColor,
        style: 'modern_dots'
      });

      onNotify('Smart QR code created successfully!', 'success');
      setCreateModalOpen(false);
      setName('');
      setQrs((prev) => [res.data, ...prev]);
    } catch (err: any) {
      onNotify(err.message || 'Failed to create QR code.', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (qr: QRCode) => {
    try {
      const nextStatus = qr.status === 'active' ? 'paused' : 'active';
      await api.qr.update(qr.id, { status: nextStatus });
      setQrs((prev) =>
        prev.map((q) => (q.id === qr.id ? { ...q, status: nextStatus } : q))
      );
      onNotify(`QR code status updated to ${nextStatus}.`, 'info');
    } catch (err: any) {
      onNotify(err.message || 'Failed to toggle status.', 'warning');
    }
  };

  const handleDeleteQr = async (id: string, qrName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${qrName}"? Analytics will be archived.`)) {
      return;
    }

    try {
      await api.qr.delete(id);
      setQrs((prev) => prev.filter((q) => q.id !== id));
      onNotify('QR code deleted successfully.', 'success');
    } catch (err: any) {
      onNotify(err.message || 'Failed to delete QR code.', 'warning');
    }
  };

  const handleCopyShortUrl = (shortCode: string) => {
    const origin = window.location.origin;
    const fullUrl = `${origin}/q/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    onNotify('Short QR tracking URL copied to clipboard!', 'success');
  };

  const filteredQrs = qrs.filter((q) => {
    return q.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.short_code.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-5 animate-fadeIn text-left max-w-7xl mx-auto">
      {/* ═══════ HEADER BANNER ═══════ */}
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 border-l-4 border-l-emerald-500 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#34A853] to-[#2D9248] text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25">
            <i className="fa-solid fa-qrcode text-xl"></i>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
              QR Code Management
            </h1>
            <p className="text-xs text-emerald-800 font-medium mt-0.5">
              Generate, print, and track smart dynamic QR stands and marketing flyers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {onOpenDesigner && (
            <button
              onClick={onOpenDesigner}
              className="px-3.5 py-2.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <i className="fa-solid fa-wand-magic-sparkles text-xs text-emerald-600"></i>
              <span>Flyer Designer</span>
            </button>
          )}

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-[#34A853] to-[#2D9248] hover:from-[#2e944a] hover:to-[#257c3d] text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            <span>Create QR Code</span>
          </button>
        </div>
      </div>

      {/* ═══════ CONTROLS: SEARCH & FILTERS ═══════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="Search QR codes by name or code…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
          {(['all', 'active', 'inactive'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                statusFilter === status
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════ STATES ═══════ */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-500">Loading your QR codes…</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-50/80 rounded-2xl border border-red-200 text-red-700 space-y-3">
          <i className="fa-solid fa-triangle-exclamation text-2xl text-red-500"></i>
          <p className="text-xs font-bold">{error}</p>
          <button
            onClick={fetchQrs}
            className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-extrabold hover:bg-red-700 cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : filteredQrs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl">
            <i className="fa-solid fa-qrcode"></i>
          </div>
          <h3 className="text-sm font-black text-slate-900">No QR codes found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create dynamic QR codes to track customer scans and direct them to your review funnels.
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer"
          >
            + Create QR Code
          </button>
        </div>
      ) : (
        /* QR Code Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQrs.map((qr) => (
            <div
              key={qr.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      qr.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${qr.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}
                    ></span>
                    {qr.status === 'active' ? 'Active' : 'Paused'}
                  </span>

                  <span className="text-[10px] text-slate-400 font-semibold">
                    {new Date(qr.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Dynamic QR Thumbnail */}
                  <div className="w-16 h-16 rounded-xl border border-slate-200 p-1 bg-white shrink-0 shadow-2xs">
                    <img
                      src={api.qr.getImageUrl(qr.id)}
                      alt={qr.name}
                      className="w-full h-full object-contain rounded-lg"
                      loading="lazy"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-black text-slate-900 leading-snug truncate">{qr.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <i className="fa-solid fa-chart-simple text-emerald-600 text-[10px]"></i>
                      <span className="font-bold text-slate-800">{qr.scan_count || 0}</span> scans
                    </div>
                  </div>
                </div>

                {/* Short Tracking URL */}
                <div className="p-2 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-emerald-800 font-bold truncate">
                    /q/{qr.short_code}
                  </span>
                  <button
                    onClick={() => handleCopyShortUrl(qr.short_code)}
                    className="text-slate-400 hover:text-emerald-700 p-1 cursor-pointer"
                    title="Copy QR URL"
                  >
                    <i className="fa-solid fa-copy text-xs"></i>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={api.qr.getDownloadUrl(qr.id)}
                  download={`reviewflow-qr-${qr.short_code}.png`}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-download text-[11px]"></i>
                  <span>PNG</span>
                </a>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleStatus(qr)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title={qr.status === 'active' ? 'Pause QR Code' : 'Activate QR Code'}
                  >
                    <i className={`fa-solid ${qr.status === 'active' ? 'fa-toggle-on text-emerald-600' : 'fa-toggle-off'} text-base`}></i>
                  </button>

                  <button
                    onClick={() => handleDeleteQr(qr.id, qr.name)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                    title="Delete QR"
                  >
                    <i className="fa-solid fa-trash text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════ CREATE QR MODAL ═══════ */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  <i className="fa-solid fa-qrcode"></i>
                </div>
                <h3 className="text-base font-black text-slate-900">Create Smart QR Code</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateQr} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  QR Code Name / Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Counter Standee #1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Review Funnel
                </label>
                <select
                  value={selectedFunnelId}
                  onChange={(e) => setSelectedFunnelId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none bg-white font-medium"
                >
                  {funnels.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} (/r/{f.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Foreground Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                    />
                    <span className="text-xs font-mono font-bold text-slate-700">{foregroundColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                    />
                    <span className="text-xs font-mono font-bold text-slate-700">{backgroundColor}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer hover:shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Generating…' : 'Generate QR Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
