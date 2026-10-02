# ReviewFlow AI — Phase 5 System Audit: AI Review Assistant & Reply Suggestions

**Audit Date**: October 2026  
**Status**: Completed  
**Scope**: Verification of Phases 1–4, Architecture Inspection, AI Provider Abstractions, Safety, Data Models, and API Contracts.

---

## 1. Executive Summary & Verification of Existing Modules

ReviewFlow AI has completed Phases 1 through 4:
- **Phase 1 (Core Foundation)**: User authentication, multi-tenant businesses, locations, JWT sessions, and RBAC (`user`, `admin`, `agency`, `staff`).
- **Phase 2 (Review Funnel Engine)**: Public review landing pages, QR code generator (print-ready flyers, SVG/PNG download, short code redirection `/q/:code`), sentiment threshold routing (>=4 stars to Google, <4 stars to internal private feedback).
- **Phase 3 (Analytics Engine)**: Rolling window daily aggregations, KPI analytics (views, scans, conversion rates, NPS, negative feedback rate), background aggregation scheduler (every 15 min), and interactive charts.
- **Phase 4 (Google Business Profile Integration)**: OAuth 2.0 connection, AES-256-GCM token encryption, Google Location linking, automatic and manual Google review synchronization (every 30 min), two-way review listing and reply publishing (`POST /api/v1/reviews/:id/reply`).

**Key Architectural Rule for Phase 5**:
AI acts strictly as an **ASSISTANT**. The system will **never** automatically publish AI-generated replies without explicit business owner confirmation and approval.

---

## 2. Existing Review Architecture & Models

### Existing Database Tables & Structures (in `DatabaseService`):
1. **`google_reviews`**:
   - `id`, `business_id`, `business_location_id`, `google_location_link_id`, `google_review_id`, `reviewer_name`, `reviewer_profile_url`, `reviewer_photo_url`, `star_rating` (1–5), `review_text`, `review_created_at`, `review_updated_at`, `google_reply_text`, `google_reply_updated_at`, `has_reply`, `synced_at`, `created_at`, `updated_at`.
2. **`reviews`** (Internal Funnel Feedback):
   - `id`, `business_id`, `google_location_id`, `reviewer_name`, `rating`, `comment`, `owner_reply`, `reply_status` (`unanswered` | `replied` | `pending`), `reply_source` (`manual` | `ai`), `policy_violation_status`.
3. **`google_location_links`**:
   - Links ReviewFlow internal locations (`business_location_id`) to Google Business Profile accounts and locations (`google_location_id`, `google_account_id`).
4. **`plans` & `subscriptions`**:
   - Already contain `ai_generations` allocation per tier:
     - `plan_free_trial`: 20 AI generations / month
     - `plan_starter_monthly`: 250 AI generations / month
     - `plan_yearly_individual`: 1,500 AI generations / month
     - `plan_agency_custom`: 10,000 AI generations / month

---

## 3. Existing Review Synchronization & Google Reply APIs

- **`GoogleBusinessProfileService`** (`src/server/services/google.ts`):
  - `replyToReview(connectionId, googleLocationId, reviewId, replyText)`: Sends reply to Google My Business API or falls back to simulation mode when unconfigured.
  - `deleteReviewReply(connectionId, googleLocationId, reviewId)`: Deletes reply on Google.
  - `getReviews(accessToken, googleLocationId, pageToken)`: Fetches reviews from Google API.
- **Review Router** (`src/server/routes/reviews.ts`):
  - `GET /api/v1/reviews`: Paginated list of reviews with rating, reply status, and search filters.
  - `GET /api/v1/reviews/:id`: Detailed view of a single review.
  - `POST /api/v1/reviews/:id/reply`: Publishes reply directly to Google via `GoogleBusinessProfileService.replyToReview`.
  - `PUT /api/v1/reviews/:id/reply`: Updates existing reply.
  - `DELETE /api/v1/reviews/:id/reply`: Deletes existing reply.
