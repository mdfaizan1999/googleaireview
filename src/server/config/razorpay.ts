export interface RazorpayConfig {
  key_id: string;
  key_secret: string;
  webhook_secret: string;
  mode: 'test' | 'live';
  grace_period_days: number;
}

export const RAZORPAY_EVENTS = {
  SUBSCRIPTION_AUTHENTICATED: 'subscription.authenticated',
  SUBSCRIPTION_ACTIVATED: 'subscription.activated',
  SUBSCRIPTION_CHARGED: 'subscription.charged',
  SUBSCRIPTION_PENDING: 'subscription.pending',
  SUBSCRIPTION_HALTED: 'subscription.halted',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  SUBSCRIPTION_PAUSED: 'subscription.paused',
  SUBSCRIPTION_RESUMED: 'subscription.resumed',
  PAYMENT_AUTHORIZED: 'payment.authorized',
  PAYMENT_CAPTURED: 'payment.captured',
  PAYMENT_FAILED: 'payment.failed',
  INVOICE_PAID: 'invoice.paid'
} as const;

export function getRazorpayConfig(): RazorpayConfig {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || '';
  const webhook_secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  const mode = (process.env.RAZORPAY_ACCOUNT_MODE === 'live' ? 'live' : 'test') as 'test' | 'live';
  const grace_period_days = Number(process.env.BILLING_GRACE_PERIOD_DAYS) || 3;

  return {
    key_id,
    key_secret,
    webhook_secret,
    mode,
    grace_period_days
  };
}

export function isRazorpayConfigured(): boolean {
  const { key_id, key_secret } = getRazorpayConfig();
  return Boolean(
    key_id &&
    key_secret &&
    !key_id.includes('rzp_test_your_key_id') &&
    !key_id.includes('placeholder') &&
    key_secret.length > 5
  );
}
