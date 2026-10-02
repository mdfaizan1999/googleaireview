# ReviewFlow AI — Phase 6 System Audit: Razorpay Billing, Subscriptions, Entitlements & Webhooks

**Audit Date**: October 2026  
**Status**: Completed  
**Scope**: Full codebase audit of existing billing, usage limits, entitlement models, Razorpay integration strategy, webhook verification, and database state machine.

---

## 1. Executive Summary & Verification of Existing Modules

ReviewFlow AI has completed Phases 1 through 5:
- **Phase 1 (Core Foundation)**: Authentication, JWT sessions, multi-tenant businesses, users, locations, and RBAC (`user`, `admin`, `agency`, `staff`).
- **Phase 2 (Review Funnel Engine)**: Public review landing pages, QR code generation (`/q/:code`), flyer downloads, star threshold routing (>=4 stars to Google, <4 stars to internal feedback).
- **Phase 3 (Analytics Engine)**: Rolling window daily aggregations, KPI analytics (views, scans, conversion rates, NPS, negative feedback rate), background aggregation scheduler (every 15 min), interactive charts.
- **Phase 4 (Google Business Profile Integration)**: OAuth 2.0 connection, AES-256-GCM token encryption, Google Location linking, review synchronization (every 30 min), review replies (`POST /api/v1/reviews/:id/reply`).
- **Phase 5 (AI Review Assistant)**: Server-side provider abstractions (`GeminiProvider`, `OpenAIProvider`, `MockProvider`), tone mapping, Hindi and English localization, review sentiment and topic analysis, prompt injection defense, and human-in-the-loop explicit approval before posting to Google.

**Phase 6 Goal**:
Replace hardcoded / mock upgrade buttons with a production-ready SaaS billing system powered by Razorpay:
- Server-side Razorpay subscriptions (monthly & annual intervals).
- Authoritative backend payment verification and HMAC SHA-256 webhook processing.
- Centralized feature entitlements (`FeatureService`) and plan usage limits (`PlanLimitService`).
- Grace periods, subscription lifecycle state transitions, invoice and payment history.
- Non-destructive subscription expiration (existing resources are preserved; new creation is restricted).

---

## 2. Existing Billing-Related Code & Limitations

1. **`src/server/routes/billing.ts`**:
   - `GET /api/v1/billing/plans`: Returns static plans from database.
   - `GET /api/v1/billing/subscription`: Returns user subscription from database.
   - `POST /api/v1/billing/upgrade`: Was an offline placeholder accepting a manual `utr` string.
   - `GET /api/v1/billing/payments`: Returns basic payment rows.
   - **Gaps**: No Razorpay SDK integration, no customer mapping, no checkout session endpoint, no webhook verification endpoint, no subscription cancellation, upgrade/downgrade, or grace period logic.

2. **Existing Models in `src/server/database.ts`**:
   - `Plan`: Has `id`, `name`, `slug`, `price`, `currency`, `billing_interval`, `max_businesses`, `max_locations`, `max_qr_codes`, `monthly_scans`, `ai_generations`, `analytics_enabled`, `google_integration`, `white_label`, `api_access`, `status`.
   - `Subscription`: Has `id`, `user_id`, `plan_id`, `gateway`, `status`, `starts_at`, `ends_at`, `trial_ends_at`.
   - `Payment`: Has `id`, `user_id`, `subscription_id`, `gateway`, `gateway_payment_id`, `amount`, `currency`, `status`, `payment_method`, `paid_at`.
   - **Gaps**: Missing Razorpay subscription IDs, Razorpay customer IDs, invoices table, webhook events table, usage counters, grace period fields, cancellation flags (`cancel_at_period_end`), and HMAC signature verification.

3. **Existing Usage & Limits Code**:
   - Phase 5 introduced `db.recordAIUsage` and `db.getAIUsageStats` for AI generations.
   - Phase 2/3 tracks QR scans and funnel page views via `funnel_events`.
   - Locations and funnels are stored in `business_locations` and `review_funnels`.
   - **Gaps**: No centralized `PlanLimitService` or `FeatureService`. Controllers directly inspected queries without atomic usage reservation or uniform boolean entitlement checks.

