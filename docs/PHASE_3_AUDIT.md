# ReviewFlow AI — Phase 3 Project Audit

**Audit Date:** October 01, 2026  
**Target:** Analytics Engine, Daily Event Aggregation & Dashboard Real Data Integration

---

## 1. Existing Backend Structure

- **Runtime & Framework:** Node.js (v22 LTS), Express full-stack server mounted with Vite SPA middleware in `server.ts`.
- **Database Engine:** `src/server/database.ts` storing structured data in `data/db.json` with synchronous in-memory indices and throttled atomic disk persistence.
- **Authentication & Security:** JWT tokens via `Authorization: Bearer <token>` (`src/server/auth.ts`). Strict tenant-level ownership checks are enforced via `getOwnedBusiness`, `getOwnedLocation`, `getOwnedFunnel`, and `getOwnedQr`.

---

## 2. Existing Phase 2 Models & Event System

- **`funnel_events`**:
  - Fields: `id`, `funnel_id`, `event_type`, `session_id`, `visitor_id`, `device`, `browser`, `os`, `referrer`, `utm_source`, `utm_medium`, `utm_campaign`, `metadata`, `created_at`.
  - Supported Event Types:
    - `page_view`
    - `qr_scan`
    - `rating_selected`
    - `feedback_started`
    - `feedback_completed`
    - `review_assistant_opened`
    - `copy_clicked`
    - `google_clicked`
  - Ingestion Endpoints:
    - `POST /api/public/funnels/:slug/event` (strict allowlist, anonymous session & visitor ID)
    - `POST /api/public/funnels/:slug/feedback` (records `feedback_completed`)
    - `GET /q/:shortCode` (atomic `scan_count` increment + records `qr_scan`)
- **`businesses` & `business_locations`**:
  - `id`, `user_id`, `name`, `slug`, `status` (`'active' | 'inactive' | 'suspended'`), `timezone`.
- **`review_funnels`**:
  - `id`, `business_id`, `location_id`, `name`, `slug`, `enabled`, `google_review_url`.
- **`qr_codes`**:
  - `id`, `business_id`, `funnel_id`, `name`, `short_code`, `destination_url`, `scan_count`, `status`.

---

## 3. Existing Dashboard Components

1. **`src/components/BusinessDashboard.tsx`**:
   - Main operator hub with 8 summary KPI cards:
     - QR Scans
     - Funnel Visits
     - AI Generated / Ratings
     - Reviews Selected
     - Scan &rarr; Review Conversion %
     - Direct Clicks
     - Completed Reviews
     - Unique Visitors
   - Quick action shortcuts, usage rate guidelines, and recent review activity list.
2. **`src/components/BusinessAnalyticsView.tsx`**:
   - Dedicated analytics tab with period selector: `7`, `30`, `90`, `all`.
   - 4 Top KPI Cards: Funnel Visits, Generated Reviews, Copied & Clicked, Submission Attempts (Google clicks + redirect rate).
   - 4-Step Funnel Journey Pipeline:
     - Step 1: Funnel Visits
     - Step 2: Reviews Generated / Ratings Selected
     - Step 3: Drafts Copied / Feedback Started
     - Step 4: Submission Attempts / Google Clicks
   - Daily performance trend graph & verified review log.

---

## 4. Existing API Client

- **`src/services/api.ts`**:
  - Modular client containing `api.auth`, `api.businesses`, `api.locations`, `api.funnels`, `api.qr`, `api.dashboard`, and `api.public`.
  - Missing: Dedicated `api.analytics` methods (`overview`, `timeseries`, `funnel`, `qr`, `location`, `business`, `topFunnels`, `topQr`).

---

## 5. Missing Functionality (To Implement in Phase 3)

1. **`analytics_daily` Table/Schema**:
   - Store aggregated daily performance per `business_id`, `location_id`, `funnel_id`, and `date`.
   - Fields: `id`, `business_id`, `location_id`, `funnel_id`, `date`, `page_views`, `qr_scans`, `unique_visitors`, `rating_selected`, `feedback_started`, `feedback_completed`, `google_clicks`, `created_at`, `updated_at`.
   - Unique composite constraint: `(business_id, location_id, funnel_id, date)`.
2. **`AnalyticsAggregationService`**:
   - Aggregates raw `funnel_events` into `analytics_daily` records with upsert semantics.
   - Prevents duplicate counting.
   - Supports rolling re-aggregation window (previous 2–3 days) to account for late events.
3. **Aggregation Command & Scheduler**:
   - CLI script (`src/server/commands/aggregate.ts` / `npm run analytics:aggregate`) supporting `--date=`, `--from=`, `--to=`, `--business=`.
   - Built-in background timer/cron scheduler in `server.ts` running daily aggregation and rolling window refresh.
4. **Analytics Service Layer (`src/server/services/analytics.ts`)**:
   - Methods: `getOverview`, `getTimeSeries`, `getBusinessAnalytics`, `getLocationAnalytics`, `getFunnelAnalytics`, `getQrAnalytics`, `getTopFunnels`, `getTopQr`.
   - Timezone boundary adjustments.
   - Mathematical safety: zero-denominator protection for all conversion calculations.
   - Comparison period calculations (`current`, `previous`, `change_percent` with null-safe division).
5. **Analytics REST Router (`src/server/routes/analytics.ts`)**:
   - Mounted at `/api/v1/analytics`.
   - Strict tenant ownership authorization for every resource ID.
   - In-memory tenant-safe cache (30–120s TTL) with cache keys incorporating user, business, location, funnel, and date range.
6. **Frontend Dashboard Real Data Integration**:
   - Connect `BusinessDashboard.tsx` and `BusinessAnalyticsView.tsx` to `api.analytics`.
   - Implement **Loading**, **Empty**, **Success**, **Error**, and **Retry** states.
   - Connect period filter tabs to API date ranges.

---

## 6. Recommended Implementation Approach

- **Phase 3.1**: Analytics database + aggregation service (`analytics_daily` schema, `AnalyticsAggregationService`, CLI runner).
- **Phase 3.2**: Analytics APIs (overview, timeseries, business, location, funnel, qr, top funnels, top qr).
- **Phase 3.3**: Frontend dashboard integration (`BusinessDashboard.tsx` and `BusinessAnalyticsView.tsx`).
- **Phase 3.4**: Tenant-safe caching, query optimization, and scheduler.
- **Phase 3.5**: Final security & cross-user access tests (`tests/phase3.test.ts`), documentation update.
