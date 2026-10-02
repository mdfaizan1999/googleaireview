import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface GoogleReviewsViewProps {
  businessName?: string;
  onNotify: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const GoogleReviewsView: React.FC<GoogleReviewsViewProps> = ({
  businessName = 'My Business',
  onNotify
}) => {
  // Reviews state
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total_reviews: 0,
    average_rating: 5.0,
    replied_count: 0,
    unreplied_count: 0,
    rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  // Filter state
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
  const [replyFilter, setReplyFilter] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Google Connection & Mapping State
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [locationLinks, setLocationLinks] = useState<any[]>([]);
  const [myLocations, setMyLocations] = useState<any[]>([]);
  const [selectedReviewflowLoc, setSelectedReviewflowLoc] = useState('');
  const [selectedGoogleLoc, setSelectedGoogleLoc] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  // Reply Modal State
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [activeReview, setActiveReview] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isDeletingReply, setIsDeletingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  // AI Assistant State
  const [aiUsage, setAiUsage] = useState<any>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiTone, setAiTone] = useState<'professional' | 'friendly' | 'empathetic' | 'concise'>('professional');
  const [aiLanguage, setAiLanguage] = useState<'en' | 'hi'>('en');
  const [currentAiSuggestion, setCurrentAiSuggestion] = useState<any>(null);
  const [currentAiAnalysis, setCurrentAiAnalysis] = useState<any>(null);
  const [reviewAnalyses, setReviewAnalyses] = useState<Record<string, any>>({});

  // Fetch reviews from API
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.reviews.list({
        search: search.trim() || undefined,
        rating: ratingFilter,
        has_reply: replyFilter,
        page,
        per_page: 15
      });

      if (res.success && res.data) {
        setReviews(res.data.reviews || []);
        setStats(res.data.stats || {
          total_reviews: 0,
          average_rating: 5.0,
          replied_count: 0,
          unreplied_count: 0,
          rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        });
        setTotalPages(res.data.total_pages || 1);
      }
    } catch (err: any) {
      console.error('Failed to load reviews:', err);
      onNotify(err.message || 'Failed to fetch Google reviews.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Google connection status
  const fetchConnectionStatus = async () => {
    try {
      const res = await api.google.getStatus();
      if (res.success && res.data) {
        setConnectionStatus(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch Google connection status:', err);
    }
  };

  // Fetch location links
  const fetchLocationLinks = async () => {
    try {
      const res = await api.google.getLocationLinks();
      if (res.success && res.data) {
        setLocationLinks(res.data || []);
      }
    } catch (err) {
      console.warn('Could not fetch location links:', err);
    }
  };

  // Fetch AI Assistant Usage Stats
  const fetchAiUsage = async () => {
    try {
      const res = await api.ai.getUsage();
      if (res.success && res.data) {
        setAiUsage(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch AI usage:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, ratingFilter, replyFilter]);

  useEffect(() => {
    fetchConnectionStatus();
    fetchLocationLinks();
    fetchAiUsage();
  }, []);

  // Connect Google OAuth flow
  const handleInitiateGoogleConnect = async () => {
    try {
      const res = await api.google.getConnectUrl();
      if (res.success && res.data?.url) {
        // If it's a simulated local callback or within iframe sandbox
        if (res.data.url.startsWith('/') || res.data.url.includes('/api/v1/integrations/google/callback')) {
          const callbackRes = await fetch(res.data.url, { headers: { Accept: 'application/json' } }).then((r) => r.json());
          if (callbackRes.success) {
            onNotify('Google account connected in sandbox mode! You can add live GCP variables later.', 'success');
            await fetchConnectionStatus();
            await fetchLocationLinks();
            await fetchReviews();
            return;
          }
        }

        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        let popup: Window | null = null;
        try {
          popup = window.open(
            res.data.url,
            'google_oauth_popup',
            `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
          );
        } catch {
          popup = null;
        }

        if (!popup) {
          window.location.href = res.data.url;
          return;
        }

        const handleMessage = (event: MessageEvent) => {
          if (event.data?.type === 'GOOGLE_CONNECTED') {
            window.removeEventListener('message', handleMessage);
            onNotify('Google account connected successfully!', 'success');
            fetchConnectionStatus();
            fetchLocationLinks();
            fetchReviews();
          }
        };

        window.addEventListener('message', handleMessage);
      }
    } catch (err: any) {
      onNotify(err.message || 'Failed to initiate Google OAuth.', 'warning');
    }
  };

  // Manual Review Sync
  const handleSyncReviews = async () => {
    try {
      setSyncing(true);
      const res = await api.google.syncReviews();
      onNotify(res.message || 'Review synchronization initiated.', 'info');
      setTimeout(async () => {
        await fetchReviews();
        await fetchConnectionStatus();
        await fetchLocationLinks();
        setSyncing(false);
      }, 1500);
    } catch (err: any) {
      setSyncing(false);
      onNotify(err.message || 'Failed to start review synchronization.', 'warning');
    }
  };

  // Disconnect Google Account
  const handleDisconnect = async () => {
    try {
      await api.google.disconnect();
      onNotify('Google Business Profile disconnected. Stored reviews preserved.', 'info');
      await fetchConnectionStatus();
      setConnectModalOpen(false);
    } catch (err: any) {
      onNotify(err.message || 'Failed to disconnect Google account.', 'warning');
    }
  };

  // Open Google Location Mapping modal
  const handleOpenConnectModal = async () => {
    setConnectModalOpen(true);
    try {
      const [locRes, bizRes] = await Promise.all([
        api.google.getLocations(),
        api.businesses.list()
      ]);

      if (locRes.success && locRes.data) {
        setLocations(locRes.data);
        if (locRes.data.length > 0) {
          setSelectedGoogleLoc(locRes.data[0].google_location_id);
        }
      }

      if (bizRes.success && bizRes.data && bizRes.data[0]) {
        const primaryBiz = bizRes.data[0];
        const bizLocs = await api.locations.list(primaryBiz.id);
        if (bizLocs.success && bizLocs.data) {
          setMyLocations(bizLocs.data);
          if (bizLocs.data.length > 0) {
            setSelectedReviewflowLoc(bizLocs.data[0].id);
          }
        }
      }
    } catch (err: any) {
      console.warn('Error loading locations for mapping:', err);
    }
  };

  // Link location submit
  const handleLinkLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewflowLoc || !selectedGoogleLoc) {
      onNotify('Please select both a ReviewFlow location and a Google location.', 'warning');
      return;
    }

    try {
      setIsLinking(true);
      const chosenLoc = locations.find((l) => l.google_location_id === selectedGoogleLoc);
      await api.google.linkLocation({
        business_location_id: selectedReviewflowLoc,
        google_location_id: selectedGoogleLoc,
        google_location_name: chosenLoc?.business_name,
        google_maps_url: chosenLoc?.google_maps_url
      });

      onNotify('Google location linked! Automatic review sync dispatched.', 'success');
      fetchLocationLinks();
      fetchReviews();
      setConnectModalOpen(false);
    } catch (err: any) {
      onNotify(err.message || 'Failed to link Google location.', 'warning');
    } finally {
      setIsLinking(false);
    }
  };

  // Open Reply Modal
  const handleOpenReplyModal = async (rev: any, autoGenerateAi: boolean = false) => {
    setActiveReview(rev);
    setReplyText(rev.google_reply_text || '');
    setReplyError(null);
    setCurrentAiSuggestion(null);
    setCurrentAiAnalysis(null);
    setReplyModalOpen(true);

    try {
      const res = await api.ai.getSuggestions(rev.id);
      if (res.success && res.data) {
        if (res.data.analysis) {
          setCurrentAiAnalysis(res.data.analysis);
          setReviewAnalyses((prev) => ({ ...prev, [rev.id]: res.data.analysis }));
        }
        if (res.data.suggestions && res.data.suggestions.length > 0) {
          setCurrentAiSuggestion(res.data.suggestions[0]);
        }
      }
    } catch (err) {
      console.warn('Could not load AI suggestions history:', err);
    }

    if (autoGenerateAi) {
      handleGenerateAiSuggestion(rev.id);
    }
  };

  // Generate AI Suggestion
  const handleGenerateAiSuggestion = async (reviewId?: string) => {
    const targetId = reviewId || activeReview?.id;
    if (!targetId) return;

    try {
      setIsGeneratingAi(true);
      setReplyError(null);
      const res = await api.ai.generateReplySuggestion(targetId, {
        tone: aiTone,
        language: aiLanguage
      });

      if (res.success && res.data) {
        setCurrentAiSuggestion(res.data);
        if (!replyText.trim()) {
          setReplyText(res.data.suggestion);
        }
        onNotify('AI reply suggestion generated. Review and approve before publishing.', 'info');
        fetchAiUsage();
      }
    } catch (err: any) {
      setReplyError(err.message || 'Failed to generate AI suggestion.');
      onNotify(err.message || 'AI generation failed', 'warning');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Analyze Review with AI
  const handleAnalyzeReview = async (reviewId: string) => {
    try {
      setIsAnalyzingAi(true);
      const res = await api.ai.analyzeReview(reviewId);
      if (res.success && res.data) {
        setReviewAnalyses((prev) => ({ ...prev, [reviewId]: res.data }));
        if (activeReview?.id === reviewId) {
          setCurrentAiAnalysis(res.data);
        }
        onNotify('Review analyzed for sentiment and topics.', 'success');
        fetchAiUsage();
      }
    } catch (err: any) {
      onNotify(err.message || 'Failed to analyze review.', 'warning');
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  // Approve and Publish Suggestion
  const handleApproveAndPublish = async () => {
    if (!currentAiSuggestion) return;
    const finalContent = replyText.trim() || currentAiSuggestion.suggestion;

    if (!finalContent) {
      setReplyError('Reply cannot be empty.');
      return;
    }

    if (!window.confirm('Are you sure you want to explicitly approve and publish this reply to Google Business Profile?')) {
      return;
    }

    try {
      setIsSubmittingReply(true);
      setReplyError(null);
      const res = await api.ai.approveAndPublish(currentAiSuggestion.id, finalContent);
      if (res.success) {
        onNotify('AI reply approved and published to Google Business Profile!', 'success');
        setReplyModalOpen(false);
        fetchReviews();
        fetchAiUsage();
      }
    } catch (err: any) {
      setReplyError(err.message || 'Failed to publish reply to Google.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Submit Reply
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) {
      setReplyError('Reply cannot be empty.');
      return;
    }

    try {
      setIsSubmittingReply(true);
      setReplyError(null);

      if (activeReview.has_reply) {
        await api.reviews.updateReply(activeReview.id, replyText.trim());
        onNotify('Review reply updated on Google Business Profile.', 'success');
      } else {
        await api.reviews.reply(activeReview.id, replyText.trim());
        onNotify('Reply published to Google Business Profile!', 'success');
      }

      setReplyModalOpen(false);
      fetchReviews();
    } catch (err: any) {
      setReplyError(err.message || 'Google rejected the reply. Please check your connection.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Delete Reply
  const handleDeleteReply = async () => {
    if (!activeReview || !window.confirm('Delete this reply from Google Business Profile?')) return;
    try {
      setIsDeletingReply(true);
      await api.reviews.deleteReply(activeReview.id);
      onNotify('Review reply deleted from Google.', 'info');
      setReplyModalOpen(false);
      fetchReviews();
    } catch (err: any) {
      setReplyError(err.message || 'Failed to delete reply from Google.');
    } finally {
      setIsDeletingReply(false);
    }
  };

  const isConnected = Boolean(connectionStatus?.connected);
  const distribution = stats.rating_distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const totalReviews = stats.total_reviews || 0;

  return (
    <div className="space-y-4 animate-fadeIn text-left">
      {/* ═══════ HEADER BANNER ═══════ */}
      <section className="relative overflow-hidden p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4285F4] to-[#2b6cb0] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <i className="fa-brands fa-google text-2xl"></i>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-extrabold text-blue-700 tracking-wider mb-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              Google Business Profile &bull; Reviews Sync
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
              Google Reviews &amp; Replies
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage and reply to authentic reviews directly from your Google Business Profile.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* AI Usage Indicator */}
          <div className="px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <i className="fa-solid fa-wand-magic-sparkles text-purple-500"></i>
            <span>AI Assistant: {aiUsage ? `${aiUsage.monthlyCount}/${aiUsage.limit} used` : 'Active'}</span>
          </div>

          {isConnected ? (
            <>
              <button
                onClick={handleSyncReviews}
                disabled={syncing}
                className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <i className={`fa-solid fa-arrows-rotate ${syncing ? 'animate-spin' : ''}`}></i>
                <span>{syncing ? 'Syncing…' : 'Sync Reviews'}</span>
              </button>

              <button
                onClick={handleOpenConnectModal}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <i className="fa-solid fa-link text-slate-400"></i>
                <span>Google Settings</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleInitiateGoogleConnect}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4285F4] to-[#1a73e8] hover:from-[#3367d6] hover:to-[#174ea6] text-white text-xs font-black transition-all flex items-center gap-2 shadow-md cursor-pointer"
            >
              <i className="fa-brands fa-google text-sm"></i>
              <span>Connect Google Account</span>
            </button>
          )}
        </div>
      </section>

      {/* ═══════ DISCONNECTED CALLOUT ═══════ */}
      {!isConnected && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-sm shrink-0 mt-0.5">
              <i className="fa-brands fa-google"></i>
            </div>
            <div>
              <h4 className="text-xs font-bold text-blue-950">
                Connect your Google Business Profile
              </h4>
              <p className="text-[11px] text-blue-700 leading-tight mt-0.5">
                Link your Google account to automatically import customer reviews, calculate verified ratings, and publish replies directly to Google Maps.
              </p>
            </div>
          </div>
          <button
            onClick={handleInitiateGoogleConnect}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 cursor-pointer"
          >
            Connect Now &rarr;
          </button>
        </div>
      )}

      {/* ═══════ 4 TOP KPI CARDS ═══════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Total Reviews */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                <i className="fa-solid fa-comments"></i>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Total Reviews
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.total_reviews}</div>
          </div>
          <span className="text-[10px] text-slate-400 block pt-1">
            Official Google Business Profile
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400"></div>
        </div>

        {/* KPI 2: Average Rating */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs">
                <i className="fa-solid fa-star"></i>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Average Rating
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 flex items-center gap-1.5">
              <span>{stats.average_rating}</span>
              <span className="text-amber-500 text-base">★</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 block pt-1">
            Calculated across verified ratings
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-400"></div>
        </div>

        {/* KPI 3: Needs Reply */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs">
                <i className="fa-solid fa-reply"></i>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Needs Reply
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.unreplied_count}</div>
          </div>
          <span className="text-[10px] text-slate-400 block pt-1">
            Customer reviews awaiting response
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-400"></div>
        </div>

        {/* KPI 4: Replied */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Replied Reviews
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-700">{stats.replied_count}</div>
          </div>
          <span className="text-[10px] text-slate-400 block pt-1">
            Confirmed published to Google
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500"></div>
        </div>
      </div>

      {/* ═══════ RATING DISTRIBUTION BAR ═══════ */}
      <section className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-black text-slate-900">Rating Distribution</div>
          <span className="text-[11px] text-slate-400 font-semibold">{totalReviews} Verified Ratings</span>
        </div>

        <div className="grid grid-cols-5 gap-2 pt-1">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = distribution[stars] || 0;
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <button
                key={stars}
                onClick={() => setRatingFilter(ratingFilter === stars ? undefined : stars)}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  ratingFilter === stars
                    ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                    : 'border-slate-100 hover:border-slate-300 bg-slate-50/40'
                }`}
              >
                <div className="text-xs font-bold text-amber-500 flex items-center justify-center gap-1">
                  <span>{stars}</span>
                  <span>★</span>
                </div>
                <div className="text-sm font-black text-slate-800 mt-0.5">{count}</div>
                <div className="text-[10px] text-slate-400 font-semibold">{pct}%</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ═══════ FILTER TOOLBAR ═══════ */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') fetchReviews(); }}
              placeholder="Search reviewer or comment text…"
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-2.5 text-xs text-slate-400"></i>
          </div>

          <button
            onClick={() => { setPage(1); fetchReviews(); }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer shrink-0"
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Reply Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setReplyFilter(undefined)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                replyFilter === undefined ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setReplyFilter(false)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                replyFilter === false ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Needs Reply
            </button>
            <button
              onClick={() => setReplyFilter(true)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                replyFilter === true ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Replied
            </button>
          </div>

          {/* Reset Filters */}
          {(ratingFilter !== undefined || replyFilter !== undefined || search) && (
            <button
              onClick={() => {
                setRatingFilter(undefined);
                setReplyFilter(undefined);
                setSearch('');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold px-2 py-1 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ═══════ REVIEWS LIST / EMPTY / LOADING ═══════ */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-500">Loading Google reviews…</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-sm">
            <i className="fa-solid fa-comments"></i>
          </div>
          <h3 className="text-sm font-bold text-slate-700">No reviews found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {isConnected
              ? 'No reviews match your current filter settings, or your Google Business Profile has not received reviews yet.'
              : 'Connect your Google Business Profile to sync and manage customer reviews.'}
          </p>
          {!isConnected && (
            <button
              onClick={handleInitiateGoogleConnect}
              className="mt-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer inline-block"
            >
              Connect Google Account
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                <div className="flex items-start gap-3">
                  {rev.reviewer_photo_url ? (
                    <img
                      src={rev.reviewer_photo_url}
                      alt={rev.reviewer_name}
                      className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 font-black text-xs flex items-center justify-center shrink-0 border border-slate-200">
                      {rev.reviewer_name?.charAt(0) || 'G'}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900">{rev.reviewer_name || 'Google Reviewer'}</h4>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                        <i className="fa-brands fa-google text-[9px]"></i>
                        Verified Review
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="text-amber-500 text-xs font-black">
                        {'★'.repeat(rev.star_rating)}
                        <span className="text-slate-200">{'★'.repeat(5 - rev.star_rating)}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {rev.review_created_at ? new Date(rev.review_created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {rev.has_reply ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <i className="fa-solid fa-check"></i>
                      Replied
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      <i className="fa-solid fa-clock"></i>
                      Needs Reply
                    </span>
                  )}

                  <button
                    onClick={() => handleOpenReplyModal(rev, true)}
                    className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    title="Draft response with AI Review Assistant"
                  >
                    <i className="fa-solid fa-wand-magic-sparkles text-indigo-500 text-[11px]"></i>
                    <span>AI Draft</span>
                  </button>

                  <button
                    onClick={() => handleOpenReplyModal(rev, false)}
                    className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    {rev.has_reply ? 'Edit Reply' : 'Reply'}
                  </button>
                </div>
              </div>

              {/* Review Text */}
              {rev.review_text && (
                <p className="text-xs text-slate-700 leading-relaxed font-normal bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                  {rev.review_text}
                </p>
              )}

              {/* AI Review Analysis Display / Action */}
              {reviewAnalyses[rev.id] ? (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-black text-slate-400">AI Insights:</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        reviewAnalyses[rev.id].sentiment === 'positive'
                          ? 'bg-emerald-100 text-emerald-800'
                          : reviewAnalyses[rev.id].sentiment === 'negative'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {reviewAnalyses[rev.id].sentiment}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        reviewAnalyses[rev.id].urgency === 'high'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : reviewAnalyses[rev.id].urgency === 'medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        Urgency: {reviewAnalyses[rev.id].urgency}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {reviewAnalyses[rev.id].topics?.map((topic: string) => (
                        <span key={topic} className="px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 text-[10px] font-semibold">
                          #{topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  {reviewAnalyses[rev.id].summary && (
                    <p className="text-[11px] text-slate-600 italic">
                      &ldquo;{reviewAnalyses[rev.id].summary}&rdquo;
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <button
                    onClick={() => handleAnalyzeReview(rev.id)}
                    disabled={isAnalyzingAi}
                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <i className="fa-solid fa-magnifying-glass-chart text-[10px]"></i>
                    <span>Analyze sentiment &amp; topics with AI</span>
                  </button>
                </div>
              )}

              {/* Existing Owner Reply */}
              {rev.has_reply && rev.google_reply_text && (
                <div className="ml-4 pl-3.5 border-l-2 border-emerald-500 py-1 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-emerald-800 flex items-center gap-1">
                      <i className="fa-solid fa-reply text-[9px]"></i>
                      Your Response (Business Owner)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {rev.google_reply_updated_at ? new Date(rev.google_reply_updated_at).toLocaleDateString() : 'Updated'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    &ldquo;{rev.google_reply_text}&rdquo;
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 rounded-lg border border-slate-200 font-bold disabled:opacity-40 cursor-pointer"
              >
                &larr; Previous
              </button>
              <span className="text-slate-500 font-semibold">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 rounded-lg border border-slate-200 font-bold disabled:opacity-40 cursor-pointer"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══════ REPLY MODAL ═══════ */}
      {replyModalOpen && activeReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setReplyModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-fadeIn text-left">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {activeReview.has_reply ? 'Edit Google Review Reply' : 'Reply to Google Review'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Published directly to Google Business Profile for {activeReview.reviewer_name || 'Customer'}.
                </p>
              </div>
              <button
                onClick={() => setReplyModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg cursor-pointer p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitReply} className="p-5 space-y-4">
              {/* Review summary */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-800">{activeReview.reviewer_name}</strong>
                  <span className="text-amber-500 font-black">{'★'.repeat(activeReview.star_rating)}</span>
                </div>
                {activeReview.review_text && (
                  <p className="text-slate-600 line-clamp-3 italic">&ldquo;{activeReview.review_text}&rdquo;</p>
                )}
                {/* Compact AI analysis if available */}
                {currentAiAnalysis && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 flex-wrap gap-1">
                    <span className="font-semibold text-slate-700">
                      Detected: <span className="font-bold text-slate-900 uppercase">{currentAiAnalysis.sentiment}</span> sentiment • Urgency: <span className="font-bold uppercase">{currentAiAnalysis.urgency}</span>
                    </span>
                    <span>{currentAiAnalysis.summary}</span>
                  </div>
                )}
              </div>

              {/* ═══════ AI ASSISTANT CONTROLS ═══════ */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-slate-50 border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-indigo-950">
                    <i className="fa-solid fa-wand-magic-sparkles text-indigo-600 text-sm"></i>
                    <span>AI Reply Assistant</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold ml-1">
                      Assistant
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-medium">
                    Strict safety: No hallucinations, unverified refunds, or claims.
                  </span>
                </div>

                {/* Tone & Language Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Tone selector */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Tone of Voice:
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-lg border border-slate-200">
                      {(['professional', 'friendly', 'empathetic', 'concise'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setAiTone(t)}
                          className={`px-2 py-1 rounded-md text-[11px] font-bold capitalize transition-all cursor-pointer ${
                            aiTone === t
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language selector */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Response Language:
                    </label>
                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 h-[34px]">
                      <button
                        type="button"
                        onClick={() => setAiLanguage('en')}
                        className={`flex-1 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                          aiLanguage === 'en'
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiLanguage('hi')}
                        className={`flex-1 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                          aiLanguage === 'hi'
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        हिंदी (Hindi)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Generate AI Draft Button */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => handleGenerateAiSuggestion()}
                    disabled={isGeneratingAi}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingAi ? (
                      <>
                        <i className="fa-solid fa-circle-notch animate-spin"></i>
                        <span>Drafting suggestion…</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-sparkles"></i>
                        <span>{currentAiSuggestion ? 'Regenerate Draft' : 'Generate AI Suggestion'}</span>
                      </>
                    )}
                  </button>

                  <span className="text-[10px] text-slate-400">
                    Requires owner review before publish.
                  </span>
                </div>

                {/* Suggestion Card preview */}
                {currentAiSuggestion && (
                  <div className="p-3 bg-white rounded-xl border border-indigo-200 shadow-2xs space-y-2 text-xs animate-fadeIn">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-indigo-700 uppercase flex items-center gap-1">
                        <i className="fa-solid fa-quote-left"></i>
                        AI Suggested Reply ({currentAiSuggestion.tone} • {currentAiSuggestion.language})
                      </span>
                      <span className="text-slate-400">
                        Model: {currentAiSuggestion.provider}/{currentAiSuggestion.model}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 leading-relaxed bg-indigo-50/40 p-2.5 rounded-lg border border-indigo-100">
                      {currentAiSuggestion.suggestion}
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyText(currentAiSuggestion.suggestion);
                          onNotify('Suggestion copied to reply editor for your review.', 'info');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                      >
                        <i className="fa-solid fa-pen mr-1"></i>
                        Insert into Editor
                      </button>

                      <button
                        type="button"
                        onClick={handleApproveAndPublish}
                        disabled={isSubmittingReply}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1"
                      >
                        <i className="fa-solid fa-check"></i>
                        <span>Approve &amp; Publish to Google</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {replyError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation text-red-500"></i>
                  <span>{replyError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Official Response (Publishable to Google):
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  maxLength={4096}
                  placeholder="Review or write your response here before approving and publishing to Google…"
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                ></textarea>
                <div className="text-[10px] text-slate-400 text-right mt-1">
                  {replyText.length} / 4096 characters
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                {activeReview.has_reply ? (
                  <button
                    type="button"
                    onClick={handleDeleteReply}
                    disabled={isDeletingReply}
                    className="text-xs text-red-600 hover:text-red-800 font-bold cursor-pointer disabled:opacity-50"
                  >
                    {isDeletingReply ? 'Deleting…' : 'Delete Reply'}
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReplyModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingReply || !replyText.trim()}
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSubmittingReply && <i className="fa-solid fa-circle-notch animate-spin"></i>}
                    <span>{isSubmittingReply ? 'Publishing…' : 'Publish Reply'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════ GOOGLE SETTINGS & LOCATION MAPPING MODAL ═══════ */}
      {connectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setConnectModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-fadeIn text-left">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">Google Business Profile Integration</h3>
                <p className="text-[11px] text-slate-400">Configure connection and location links.</p>
              </div>
              <button
                onClick={() => setConnectModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg cursor-pointer p-1"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Connection Status Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Connected Account</div>
                  <strong className="text-xs text-slate-800">
                    {connectionStatus?.connection?.google_email || 'No account connected'}
                  </strong>
                </div>

                {isConnected ? (
                  <button
                    onClick={handleDisconnect}
                    className="text-xs text-red-600 hover:text-red-800 font-bold cursor-pointer"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={handleInitiateGoogleConnect}
                    className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs cursor-pointer"
                  >
                    Connect
                  </button>
                )}
              </div>

              {/* Linked Locations List */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2">Linked Locations ({locationLinks.length})</h4>
                {locationLinks.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No locations linked yet.</p>
                ) : (
                  <div className="space-y-2">
                    {locationLinks.map((link) => (
                      <div
                        key={link.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <strong className="text-slate-800 block">{link.google_location_name || 'Google Location'}</strong>
                          <span className="text-[10px] text-slate-400">
                            Sync Status: <span className="font-bold text-emerald-700 uppercase">{link.sync_status}</span>
                            {link.last_synced_at && ` • Last: ${new Date(link.last_synced_at).toLocaleDateString()}`}
                          </span>
                        </div>

                        <button
                          onClick={async () => {
                            if (window.confirm('Unlink this Google location?')) {
                              await api.google.unlinkLocation(link.id);
                              onNotify('Location unlinked.', 'info');
                              fetchLocationLinks();
                            }
                          }}
                          className="text-slate-400 hover:text-red-600 text-xs p-1 cursor-pointer"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Link New Location Form */}
              {isConnected && locations.length > 0 && myLocations.length > 0 && (
                <form onSubmit={handleLinkLocation} className="pt-3 border-t border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900">Link a Location</h4>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      ReviewFlow Business Location:
                    </label>
                    <select
                      value={selectedReviewflowLoc}
                      onChange={(e) => setSelectedReviewflowLoc(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
                    >
                      {myLocations.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name} ({l.address || 'Primary'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Google Business Profile Location:
                    </label>
                    <select
                      value={selectedGoogleLoc}
                      onChange={(e) => setSelectedGoogleLoc(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
                    >
                      {locations.map((g) => (
                        <option key={g.google_location_id} value={g.google_location_id}>
                          {g.business_name} — {g.address}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isLinking}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isLinking ? 'Linking…' : '✓ Link Location & Start Sync'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
