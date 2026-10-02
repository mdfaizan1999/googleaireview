# ReviewFlow AI — Complete Project Audit

**Audit Date:** October 01, 2026  
**Audited Target:** ReviewFlow AI (https://reviewflowai.in/)  
**Environment:** Node.js v22.23.2, React 19, TypeScript, Vite, Express, Tailwind CSS v4

---

## 1. Executive Summary

ReviewFlow AI is a high-conversion Google Review automation SaaS designed for local businesses, franchises, and agencies. The frontend application is thoroughly built with a landing page, interactive onboarding flow, simulated customer funnel, live QR designer, and a full Business Console Dashboard (with views for Analytics, Negative Reviews, Review Settings, Physical QR Stands, AI SEO Analyzer, Add-On Services, Billing & Subscription Plans, and Account Settings).

However, currently the application operates primarily as a client-side Single Page Application (SPA) with mock state in memory. There is no persistent database, no REST API backend endpoints (`/api/v1/*`), no server-side token authentication, and no live integration with Google Business Profile, Cashfree webhooks, or server-authoritative review sync.

This audit documents the existing system and outlines the modular architecture for Phase 1 (and subsequent phases) to deliver a production-grade backend.

---

## 2. Existing Technology Stack

| Layer | Detected Technology | Version / Details |
|---|---|---|
| **Runtime** | Node.js | v22.23.2 LTS |
| **Frontend Framework** | React | v19.0.1 |
| **Bundler & Dev Server** | Vite | v8.3.0 |
| **Language** | TypeScript | v7.0.2 / strict types |
| **Styling** | Tailwind CSS | v4.3.3 (`@import "tailwindcss";`) |
| **Backend Server** | Express.js | v4.21.2 |
| **Server-Side TypeScript Execution** | `tsx` | v4.21.0 |
| **Icons & Media** | FontAwesome 6, Lucide React | SVG & Web Fonts |
| **QR Code Engine** | `qrcode` npm library + Canvas API | Client-side & Server generation |
| **AI Capabilities** | `@google/genai` (Server-side Gemini SDK) | Provisioned via `GEMINI_API_KEY` |
| **Security & Auth Libraries** | `bcryptjs`, `jsonwebtoken` | Token-based auth & salted password hashing |

---

## 3. Existing Routes & Navigation Views

The frontend utilizes a custom SPA view router (`ViewType`) controlled by state in `src/App.tsx`:

| View Identifier | Route / Purpose | Component File |
|---|---|---|
| `'home'` | Public SaaS Homepage & Conversion Funnel | `src/components/Hero.tsx`, `Features.tsx`, `HowItWorks.tsx`, etc. |
| `'vs-normal-qr'` | Normal QR vs ReviewFlow Smart QR Comparison | `src/components/Comparison.tsx` |
| `'pricing'` | Public Subscription Pricing & ROI Guarantee | `src/components/Pricing.tsx` |
| `'source-code'` | Software License & Agency Architecture Info | `src/components/SourceCodeSection.tsx` |
| `'referral-program'`| Partner Referral Program with 30% Recurring Comm. | `src/components/ReferralProgram.tsx` |
| `'agency'` | Multi-Location Agency Application | `src/components/AgencyApplication.tsx` |
| `'analyzer'` | Free Public Google Business Profile SEO Audit | `src/components/SeoAnalyzer.tsx` |
| `'flyer-tool'` | Interactive Print-Ready QR Flyer Generator | `src/components/QrFlyerDesigner.tsx` |
| `'signin'` | Dedicated Sign In View | `src/components/SignInPage.tsx` |
| `'register'` | Dedicated Business Registration View | `src/components/RegisterPage.tsx` |
| `'onboarding'` | 3-Step Business Profile Setup Wizard | `src/components/OnboardingWizard.tsx` |
| `'dashboard'` | Business Console Main Overview | `src/components/BusinessDashboard.tsx` |
| `'analytics'` | Conversion Rates, Star Distribution, Trends | `src/components/BusinessAnalyticsView.tsx` |
| `'feedback'` | Private Negative Review Triage (1-3 Stars) | `src/components/NegativeReviewsView.tsx` |
| `'settings'` | Review Settings (Google Review URL, Threshold) | `src/components/ReviewSettingsView.tsx` |
| `'stand'` | Physical NFC/QR Wooden Stand Order & Specs | `src/components/PhysicalStandView.tsx` |
| `'services'` | Agency Growth & GBP Optimization Add-Ons | `src/components/AddOnServicesView.tsx` |
| `'billing'` | Subscription Plans, UPI Checkout & Invoices | `src/components/BillingPlansView.tsx` |
| `'account'` | Business Owner Account Settings (Google SSO, Deactivate, Delete) | `src/components/AccountSettingsView.tsx` |

---

## 4. Existing Components Audit

1. **Public Marketing Components**:
   - `Header.tsx`: Responsive navigation, logo, navigation links, Sign In / Free Trial CTA.
   - `Hero.tsx`: Headline, value proposition, instant Google Place lookup preview.
   - `TrustBar.tsx`: Verified badge, 4.9★ rating indicators, social proof.
   - `ShowcaseTabs.tsx`: Interactive preview of the customer review experience.
   - `Features.tsx`: Human-like AI wording, smart routing, custom keywords.
   - `CustomerFunnelSimulator.tsx`: Live interactive simulation of customer scanning QR & filtering.
   - `QrFlyerDesigner.tsx`: Live flyer customization tool with download support.
   - `Pricing.tsx`: Monthly (₹199), Yearly (₹1,199), Agency pricing cards.
   - `Footer.tsx`: Legal links, quick navigation, copyright.

2. **Console & Dashboard Components**:
   - `BusinessDashboard.tsx`: Collapsible gradient sidebar, stats cards, metrics, recent reviews, action shortcuts.
   - `BusinessAnalyticsView.tsx`: Rating breakdown, monthly trajectory, funnel drop-off stats.
   - `NegativeReviewsView.tsx`: Private intercepted reviews, contact details, resolution status tracker.
   - `ReviewSettingsView.tsx`: Google review URL configuration, minimum star threshold, custom AI prompt keywords.
   - `PhysicalStandView.tsx`: Premium acrylic/wood QR stand showcase with ordering options.
   - `AiSeoAnalyzerView.tsx`: Business profile health audit, keyword density, local ranking analysis.
   - `AddOnServicesView.tsx`: Google Maps SEO, citation building, custom NFC cards.
   - `BillingPlansView.tsx`: Active subscription badge, flexible monthly vs annual plan, instant UPI checkout modal.
   - `AccountSettingsView.tsx`: Profile contact details, phone update, account deactivation, permanent deletion.

3. **Modals & Utilities**:
   - `AuthModal.tsx`: Popup login & registration modal with Google SSO button.
   - `Toast.tsx`: Dynamic notification system.
   - `WhatsAppWidget.tsx`: Floating support widget with direct message link.

---

## 5. Existing Authentication & Database Status

- **Authentication**: Currently simulated client-side. The dashboard displays `harsh` (`ahmadfaizan1999@gmail.com`) as authenticated owner.
- **Database**: No backend database is currently connected. State is stored in React `useState` hooks.
- **API Endpoints**: No `/api/*` endpoints exist yet.

---

## 6. Missing Backend Functionality (To Implement in Phases)

1. **Full-Stack Server (`server.ts`)**:
   - Express server hosting `/api/v1/*` routes.
   - In dev mode, mounts `vite.middlewares` on port 3000.
   - In production mode, serves built static files from `dist`.
2. **Database Engine & Schema**:
   - High-performance, schema-enforced relational store with JSON/SQLite persistence.
   - Relational tables: `users`, `businesses`, `google_connections`, `google_locations`, `reviews`, `review_funnels`, `funnel_events`, `qr_codes`, `ai_generations`, `usage_records`, `analytics_daily`, `plans`, `subscriptions`, `payments`, `webhook_events`, `notifications`, `audit_logs`, `referrals`.
3. **Authentication API (`/api/v1/auth/*`)**:
   - Registration with password hashing (`bcryptjs`).
   - Secure login generating signed JWT session tokens.
   - Current user endpoint (`GET /api/v1/auth/me`).
   - Password change, profile update, deactivation, and deletion.
4. **Data Ownership & Authorization**:
   - Multi-tenant data isolation: User can only read/write their own businesses, funnels, QR codes, and reviews.
   - Role-based authorization (`user`, `admin`, `agency`, `staff`).
5. **Business & Review Funnel API (`/api/v1/businesses/*`, `/api/v1/funnels/*`)**:
   - CRUD for businesses and funnels.
   - Public funnel rendering (`/r/:slug`) with event tracking (`/api/public/funnels/:slug/event`).
6. **QR Code Engine (`/api/v1/qr/*`, `/q/:short_code`)**:
   - Server-side QR generation and dynamic redirection tracking.
7. **AI Review & Reply Service (`/api/v1/ai/*`)**:
   - Using server-side `@google/genai` Gemini SDK with secure `GEMINI_API_KEY`.
   - Transformation of honest customer experiences into polished reviews without fabricating claims.
8. **Billing & Subscriptions (`/api/v1/billing/*`)**:
   - Plan listings, UPI and Cashfree checkout simulation, webhook verification with idempotency.

---

## 7. Recommended Implementation Sequence (Starting with Phase 1)

### Phase 1: Foundation, Database, Auth & Authorization (Current Focus)
1. **Server Architecture**:
   - Create `server.ts` with Express and integrate with Vite dev middleware on port 3000.
   - Configure `"dev": "tsx server.ts"` and `"start": "node server.js"`.
2. **Database Schema & Store**:
   - Implement persistent data models with file-backed JSON/SQLite database store in `src/db/`.
   - Seed default plans, admin user, and demo business profile.
3. **Auth Controller & Middleware**:
   - JWT authentication middleware (`authMiddleware`).
   - Endpoints:
     - `POST /api/v1/auth/register`
     - `POST /api/v1/auth/login`
     - `POST /api/v1/auth/logout`
     - `GET /api/v1/auth/me`
     - `PUT /api/v1/auth/profile`
     - `POST /api/v1/auth/deactivate`
     - `POST /api/v1/auth/delete`
4. **Business & Ownership Authorization**:
   - `POST /api/v1/businesses`
   - `GET /api/v1/businesses`
   - `GET /api/v1/businesses/:id`
   - `PUT /api/v1/businesses/:id`
   - Ownership verification middleware ensuring users only access their own businesses.
5. **Audit Logging & Verification**:
   - Log all security events into `audit_logs`.
   - Run compilation and linting to ensure zero build errors.