4. **Frontend Billing Components**:
   - `src/components/BillingPlansView.tsx`: Contained a visual billing dashboard and plan cards with a mock UPI UTR dialog.
   - `src/components/Pricing.tsx`: Landing page pricing table.
   - **Gaps**: Needs real integration with `api.billing.checkout`, `api.billing.cancel`, `api.billing.status`, real usage progress meters, and invoice download history.

---

## 3. Database Changes Required

1. **Extend `Plan` model**:
   - Add `is_free`: boolean
   - Add `monthly_price`: number
   - Add `annual_price`: number
   - Add `razorpay_monthly_plan_id`: string (nullable)
   - Add `razorpay_annual_plan_id`: string (nullable)
   - Add `trial_days`: number
   - Add `features`: Record<string, boolean>
   - Add `limits`: Record<string, number>

2. **Extend `Subscription` model**:
   - Add `razorpay_subscription_id`: string (nullable)
   - Add `razorpay_customer_id`: string (nullable)
   - Add `billing_interval`: 'monthly' | 'annual'
   - Add `current_period_start`: string
   - Add `current_period_end`: string
   - Add `cancel_at_period_end`: boolean
   - Add `cancelled_at`: string (nullable)
   - Add `grace_period_end`: string (nullable)
   - Add `status`: 'trialing' | 'active' | 'past_due' | 'paused' | 'cancelled' | 'expired' | 'halted'

3. **Create `BillingCustomer`**:
   - `id`, `user_id`, `razorpay_customer_id`, `email`, `name`, `created_at`, `updated_at`

4. **Create `Invoice`**:
   - `id`, `user_id`, `subscription_id`, `razorpay_invoice_id`, `invoice_number`, `amount`, `currency`, `status`, `paid_at`, `hosted_url`, `pdf_url`, `created_at`

5. **Create `WebhookEvent`**:
   - `id`, `provider`, `event_id`, `event_type`, `signature_verified`, `payload_hash`, `payload`, `processed_at`, `processing_status`, `error_message`, `created_at`

6. **Create `UsageCounter`**:
   - `id`, `user_id`, `business_id`, `feature`, `period_start`, `period_end`, `used`, `limit`, `created_at`, `updated_at`

---

## 4. API Endpoints Required

1. **Public / Authenticated Plans**:
   - `GET /api/v1/billing/plans` (returns database-driven plans without exposing internal Razorpay secret IDs)
2. **Subscription & Checkout**:
   - `GET /api/v1/billing/status` (unified billing status, current plan, usage meters, grace period state)
   - `GET /api/v1/billing/subscription`
   - `POST /api/v1/billing/checkout` (creates or retrieves Razorpay customer & subscription, returns safe client options)
   - `POST /api/v1/billing/upgrade`
   - `POST /api/v1/billing/downgrade`
   - `POST /api/v1/billing/cancel`
   - `POST /api/v1/billing/reactivate`
3. **Usage & History**:
   - `GET /api/v1/billing/usage`
   - `GET /api/v1/billing/payments`
   - `GET /api/v1/billing/invoices`
4. **Webhooks**:
   - `POST /api/webhooks/razorpay` (raw body HMAC SHA256 validation, idempotency check, async processing)

---

## 5. Security & Idempotency Safeguards

1. **Server-Side Secrets**:
   - `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` are never sent to the client or returned in API responses.
2. **Price Authority**:
   - The frontend only submits `plan_id` and `interval`. The backend retrieves all pricing and currency from the database.
3. **Webhook Verification**:
   - Webhook payloads must match `crypto.createHmac('sha256', secret).update(rawBody).digest('hex')`.
4. **Idempotency**:
   - Webhook events are hashed and deduplicated in `webhook_events`. Repeated deliveries acknowledge with HTTP 200 without duplicate billing updates or credits.
5. **Non-destructive Expiry**:
   - When a plan expires, existing locations, funnels, QR codes, and reviews are preserved. Only creation of new resources exceeding free limits is blocked.
6. **Grace Period**:
   - Configurable grace period (default 3 days) during which users receive past-due notifications while maintaining essential service before restriction.
