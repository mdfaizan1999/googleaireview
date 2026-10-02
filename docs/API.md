# ReviewFlow AI — REST API Documentation

**Base URL:** `/api/v1`  
**Public Base URL:** `/api/public`  
**Authentication:** Bearer token in `Authorization: Bearer <JWT_TOKEN>` header  
**Standard Response Envelope:**
```json
{
  "success": true,
  "message": "Operation description",
  "data": {},
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1,
    "last_page": 1
  }
}
```

---

## 1. Authentication APIs (`/api/v1/auth`)

### `POST /api/v1/auth/register`
Creates a new user account with salted `bcryptjs` password hashing and auto-provisions a free trial subscription.
- **Request Body:**
  ```json
  {
    "name": "Dr. Sarah",
    "email": "sarah@clinic.com",
    "password": "Password@123",
    "phone": "+91 9876543210"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Account registered successfully.",
    "data": {
      "user": { "id": "usr_...", "name": "Dr. Sarah", "email": "sarah@clinic.com", "role": "user" },
      "token": "eyJhbGciOiJIUzI1Ni..."
    }
  }
  ```

### `POST /api/v1/auth/login`
Authenticates credentials and returns a signed JWT token valid for 7 days.
- **Request Body:**
  ```json
  {
    "email": "sarah@clinic.com",
    "password": "Password@123"
  }
  ```

### `GET /api/v1/auth/me`
Returns current authenticated user, associated businesses, and active subscription.

### `PUT /api/v1/auth/profile`
Updates profile contact information (e.g. phone number).

### `POST /api/v1/auth/deactivate`
Temporarily deactivates user account and suspends active review funnels.

### `POST /api/v1/auth/delete`
Permanently soft-deletes the account upon receiving `"confirmation": "DELETE"`.

---

## 2. Business Management APIs (`/api/v1/businesses`)

All queries enforce strict multi-tenant data isolation. A user can only access businesses they own.

### `GET /api/v1/businesses`
Lists businesses owned by the authenticated user with pagination.
- **Query Parameters:** `page` (default: 1), `per_page` (default: 20, max: 100)

### `POST /api/v1/businesses`
Creates a new business and auto-generates a unique URL slug (`name-2`, etc. on collision) and a primary location.
- **Request Body:**
  ```json
  {
    "name": "Sunrise Dental Care",
    "category": "Healthcare & Dental",
    "address": "100 Beach Road, Suite 4",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "phone": "+91 9876543210",
    "website": "https://sunrisedental.in",
    "google_review_url": "https://g.page/r/.../review",
    "min_star_threshold": 4
  }
  ```

### `GET /api/v1/businesses/:id`
Retrieves a single business. Returns `HTTP 403 Forbidden` if accessed by another user.

### `PUT /api/v1/businesses/:id`
Updates business configuration, recalculating the slug if the name is changed.

### `DELETE /api/v1/businesses/:id`
Soft-deletes the business (`deleted_at`), setting its status to `inactive`.

---

## 3. Business Locations APIs (`/api/v1/locations` & `/api/v1/businesses/:id/locations`)

### `GET /api/v1/businesses/:businessId/locations`
Lists all physical branches/locations for a specific business.

### `POST /api/v1/businesses/:businessId/locations`
Adds a new location under an owned business.
- **Request Body:**
  ```json
  {
    "name": "Andheri Branch",
    "address": "404 Link Road, Andheri West",
    "city": "Mumbai",
    "phone": "+91 9876543211",
    "timezone": "Asia/Kolkata"
  }
  ```

### `GET /api/v1/locations/:id`, `PUT /api/v1/locations/:id`, `DELETE /api/v1/locations/:id`
Retrieves, updates, or soft-deletes a specific location, strictly checking that the authenticated user owns the parent business.

---

## 4. Review Funnels APIs (`/api/v1/funnels`)

### `GET /api/v1/funnels`
Lists review funnels with optional filtering by `business_id`, `location_id`, and `status`.

### `POST /api/v1/funnels`
Creates a new customer review funnel with a collision-free URL slug.
- **Request Body:**
  ```json
  {
    "business_id": "biz_...",
    "location_id": "loc_...",
    "name": "Reception Desk Funnel",
    "title": "How was your experience today?",
    "subtitle": "Your feedback helps other local customers find trusted care.",
    "primary_color": "#34A853",
    "google_review_url": "https://g.page/r/.../review"
  }
  ```

### `GET /api/v1/funnels/:id`, `PUT /api/v1/funnels/:id`, `DELETE /api/v1/funnels/:id`
Standard CRUD with ownership validation and soft delete.

---

## 5. QR Code Management APIs (`/api/v1/qr`)

### `GET /api/v1/qr`
Lists QR codes with scan counts, destination funnels, and styles.

### `POST /api/v1/qr`
Generates a dynamic smart QR code with a random 6-character alphanumeric short code.
- **Request Body:**
  ```json
  {
    "business_id": "biz_...",
    "funnel_id": "fnl_...",
    "name": "Counter Acrylic Stand",
    "foreground_color": "#166534",
    "background_color": "#FFFFFF",
    "style": "modern_dots"
  }
  ```

### `GET /api/v1/qr/:id/image`
Streams dynamic PNG buffer for inline dashboard display.

### `GET /api/v1/qr/:id/download`
Streams high-resolution 800px print-ready PNG as an attachment download (`Content-Disposition: attachment`).

---

## 6. Public Customer Funnel APIs (`/api/public` & `/q/:shortCode`)

No user login is required for public customer interaction.

### `GET /api/public/funnels/:slug`
Fetches public funnel branding, headline, colors, and business status. Returns `404` with a safe disabled message if the business or funnel is inactive.

### `POST /api/public/funnels/:slug/event`
Telemetry endpoint for tracking customer behavior without storing personal data.
- **Allowed Events:** `page_view`, `qr_scan`, `rating_selected`, `feedback_started`, `feedback_completed`, `review_assistant_opened`, `copy_clicked`, `google_clicked`.
- **Request Body:**
  ```json
  {
    "event_type": "rating_selected",
    "session_id": "sess_179088...",
    "visitor_id": "anon_...",
    "metadata": { "rating": 5 }
  }
  ```

### `POST /api/public/funnels/:slug/feedback`
Captures customer ratings and optional comments.
- **Rating >= Threshold (4-5 Stars):** Returns `is_positive: true` and direct `redirect_url` to Google Maps.
- **Rating < Threshold (1-3 Stars):** Routes feedback to private management inbox, returns `is_positive: false` and offers private resolution assurance.

### `GET /q/:shortCode`
Instant scan redirection endpoint:
1. Finds QR code by short code.
2. Atomically increments fast summary scan counter.
3. Records anonymous `qr_scan` event in `funnel_events`.
4. Returns `HTTP 302 Found` with `Location: /r/{slug}`.
