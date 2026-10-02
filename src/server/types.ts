export type UserRole = 'user' | 'admin' | 'agency' | 'staff';
export type AdminRole = 'super_admin' | 'admin' | 'support' | 'finance' | 'analyst';
export type UserStatus = 'active' | 'deactivated' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  admin_role?: AdminRole;
  status: UserStatus;
  email_verified_at?: string;
  last_login_at?: string;
  suspended_at?: string;
  suspended_by?: string;
  suspension_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  logo?: string;
  category: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  timezone?: string;
  status: 'active' | 'inactive' | 'suspended';
  google_review_url?: string;
  min_star_threshold?: number;
  custom_keywords?: string[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface BusinessLocation {
  id: string;
  business_id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  timezone?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface GoogleConnection {
  id: string;
  user_id: string;
  provider: 'google';
  google_account_id?: string;
  google_email?: string;
  access_token: string; // AES-256-GCM encrypted
  refresh_token: string; // AES-256-GCM encrypted
  token_expires_at?: string; // ISO Date string
  scopes?: string[];
  status: 'active' | 'expired' | 'revoked' | 'disconnected';
  last_used_at?: string;
  connected_at: string;
  disconnected_at?: string;
  created_at: string;
  updated_at: string;
}

export interface GoogleLocationLink {
  id: string;
  business_id: string;
  business_location_id: string;
  google_connection_id: string;
  google_account_id: string;
  google_location_id: string;
  google_location_name?: string;
  google_maps_url?: string;
  sync_status: 'idle' | 'syncing' | 'synced' | 'failed';
  last_synced_at?: string;
  last_sync_error?: string;
  created_at: string;
  updated_at: string;
}

export interface GoogleReview {
  id: string;
  business_id: string;
  business_location_id?: string;
  google_location_link_id: string;
  google_review_id: string;
  reviewer_name?: string;
  reviewer_profile_url?: string;
  reviewer_photo_url?: string;
  star_rating: number; // 1 to 5
  review_text?: string;
  review_created_at?: string;
  review_updated_at?: string;
  google_reply_text?: string;
  google_reply_updated_at?: string;
  has_reply: boolean;
  synced_at: string;
  created_at: string;
  updated_at: string;
}

export interface GoogleLocation {
  id: string;
  business_id: string;
  google_connection_id?: string;
  google_account_name?: string;
  google_location_name?: string;
  google_location_id?: string;
  place_id: string;
  location_title: string;
  address: string;
  phone?: string;
  website?: string;
  google_maps_url?: string;
  review_url: string;
  rating: number;
  review_count: number;
  verified: boolean;
  status: 'active' | 'inactive';
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  business_id: string;
  google_location_id?: string;
  google_review_id?: string;
  google_review_name?: string;
  reviewer_name: string;
  reviewer_photo?: string;
  rating: number;
  comment: string;
  review_created_at: string;
  review_updated_at?: string;
  owner_reply?: string;
  owner_reply_updated_at?: string;
  reply_status: 'unanswered' | 'replied' | 'pending';
  reply_source?: 'manual' | 'ai';
  policy_violation_status?: 'none' | 'flagged' | 'removed';
  raw_payload?: any;
  created_at: string;
  updated_at: string;
}

export interface ReviewFunnel {
  id: string;
  business_id: string;
  location_id?: string;
  google_location_id?: string;
  name: string;
  slug: string;
  title: string;
  subtitle: string;
  logo?: string;
  primary_color: string;
  background_color: string;
  language: string;
  enabled: boolean;
  show_customer_name: boolean;
  google_review_url: string;
  status?: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface FunnelEvent {
  id: string;
  funnel_id: string;
  event_type: 'page_view' | 'qr_scan' | 'rating_selected' | 'feedback_started' | 'feedback_completed' | 'review_assistant_opened' | 'copy_clicked' | 'google_clicked';
  session_id: string;
  visitor_id: string;
  device?: string;
  browser?: string;
  os?: string;
  country?: string;
  region?: string;
  city?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface QRCode {
  id: string;
  business_id: string;
  funnel_id: string;
  name: string;
  short_code: string;
  destination_url: string;
  style: string;
  foreground_color: string;
  background_color: string;
  logo?: string;
  scan_count: number;
  status: 'active' | 'inactive' | 'paused';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface AnalyticsDaily {
  id: string;
  business_id: string;
  location_id?: string;
  funnel_id?: string;
  date: string; // YYYY-MM-DD
  page_views: number;
  qr_scans: number;
  unique_visitors: number;
  rating_selected: number;
  feedback_started: number;
  feedback_completed: number;
  google_clicks: number;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PlanFeatures {
  analytics: boolean;
  google_reviews: boolean;
  google_reply: boolean;
  ai_review_analysis: boolean;
  ai_reply_generation: boolean;
  multiple_locations: boolean;
  custom_branding: boolean;
  advanced_analytics: boolean;
  api_access: boolean;
  team_members: boolean;
  export: boolean;
}

export interface PlanLimits {
  businesses: number;
  locations: number;
  funnels: number;
  qr_codes: number;
  google_reviews: number;
  ai_generations: number;
  monthly_scans: number;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number; // monthly price default
  monthly_price: number;
  annual_price: number;
  currency: string;
  is_free: boolean;
  billing_interval?: 'month' | 'year';
  razorpay_monthly_plan_id?: string;
  razorpay_annual_plan_id?: string;
  trial_days: number;
  sort_order: number;
  features: Partial<PlanFeatures>;
  limits: Partial<PlanLimits>;
  max_businesses?: number;
  max_locations?: number;
  max_qr_codes?: number;
  monthly_scans?: number;
  ai_generations?: number;
  analytics_enabled?: boolean;
  google_integration?: boolean;
  white_label?: boolean;
  api_access?: boolean;
  status: 'active' | 'archived';
  created_at?: string;
  updated_at?: string;
}

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'paused'
  | 'cancelled'
  | 'expired'
  | 'halted';

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  gateway: 'razorpay' | 'upi' | 'cashfree' | 'stripe' | 'manual';
  gateway_customer_id?: string;
  gateway_subscription_id?: string;
  razorpay_subscription_id?: string;
  razorpay_customer_id?: string;
  status: SubscriptionStatus;
  billing_interval?: 'monthly' | 'annual' | 'month' | 'year';
  starts_at: string;
  ends_at: string;
  current_period_start?: string;
  current_period_end?: string;
  trial_ends_at?: string;
  trial_start?: string;
  trial_end?: string;
  cancel_at_period_end?: boolean;
  cancelled_at?: string;
  ended_at?: string;
  grace_period_end?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface BillingCustomer {
  id: string;
  user_id: string;
  razorpay_customer_id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  subscription_id?: string;
  gateway: 'razorpay' | 'upi' | 'cashfree' | 'manual';
  gateway_order_id?: string;
  gateway_payment_id?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_invoice_id?: string;
  amount: number;
  currency: string;
  status: 'success' | 'pending' | 'failed' | 'refunded';
  payment_method: string;
  method?: string;
  captured_at?: string;
  failed_at?: string;
  failure_code?: string;
  failure_reason?: string;
  paid_at?: string;
  metadata?: Record<string, any>;
  raw_payload?: any;
  created_at?: string;
  updated_at?: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  subscription_id?: string;
  razorpay_invoice_id?: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'issued' | 'pending' | 'expired';
  issued_at: string;
  paid_at?: string;
  due_at?: string;
  hosted_url?: string;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookEvent {
  id: string;
  provider: 'razorpay';
  event_id: string;
  event_type: string;
  signature_verified: boolean;
  payload_hash: string;
  payload: any;
  processed_at?: string;
  processing_status: 'pending' | 'processed' | 'failed' | 'ignored';
  attempts: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface UsageCounter {
  id: string;
  user_id: string;
  business_id?: string;
  feature: string;
  period_start: string;
  period_end: string;
  used: number;
  limit: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  admin_id?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export type AISuggestionStatus = 'generated' | 'edited' | 'accepted' | 'rejected' | 'published' | 'failed';

export interface AIReviewAnalysis {
  id: string;
  review_id: string;
  business_id: string;
  provider: string;
  model: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: 'low' | 'medium' | 'high';
  topics: string[];
  summary?: string;
  confidence?: number;
  prompt_version: string;
  created_at: string;
  updated_at: string;
}

export interface AIReplySuggestion {
  id: string;
  review_id: string;
  business_id: string;
  provider: string;
  model: string;
  tone: 'professional' | 'friendly' | 'empathetic' | 'concise';
  language: 'en' | 'hi';
  suggestion: string;
  prompt_version: string;
  status: AISuggestionStatus;
  created_at: string;
  updated_at: string;
}

export interface AIUsageLog {
  id: string;
  business_id: string;
  user_id: string;
  review_id?: string;
  provider: string;
  model: string;
  tokens_used: number;
  action: 'reply_suggestion' | 'review_analysis' | 'variants';
  status: 'success' | 'failed';
  created_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, any>;
  errors?: Record<string, string>;
}

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  environment: 'all' | 'production' | 'staging' | 'development';
  config?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SystemSettings {
  maintenance_mode: boolean;
  new_registration_enabled: boolean;
  default_timezone: string;
  default_currency: string;
  support_email: string;
  support_url: string;
  billing_grace_period_days: number;
  default_ai_provider: string;
  updated_at: string;
  updated_by?: string;
}

export interface FailedJob {
  id: string;
  queue: string;
  job_name: string;
  payload: any;
  exception: string;
  failed_at: string;
  retried_at?: string;
  status: 'failed' | 'retrying' | 'resolved';
}

export interface SchedulerTask {
  id: string;
  task_name: string;
  interval_minutes: number;
  last_run: string;
  last_status: 'success' | 'failed';
  last_duration_ms: number;
  error_message?: string;
}
