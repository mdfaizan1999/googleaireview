# ReviewFlow AI — Database Architecture & Schema

**Database Engine:** High-performance, schema-enforced persistent JSON database store (`data/db.json`) with atomic synchronization and safe write buffering.

---

## Relational Entity Schema

### 1. `users`
| Field | Type | Modifiers | Description |
|---|---|---|---|
| `id` | `VARCHAR(64)` | PRIMARY KEY | Unique user identifier (`usr_...`) |
| `name` | `VARCHAR(150)` | NOT NULL | User full name |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | Account email |
| `password_hash`| `VARCHAR(255)` | NOT NULL | Salted bcrypt hash |
| `phone` | `VARCHAR(30)` | NULLABLE | Contact telephone |
| `avatar` | `TEXT` | NULLABLE | Profile avatar URL |
| `role` | `ENUM` | NOT NULL | `'user'`, `'admin'`, `'agency'`, `'staff'` |
| `status` | `ENUM` | NOT NULL | `'active'`, `'deactivated'`, `'suspended'` |
| `email_verified_at`| `DATETIME` | NULLABLE | Email verification timestamp |
| `last_login_at` | `DATETIME` | NULLABLE | Last active session timestamp |
| `created_at` | `DATETIME` | NOT NULL | Creation timestamp |
| `updated_at` | `DATETIME` | NOT NULL | Update timestamp |

### 2. `businesses`
| Field | Type | Modifiers | Description |
|---|---|---|---|
| `id` | `VARCHAR(64)` | PRIMARY KEY | Business identifier (`biz_...`) |
| `user_id` | `VARCHAR(64)` | FOREIGN KEY (users.id) | Owning user ID |
| `name` | `VARCHAR(150)` | NOT NULL | Business entity name |
| `slug` | `VARCHAR(160)` | UNIQUE, NOT NULL | Unique URL slug |
| `logo` | `TEXT` | NULLABLE | Business brand logo |
| `category` | `VARCHAR(100)` | NOT NULL | Business industry category |
| `description` | `TEXT` | NULLABLE | Business summary |
| `phone` | `VARCHAR(30)` | NULLABLE | Business telephone |
| `email` | `VARCHAR(255)` | NULLABLE | Business public email |
| `website` | `VARCHAR(255)` | NULLABLE | Business homepage URL |
| `address` | `TEXT` | NOT NULL | Physical address |
| `city` | `VARCHAR(100)` | NULLABLE | City / Municipality |
| `state` | `VARCHAR(100)` | NULLABLE | State / Province |
| `country` | `VARCHAR(100)` | NULLABLE | Country |
| `postal_code` | `VARCHAR(20)` | NULLABLE | Postal / PIN code |
| `timezone` | `VARCHAR(50)` | NOT NULL | Local timezone |
| `status` | `ENUM` | NOT NULL | `'active'`, `'inactive'`, `'suspended'` |
| `google_review_url`| `TEXT` | NULLABLE | Direct Google review intent link |
| `min_star_threshold`| `INT` | DEFAULT 4 | Interception threshold (1–5) |
| `custom_keywords` | `JSON` | DEFAULT '[]' | Service, staff, and product keywords |
| `created_at` | `DATETIME` | NOT NULL | Creation timestamp |
| `updated_at` | `DATETIME` | NOT NULL | Update timestamp |
| `deleted_at` | `DATETIME` | NULLABLE | Soft delete timestamp |

### 3. `business_locations`
| Field | Type | Modifiers | Description |
|---|---|---|---|
| `id` | `VARCHAR(64)` | PRIMARY KEY | Location ID (`loc_...`) |
| `business_id` | `VARCHAR(64)` | FOREIGN KEY (businesses.id) | Parent business |
| `name` | `VARCHAR(150)` | NOT NULL | Branch / location name |
| `address` | `TEXT` | NOT NULL | Physical location address |
| `city` | `VARCHAR(100)` | NULLABLE | City |
| `state` | `VARCHAR(100)` | NULLABLE | State |
| `country` | `VARCHAR(100)` | NULLABLE | Country |
| `postal_code` | `VARCHAR(20)` | NULLABLE | Postal code |
| `phone` | `VARCHAR(30)` | NULLABLE | Branch telephone |
| `timezone` | `VARCHAR(50)` | NOT NULL | Branch timezone |
| `status` | `ENUM` | NOT NULL | `'active'`, `'inactive'` |
| `created_at` | `DATETIME` | NOT NULL | Creation timestamp |
| `updated_at` | `DATETIME` | NOT NULL | Update timestamp |
| `deleted_at` | `DATETIME` | NULLABLE | Soft delete timestamp |

