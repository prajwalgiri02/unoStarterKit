A production-ready Laravel starter kit designed specifically for Uno Technology to standardize project development and reduce repeated work. It includes a fully featured Admin CMS powered by Inertia.js and a JWT-authenticated JSON REST API.

The starter kit provides reusable, prebuilt modules for common and recurring project requirements, including user and role management, OTP-based verification, push notifications, chunked file uploads, authentication, and other shared features.

It serves as a consistent foundation for future Uno Technology projects, allowing developers to reuse proven components, maintain common development standards, and focus primarily on project-specific features.


---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Features](#features)
  - [1. API Authentication (JWT)](#1-api-authentication-jwt)
  - [2. CMS Authentication (Session)](#2-cms-authentication-session)
  - [3. OTP System](#3-otp-system)
    - [`OtpService` — Storage \& Lifecycle](#otpservice--storage--lifecycle)
    - [`OtpDeliveryService` — Channel Dispatch](#otpdeliveryservice--channel-dispatch)
    - [OTP Channels](#otp-channels)
    - [OTP Purposes](#otp-purposes)
    - [OTP Configuration (`config/otp.php`)](#otp-configuration-configotpphp)
    - [SMS Gateway](#sms-gateway)
  - [4. Password Reset Flow](#4-password-reset-flow)
  - [5. Profile Settings with OTP Verification](#5-profile-settings-with-otp-verification)
  - [6. User Approval System](#6-user-approval-system)
  - [7. User Manager (Admin)](#7-user-manager-admin)
  - [8. Role-Based Access Control](#8-role-based-access-control)
  - [9. FAQ Management](#9-faq-management)
    - [CMS (Admin)](#cms-admin)
    - [API (Public)](#api-public)
  - [10. Static Content Management](#10-static-content-management)
    - [CMS (Admin)](#cms-admin-1)
    - [API (Public)](#api-public-1)
  - [11. Support Tickets](#11-support-tickets)
    - [API (Public / Authenticated)](#api-public--authenticated)
    - [CMS (Admin)](#cms-admin-2)
  - [12. Push Notifications](#12-push-notifications)
  - [13. Video Upload (Chunked to S3)](#13-video-upload-chunked-to-s3)
  - [14. Standardised API Responses](#14-standardised-api-responses)
  - [15. Slug Generation (`HasSlug`)](#15-slug-generation-hasslug)
  - [16. CMS Frontend (React + Tailwind)](#16-cms-frontend-react--tailwind)
- [Configuration Reference](#configuration-reference)
- [Route Overview](#route-overview)
  - [API Routes (`/api/*`)](#api-routes-api)
  - [CMS Routes (`/cms/*`)](#cms-routes-cms)

---

## Tech Stack

| Layer | Package / Tool |
|---|---|
| Framework | Laravel 13.x, PHP 8.3+ |
| Frontend bridge | Inertia.js v3 (`inertiajs/inertia-laravel`, `@inertiajs/react`) |
| CMS frontend | React 19 + TypeScript, Tailwind CSS v4 (theme tokens in `resources/css/theme.css`) |
| Rich text | Tiptap 3 (editor) + DOMPurify (rendering) |
| Toasts | sonner |
| API auth | JWT (`php-open-source-saver/jwt-auth`) |
| Roles & permissions | Spatie Laravel Permission v8 |
| File storage | AWS S3 (`league/flysystem-aws-s3-v3`) |
| Frontend build | Vite 8 + npm |
| Testing | PHPUnit 12 |
| Code style | Laravel Pint |

---

## Quick Start

```bash
composer run setup
```

This single command installs PHP and JS dependencies, generates the application key, runs all migrations, and builds the frontend assets.

For local development with hot-reload and log streaming:

```bash
composer run dev
```

This concurrently starts the HTTP server, queue worker, Pail log viewer, and Vite dev server.

---

## Features

### 1. API Authentication (JWT)

All mobile/SPA clients authenticate with stateless JWT tokens.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new account and receive a token |
| `POST` | `/api/auth/login` | Log in and receive a token |
| `POST` | `/api/auth/logout` | Invalidate the current token (`device_id` required) |
| `POST` | `/api/auth/refresh` | Issue a new token; the current one must not have expired yet |
| `GET` | `/api/profile` | Return the authenticated user's profile |

**Login guards** (checked in this order):
- Wrong email or password returns `401` with `code: invalid_credentials`.
- A user whose account has been **blocked** receives `403` with `code: account_blocked`.
- A user who has **not verified their email or mobile number** (when sign-up verification is on) receives `403` with `code: verification_required`, and a fresh code is sent. See [Sign-up verification](#sign-up-verification).
- A user whose account is **pending admin approval** receives `403` with `code: account_pending_approval`.

Register follows the same rule: when `USER_REQUIRE_APPROVAL` is on, the account is created but `POST /api/auth/register` answers `403` with `code: account_pending_approval` and no token. Its device token is not saved, so the app should send it again at the first successful login.

The token response (inside the standard envelope, see [Standardised API Responses](#14-standardised-api-responses)):

```json
{
  "status": 200,
  "message": null,
  "data": {
    "access_token": "...",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": { ... }
  }
}
```

#### Sign-up verification

Users can be required to verify their email, their mobile number, or both, with a one-time code before they get a token. Each is switched on separately in `.env`:

```dotenv
USER_REQUIRE_EMAIL_VERIFICATION=true
USER_REQUIRE_PHONE_VERIFICATION=false
```

Both are `false` by default, so register and login behave exactly as above until one is turned on. Email codes always go by email; phone codes always go by SMS, so phone verification makes `phone` required on register and profile update and needs the [SMS gateway](#sms-gateway) configured. Admin accounts are never asked to verify.

| Step | Method | Endpoint | Body | Result |
|---|---|---|---|---|
| 1 | `POST` | `/api/auth/register` | as before | Account is created but **no token** is returned. `data` is `{ verification_required: ["email"], otp_length: 6 }` and a code is sent to each channel listed |
| 2 | `POST` | `/api/auth/verification/verify` | `email`, `channel` (`email` or `phone`), `otp`, optional device fields | Marks that channel verified. If another channel is still listed in `verification_required`, returns `200` with the remaining list; once nothing is left, returns the normal token response |
| � | `POST` | `/api/auth/verification/resend` | `email`, `channel` | Sends a new code; same `200` for unknown or already-verified accounts |

- **Login before verifying:** `403 verification_required` with the same `data` as step 1, and a new code is sent, so the app can open the code screen straight away.
- **Admin approval:** when `USER_REQUIRE_APPROVAL` is also on, the user verifies first; the verify step then answers `403 account_pending_approval` instead of a token until an admin approves them.
- **Changing email or phone:** when `POST /api/profile` changes a channel that must be verified, that channel becomes unverified and a code is sent to the new address. The profile response says so, and `user.pending_verifications` lists it. The app verifies it with step 2; the user's current token keeps working. An admin changing a user's email in the CMS also clears it, and the user is asked for a code at their next login.
- **Errors:** wrong, expired or used-up codes use the normal OTP error codes (`otp_invalid`, `otp_expired`, `otp_attempt_limit`, `otp_resend_cooldown`, `otp_resend_limit`). Verifying a channel that is already verified returns `422 otp_already_verified` and never a token.
- **Rate limits:** verify 6 requests per minute, resend 3 per minute, plus the 60-second resend cooldown.

The `user` object (in the token response and `GET /api/profile`) includes `is_email_verified`, `is_phone_verified`, `email_verified_at`, `phone_verified_at` and `pending_verifications` (the channels still to verify under the current settings). In the CMS, the user details page shows a notice when a user's email or mobile number is not verified.

**Token revocation:** every JWT carries a `tv` claim matching `users.token_version`. A password reset increments the version, and the `EnsureApiTokenIsCurrent` middleware (appended to the `api` middleware group) rejects older tokens with `401 unauthenticated`, signing the user out on every device.

---

### 2. CMS Authentication (Session)

The Admin CMS uses Laravel session-based authentication, served as a single-page application via Inertia.js.

| Route name | Method | Path | Description |
|---|---|---|---|
| `cms.auth.login` | `GET / POST` | `/cms/login` | Login form and submit (rate-limited: 5/min). Only accounts with the `admin` role can sign in |
| `cms.auth.logout` | `POST` | `/cms/logout` | Log out of the session |

Unauthenticated requests to any protected CMS route are automatically redirected to `/cms/login`. The CMS has no registration; app users sign up through `POST /api/auth/register`.

---

### 3. OTP System

The OTP system is the backbone of every verification flow in the project. It is split into two focused services:

#### `OtpService` — Storage & Lifecycle

- **Create** — Generates a cryptographically random numeric code (4–9 digits), a SHA-256-hashed flow token, and persists the record. If an OTP already exists for the same destination + channel + purpose it is replaced atomically (row-level lock).
- **Verify** — Checks the submitted code against the bcrypt hash. Increments an attempt counter on each failure.
- **Resend** — Generates a fresh code for an existing OTP request after a configurable cooldown.
- **Consume / Cancel** — Deletes the OTP row once the associated action is complete (or cancelled by the user).
- **Clear expired** — Artisan-friendly method for pruning stale records.

#### `OtpDeliveryService` — Channel Dispatch

Reads the delivery channel(s) configured per-purpose and dispatches accordingly:

| `delivery.channels` value | Behaviour |
|---|---|
| `mail` / `email` | OTP sent by email only |
| `sms` | OTP sent by SMS only |
| `both` | OTP sent by **both** email and SMS |
| Array / comma-separated | Each listed channel is tried; partial failures are tolerated |

If **all** configured channels fail, the exception is re-thrown and the OTP record is rolled back to its previous state so users are never left locked out.

#### OTP Channels

```
EMAIL  — sent to the user's email address
SMS    — sent to the user's phone number via the SmsGateway
```

#### OTP Purposes

| Enum case | Value | Used in |
|---|---|---|
| `PASSWORD_RESET` | `password_reset` | Forgot-password flow |
| `PASSWORD_CHANGE` | `password_change` | Profile settings update |
| `EMAIL_VERIFICATION` | `email_verification` | Sign-up email verification and email changes (API) |
| `PHONE_VERIFICATION` | `phone_verification` | Sign-up mobile verification and phone changes (API, by SMS) |
| `LOGIN_VERIFICATION` | `login_verification` | Future: 2FA login step |

#### OTP Configuration (`config/otp.php`)

Each setting can be defined globally under `defaults` or overridden per-purpose under `purposes.<name>`:

| Key | Default | Description |
|---|---|---|
| `length` | `6` (`OTP_LENGTH` in `.env`) | Number of digits (4–9). Applies to every flow; the CMS OTP screens read it from the backend so they always show the right number of boxes |
| `expires_in_minutes` | `10` | Minutes until the code expires |
| `max_attempts` | `5` | Failed attempts before the code is locked |
| `max_resends` | `3` | Times the user may request a new code |
| `resend_cooldown_seconds` | `60` | Minimum gap between resend requests |
| `delivery.channels` | `mail` | `mail`, `sms`, or `both` |

#### SMS Gateway

The `SmsGateway` contract (`App\Contracts\SmsGateway`) defines a single `send(string $to, string $message): void` method. The default binding is `LogSmsGateway`, which writes the OTP to the Laravel log — ideal for local development without a real SMS provider. Swap the binding in `AppServiceProvider` to plug in any SMS provider (Twilio, Vonage, etc.).

---

### 4. Password Reset Flow

A multi-step, token-guarded password reset entirely via OTP — no email magic links required. The CMS and the API share `PasswordResetService`, but each has its own routes and request classes.

#### API (mobile)

| Step | Method | Endpoint | Body | Result |
|---|---|---|---|---|
| 1 | `POST` | `/api/auth/password/forgot` | `email` | Always `200` "Please check your email for a verification code." A code is only sent when the account exists |
| 2 | `POST` | `/api/auth/password/verify` | `email`, `otp` | Returns `{ reset_token, expires_in }` (single-use, 15 minutes) |
| — | `POST` | `/api/auth/password/resend` | `email` | Sends a new code; same `200` for unknown emails |
| 3 | `POST` | `/api/auth/password/reset` | `reset_token`, `password`, `password_confirmation` | Sets the password; `422 reset_token_invalid` if the token is wrong, expired or already used |

Follows the OWASP forgot-password guidance:
- The responses never reveal whether an email is registered (unknown emails get the same `200` on forgot and resend, and `otp_invalid` on verify).
- Only the holder of the `reset_token` from step 2 can set the new password, so knowing an email is not enough to take over a reset.
- After a reset every existing API token for the user stops working (see [Token revocation](#1-api-authentication-jwt)); the user logs in again.
- All four endpoints are rate limited to 3 requests per 60 minutes per IP, and resending is limited to once every 60 seconds.

#### CMS (admin)

| Route | Description |
|---|---|
| `GET /cms/forgot-password` | Request form (enter email) |
| `POST /cms/forgot-password` | Send OTP to email (rate-limited: 3/min) |
| `GET /cms/forgot-password/verify/{token}` | OTP entry form |
| `POST /cms/forgot-password/verify/{token}` | Submit OTP code (rate-limited: 6/min) |
| `POST /cms/forgot-password/resend/{token}` | Resend OTP (rate-limited: 3/min) |
| `GET /cms/reset-password/{token}` | New password form |
| `POST /cms/reset-password/{token}` | Save new password |
| `POST /cms/forgot-password/cancel/{token}` | Cancel and discard the reset request |

**Security details:**
- The flow token in every URL is a 64-character random string stored as a SHA-256 hash in the database.
- Routes are protected by middleware: `password-reset.pending` (token must exist and be unverified) or `password-reset.verified` (token must already be verified).
- The `PasswordResetService` rolls back OTP creation if delivery fails, preventing silent lock-outs.
- Email addresses are masked in the UI (e.g. `jo***@example.com`).
- A `PasswordReset` event is fired after a successful reset, and the user's API tokens are revoked.

---

### 5. Profile Settings with OTP Verification

Admins can update their profile from the Settings page. Changes to **email** or **password** require OTP verification before being applied. The code is entered in a modal on the Settings page. When the email changes, the code is sent to the **new** address, and verifying it marks that address as verified. A password-only change sends the code to the current address. Settings codes are always sent by email. Phone is never required for admins.

| Route | Description |
|---|---|
| `GET /cms/settings` | View current profile |
| `PUT /cms/settings` | Submit changes (triggers OTP if email/password changed) |
| `POST /cms/settings/verify/{token}` | Verify code and apply changes |
| `POST /cms/settings/resend/{token}` | Resend the verification code |

Pending changes (new email, new hashed password) are stored in the OTP's `metadata` column and only committed after the user successfully verifies the code.

---

### 6. User Approval System

Registration approvals can be toggled via the `users.require_approval` config key.

- When **enabled**: newly registered users have `approved_at = null` and cannot log in to either the CMS or the API until an admin approves them. If sign-up verification is also on, users verify their email/phone first and then wait for approval.
- When **disabled**: users are auto-approved on registration.
- Admin accounts are always considered approved regardless of the setting.

**Admin approval routes (CMS):**

| Method | Path | Description |
|---|---|---|
| `POST` | `/cms/admin/users/{user}/approve` | Approve a specific user |

The User Manager page has two lists. **Users Pending Approval** shows unapproved users, 2 per page (`?pending_page=N`), with a badge counting every pending user. **All Users** shows every non-admin user, pending ones included, 10 per page (`?page=N`). It has two filters: **Status** (`?status=active|blocked`) and, when approval is on, **Approval** (`?approval=approved|pending`); invalid values are ignored. The header search filters both lists by name or email as you type and resets both to page 1.

The `EnsureUserApproved` middleware is aliased as `approved` and applied globally to all authenticated CMS routes.

---

### 7. User Manager (Admin)

Full CRUD management of all user accounts, accessible to admins only.

| Method | Path | Description |
|---|---|---|
| `GET` | `/cms/user-manager` | Paginated, searchable list of all users |
| `GET` | `/cms/user-manager/{user}` | View a user's details |
| `GET` | `/cms/user-manager/{user}/edit` | Edit form |
| `PUT` | `/cms/user-manager/{user}` | Update name, email, and optionally password |
| `DELETE` | `/cms/user-manager/{user}` | Delete a user |
| `POST` | `/cms/user-manager/{user}/toggle-block` | Block or unblock a user |

**Built-in safeguards:**
- An admin **cannot delete or block themselves**.
- The **last remaining admin account** cannot be deleted or modified by another admin.
- Blocked users are prevented from logging in to both the API and CMS.

---

### 8. Role-Based Access Control

Roles are managed via **Spatie Laravel Permission**. Two roles are used out of the box:

| Role | Assigned to | Access |
|---|---|---|
| `admin` | Admin CMS users | All CMS routes behind `role:admin` middleware |
| `user` | API / mobile app users | API endpoints behind `auth:api` |

Roles are assigned at registration time (`UserRegistrationService` assigns the `user` role; admin accounts are seeded separately).

---

### 9. FAQ Management

#### CMS (Admin)

| Method | Path | Description |
|---|---|---|
| `GET` | `/cms/faqs` | List all FAQs |
| `POST` | `/cms/faqs` | Create a new FAQ |
| `PUT` | `/cms/faqs/{faq}` | Update an existing FAQ |
| `DELETE` | `/cms/faqs/{faq}` | Delete a FAQ |

#### API (Public)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/faqs` | Return all FAQs (no authentication required) |

---

### 10. Static Content Management

Editable rich-text pages that the mobile app consumes via API.

**Available content types:**

| Type value | Label |
|---|---|
| `terms_and_conditions` | Terms & Conditions |
| `privacy_policy` | Privacy Policy |
| `community_guidelines` | Community Guidelines |

#### CMS (Admin)

| Method | Path | Description |
|---|---|---|
| `GET` | `/cms/static-content` | List all content pages |
| `PUT` | `/cms/static-content/{staticContent}` | Update a page's title and description |

The description is edited with the Tiptap rich text editor (`RichTextEditor`) and **stored as HTML** (headings, bold/italic/underline, lists, links). Several pages can be edited at once. The editor is loaded on demand, only when "Edit Details" is clicked. Read-only views render the HTML through `RichText`, which sanitises it with DOMPurify. Older plain-text content still loads with its line breaks.

#### API (Public)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/{type}` | Fetch a single content page, e.g. `/api/terms_and_conditions`. `description` is HTML |

---

### 11. Support Tickets

#### API (Public / Authenticated)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/contact-us` | Submit a support ticket (Contact Us or Dispute) |

The `user_id` field is automatically set when the request is authenticated.

**Ticket types:** `contact_us`, `dispute`
**Ticket statuses:** `pending`, `resolved`

#### CMS (Admin)

| Method | Path | Description |
|---|---|---|
| `GET` | `/cms/messages` | List all tickets (filterable by type, sortable by date/name) |
| `PATCH` | `/cms/messages/{ticket}/resolve` | Mark a ticket as resolved |
| `DELETE` | `/cms/messages/{ticket}` | Delete a ticket |

---

### 12. Push Notifications

Admins can broadcast push notifications from the CMS to any subset of users.

| Method | Path | Description |
|---|---|---|
| `GET` | `/cms/notifications` | List all past broadcasts |
| `POST` | `/cms/notifications` | Create and send (or schedule) a new broadcast |

**Targeting options:**

| Field | Behaviour |
|---|---|
| `send_to_all = true` | Broadcast to every app user |
| `location` | Filter by the user's `location` field |
| `subscription_type` | Comma-separated list (e.g. `free,monthly`) matched against the user's `subscription_type` |

Broadcasts only go to app users: admins, blocked users and (when approval is on) users still waiting for approval never receive them.

**Scheduling:** Set `scheduled_at` to defer delivery; leave it `null` to send immediately.

**Delivery mechanism:**
1. An in-app `UserNotification` record is created for every matched user.
2. The user's registered Firebase device tokens are collected and sent to **Firebase Cloud Messaging (FCM)**.
3. Users are processed in chunks of 500 to handle large audiences efficiently.

**Firebase token management:** Devices register their FCM tokens via the `FirebaseTokens` model. Each token stores the `device_token` and `platform`.

**Admin inbox (header bell):** admins receive alerts, not broadcasts. `AdminAlertService` creates one for every admin when:

| Event | Message | Opens |
|---|---|---|
| A user registers via `POST /api/auth/register` | "Jane Doe registered." or, when approval is on, "Jane Doe registered and is waiting for approval." | The user in User Manager |
| A message arrives via `POST /api/contact-us` | "Sam (sam@example.com) sent a message." | Messages & Support |

Alerts are stored in the `notifications` table with `type = admin_alert` (broadcasts use `type = broadcast`), so they never appear in the broadcast history. Clicking an alert marks it as read and opens its link.

| Method | Path | Description |
|---|---|---|
| `PATCH` | `/cms/notifications/{userNotification}/read` | Mark one inbox item as read |
| `PATCH` | `/cms/notifications/mark-all-read` | Mark all inbox items as read |
| `DELETE` | `/cms/notifications/clear-all` | Clear the inbox |

> The FCM dispatch stub in `NotificationController::sendToFirebase()` is ready for implementation with `kreait/laravel-firebase` or direct FCM v1 HTTP calls. For production, dispatch a queued Job instead of sending inline.

---

### 13. Video Upload (Chunked to S3)

Large video files are uploaded in chunks directly to AWS S3 using the **S3 Multipart Upload API**, avoiding PHP memory limits and request timeouts.

**How it works:**

1. The client splits the file into chunks and sends them one at a time with the following fields:
   - `file_id` — a unique identifier for the upload session
   - `chunk_number` — the sequential chunk index (starting at 1)
   - `total_chunks` — the total number of chunks
   - `chunk` — the binary chunk file
   - `file_name` (optional) — the final filename

2. On the first chunk (or when the upload ID is missing from cache), a new S3 multipart upload is initiated.

3. Each chunk is uploaded as an S3 part. **Duplicate chunks are detected and skipped** so that retried requests do not waste bandwidth.

4. Upload progress (0–100%) is tracked in cache and can be polled independently.

5. When the final chunk arrives, the multipart upload is completed and S3 assembles the file at `uploads/videos/{file_id}_{file_name}`.

6. All temporary cache keys are cleaned up after a successful completion.

**Upload state is cached for 6 hours**, allowing interrupted uploads to resume.

Files are stored at path: `uploads/videos/{file_id}_{file_name}` on the configured S3 bucket.

---

### 14. Standardised API Responses

**Every** response under `/api/*` uses one envelope, including errors raised by the framework (validation, authentication, 404/405, rate limiting, server errors and maintenance mode). The full contract with raw sample bodies for every endpoint is in [`docs/api-response-reference.pdf`](api-response-reference.pdf); share that with mobile developers.

**Success:**
```json
{ "status": 200, "message": null, "data": { ... } }
```

**Paginated success** (any `LengthAwarePaginator`, e.g. the notifications list):
```json
{ "status": 200, "message": "...", "data": [ ... ], "meta": { "current_page": 1, "last_page": 2, "per_page": 20, "total": 22, "from": 1, "to": 20 } }
```

**Error:**
```json
{ "status": 422, "code": "validation_failed", "message": "The email field is required.", "errors": { "email": ["The email field is required."] } }
```

- `code` is a stable, machine-readable value from `App\Enums\ApiErrorCode` (e.g. `invalid_credentials`, `account_blocked`, `otp_expired`, `reset_token_invalid`, `too_many_requests`). Clients should branch on `code`, never on `message`.
- `errors` is a field → messages map for validation and OTP errors, otherwise `null`.
- A 500 returns a safe generic message; a `debug` block is added only when `APP_DEBUG=true`.

**How it works:**

| Piece | Role |
|---|---|
| `App\Support\ApiEnvelope` | Builds every success/error body; adds `meta` automatically for paginated data |
| `App\Traits\ApiResponse` | Controller helpers: `successResponse()`, `errorResponse($message, $status, $errors, $errorCode)`, `resourceResponse()` |
| `App\Exceptions\ApiExceptionRenderer` | Registered in `bootstrap/app.php`; converts every exception on `api/*` into the envelope |
| `App\Exceptions\OtpException` | Carries an `ApiErrorCode` `reason` (e.g. `OtpExpired`) that becomes the response `code` |

**Validation:** every endpoint validates through a dedicated FormRequest class. When the CMS and API accept different input for the same action, they use separate classes (e.g. `Auth\VerifyPasswordOtpRequest` for the CMS, `Api\VerifyPasswordResetOtpRequest` for the API) instead of one class with conditional rules.

---

### 15. Slug Generation (`HasSlug`)

The `HasSlug` trait (`App\Traits\HasSlug`) gives any Eloquent model automatic unique-slug generation. Add it to a model, call one method, and the trait handles collision detection and numeric suffixing for you.

#### Adding to a model

```php
use App\Traits\HasSlug;

class Post extends Model
{
    use HasSlug;
}
```

The model's table must contain a slug column (default column name: `slug`).

#### Methods

**`setSlug(string $sourceField, string $slugField = 'slug'): static`**

Generates a unique slug from the model attribute named `$sourceField`, assigns it to `$slugField`, and returns the model for fluent chaining.

```php
// Derive slug from 'title', store in 'slug'
$post->title = 'Hello World';
$post->setSlug('title')->save();
// → slug = "hello-world"

// Derive from 'name', store in a custom 'handle' column
$post->setSlug('name', 'handle');
```

When called on an **existing** record (one that has already been saved), the model's own primary key is automatically excluded from the uniqueness check, so updating a record never conflicts with its current slug.

**`generateUniqueSlug(string $sourceField, string $slugField = 'slug', ?int $ignoreId = null): string`**

Returns the unique slug string without assigning it to the model. Useful when you need to inspect or store the value manually.

```php
$slug = $post->generateUniqueSlug('title');
// → "hello-world-2"  (if "hello-world" is already taken)
```

#### How uniqueness is enforced

1. The source field value is run through `Str::slug()` to produce a URL-safe base (e.g. `"Hello World!"` → `"hello-world"`).
2. If the base is empty (blank source value), an 8-character random lowercase string is used instead.
3. The base slug is tested against the database. If it is already taken, a numeric suffix is appended and incremented until a free slot is found: `hello-world` → `hello-world-1` → `hello-world-2` → …

#### Example — automatic slug on create and update

```php
class Post extends Model
{
    use HasSlug;

    protected static function booted(): void
    {
        static::saving(function (Post $post): void {
            if ($post->isDirty('title') || ! $post->slug) {
                $post->setSlug('title');
            }
        });
    }
}
```

With the `saving` hook in place, the slug is regenerated whenever `title` changes and is always set before the first save.

---

### 16. CMS Frontend (React + Tailwind)

The CMS is built from the Figma "Design Foundation" components and themed entirely through design tokens, so a new project only needs a new `theme.css`.

#### Styling

| File | Holds |
|---|---|
| `resources/css/app.css` | Imports only (fonts, Tailwind, the two files below) |
| `resources/css/theme.css` | Design tokens: colour scales (`primary`, `secondary`, `neutral`, `success`, `warning`, `error`, `info`), text styles, shadows, modal backdrop, and layout backgrounds (`app-background`, `auth-background`, `auth-panel`) |
| `resources/css/utilities.css` | Custom Tailwind utilities (`@utility`), e.g. `scrollbar-none` and `autofill-none` |

Components are styled with Tailwind classes that reference the tokens (e.g. `bg-primary-500`, `text-body-xs`). There is no separate component stylesheet; change a token and every component follows.

#### Structure

| Folder | Contents |
|---|---|
| `Layouts/` | Exactly two layouts: `auth-layout` (login, forgot/reset password) and `app-layout` (sidebar + header for logged-in pages) |
| `Components/buttons/` | `Button` (giant/large/medium/small/tiny; filled/outline/clear; primary/danger), `IconButton`, `TextButton` |
| `Components/inputs/` | `Input`, `Select`, `Textarea`, `RichTextEditor`, `Checkbox`, `Radio`, `Toggle`, `OtpInput`, `DateRangePicker`. Input, Select, Textarea and the editor share `field.tsx` (sizes, statuses, filled/outline variants, disabled state, label and helper text) |
| `Components/badges/`, `feedback/`, `modals/` | `Badge`, `Alert`, toasts (`lib/toast`), `Modal`, `ConfirmModal`, `OtpModal`, `SuccessModal` |
| `Components/common/` | `Card`, `Tabs`, `Popover`, `DropdownMenu`, `SortMenu`, `Avatar`, `DetailField`, `RichText`, … |
| `Components/icons/` | Icons exported from Figma as React components (`currentColor`) |

#### Conventions

- **Pages load on demand.** `app.tsx` resolves each Inertia page as its own chunk, so a page only downloads the code it uses. Heavy components (the rich text editor) are additionally lazy-loaded with `React.lazy`.
- **Forms** use `useFieldForm` (`resources/js/lib/use-field-form.ts`), a wrapper around Inertia's `useForm` whose `setField(name, value)` updates a field and clears that field's validation error.
- **Dropdowns** (`Popover`) render in a portal, flip upwards when there is no room below and follow their trigger on scroll, so they are never clipped by scroll containers.
- **Page titles** come from each layout's `pageTitle`/`title` and render as `Page | APP_NAME` in the browser tab. The favicon is `public/favicon.svg`.

---

## Configuration Reference

| File | Key | Description |
|---|---|---|
| `config/otp.php` | `defaults.*` | Global OTP settings (length, expiry, attempts, resends, cooldown) |
| `config/otp.php` | `purposes.<name>.*` | Per-purpose OTP overrides |
| `config/otp.php` | `delivery.channels` | Global delivery channel: `mail`, `sms`, or `both` |
| `config/otp.php` | `purposes.<name>.delivery.channels` | Per-purpose delivery channel override |
| `config/users.php` | `require_approval` | `true` to require admin approval before users can log in |
| `config/users.php` | `verification.email` | `USER_REQUIRE_EMAIL_VERIFICATION`: `true` to require an email code before a token is issued |
| `config/users.php` | `verification.phone` | `USER_REQUIRE_PHONE_VERIFICATION`: `true` to require an SMS code before a token is issued |
| `config/filesystems.php` | `disks.s3.*` | AWS S3 credentials and bucket for video uploads |
| `.env` | `JWT_SECRET` | Secret key for JWT token signing. Generate it with `php artisan jwt:secret`; API login fails without it |
| `.env` | `OTP_LENGTH` | Number of OTP digits for every flow (default `6`) |
| `.env` | `APP_NAME` | Shown after the page name in browser tab titles |

---

## Route Overview

### API Routes (`/api/*`)

| Auth required | Method | Path | Feature |
|---|---|---|---|
| No | `POST` | `/api/auth/register` | Register |
| No | `POST` | `/api/auth/login` | Login |
| JWT | `POST` | `/api/auth/logout` | Logout |
| JWT | `POST` | `/api/auth/refresh` | Refresh token |
| No | `POST` | `/api/auth/verification/verify` | Sign-up verification: verify code, get token |
| No | `POST` | `/api/auth/verification/resend` | Sign-up verification: resend code |
| No | `POST` | `/api/auth/password/forgot` | Password reset: send code |
| No | `POST` | `/api/auth/password/verify` | Password reset: verify code, get `reset_token` |
| No | `POST` | `/api/auth/password/resend` | Password reset: resend code |
| No | `POST` | `/api/auth/password/reset` | Password reset: set new password |
| JWT | `GET` | `/api/profile` | Current user |
| JWT | `POST` | `/api/profile` | Update profile (multipart for `avatar`) |
| JWT | `GET` | `/api/user` | Current user (same as `GET /api/profile`) |
| JWT | `POST` | `/api/change-password` | Change password |
| JWT | `POST` | `/api/device-tokens` | Register a device for push notifications |
| JWT | `GET` | `/api/notifications` | Paginated notifications (`?page=N`) |
| JWT | `PATCH` | `/api/notifications/{id}/read` | Mark one notification as read |
| JWT | `PATCH` | `/api/notifications/mark-all-as-read` | Mark all as read |
| No | `GET` | `/api/faqs` | Public FAQ list |
| No | `GET` | `/api/{type}` | Public static content (`terms_and_conditions`, `privacy_policy`, `community_guidelines`) |
| Optional | `POST` | `/api/contact-us` | Submit support ticket |

Login, register and the password-reset endpoints are rate limited to 3 requests per 60 minutes per IP.

### CMS Routes (`/cms/*`)

| Auth required | Role | Method | Path | Feature |
|---|---|---|---|---|
| No | — | `GET/POST` | `/cms/login` | Login |
| No | — | `GET/POST` | `/cms/forgot-password` | Initiate password reset |
| No | — | `GET/POST` | `/cms/forgot-password/verify/{token}` | Verify OTP |
| No | — | `POST` | `/cms/forgot-password/resend/{token}` | Resend OTP |
| No | — | `GET/POST` | `/cms/reset-password/{token}` | Set new password |
| No | — | `POST` | `/cms/forgot-password/cancel/{token}` | Cancel reset |
| Yes | admin | `POST` | `/cms/logout` | Logout |
| Yes | admin | `GET` | `/cms/dashboard` | Dashboard |
| Yes | admin | `GET/PUT` | `/cms/settings` | Profile settings |
| Yes | admin | `POST` | `/cms/settings/verify/{token}` | OTP verification for settings |
| Yes | admin | `POST` | `/cms/settings/resend/{token}` | Resend settings OTP |
| Yes | admin | `POST` | `/cms/admin/users/{user}/approve` | Approve user |
| Yes | admin | `GET/PUT/DELETE` | `/cms/user-manager/*` | User management |
| Yes | admin | `POST` | `/cms/user-manager/{user}/toggle-block` | Block/unblock user |
| Yes | admin | `GET/POST/PUT/DELETE` | `/cms/faqs/*` | FAQ management |
| Yes | admin | `GET/PUT` | `/cms/static-content/*` | Static content management |
| Yes | admin | `GET/PATCH/DELETE` | `/cms/messages/*` | Support ticket management |
| Yes | admin | `GET/POST` | `/cms/notifications` | Push notifications |
| Yes | admin | `PATCH/DELETE` | `/cms/notifications/*` | Admin inbox (mark read, clear) |