- **Authorization Verification**:
  - `verifyReviewOwnership(req, reviewId)` strictly checks that the review's associated `business_id` is owned by `req.user.id`.

---

## 4. Reusable Components & Capabilities

1. **`authMiddleware` & `AuthenticatedRequest`**:
   - Provides validated `req.user` for all AI endpoints.
2. **`verifyReviewOwnership`**:
   - Reusable across all AI review assistant routes to prevent unauthorized AI access to other businesses' reviews.
3. **`GoogleReviewsView.tsx`**:
   - Existing UI dashboard for viewing Google reviews, filtering, and replying.
   - Will be enhanced cleanly with AI Review Assistant controls (tone selection, language selection, AI suggestion generation, edit preview, and explicit approval before publishing).
4. **`api.reviews` Client**:
   - Fully typed client in `src/services/api.ts` with token forwarding.
5. **Modern Gemini SDK**:
   - `@google/genai` is already installed in `package.json` (`^2.4.0`), ready to use with server-side API keys and telemetry headers (`User-Agent: aistudio-build`).

---

## 5. Missing Functionality to Implement in Phase 5

1. **AI Provider Abstraction Layer**:
   - `AIProviderInterface` defining `generateReplySuggestion`, `analyzeReview`, and `generateVariants`.
   - `GeminiProvider` implementing `@google/genai` with `gemini-3.8-flash`.
   - `OpenAIProvider` implementing OpenAI chat completions API.
   - `MockProvider` providing high-quality heuristic fallbacks when API keys are not yet configured in development/sandbox.
2. **AI Configuration Layer**:
   - `src/server/config/ai.ts` with validated models, temperatures, max token limits, timeouts, rate limits, tone system prompts, and injection protections.
3. **AI Service (`AIService`)**:
   - Orchestrates provider selection, prompt rendering, safety sanitization, schema validation, timeout handling, retry mechanism, and usage quota checking.
4. **Database Models & Methods**:
   - `ai_review_analyses`: Stores structured sentiment, topics, urgency, summary, confidence, prompt version.
   - `ai_reply_suggestions`: Stores suggestion text, tone, language, status (`generated`, `edited`, `accepted`, `rejected`, `published`, `failed`), prompt version.
   - `ai_usage_logs`: Tracks monthly token/generation consumption per business against plan limits.
5. **API Endpoints (`/api/v1/ai`)**:
   - `POST /api/v1/ai/reviews/:reviewId/reply-suggestion`
   - `POST /api/v1/ai/reviews/:reviewId/analyze`
   - `GET /api/v1/ai/reviews/:reviewId/suggestions`
   - `PATCH /api/v1/ai/suggestions/:suggestionId`
   - `POST /api/v1/ai/suggestions/:suggestionId/approve-and-publish`
   - `GET /api/v1/ai/usage`
6. **Frontend Integration**:
   - Extended `api.ai` methods in `src/services/api.ts`.
   - Integrated AI Assistant drawer/card in `GoogleReviewsView.tsx` with tone selector, language selector, one-click draft population, sentiment badges, and usage meters.

---

## 6. Safety & Prompt Injection Guardrails

1. **Untrusted Review Content**:
   - Review text is treated as untrusted user input wrapped in strict boundary delimiters (`<<<CUSTOMER_REVIEW>>>`).
   - System instructions explicitly forbid executing instructions found inside the review text or disclosing internal keys.
2. **Hallucination Prevention**:
   - The AI is forbidden from inventing discounts, refunds, free items, staff names, operational hours, or unconfirmed business claims.
3. **Negative Review Strategy**:
   - Acknowledges customer feelings empathetically without admitting unestablished legal liabilities or arguing. Suggests private resolution channel if needed.
4. **Star-Only / Empty Reviews**:
   - Appropriate polite acknowledgment without hallucinating customer interactions.
5. **Human-in-the-Loop Enforced**:
   - Suggested replies are saved in `generated` status. Only upon explicit human action does status transition to `published` via the existing Google reply API.