### 4. `review_funnels`
| Field | Type | Modifiers | Description |
|---|---|---|---|
| `id` | `VARCHAR(64)` | PRIMARY KEY | Funnel ID (`fnl_...`) |
| `business_id` | `VARCHAR(64)` | FOREIGN KEY (businesses.id) | Parent business |
| `location_id` | `VARCHAR(64)` | NULLABLE, FOREIGN KEY | Specific branch (optional) |
| `name` | `VARCHAR(150)` | NOT NULL | Internal funnel name |
| `slug` | `VARCHAR(160)` | UNIQUE, NOT NULL | Public URL slug (`/r/:slug`) |
| `title` | `VARCHAR(255)` | NOT NULL | Customer-facing headline |
| `subtitle` | `TEXT` | NULLABLE | Customer instructions |
| `logo` | `TEXT` | NULLABLE | Custom funnel logo override |
| `primary_color`| `VARCHAR(20)` | DEFAULT '#34A853' | Brand accent color |
| `background_color`| `VARCHAR(20)`| DEFAULT '#F9FAFB' | Background tone |
| `language` | `VARCHAR(10)` | DEFAULT 'en' | Default language code |
| `enabled` | `BOOLEAN` | DEFAULT TRUE | Active status |
| `show_customer_name`| `BOOLEAN` | DEFAULT TRUE | Name input toggle |
| `google_review_url`| `TEXT` | NULLABLE | Destination Google review URL |
| `created_at` | `DATETIME` | NOT NULL | Creation timestamp |
| `updated_at` | `DATETIME` | NOT NULL | Update timestamp |
| `deleted_at` | `DATETIME` | NULLABLE | Soft delete timestamp |

### 5. `qr_codes`
| Field | Type | Modifiers | Description |
|---|---|---|---|
| `id` | `VARCHAR(64)` | PRIMARY KEY | QR identifier (`qr_...`) |
| `business_id` | `VARCHAR(64)` | FOREIGN KEY (businesses.id) | Parent business |
| `funnel_id` | `VARCHAR(64)` | FOREIGN KEY (review_funnels.id) | Target review funnel |
| `name` | `VARCHAR(150)` | NOT NULL | Physical placement name |
| `short_code` | `VARCHAR(20)` | UNIQUE, NOT NULL | Scan redirect code (`/q/:shortCode`)|
| `destination_url`| `TEXT` | NOT NULL | Relative funnel destination |
| `style` | `VARCHAR(50)` | DEFAULT 'modern_dots' | QR dot matrix style |
| `foreground_color`| `VARCHAR(20)`| DEFAULT '#166534' | QR dot color |
| `background_color`| `VARCHAR(20)`| DEFAULT '#FFFFFF' | QR card background |
| `logo` | `TEXT` | NULLABLE | Center emblem |
| `scan_count` | `INT` | DEFAULT 0 | Fast summary scan counter |
| `status` | `ENUM` | NOT NULL | `'active'`, `'inactive'`, `'paused'` |
| `created_at` | `DATETIME` | NOT NULL | Creation timestamp |
| `updated_at` | `DATETIME` | NOT NULL | Update timestamp |
| `deleted_at` | `DATETIME` | NULLABLE | Soft delete timestamp |

### 6. `funnel_events`
| Field | Type | Modifiers | Description |
|---|---|---|---|
| `id` | `VARCHAR(64)` | PRIMARY KEY | Event ID (`evt_...`) |
| `funnel_id` | `VARCHAR(64)` | FOREIGN KEY (review_funnels.id)| Target funnel |
| `event_type` | `VARCHAR(50)` | NOT NULL | `page_view`, `qr_scan`, `rating_selected`, etc. |
| `session_id` | `VARCHAR(100)`| NOT NULL | Anonymous session grouping ID |
| `visitor_id` | `VARCHAR(100)`| NOT NULL | Anonymous visitor UUID (`rf_vid`) |
| `device` | `VARCHAR(50)` | NULLABLE | `'mobile'`, `'desktop'`, `'tablet'` |
| `browser` | `VARCHAR(50)` | NULLABLE | User browser name |
| `os` | `VARCHAR(50)` | NULLABLE | Client operating system |
| `referrer` | `VARCHAR(300)`| NULLABLE | HTTP Referrer header |
| `utm_source` | `VARCHAR(100)`| NULLABLE | Campaign attribution source |
| `utm_medium` | `VARCHAR(100)`| NULLABLE | Campaign medium |
| `utm_campaign`| `VARCHAR(100)`| NULLABLE | Campaign name |
| `metadata` | `JSON` | NULLABLE | Non-sensitive metrics |
| `created_at` | `DATETIME` | NOT NULL | Event timestamp |

---

## Database Indexing & Optimization

The following logical indexes are implemented to guarantee fast lookups under high scan volume:
- `users.email` (Unique lookups during login/register)
- `businesses.user_id` (Instant multi-tenant business listing)
- `businesses.slug` (Unique business routing)
- `business_locations.business_id` (Branch lookups)
- `review_funnels.slug` (High-speed public funnel routing `/r/:slug`)
- `qr_codes.short_code` (Instant redirection `/q/:shortCode`)
- `funnel_events.funnel_id` + `funnel_events.created_at` (Time-series analytics rollups)
