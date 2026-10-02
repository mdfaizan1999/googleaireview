# ReviewFlow AI — Phase 4 Project Audit

**Audit Date:** October 01, 2026  
**Target:** Google Business Profile Integration + Reviews Sync + Reply Management

---

## 1. Existing Relevant Code & Foundations

- **Authentication & Authorization (`src/server/auth.ts`)**:
  - JWT Bearer authentication with multi-tenant ownership checks (`getOwnedBusiness`, `getOwnedLocation`, `getOwnedFunnel`, `getOwnedQr`).
  - Standard user roles (`user`, `admin`, `agency`, `staff`) with strict tenant isolation.
- **Database Engine (`src/server/database.ts` & `data/db.json`)**:
  - In-memory synchronous indices with atomic disk persistence.
  - Existing tables: `users`, `businesses`, `business_locations`, `google_connections`, `google_locations`, `reviews`, `review_funnels`, `funnel_events`, `analytics_daily`, `qr_codes`, `plans`, `subscriptions`, `payments`, `audit_logs`.
  - Notice that `google_connections`, `google_locations`, and `reviews` exist in schema from Phase 1, but need extension and alignment with Phase 4's exact specifications (`google_location_links`, `google_reviews`, encrypted token storage).
- **Dashboard & Frontend Components (`src/components/`)**:
  - `BusinessDashboard.tsx`: Main operator interface with sidebar navigation, 8 KPI cards, dynamic charts, and tabs (`dashboard`, `analytics`, `feedback`, `funnels`, `qr-manager`, `settings`, `stand`, `seo`, `services`, `billing`, `account`).
  - `ReviewSettingsView.tsx`: Form for business info, languages, categories, formatting.
  - `NegativeReviewsView.tsx`: Private feedback management triage.
  - `src/services/api.ts`: Central client API service with `api.auth`, `api.businesses`, `api.locations`, `api.funnels`, `api.qr`, `api.analytics`, `api.dashboard`, and `api.public`.
- **Background Scheduler & Queue Infrastructure**:
  - `server.ts` contains interval-based scheduler running daily analytics aggregation rolling window.
  - Can easily support asynchronous queue execution for review synchronization jobs (`SyncGoogleReviewsJob`).
- **Audit Logging System**:
  - `db.logAudit()` in `src/server/database.ts` for recording security and integration events.

---

## 2. Missing Google Integration Components to Implement

1. **Token Encryption & Security (`src/server/utils/crypto.ts`)**:
   - AES-256-GCM symmetric authenticated encryption for OAuth access and refresh tokens.
   - Encrypted at rest, never logged, never exposed in API responses.
2. **OAuth State Verification & Anti-Replay (`src/server/utils/oauthState.ts`)**:
   - Cryptographically random state signed with short TTL (10 minutes) and single-use invalidation.
3. **Google Business Profile Service (`src/server/services/google.ts`)**:
   - Official Google Business Profile APIs (Account Management API, Business Information API, My Business v4 Reviews & Reply APIs).
   - Token refresh logic with automatic retry and backoff on rate limits (429/5xx).
   - Clean client abstraction with mock mode for unit and integration testing.
4. **Database Models & Tables (`src/server/database.ts` & `src/server/types.ts`)**:
   - Enhanced `google_connections` (storing encrypted tokens, provider, scopes, account ID, email, connection status).
   - Dedicated `google_location_links` table mapping ReviewFlow `business_locations` to Google Business Profile location IDs.
   - Dedicated `google_reviews` table storing synced Google reviews with star rating, reviewer info, timestamps, reply text, and reply status.
5. **Review Synchronization Engine & Queue Job (`src/server/services/reviewSync.ts`)**:
   - Idempotent upsert preventing duplicate review records.
   - Detects updated reviews and existing owner replies.
   - Background queue job (`SyncGoogleReviewsJob`) with failure tracking and retry cooldowns.
6. **REST API Routes (`src/server/routes/google.ts` & `src/server/routes/reviews.ts`)**:
   - `/api/v1/integrations/google/connect`
   - `/api/v1/integrations/google/callback`
   - `/api/v1/integrations/google/status`
   - `/api/v1/integrations/google/disconnect`
   - `/api/v1/integrations/google/locations`
   - `/api/v1/integrations/google/location-links`
   - `/api/v1/google/reviews/sync`
   - `/api/v1/reviews` & `/api/v1/reviews/:id`
   - `/api/v1/reviews/:id/reply` (POST, PUT, DELETE)
7. **Frontend Google Reviews & Integration UI**:
   - `GoogleReviewsView.tsx`: Full reviews dashboard displaying total reviews, average rating, replied vs unreplied breakdown, star rating distribution, search, filters, pagination, and interactive review reply modal.
   - Google Connection & Location Mapping modal in `BusinessDashboard.tsx` and settings.
   - Safe empty and error states without exposing technical error traces.

---

## 3. Recommended Implementation Roadmap

- **Phase 4.1**: Google Cloud configuration, `.env.example`, `docs/GOOGLE_SETUP.md`, crypto utilities, OAuth state, OAuth connect & callback, token encryption, status & disconnect endpoints.
- **Phase 4.2**: Google Account & Location Discovery service (`GoogleBusinessProfileService`).
- **Phase 4.3**: Google Location Mapping (`google_location_links` table, endpoints, and validation).
- **Phase 4.4**: Review Database & Synchronization service (`google_reviews` table, `GoogleReviewSyncService`).
- **Phase 4.5**: Review Dashboard APIs (`GET /api/v1/reviews`, `GET /api/v1/reviews/:id`, rating distribution, filters).
- **Phase 4.6**: Review Reply Management (`POST /api/v1/reviews/:id/reply`, PUT, DELETE, local status sync).
- **Phase 4.7**: Queue Job, Token Refresh, Periodic Scheduler integration, and Error Handling.
- **Phase 4.8**: Frontend integration (`GoogleReviewsView.tsx`, connection & mapping UI), comprehensive automated test suite (`tests/phase4.test.ts`), and documentation.
