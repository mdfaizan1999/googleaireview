import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ReviewFunnel } from '../server/types';

interface FunnelsManagementViewProps {
  businessId?: string;
  onNotify: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  onNavigateToQr?: (funnelId: string) => void;
  onPreviewFunnel: (slug: string) => void;
}

export const FunnelsManagementView: React.FC<FunnelsManagementViewProps> = ({
  businessId,
  onNotify,
  onNavigateToQr,
  onPreviewFunnel
}) => {
  const [funnels, setFunnels] = useState<ReviewFunnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTitle, setNewTitle] = useState('How was your experience today?');
  const [newSubtitle, setNewSubtitle] = useState('Your feedback helps other local customers find trusted care.');
  const [newPrimaryColor, setNewPrimaryColor] = useState('#34A853');
  const [newGoogleUrl, setNewGoogleUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFunnels = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.funnels.list({
        business_id: businessId,
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      setFunnels(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load review funnels.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunnels();
  }, [businessId, statusFilter]);

  const handleCreateFunnel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newTitle.trim()) {
      onNotify('Name and title are required.', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      // If businessId not supplied, fetch user's first business
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

      const res = await api.funnels.create({
        business_id: targetBizId,
        name: newName.trim(),
        title: newTitle.trim(),
        subtitle: newSubtitle.trim(),
        primary_color: newPrimaryColor,
        google_review_url: newGoogleUrl.trim()
      });

      onNotify('Review funnel created successfully!', 'success');
      setCreateModalOpen(false);
      setNewName('');
      setNewGoogleUrl('');
      setFunnels((prev) => [res.data, ...prev]);
    } catch (err: any) {
      onNotify(err.message || 'Failed to create funnel.', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (funnel: ReviewFunnel) => {
    try {
      const updatedStatus = !funnel.enabled;
      await api.funnels.update(funnel.id, { enabled: updatedStatus });
      setFunnels((prev) =>
        prev.map((f) => (f.id === funnel.id ? { ...f, enabled: updatedStatus } : f))
      );
      onNotify(`Funnel is now ${updatedStatus ? 'Active' : 'Disabled'}.`, 'info');
    } catch (err: any) {
      onNotify(err.message || 'Failed to update funnel status.', 'warning');
    }
  };

  const handleDeleteFunnel = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? Historical events will be safely archived.`)) {
      return;
    }

    try {
      await api.funnels.delete(id);
      setFunnels((prev) => prev.filter((f) => f.id !== id));
      onNotify('Funnel deleted successfully.', 'success');
    } catch (err: any) {
      onNotify(err.message || 'Failed to delete funnel.', 'warning');
    }
  };

  const handleCopyUrl = (slug: string) => {
    const origin = window.location.origin;
    const fullUrl = `${origin}/r/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    onNotify('Public funnel URL copied to clipboard!', 'success');
  };

  const filteredFunnels = funnels.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-5 animate-fadeIn text-left max-w-7xl mx-auto">
      {/* ═══════ HEADER BANNER ═══════ */}
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 border-l-4 border-l-emerald-500 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#34A853] to-[#2D9248] text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25">
            <i className="fa-solid fa-filter text-xl"></i>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
              Review Funnels
            </h1>
            <p className="text-xs text-emerald-800 font-medium mt-0.5">
              Manage smart review landing pages that route customer feedback cleanly.
            </p>
          </div>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-[#34A853] to-[#2D9248] hover:from-[#2e944a] hover:to-[#257c3d] text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          <span>Create New Funnel</span>
        </button>
      </div>

      {/* ═══════ CONTROLS: SEARCH & STATUS ═══════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="Search funnels by name or slug…"
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

      {/* ═══════ STATES: LOADING, ERROR, EMPTY, SUCCESS ═══════ */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-500">Loading your review funnels…</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-50/80 rounded-2xl border border-red-200 text-red-700 space-y-3">
          <i className="fa-solid fa-triangle-exclamation text-2xl text-red-500"></i>
          <p className="text-xs font-bold">{error}</p>
          <button
            onClick={fetchFunnels}
            className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-extrabold hover:bg-red-700 cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : filteredFunnels.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl">
            <i className="fa-solid fa-filter"></i>
          </div>
          <h3 className="text-sm font-black text-slate-900">No review funnels found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create your first high-converting review funnel to start capturing customer ratings cleanly.
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer"
          >
            + Create Funnel
          </button>
        </div>
      ) : (
        /* Funnel Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFunnels.map((funnel) => (
            <div
              key={funnel.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      funnel.enabled
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${funnel.enabled ? 'bg-emerald-500' : 'bg-slate-400'}`}
                    ></span>
                    {funnel.enabled ? 'Active' : 'Disabled'}
                  </span>

                  <span className="text-[10px] text-slate-400 font-semibold">
                    {new Date(funnel.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-snug">{funnel.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{funnel.title}</p>
                </div>

                {/* Public URL pill */}
                <div className="p-2 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-emerald-800 font-bold truncate">
                    /r/{funnel.slug}
                  </span>
                  <button
                    onClick={() => handleCopyUrl(funnel.slug)}
                    className="text-slate-400 hover:text-emerald-700 p-1 cursor-pointer"
                    title="Copy URL"
                  >
                    <i className="fa-solid fa-copy text-xs"></i>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onPreviewFunnel(funnel.slug)}
                    className="px-2.5 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    title="Preview Public Funnel"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                    <span>Preview</span>
                  </button>

                  {onNavigateToQr && (
                    <button
                      onClick={() => onNavigateToQr(funnel.id)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      title="Generate QR code for this funnel"
                    >
                      <i className="fa-solid fa-qrcode text-[10px]"></i>
                      <span>QR</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleStatus(funnel)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title={funnel.enabled ? 'Disable Funnel' : 'Enable Funnel'}
                  >
                    <i className={`fa-solid ${funnel.enabled ? 'fa-toggle-on text-emerald-600' : 'fa-toggle-off'} text-base`}></i>
                  </button>

                  <button
                    onClick={() => handleDeleteFunnel(funnel.id, funnel.name)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                    title="Delete Funnel"
                  >
                    <i className="fa-solid fa-trash text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════ CREATE FUNNEL MODAL ═══════ */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  <i className="fa-solid fa-filter"></i>
                </div>
                <h3 className="text-base font-black text-slate-900">Create Review Funnel</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateFunnel} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Funnel Name (Internal Reference)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Front Desk Checkout Funnel"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Public Headline / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="How was your experience today?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subtitle / Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Your review helps other local customers find trusted care."
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Review Destination URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://g.page/r/.../review"
                  value={newGoogleUrl}
                  onChange={(e) => setNewGoogleUrl(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                />
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
                  {isSubmitting ? 'Creating…' : 'Create Funnel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
