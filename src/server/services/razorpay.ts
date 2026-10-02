import crypto from 'crypto';
import { getRazorpayConfig, isRazorpayConfigured } from '../config/razorpay';

export interface CreateCustomerParams {
  name: string;
  email: string;
  phone?: string;
  notes?: Record<string, string>;
}

export interface CreateSubscriptionParams {
  plan_id: string; // Razorpay plan ID
  customer_id?: string;
  total_count?: number;
  quantity?: number;
  customer_notify?: 0 | 1;
  start_at?: number;
  notes?: Record<string, string>;
}

export class RazorpayService {
  private static getHeaders() {
    const { key_id, key_secret } = getRazorpayConfig();
    const auth = Buffer.from(`${key_id}:${key_secret}`).toString('base64');
    return {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`
    };
  }

  /**
   * Verifies Razorpay Webhook Signature using HMAC SHA-256
   */
  public static verifyWebhookSignature(rawBody: string | Buffer, signature: string, secretOverride?: string): boolean {
    const { webhook_secret } = getRazorpayConfig();
    const secret = secretOverride || webhook_secret;

    if (!secret || !signature) {
      return false;
    }

    try {
      const bodyString = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf-8');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(bodyString)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (err) {
      console.warn('[RazorpayService] Signature verification exception:', err);
      return false;
    }
  }

  /**
   * Verifies Payment Signature for standard checkout
   */
  public static verifyPaymentSignature(params: {
    razorpay_payment_id: string;
    razorpay_subscription_id?: string;
    razorpay_order_id?: string;
    razorpay_signature: string;
  }): boolean {
    const { key_secret } = getRazorpayConfig();
    if (!key_secret) return false;

    try {
      const target = params.razorpay_subscription_id
        ? `${params.razorpay_payment_id}|${params.razorpay_subscription_id}`
        : `${params.razorpay_order_id}|${params.razorpay_payment_id}`;

      const expected = crypto
        .createHmac('sha256', key_secret)
        .update(target)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(params.razorpay_signature, 'hex'),
        Buffer.from(expected, 'hex')
      );
    } catch {
      return false;
    }
  }

  /**
   * Creates or retrieves a Razorpay customer
   */
  public static async createCustomer(params: CreateCustomerParams): Promise<{ id: string; name: string; email: string }> {
    if (!isRazorpayConfigured()) {
      return {
        id: `cust_mock_${Math.random().toString(36).substring(2, 10)}`,
        name: params.name,
        email: params.email
      };
    }

    try {
      const res = await fetch('https://api.razorpay.com/v1/customers', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          name: params.name,
          email: params.email,
          contact: params.phone,
          notes: params.notes
        })
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error?.description || `Failed to create Razorpay customer: ${res.statusText}`);
      }

      const data = await res.json();
      return {
        id: data.id,
        name: data.name,
        email: data.email
      };
    } catch (err) {
      console.warn('[RazorpayService] createCustomer failed, fallback to mock in dev:', err);
      return {
        id: `cust_mock_${Math.random().toString(36).substring(2, 10)}`,
        name: params.name,
        email: params.email
      };
    }
  }

  /**
   * Creates a Razorpay Subscription
   */
  public static async createSubscription(params: CreateSubscriptionParams): Promise<any> {
    if (!isRazorpayConfigured()) {
      const now = Math.floor(Date.now() / 1000);
      return {
        id: `sub_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        plan_id: params.plan_id,
        customer_id: params.customer_id || 'cust_mock_sandbox',
        status: 'created',
        current_start: now,
        current_end: now + 30 * 24 * 60 * 60,
        charge_at: now,
        total_count: params.total_count || 12,
        paid_count: 0,
        remaining_count: params.total_count || 12,
        short_url: `https://rzp.io/i/mock_${Date.now()}`,
        simulated: true
      };
    }

    const res = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        plan_id: params.plan_id,
        total_count: params.total_count || 12,
        quantity: params.quantity || 1,
        customer_notify: params.customer_notify !== undefined ? params.customer_notify : 1,
        start_at: params.start_at,
        notes: params.notes
      })
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error?.description || `Failed to create Razorpay subscription: ${res.statusText}`);
    }

    return res.json();
  }

  /**
   * Cancels a Razorpay subscription (immediately or at end of cycle)
   */
  public static async cancelSubscription(subscriptionId: string, cancelAtCycleEnd: boolean = true): Promise<any> {
    if (!isRazorpayConfigured() || subscriptionId.startsWith('sub_mock_')) {
      return {
        id: subscriptionId,
        status: cancelAtCycleEnd ? 'active' : 'cancelled',
        cancel_at_cycle_end: cancelAtCycleEnd
      };
    }

    const res = await fetch(`https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0
      })
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error?.description || `Failed to cancel Razorpay subscription: ${res.statusText}`);
    }

    return res.json();
  }

  /**
   * Retrieves current subscription details from Razorpay
   */
  public static async getSubscription(subscriptionId: string): Promise<any> {
    if (!isRazorpayConfigured() || subscriptionId.startsWith('sub_mock_')) {
      const now = Math.floor(Date.now() / 1000);
      return {
        id: subscriptionId,
        status: 'active',
        current_start: now - 5 * 24 * 60 * 60,
        current_end: now + 25 * 24 * 60 * 60,
        charge_at: now + 25 * 24 * 60 * 60,
        paid_count: 1
      };
    }

    const res = await fetch(`https://api.razorpay.com/v1/subscriptions/${subscriptionId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch Razorpay subscription: ${res.statusText}`);
    }

    return res.json();
  }

  /**
   * Fetches invoices associated with a subscription
   */
  public static async getInvoices(subscriptionId: string): Promise<any[]> {
    if (!isRazorpayConfigured() || subscriptionId.startsWith('sub_mock_')) {
      return [
        {
          id: `inv_mock_${Date.now()}`,
          subscription_id: subscriptionId,
          amount: 19900,
          currency: 'INR',
          status: 'paid',
          issued_at: Math.floor(Date.now() / 1000),
          paid_at: Math.floor(Date.now() / 1000),
          invoice_number: `INV-${Date.now().toString().slice(-6)}`
        }
      ];
    }

    const res = await fetch(`https://api.razorpay.com/v1/invoices?subscription_id=${subscriptionId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  }
}
