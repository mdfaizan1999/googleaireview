import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface BillingPlansViewProps {
  ownerName?: string;
  businessName?: string;
  onNotify: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  onNavigateToDashboard?: () => void;
}

interface PlanLimitInfo {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
}

interface BillingStatusData {
  subscription: {
    id: string;
    plan_id: string;
    status: string;
    billing_interval?: string;
    starts_at: string;
    ends_at: string;
    current_period_start?: string;
    current_period_end?: string;
    cancel_at_period_end?: boolean;
    cancelled_at?: string;
    grace_period_end?: string;
  };
  plan: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    price: number;
    monthly_price: number;
    annual_price: number;
    currency: string;
    is_free: boolean;
    features?: Record<string, boolean>;
    limits?: Record<string, number>;
  };
  isOperational: boolean;
  gracePeriod: {
    in_grace_period: boolean;
    grace_period_end: string | null;
    hours_remaining: number;
  };
  daysRemaining: number;
  usage: Record<string, PlanLimitInfo>;
  features: Record<string, boolean>;
}

interface PlanOption {
  id: string;
  name: string;
  slug: string;
  description: string;
  monthly_price: number;
  annual_price: number;
  currency: string;
  is_free: boolean;
  limits: Record<string, number>;
  features: Record<string, boolean>;
}

