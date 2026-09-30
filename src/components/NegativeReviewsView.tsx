import React, { useState } from 'react';

interface NegativeReviewsViewProps {
  onUpgrade: () => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

interface FeedbackItem {
  id: string;
  customerName: string;
  phone?: string;
  email?: string;
  rating: number;
  date: string;
  comment: string;
  note: string;
  status: 'pending' | 'reviewed';
  archived: boolean;
}

export const NegativeReviewsView: React.FC<NegativeReviewsViewProps> = ({
  onUpgrade,
  onNotify
}) => {
  const [managementEnabled, setManagementEnabled] = useState(false);
  const [currentTab, setCurrentTab] = useState<'active' | 'archived'>('active');
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showLocalToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleToggleManagement = (enable: boolean) => {
    setManagementEnabled(enable);
    const statusMsg = enable
      ? 'Negative Review Management enabled. Low star ratings will now be routed privately.'
      : 'Negative Review Management disabled. Standard direct review flow restored.';
    showLocalToast(enable ? 'Review gating enabled' : 'Review gating disabled');
    onNotify(statusMsg, enable ? 'warning' : 'info');
  };

  const handleToggleReviewed = (id: string) => {
    setFeedbacks(prev =>
      prev.map(f => {
        if (f.id === id) {
          const next = f.status === 'reviewed' ? 'pending' : 'reviewed';
          showLocalToast(next === 'reviewed' ? 'Status updated: Reviewed' : 'Status updated: Pending');
          return { ...f, status: next };
        }
        return f;
      })
    );
  };

  const handleSaveNote = (id: string, newNote: string) => {
    setFeedbacks(prev =>
      prev.map(f => (f.id === id ? { ...f, note: newNote } : f))
    );
    showLocalToast('Internal note saved');
  };

  const handleToggleArchive = (id: string, archive: boolean) => {
    setFeedbacks(prev =>
      prev.map(f => (f.id === id ? { ...f, archived: archive } : f))
    );
    showLocalToast(archive ? 'Item archived' : 'Item restored to active');
  };

  const handleAddSampleFeedback = () => {
    const sample: FeedbackItem = {
      id: `fb_${Date.now()}`,
      customerName: 'Aman Sharma',
      phone: '+91 98765 43210',
      email: 'aman.sharma@example.com',
      rating: 2,
      date: 'Today, 2:30 PM',
      comment: 'Waited 25 minutes for our table even with a reservation. The food was good once served, but the waiting experience was frustrating.',
      note: 'Offered complimentary dessert voucher on next visit.',
      status: 'pending',
      archived: false
    };
    setFeedbacks([sample, ...feedbacks]);
    showLocalToast('Sample private feedback added');
  };

  const activeItems = feedbacks.filter(f => !f.archived);
  const archivedItems = feedbacks.filter(f => f.archived);
  const displayedItems = currentTab === 'active' ? activeItems : archivedItems;

  return (
    <div className="space-y-4 animate-fadeIn text-left">
      {/* ═══════ PAGE HEADER BANNER ═══════ */}
      <section className="relative overflow-hidden p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#34A853] to-[#2D9248] text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <path d="M8 8h8M8 12h5"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
              Negative Reviews
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Review and manage private customer feedback captured through your low-rating funnel.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#22c55e]"></span>
            {activeItems.length} Active
          </div>
        </div>
      </section>

      {/* ═══════ NEGATIVE REVIEW MANAGEMENT CONTROL ═══════ */}
      <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-sm shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 7h16"/>
                <path d="M4 12h16"/>
                <path d="M4 17h16"/>
                <circle cx="8" cy="7" r="2"/>
                <circle cx="15" cy="12" r="2"/>
                <circle cx="10" cy="17" r="2"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-black text-slate-900">Negative Review Management</h2>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  managementEnabled
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${managementEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                  {managementEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Control whether customers see the 1–5 star rating step before reaching your review flow.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleToggleManagement(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                managementEnabled
                  ? 'bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Enable
            </button>
            <button
              type="button"
              onClick={() => handleToggleManagement(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !managementEnabled
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Disable
            </button>
          </div>
        </div>

        {/* Policy Notice Box */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex gap-2.5 items-start">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 text-xs">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div className="space-y-0.5">
            <strong className="text-xs font-bold text-amber-950 block">Google policy notice</strong>
            <p className="text-xs text-amber-900 leading-relaxed">
              Selective review routing or review gating may violate Google review policies. Keeping this feature disabled provides the standard review flow.
            </p>
          </div>
        </div>

        {/* 4 Feature Explanation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 text-xs mt-0.5">
              <i className="fa-solid fa-circle-info"></i>
            </div>
            <div>
              <strong className="block text-xs text-slate-800 font-bold mb-0.5">What it does</strong>
              <p className="text-[11px] text-slate-500 leading-normal">
                Captures low-star feedback privately before customers continue to a public review flow.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-xs mt-0.5">
              <i className="fa-solid fa-star-half-stroke"></i>
            </div>
            <div>
              <strong className="block text-xs text-slate-800 font-bold mb-0.5">When enabled</strong>
              <p className="text-[11px] text-slate-500 leading-normal">
                The public QR flow starts with star selection, and lower ratings can submit private feedback here.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 text-xs mt-0.5">
              <i className="fa-solid fa-forward"></i>
            </div>
            <div>
              <strong className="block text-xs text-slate-800 font-bold mb-0.5">When disabled</strong>
              <p className="text-[11px] text-slate-500 leading-normal">
                The rating step is skipped and customers move directly to AI review drafts and your Google review link.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 text-xs mt-0.5">
              <i className="fa-solid fa-shield-heart"></i>
            </div>
            <div>
              <strong className="block text-xs text-slate-800 font-bold mb-0.5">Feedback stays safe</strong>
              <p className="text-[11px] text-slate-500 leading-normal">
                Disabling this feature does not delete or alter feedback that has already been collected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FREE TRIAL BANNER ═══════ */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-200 border-l-4 border-l-amber-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-200/80 text-amber-800 flex items-center justify-center text-sm shrink-0">
            <i className="fa-solid fa-clock"></i>
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-950">
              You are on the Free Trial plan &mdash; <span className="text-red-600 font-extrabold">1 day remaining</span>
            </h4>
            <p className="text-[11px] text-amber-800 leading-tight mt-0.5">
              Upgrade to unlock advanced features including AI review replies and priority support.
            </p>
          </div>
        </div>

        <button
          onClick={onUpgrade}
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#34A853] to-[#258744] text-white font-extrabold text-xs shadow-xs hover:shadow transition-all shrink-0 cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
        >
          <i className="fa-solid fa-crown text-[10px]"></i> Upgrade Plan
        </button>
      </div>

      {/* ═══════ FILTER TABS & SAMPLE SIMULATOR ═══════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setCurrentTab('active')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'active'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({activeItems.length})
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('archived')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'archived'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Archived ({archivedItems.length})
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddSampleFeedback}
          className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
        >
          <i className="fa-solid fa-plus-circle"></i>
          Simulate Incoming Low-Rating Feedback
        </button>
      </div>

      {/* ═══════ FEEDBACK GRID / CARDS ═══════ */}
      <div className="space-y-3">
        {displayedItems.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-2">
            <div className="text-3xl mx-auto">{currentTab === 'active' ? '✅' : '📁'}</div>
            <h3 className="text-sm font-black text-slate-800">
              {currentTab === 'active' ? 'No Active Negative Reviews' : 'No Archived Items'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {currentTab === 'active'
                ? "You don't have any pending negative review messages. Great job keeping customers happy!"
                : 'Archive completed negative reviews to keep your dashboard organized.'}
            </p>
          </div>
        ) : (
          displayedItems.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border shadow-xs transition-all space-y-3 ${
                item.status === 'reviewed'
                  ? 'bg-slate-50/70 border-slate-200'
                  : 'bg-white border-slate-200 hover:border-emerald-300'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="text-amber-400 text-sm tracking-wider">
                    {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                  </div>
                  <span className="text-xs font-bold text-slate-900">{item.customerName}</span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-3">
                  {item.phone && <span>📞 {item.phone}</span>}
                  {item.email && <span>✉️ {item.email}</span>}
                  <span>⏱️ {item.date}</span>
                </div>
              </div>

              {/* Feedback Text Quote */}
              <div className="p-3 bg-amber-50/80 border-l-4 border-l-amber-400 rounded-xl text-xs text-slate-800 leading-relaxed font-medium">
                &ldquo;{item.comment}&rdquo;
              </div>

              {/* Internal Notes Section */}
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
                    Internal Operator Notes
                  </span>
                </div>
                <textarea
                  defaultValue={item.note}
                  id={`note-input-${item.id}`}
                  placeholder="Add resolution notes, customer contact history, or action taken..."
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 resize-none h-16 text-slate-700"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(`note-input-${item.id}`) as HTMLTextAreaElement;
                      if (el) handleSaveNote(item.id, el.value);
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    Save Note
                  </button>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    item.status === 'reviewed'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {item.status === 'reviewed' ? '✓ Reviewed' : 'Pending'}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleReviewed(item.id)}
                    className="px-2.5 py-1 bg-white border border-slate-200 hover:border-emerald-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    {item.status === 'reviewed' ? 'Mark as Pending' : 'Mark as Reviewed'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleArchive(item.id, !item.archived)}
                  className="px-2.5 py-1 bg-white border border-slate-200 hover:border-red-200 hover:text-red-600 rounded-lg text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  {item.archived ? 'Restore to Active' : 'Archive Feedback'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold animate-fadeIn">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
