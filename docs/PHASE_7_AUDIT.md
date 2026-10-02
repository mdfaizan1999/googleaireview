# ReviewFlow AI — Phase 7 System Audit: Operations & Admin Infrastructure

**Audit Date**: October 2026  
**Status**: Completed  
**Scope**: Full architectural inspection of Phases 1–6, Admin authorization models, RBAC schema, monitoring hooks, auditing subsystem, and administrative workflows.

---

## 1. Executive Summary & Verification of Phases 1–6

ReviewFlow AI has successfully operationalized Phases 1 through 6:
- **Phase 1 (Foundation & RBAC)**: JWT authentication (`src/server/auth.ts`), users, businesses, locations, role checks (`UserRole` = `'user' | 'admin' | 'agency' | 'staff'`).
- **Phase 2 (Review Funnel Engine)**: Public review landing pages, QR code generation (`/q/:shortCode`), printable flyers, 4-star sentiment gating.
- **Phase 3 (Analytics Engine)**: Rolling window daily aggregations, NPS, conversion metrics, automated 15-minute background aggregation scheduler.
- **Phase 4 (Google Business Profile)**: OAuth 2.0 connection, AES-256-GCM token encryption, automated 30-minute review synchronization, owner replies.
- **Phase 5 (AI Review Assistant)**: Server-side provider abstraction (`GeminiProvider`, `OpenAIProvider`, `MockProvider`), tone mapping, Hindi and English localization, review sentiment and topic analysis, prompt injection defense, and human-in-the-loop explicit approval before posting to Google.
- **Phase 6 (Razorpay SaaS Billing)**: Subscriptions, webhook HMAC SHA-256 verification, grace period state machine, centralized `PlanLimitService` and `FeatureService`, and billing dashboard.

**Phase 7 Goal**:
Construct an enterprise-grade administrative and operations layer (`/api/v1/admin/*` and frontend Admin Portal) without breaking or modifying customer-facing workflows.

---

## 2. Existing Architecture & Reusable Components

| Module | Existing Implementation | Reusability in Phase 7 |
| :--- | :--- | :--- |
| **Authentication** | `src/server/auth.ts` (`authMiddleware`, `requireRole`) | Extend with `adminMiddleware` and granular permission checks (`hasPermission`). |
| **Database** | `src/server/database.ts` (`DatabaseService`, JSON persistence) | Add collections for `feature_flags`, `system_settings`, `failed_jobs`, `roles`, `permissions`. |
| **Billing Service** | `src/server/services/billing.ts` | Reuse subscription retrieval, status calculation, plan updates, and webhook reprocessing. |
| **Razorpay Service** | `src/server/services/razorpay.ts` | Reuse signature verification, subscription query, and customer inspection. |
| **Google Sync** | `src/server/services/reviewSync.ts` & `google.ts` | Reuse `syncAllActiveLinks` and `replyToReview` for admin diagnostics and manual sync triggers. |
| **AI Service** | `src/server/services/ai/index.ts` | Reuse provider diagnostics, health inspection, and monthly usage limits. |
| **Scheduler** | `server.ts` `setInterval` loops | Expose scheduler heartbeat, task execution records, and status reports to admin monitor. |
| **Audit Logs** | `db.logAudit` in `database.ts` | Extend schema with `admin_id`, IP, user agent, old/new values JSON, and queryable filters. |

---

## 3. Database Changes Required

1. **User Extensions**:
   - `admin_role`: `'super_admin' | 'admin' | 'support' | 'finance' | 'analyst'` (nullable, for administrative staff).
   - `suspended_at`: ISO timestamp string.
   - `suspended_by`: Admin ID string.
   - `suspension_reason`: string.

2. **Feature Flags (`feature_flags`)**:
   - `id`: string
   - `name`: string
   - `key`: string (unique)
   - `description`: string
   - `enabled`: boolean
   - `environment`: `'production' | 'staging' | 'all'`
   - `config`: Record<string, any>
   - `created_at`: ISO timestamp string
   - `updated_at`: ISO timestamp string

3. **Platform Settings (`system_settings`)**:
   - `maintenance_mode`: boolean
   - `new_registration_enabled`: boolean
   - `default_timezone`: string
   - `default_currency`: string
   - `support_email`: string
   - `support_url`: string
   - `billing_grace_period_days`: number
   - `default_ai_provider`: string
   - `updated_at`: string
   - `updated_by`: string

4. **Background & Failed Jobs (`failed_jobs`)**:
   - `id`: string
   - `queue`: string
   - `payload`: any
   - `exception`: string
   - `failed_at`: string
   - `retried_at`: string (nullable)
   - `status`: `'failed' | 'retrying' | 'resolved'`

5. **Scheduler Tasks Status (`scheduler_tasks`)**:
   - `id`: string
   - `task_name`: string
   - `interval_minutes`: number
   - `last_run`: string
   - `last_status`: `'success' | 'failed'`
   - `last_duration_ms`: number
   - `error_message`: string (nullable)

---

## 4. Admin Roles & Permissions Matrix

| Permission | Super Admin | Admin | Support | Finance | Analyst |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `users.view` | ✅ | ✅ | ✅ | ❌ | ✅ |
| `users.manage` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `users.suspend` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `businesses.manage`| ✅ | ✅ | ✅ | ❌ | ❌ |
| `reviews.view` | ✅ | ✅ | ✅ | ❌ | ✅ |
| `google.manage` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `ai.manage` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `plans.manage` | ✅ | ✅ | ❌ | ✅ | ❌ |
| `billing.manage` | ✅ | ✅ | ❌ | ✅ | ❌ |
| `webhooks.retry` | ✅ | ✅ | ❌ | ✅ | ❌ |
| `audit.view` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `settings.manage` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `system.health` | ✅ | ✅ | ❌ | ❌ | ✅ |

---

## 5. Security Safeguards

1. **Server-Side Enforcement**:
   - Every `/api/v1/admin/*` route verifies JWT authenticity and checks if `req.user.role === 'admin'` or matches required `admin_role`.
2. **Secret Redaction**:
   - OAuth tokens, Razorpay secrets, encryption keys, and AI credentials are automatically stripped from admin payloads and responses.
3. **Audit Immutability**:
   - Audit logs are strictly append-only; standard APIs provide no delete or edit mutations for audit records.
4. **Idempotent Webhook Retry**:
   - Admin webhook retry invokes the unified `BillingService.processWebhook` logic preserving signature validation and deduplication keys.
5. **Non-destructive Actions**:
   - Suspending users or deactivating plans leaves database relations and historical transactions fully intact.