export const BillingPlansView: React.FC<BillingPlansViewProps> = ({
  ownerName = 'Business Owner',
  businessName = 'My Business',
  onNotify,
  onNavigateToDashboard
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'plans' | 'usage' | 'invoices' | 'payments'>('plans');

  // Billing interval toggle
  const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly');

  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [billingStatus, setBillingStatus] = useState<BillingStatusData | null>(null);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  // Checkout modal & action states
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutSessionData, setCheckoutSessionData] = useState<any | null>(null);
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  // Load billing data
  const loadBillingData = async () => {
    try {
      setLoading(true);
      const [statusRes, plansRes] = await Promise.all([
        api.billing.getStatus(),
        api.billing.getPlans()
      ]);

      if (statusRes.data) {
        setBillingStatus(statusRes.data);
      }
      if (plansRes.data) {
        setPlans(plansRes.data);
      }
    } catch (err: any) {
      console.error('Failed to load billing status:', err);
      onNotify('Failed to retrieve current billing details.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const loadInvoicesAndPayments = async () => {
    try {
      const [invRes, payRes] = await Promise.all([
        api.billing.getInvoices(),
        api.billing.getPayments()
      ]);
      if (invRes.data) setInvoices(invRes.data);
      if (payRes.data) setPayments(payRes.data);
    } catch (err) {
      console.warn('Failed to load invoice/payment history:', err);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, []);

  useEffect(() => {
    if (activeTab === 'invoices' || activeTab === 'payments') {
      loadInvoicesAndPayments();
    }
  }, [activeTab]);

  // Handle plan checkout / upgrade
  const handleSelectPlan = async (plan: PlanOption) => {
    // If selecting current plan, do nothing
    if (billingStatus?.plan.id === plan.id && billingStatus?.subscription.status === 'active') {
      onNotify(`You are already subscribed to the ${plan.name}.`, 'info');
      return;
    }

    try {
      setIsProcessingCheckout(true);
      const res = await api.billing.checkout({
        plan_id: plan.id,
        interval
      });

      const session = res.data;

      // If switched to Free plan directly
      if (session.free) {
        onNotify(`Successfully moved to the ${plan.name}.`, 'success');
        await loadBillingData();
        setIsProcessingCheckout(false);
        return;
      }

      setCheckoutSessionData(session);

      // Check if window.Razorpay is loaded or can be loaded
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        openRazorpayModal(session, plan);
      } else {
        // Attempt dynamic load of checkout.js
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          openRazorpayModal(session, plan);
        };
        script.onerror = () => {
          // Open simulated test checkout modal
          setShowSandboxModal(true);
        };
        document.body.appendChild(script);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      onNotify(err.message || 'Unable to initiate checkout.', 'warning');
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const openRazorpayModal = (session: any, plan: PlanOption) => {
    try {
      const options = {
        key: session.key_id,
        subscription_id: session.subscription_id,
        name: 'ReviewFlow AI',
        description: `${plan.name} (${interval === 'annual' ? 'Annual' : 'Monthly'})`,
        image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        handler: async (response: any) => {
          try {
            onNotify('Payment authorized by Razorpay! Activating plan...', 'info');
            await api.billing.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id || session.subscription_id,
              razorpay_signature: response.razorpay_signature,
              plan_id: plan.id,
              interval
            });

            onNotify(`Congratulations! You are now subscribed to ${plan.name}.`, 'success');
            await loadBillingData();
            await loadInvoicesAndPayments();
          } catch (verifyErr: any) {
            onNotify(verifyErr.message || 'Verification failed. Please contact support.', 'warning');
          }
        },
        prefill: {
          name: session.customer_name || ownerName,
          email: session.customer_email || 'owner@reviewflow.ai'
        },
        theme: {
          color: '#16A34A'
        },
        modal: {
          ondismiss: () => {
            onNotify('Checkout window closed.', 'info');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        onNotify(`Payment failed: ${resp.error?.description || 'Declined'}`, 'warning');
      });
      rzp.open();
    } catch (err) {
      console.warn('Razorpay modal launch failed, opening sandbox modal:', err);
      setShowSandboxModal(true);
    }
  };

  const handleSimulatePayment = async () => {
    if (!checkoutSessionData) return;
    try {
      setIsProcessingCheckout(true);
      const mockPaymentId = `pay_mock_${Date.now()}`;
      await api.billing.verifyPayment({
        razorpay_payment_id: mockPaymentId,
        razorpay_subscription_id: checkoutSessionData.subscription_id,
        razorpay_signature: 'sig_mock_verified',
        plan_id: checkoutSessionData.plan_id,
        interval: checkoutSessionData.interval
      });

      setShowSandboxModal(false);
      onNotify(`Simulated payment verified! Successfully upgraded to ${checkoutSessionData.plan_name}.`, 'success');
      await loadBillingData();
      await loadInvoicesAndPayments();
    } catch (err: any) {
      onNotify(err.message || 'Simulation verification failed.', 'warning');
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // Handle Cancel Subscription
  const handleCancelSubscription = async (cancelAtEnd: boolean) => {
    try {
      await api.billing.cancelSubscription(cancelAtEnd);
      setShowManageModal(false);
      onNotify(
        cancelAtEnd
          ? 'Subscription set to cancel at the end of the billing period.'
          : 'Subscription cancelled immediately.',
        'info'
      );
      await loadBillingData();
    } catch (err: any) {
      onNotify(err.message || 'Failed to cancel subscription.', 'warning');
    }
  };

  // Handle Reactivate Subscription
  const handleReactivateSubscription = async () => {
    try {
      await api.billing.reactivateSubscription();
      setShowManageModal(false);
      onNotify('Subscription reactivated successfully!', 'success');
      await loadBillingData();
    } catch (err: any) {
      onNotify(err.message || 'Failed to reactivate subscription.', 'warning');
    }
  };

  const currentPlanObj = billingStatus?.plan;
  const currentSub = billingStatus?.subscription;

  // Format date helper
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-left max-w-7xl mx-auto pb-12">
      {/* ═══════ HEADER BANNER ═══════ */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ReviewFlow AI Billing &amp; Plans
            </span>
            <span className="text-xs text-slate-400">&bull; Razorpay Secure Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Subscription &amp; Usage Controls
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Manage your Google Review automation tier, allocate branch capacity, review real-time usage meters, and access official tax invoices.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          {currentSub && (
            <button
              onClick={() => setShowManageModal(true)}
              className="px-4 py-2 text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Manage Subscription
            </button>
          )}

          {onNavigateToDashboard && (
            <button
              onClick={onNavigateToDashboard}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-950/40"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>

      {/* ═══════ GRACE PERIOD / PAST DUE BANNER ═══════ */}
      {billingStatus?.gracePeriod.in_grace_period && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-400 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 text-lg">
              ⚠️
            </div>
            <div>
              <h3 className="text-sm font-black text-amber-950">
                Active Grace Period ({billingStatus.gracePeriod.hours_remaining} hours remaining)
              </h3>
              <p className="text-xs text-amber-800 mt-0.5 max-w-2xl leading-relaxed">
                Your last subscription payment could not be processed. Your QR codes, review funnels, and public landing pages remain active during the grace period. Please renew to avoid service restriction.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('plans')}
            className="px-4 py-2 text-xs font-black text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shrink-0 shadow-md shadow-amber-600/20"
          >
            Update Payment &amp; Renew
          </button>
        </div>
      )}

      {/* ═══════ CURRENT PLAN OVERVIEW CARD ═══════ */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Current Plan</span>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">
                {currentPlanObj?.name || 'Free Plan'}
              </h2>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  currentSub?.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : currentSub?.status === 'past_due'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {currentSub?.status || 'Active'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {currentPlanObj?.description || 'Basic single business access'}
            </p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-6 space-y-1">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Billing Cycle</span>
            <div className="text-base font-black text-slate-900 capitalize">
              {currentSub?.billing_interval || 'Monthly'} Billing
            </div>
            <div className="text-xs text-slate-500">
              {currentPlanObj?.is_free ? '₹0 Forever' : `₹${currentPlanObj?.monthly_price}/month`}
            </div>
          </div>

          <div className="pt-3 md:pt-0 md:pl-6 space-y-1">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Next Renewal / Expiry</span>
            <div className="text-base font-black text-slate-900">
              {formatDate(currentSub?.current_period_end || currentSub?.ends_at)}
            </div>
            <div className="text-xs text-slate-500">
              {billingStatus?.daysRemaining} days remaining in cycle
            </div>
          </div>

          <div className="pt-3 md:pt-0 md:pl-6 flex flex-col justify-center space-y-1.5">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">AI Review Quota</span>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Monthly Usage</span>
              <span className="font-black text-emerald-700">
                {billingStatus?.usage?.ai_generations?.used ?? 0} / {billingStatus?.usage?.ai_generations?.limit ?? 50}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, billingStatus?.usage?.ai_generations?.percentage || 0)}%` }}
              />
            </div>
          </div>
        </div>

        {currentSub?.cancel_at_period_end && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
            <span>
              <strong>Scheduled for Cancellation:</strong> Your subscription will terminate on{' '}
              {formatDate(currentSub.current_period_end || currentSub.ends_at)}. Your account will then move to the Free plan.
            </span>
            <button
              onClick={handleReactivateSubscription}
              className="px-3 py-1 font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors shrink-0"
            >
              Keep Subscription
            </button>
          </div>
        )}
      </div>

      {/* ═══════ TAB NAVIGATION ═══════ */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 text-xs sm:text-sm font-black rounded-xl transition-all ${
            activeTab === 'plans'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Subscription Plans
        </button>
        <button
          onClick={() => setActiveTab('usage')}
          className={`px-4 py-2 text-xs sm:text-sm font-black rounded-xl transition-all ${
            activeTab === 'usage'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Usage &amp; Limits
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 text-xs sm:text-sm font-black rounded-xl transition-all ${
            activeTab === 'invoices'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Invoices &amp; Receipts
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 text-xs sm:text-sm font-black rounded-xl transition-all ${
            activeTab === 'payments'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Payment History
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════
          TAB 1: SUBSCRIPTION PLANS
      ═══════════════════════════════════════════════════ */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Billing Interval Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200">
            <div>
              <h3 className="text-sm font-black text-slate-900">Choose Billing Frequency</h3>
              <p className="text-xs text-slate-500">
                Annual billing includes a 20% discount on all paid tiers.
              </p>
            </div>

            <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setInterval('monthly')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  interval === 'monthly'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setInterval('annual')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  interval === 'annual'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Plan Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((plan) => {
              const isCurrent = billingStatus?.plan?.id === plan.id;
              const isGrowth = plan.slug.includes('yearly') || plan.slug.includes('growth');
              const price = interval === 'annual' ? plan.annual_price : plan.monthly_price;
              const displayPrice = plan.is_free ? '₹0' : `₹${price.toLocaleString('en-IN')}`;
              const periodLabel = plan.is_free ? 'forever' : interval === 'annual' ? '/year' : '/month';

              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-6 flex flex-col justify-between transition-all relative ${
                    isGrowth
                      ? 'bg-gradient-to-b from-white to-emerald-50/50 border-2 border-emerald-500 shadow-lg shadow-emerald-500/10'
                      : isCurrent
                      ? 'bg-white border-2 border-slate-900 shadow-md'
                      : 'bg-white border border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {isGrowth && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-sm">
                      Recommended Tier
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-black text-slate-900">{plan.name}</h4>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-900 text-white">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900">{displayPrice}</span>
                        <span className="text-xs text-slate-500">{periodLabel}</span>
                      </div>
                      {!plan.is_free && interval === 'annual' && (
                        <p className="text-[11px] text-emerald-700 font-bold mt-0.5">
                          Equivalent to ₹{Math.round(plan.annual_price / 12)}/month
                        </p>
                      )}
                    </div>

                    {/* Limits & Feature Highlights */}
                    <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>
                          <strong>{plan.limits?.businesses || 1}</strong> Business Profile(s)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>
                          <strong>{plan.limits?.locations || 1}</strong> Location Branch(es)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>
                          <strong>{plan.limits?.funnels || 2}</strong> Smart Review Funnels
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>
                          <strong>{plan.limits?.qr_codes || 2}</strong> Dynamic QR Codes
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>
                          <strong>{plan.limits?.ai_generations || 20}</strong> AI Generations/mo
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          className={`w-4 h-4 shrink-0 ${plan.features?.custom_branding ? 'text-emerald-600' : 'text-slate-300'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <polyline points="20 6 9 17 4 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className={plan.features?.custom_branding ? '' : 'text-slate-400 line-through'}>
                          Custom Brand QR Flyers
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          className={`w-4 h-4 shrink-0 ${plan.features?.api_access ? 'text-emerald-600' : 'text-slate-300'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <polyline points="20 6 9 17 4 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className={plan.features?.api_access ? '' : 'text-slate-400 line-through'}>
                          API &amp; Webhook Access
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={isCurrent || isProcessingCheckout}
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-black transition-all ${
                        isCurrent
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : isGrowth
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                      }`}
                    >
                      {isCurrent
                        ? 'Current Active Plan'
                        : plan.is_free
                        ? 'Downgrade to Free'
                        : `Upgrade to ${plan.name}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          TAB 2: USAGE & RESOURCE LIMITS
      ═══════════════════════════════════════════════════ */}
      {activeTab === 'usage' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200">
            <h3 className="text-base font-black text-slate-900">Resource Consumption &amp; Capacity</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live consumption meters based on your <strong>{currentPlanObj?.name}</strong> allocations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
              {billingStatus?.usage &&
                Object.entries(billingStatus.usage).map(([key, item]) => {
                  const labelMap: Record<string, string> = {
                    businesses: 'Business Profiles',
                    locations: 'Location Branches',
                    funnels: 'Review Funnels',
                    qr_codes: 'Active QR Codes',
                    ai_generations: 'AI Reply & Analyses (This Month)',
                    google_reviews: 'Google Reviews Synced',
                    monthly_scans: 'QR Code Scans'
                  };

                  const isHigh = item.percentage >= 90;
                  const isMed = item.percentage >= 70 && item.percentage < 90;

                  return (
                    <div key={key} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">{labelMap[key] || key}</span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            isHigh
                              ? 'bg-rose-100 text-rose-800'
                              : isMed
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.percentage}% Used
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-slate-900">{item.used}</span>
                        <span className="text-xs text-slate-500">Max {item.limit}</span>
                      </div>

                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>

                      <div className="text-[11px] text-slate-400 text-right">
                        {item.remaining} remaining capacity
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          TAB 3: INVOICES & RECEIPTS
      ═══════════════════════════════════════════════════ */}
      {activeTab === 'invoices' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Tax Invoices</h3>
              <p className="text-xs text-slate-500">Official GST-compliant receipts generated upon successful subscription cycles.</p>
            </div>
          </div>

          {invoices.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <div className="text-3xl">🧾</div>
              <div className="text-sm font-bold text-slate-700">No Invoices Issued Yet</div>
              <p className="text-xs text-slate-500">Invoices will automatically appear here once payments are processed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Date Issued</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.invoice_number}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(inv.issued_at || inv.created_at)}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">₹{inv.amount}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedReceipt(inv)}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          TAB 4: PAYMENT HISTORY
      ═══════════════════════════════════════════════════ */}
      {activeTab === 'payments' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
          <h3 className="text-base font-black text-slate-900">Razorpay Payment Logs</h3>
          <p className="text-xs text-slate-500">Immutable ledger of verified backend transactions.</p>

          {payments.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <div className="text-3xl">💳</div>
              <div className="text-sm font-bold text-slate-700">No Payments Recorded</div>
              <p className="text-xs text-slate-500">Transaction records will show up once subscriptions are charged.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Payment ID</th>
                    <th className="py-3 px-4">Gateway</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {p.razorpay_payment_id || p.gateway_payment_id || p.id}
                      </td>
                      <td className="py-3 px-4 uppercase text-slate-500">{p.gateway}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(p.paid_at || p.created_at)}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">₹{p.amount}</td>
                      <td className="py-3 px-4 text-slate-600">{p.payment_method || 'CARD/UPI'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            p.status === 'success'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════ SANDBOX / SIMULATED CHECKOUT MODAL ═══════ */}
      {showSandboxModal && checkoutSessionData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-left border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  ⚡
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900">Razorpay Test Simulator</h3>
                  <p className="text-[11px] text-slate-400">Sandbox environment active</p>
                </div>
              </div>
              <button
                onClick={() => setShowSandboxModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Plan:</span>
                <span className="font-bold text-slate-900">{checkoutSessionData.plan_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billing Interval:</span>
                <span className="font-bold text-slate-900 capitalize">{checkoutSessionData.interval}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subscription ID:</span>
                <span className="font-mono text-slate-700">{checkoutSessionData.subscription_id}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-900">Total Charge:</span>
                <span className="font-black text-emerald-700">₹{checkoutSessionData.amount / 100}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              In test mode, clicking below simulates authoritative payment authorization and triggers backend signature validation, subscription provisioning, and tax invoice generation.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSandboxModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingCheckout}
                onClick={handleSimulatePayment}
                className="px-5 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
              >
                {isProcessingCheckout ? 'Authorizing...' : 'Authorize Test Payment (₹)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ MANAGE SUBSCRIPTION MODAL ═══════ */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-left border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Manage Subscription</h3>
              <button onClick={() => setShowManageModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p>
                <strong>Current Plan:</strong> {currentPlanObj?.name}
              </p>
              <p>
                <strong>Current Cycle Ends:</strong> {formatDate(currentSub?.current_period_end || currentSub?.ends_at)}
              </p>
            </div>

            {currentSub?.cancel_at_period_end ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                <p className="text-xs text-amber-900">
                  Your subscription is scheduled to expire at the end of the current billing cycle. You can reactivate anytime before then without losing any business data or custom QR setups.
                </p>
                <button
                  onClick={handleReactivateSubscription}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black"
                >
                  Reactivate Subscription
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
                  Non-destructive policy: When cancelling, all your businesses, locations, funnels, and synced reviews are kept safe. Only creation of new entities exceeding Free plan allowances will be held.
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleCancelSubscription(true)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 transition-colors text-left flex justify-between items-center"
                  >
                    <span>Cancel at End of Billing Cycle</span>
                    <span className="text-[10px] text-amber-700 uppercase font-black">Recommended</span>
                  </button>
                  <button
                    onClick={() => handleCancelSubscription(false)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors text-left"
                  >
                    Cancel Immediately
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowManageModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ RECEIPT / INVOICE VIEW MODAL ═══════ */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 text-left border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                  RF
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">ReviewFlow AI Inc.</h4>
                  <p className="text-[10px] text-slate-400">Tax Invoice / Receipt</p>
                </div>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-slate-600 p-1">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold">Billed To</span>
                <div className="font-black text-slate-900 mt-0.5">{ownerName}</div>
                <div className="text-slate-600">{businessName}</div>
              </div>
              <div className="text-right">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Invoice Details</span>
                <div className="font-mono font-bold text-slate-900 mt-0.5">{selectedReceipt.invoice_number}</div>
                <div className="text-slate-600">{formatDate(selectedReceipt.issued_at || selectedReceipt.created_at)}</div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-700 pb-2 border-b border-slate-200">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-1">
                <span>SaaS Subscription Services</span>
                <span>₹{selectedReceipt.amount}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Integrated GST (18% inclusive)</span>
                <span>₹{Math.round(selectedReceipt.amount * 0.18)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Paid</span>
                <span className="text-emerald-700">₹{selectedReceipt.amount}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-slate-400">Status: Verified Paid via Razorpay</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Print Receipt
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
