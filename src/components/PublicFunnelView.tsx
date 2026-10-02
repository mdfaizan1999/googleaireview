import React, { useState, useEffect } from 'react';

interface PublicFunnelViewProps {
  slug?: string;
  onBackToHome?: () => void;
}

export const PublicFunnelView: React.FC<PublicFunnelViewProps> = ({
  slug = 'muzaffarabad-reviews',
  onBackToHome
}) => {
  const [funnelData, setFunnelData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [comment, setComment] = useState('');
  const [selectedHighlights, setSelectedHighlights] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<any>(null);
  const [copiedText, setCopiedText] = useState(false);

  const availableTags = [
    'Friendly Staff',
    'Quick Service',
    'Spotless Clean',
    'Fair Pricing',
    'High Quality',
    'Highly Recommended'
  ];

  // Fetch funnel config on mount
  useEffect(() => {
    async function loadFunnel() {
      try {
        setLoading(true);
        const res = await fetch(`/api/public/funnels/${slug}`);
        const json = await res.json();
        if (json.success && json.data) {
          setFunnelData(json.data);
          // Send page_view event
          fetch(`/api/public/funnels/${slug}/event`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event_type: 'page_view' })
          }).catch(() => {});
        } else {
          setError(json.message || 'Funnel not found');
        }
      } catch (err: any) {
        // Fallback for standalone demo
        setFunnelData({
          funnel: {
            title: 'How was your experience today?',
            subtitle: 'Your feedback helps other local customers find trusted care.',
            primary_color: '#34A853',
            background_color: '#F9FAFB',
            google_review_url: 'https://g.page/r/CbX7-reviewflow/review',
            show_customer_name: true
          },
          business: {
            name: 'Muzaffarabad azad jamu and kashmir',
            category: 'Healthcare & Dental',
            min_star_threshold: 4
          }
        });
      } finally {
        setLoading(false);
      }
    }

    loadFunnel();
  }, [slug]);

  const handleRatingSelect = (selectedStar: number) => {
    setRating(selectedStar);
    fetch(`/api/public/funnels/${slug}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'rating_selected',
        metadata: { rating: selectedStar }
      })
    }).catch(() => {});
  };

  const toggleTag = (tag: string) => {
    setSelectedHighlights((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleGenerateDraft = () => {
    const highlights = selectedHighlights.length > 0 ? selectedHighlights.join(', ') : 'overall service';
    let draft = '';

    if (rating === 5) {
      draft = `Outstanding experience at ${funnelData?.business?.name || 'this location'}! The team was exceptional with their ${highlights.toLowerCase()}. Everything went smoothly and I highly recommend them to anyone in the area!`;
    } else if (rating === 4) {
      draft = `Great visit overall! Really appreciated the ${highlights.toLowerCase()}. Minor wait time, but the staff was courteous and attentive throughout.`;
    } else {
      draft = `Had a couple of concerns during my visit regarding ${highlights.toLowerCase()}. Sharing my honest feedback so the management team can make improvements.`;
    }

    setComment(draft);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/public/funnels/${slug}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment,
          reviewer_name: customerName,
          reviewer_phone: customerPhone,
          reviewer_email: customerEmail
        })
      });

      const json = await res.json();
      setFeedbackResult(json.data || { is_positive: rating >= 4, redirect_url: 'https://google.com' });
    } catch {
      setFeedbackResult({ is_positive: rating >= 4, redirect_url: 'https://google.com' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyReview = () => {
    if (comment) {
      navigator.clipboard.writeText(comment);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);

      fetch(`/api/public/funnels/${slug}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: 'copy_clicked' })
      }).catch(() => {});
    }
  };

  const handleGoogleRedirect = () => {
    fetch(`/api/public/funnels/${slug}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'google_clicked' })
    }).catch(() => {});

    const targetUrl = feedbackResult?.redirect_url || funnelData?.funnel?.google_review_url || 'https://google.com';
    window.location.href = targetUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-700">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-500">Loading Review Funnel…</p>
        </div>
      </div>
    );
  }

  if (error && !funnelData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-700">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-lg font-black text-slate-900">Funnel Not Available</h2>
          <p className="text-xs text-slate-500">{error}</p>
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-emerald-700"
            >
              Return to Homepage
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50/20 text-slate-900 font-sans flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top branding bar */}
      <div className="max-w-xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#34A853] to-[#2D9248] text-white flex items-center justify-center shadow-xs text-xs font-black">
            RF
          </div>
          <span className="text-xs font-black text-slate-800">
            ReviewFlow <span className="text-emerald-600">AI</span>
          </span>
        </div>

        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="text-xs text-slate-400 hover:text-slate-700 font-semibold cursor-pointer"
          >
            &larr; Exit
          </button>
        )}
      </div>

      {/* Main funnel card */}
      <div className="max-w-xl w-full mx-auto my-auto py-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-6 sm:p-8 text-left space-y-5 relative overflow-hidden">
          {/* Header */}
          <div className="text-center space-y-1.5 pb-2 border-b border-slate-100">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {funnelData?.business?.name || 'Verified Business'}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {funnelData?.funnel?.title || 'How was your experience today?'}
            </h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {funnelData?.funnel?.subtitle || 'Your feedback helps other local customers find trusted care.'}
            </p>
          </div>

          {/* Feedback Form vs Result */}
          {!feedbackResult ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating Selector */}
              <div className="text-center py-2 bg-slate-50/70 rounded-2xl border border-slate-100 p-4">
                <div className="text-xs font-bold text-slate-600 mb-2">Tap to Rate Your Experience</div>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingSelect(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 cursor-pointer transition-transform hover:scale-115 focus:outline-none"
                    >
                      <svg
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill={(hoverRating || rating) >= star ? '#FBBF24' : 'none'}
                        stroke={(hoverRating || rating) >= star ? '#F59E0B' : '#CBD5E1'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-colors"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  ))}
                </div>
                <div className="text-xs font-black text-amber-600 mt-2">
                  {rating === 5 && '★★★★★ Excellent · 5 Stars'}
                  {rating === 4 && '★★★★☆ Very Good · 4 Stars'}
                  {rating === 3 && '★★★☆☆ Average · 3 Stars'}
                  {rating === 2 && '★★☆☆☆ Needs Improvement · 2 Stars'}
                  {rating === 1 && '★☆☆☆☆ Unhappy · 1 Star'}
                </div>
              </div>

              {/* What stood out tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  What stood out during your visit? (Tap to include)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag) => {
                    const active = selectedHighlights.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-all cursor-pointer ${
                          active
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {tag} {active ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment & AI drafter button */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Write Your Feedback</label>
                  <button
                    type="button"
                    onClick={handleGenerateDraft}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <i className="fa-solid fa-wand-magic-sparkles text-emerald-500"></i> Suggest Review Draft
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details of your experience to help the business and other local customers…"
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                ></textarea>
              </div>

              {/* Name & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Your Name (Optional)</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Mobile / Email (Optional)</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="For follow-up resolution"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-[#34A853] to-[#2D9248] hover:from-[#2e944a] hover:to-[#257c3d] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting Your Review…</span>
                  </>
                ) : (
                  <span>Submit &amp; Continue &rarr;</span>
                )}
              </button>
            </form>
          ) : (
            /* Result Screen */
            <div className="space-y-4 py-2 animate-fadeIn text-center">
              {feedbackResult.is_positive ? (
                /* Positive 5-Star Path */
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl font-black shadow-sm">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Your Review is Ready for Google!</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Thank you for sharing your support. Copy your review below and paste it on Google Maps in 1 click!
                    </p>
                  </div>

                  {comment && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Your Draft</div>
                      <p className="text-xs text-slate-800 font-medium italic leading-relaxed">"{comment}"</p>
                      <button
                        type="button"
                        onClick={handleCopyReview}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-emerald-100"
                      >
                        <i className="fa-solid fa-copy"></i>
                        <span>{copiedText ? 'Copied to Clipboard!' : 'Copy Review Text'}</span>
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleGoogleRedirect}
                    className="w-full py-3.5 bg-gradient-to-r from-[#34A853] to-[#2D9248] text-white font-black text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Post Review on Google Maps &rarr;</span>
                  </button>
                </div>
              ) : (
                /* Negative 1-3 Star Path (Private Triage) */
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-2xl font-black shadow-sm">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Thank You for Your Honest Feedback</h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                      We take customer satisfaction seriously. Your comments have been privately routed directly to the business owner so they can address your concerns immediately.
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-left text-xs text-amber-900 space-y-1">
                    <strong className="block font-bold">Priority Management Resolution:</strong>
                    <span>If you provided contact details, a manager will follow up with you within 24 hours.</span>
                  </div>

                  <div className="pt-2 text-center">
                    <button
                      onClick={handleGoogleRedirect}
                      className="text-xs text-slate-400 hover:text-slate-600 underline font-semibold cursor-pointer"
                    >
                      I still want to post publicly on Google Maps
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-400 py-2">
        Powered by ReviewFlow AI &bull; Verified Google Review Partner Technology
      </div>
    </div>
  );
};
