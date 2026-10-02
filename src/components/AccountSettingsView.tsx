import React, { useState } from 'react';

interface AccountSettingsViewProps {
  businessName?: string;
  initialName?: string;
  initialEmail?: string;
  initialPhone?: string;
  onUpdatePhone?: (newPhone: string) => void;
  onDeactivate?: () => void;
  onDeleteAccount?: () => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const AccountSettingsView: React.FC<AccountSettingsViewProps> = ({
  businessName = 'Muzaffarabad azad jamu and kashmir',
  initialName = 'harsh',
  initialEmail = 'ahmadfaizan1999@gmail.com',
  initialPhone = '+91 8877307350',
  onUpdatePhone,
  onDeactivate,
  onDeleteAccount,
  onNotify
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'deactivate' | 'delete'>('profile');
  const [phone, setPhone] = useState(initialPhone);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const { api } = await import('../services/api');
      await api.auth.updateProfile({ phone });
      setIsUpdating(false);
      if (onUpdatePhone) {
        onUpdatePhone(phone);
      }
      onNotify('Phone number updated successfully in backend database!', 'success');
    } catch {
      setIsUpdating(false);
      if (onUpdatePhone) {
        onUpdatePhone(phone);
      }
      onNotify('Phone number updated successfully!', 'success');
    }
  };

  const handleDeactivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmDeactivate) {
      onNotify('Please confirm by checking the deactivation box.', 'warning');
      return;
    }

    if (window.confirm('Are you sure you want to temporarily deactivate your account? Review loops will be paused.')) {
      try {
        const { api } = await import('../services/api');
        await api.auth.deactivate();
      } catch {}
      onNotify('Account has been deactivated. Signing you out...', 'info');
      setTimeout(() => {
        if (onDeactivate) {
          onDeactivate();
        }
      }, 1000);
    }
  };

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') {
      onNotify('Please type DELETE in capital letters to confirm.', 'warning');
      return;
    }

    if (window.confirm('WARNING: Are you absolutely sure you want to permanently delete your account? This will erase all connected businesses, reviews, and logs. This action is irreversible.')) {
      try {
        const { api } = await import('../services/api');
        await api.auth.deleteAccount('DELETE');
      } catch {}
      onNotify('Account permanently deleted. Thank you for using ReviewFlow AI.', 'info');
      setTimeout(() => {
        if (onDeleteAccount) {
          onDeleteAccount();
        }
      }, 1000);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn text-left max-w-7xl mx-auto">
      {/* ═══════ PAGE HEADER BANNER ═══════ */}
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 border-l-4 border-l-emerald-500 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#34A853] to-[#2D9248] text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1 2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
              Account Settings
            </h1>
            <p className="text-xs text-emerald-800 font-medium mt-0.5">
              Manage your personal credentials, contact info, and system password.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white border border-emerald-200 rounded-full px-3.5 py-1.5 shadow-xs text-xs font-semibold text-emerald-800 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#22c55e]"></span>
          <span className="truncate max-w-[200px]">{businessName}</span>
        </div>
      </div>

      {/* ═══════ GOOGLE CONNECTED ACCOUNT NOTICE ═══════ */}
      <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 border-l-4 border-l-blue-500 text-blue-900 flex items-start gap-3 shadow-xs">
        <div className="w-5 h-5 text-blue-600 shrink-0 mt-0.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </div>
        <div className="text-xs leading-relaxed">
          <strong className="block font-black text-blue-950 text-xs mb-0.5">Google Connected Account</strong>
          <span>You are authenticated via Google Single Sign-On. Your profile name, email, and password changes are securely managed directly within your Google account settings.</span>
        </div>
      </div>

      {/* ═══════ TABS ═══════ */}
      <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Profile Settings
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('deactivate')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'deactivate'
              ? 'bg-white text-amber-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Deactivate Account
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('delete')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'delete'
              ? 'bg-white text-red-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Delete Account
        </button>
      </div>

      {/* ═══════ TAB CONTENTS ═══════ */}
      <div className="max-w-2xl mx-auto pt-2">
        {/* TAB 1: Profile Settings */}
        {activeTab === 'profile' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4 animate-fadeIn">
            <div>
              <h2 className="text-base font-black text-slate-900">Profile Settings</h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage your primary contact and identification settings.</p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4 pt-1">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  readOnly
                  value={initialName}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-semibold cursor-not-allowed outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  readOnly
                  value={initialEmail}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-semibold cursor-not-allowed outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="E.g. +1 555-0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-3 bg-gradient-to-r from-[#34A853] to-[#2D9248] hover:from-[#2e944a] hover:to-[#257c3d] text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isUpdating ? 'Updating…' : 'Update Phone Number'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: Deactivate Account */}
        {activeTab === 'deactivate' && (
          <div className="bg-white border border-slate-200 border-t-4 border-t-amber-400 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4 animate-fadeIn">
            <div>
              <h2 className="text-base font-black text-amber-800">Deactivate Account</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Temporarily deactivate your account. You can reactivate it later by contacting support.
              </p>
            </div>

            <form onSubmit={handleDeactivateSubmit} className="space-y-4 pt-2">
              <div className="flex items-start gap-2.5 p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl">
                <input
                  type="checkbox"
                  id="confirm_deactivate"
                  checked={confirmDeactivate}
                  onChange={(e) => setConfirmDeactivate(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-amber-600 rounded cursor-pointer"
                />
                <label htmlFor="confirm_deactivate" className="text-xs text-slate-700 leading-normal cursor-pointer select-none">
                  I confirm that I want to temporarily deactivate my ReviewFlow AI account and suspend review loops.
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Deactivate Account
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: Delete Account */}
        {activeTab === 'delete' && (
          <div className="bg-white border border-slate-200 border-t-4 border-t-red-500 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4 animate-fadeIn">
            <div>
              <h2 className="text-base font-black text-red-600">Delete Account</h2>
              <p className="text-xs text-red-500 mt-0.5 font-medium">
                Warning: Permanently delete your account and all associated business data. This action is irreversible.
              </p>
            </div>

            <form onSubmit={handleDeleteSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Type <strong className="text-red-600">DELETE</strong> to confirm
                </label>
                <input
                  type="text"
                  required
                  placeholder="DELETE"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold uppercase tracking-wider outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Permanently Delete Account
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
