# laravelBase 🚀

> A reusable Laravel starter kit — build once, ship faster every time.

---

## Phase 1 — Foundation

### 1. Project Setup
- [ ] Install Laravel via `composer create-project laravel/laravel laravelBase`
- [ ] Configure `.env` — set `APP_NAME=laravelBase`, database, mail
- [ ] Install and configure **Vite** (ships with Laravel 10+)
- [ ] Install **Tailwind CSS** via `npm install -D tailwindcss postcss autoprefixer`
- [ ] Configure `tailwind.config.js` with content paths
- [ ] Install **Alpine.js** `npm install alpinejs`
- [ ] Set up base layout `resources/views/layouts/app.blade.php`
- [ ] Set up `resources/views/layouts/guest.blade.php`
- [ ] Add a `/` welcome route and view
- [ ] Run `npm run dev` and verify Vite HMR works

### 2. Authentication (Custom)

#### 2a. User Model & Migration
- [ ] Update `users` table migration — ensure columns: `name`, `email`, `password`, `email_verified_at`, `remember_token`
- [ ] Implement `MustVerifyEmail` contract on `User` model
- [ ] Add `HasApiTokens` trait to `User` model (for Sanctum API later)
- [ ] Run `php artisan migrate`

#### 2b. Register
- [ ] Create `App\Http\Controllers\Auth\RegisterController`
- [ ] Add `showRegisterForm()` — return `auth.register` view
- [ ] Add `register(Request $request)` — validate, hash password, create user, fire `Registered` event, redirect
- [ ] Validation rules: `name` required, `email` unique, `password` min 8 + confirmed
- [ ] Create view `resources/views/auth/register.blade.php` with name, email, password, confirm password fields
- [ ] Register routes: `GET /register` → `showRegisterForm`, `POST /register` → `register`

#### 2c. Login
- [ ] Create `App\Http\Controllers\Auth\LoginController`
- [ ] Add `showLoginForm()` — return `auth.login` view
- [ ] Add `login(Request $request)` — validate, attempt `Auth::attempt()`, regenerate session, redirect
- [ ] Handle failed login — return back with `auth.failed` error message
- [ ] Add **remember me** — pass `$request->boolean('remember')` to `Auth::attempt()`
- [ ] Create view `resources/views/auth/login.blade.php` with email, password, remember me checkbox
- [ ] Register routes: `GET /login` → `showLoginForm`, `POST /login` → `login`

#### 2d. Logout
- [ ] Add `logout(Request $request)` to `LoginController`
- [ ] Call `Auth::logout()`, invalidate session, regenerate CSRF token, redirect to `/`
- [ ] Register route: `POST /logout` → `logout` (auth middleware)

#### 2e. Email Verification
- [ ] Create `App\Http\Controllers\Auth\EmailVerificationController`
- [ ] Add `notice()` — show `auth.verify-email` prompt view (redirect if already verified)
- [ ] Add `verify(EmailVerificationRequest $request)` — call `$request->fulfill()`, redirect to dashboard
- [ ] Add `resend(Request $request)` — call `$request->user()->sendEmailVerificationNotification()`, redirect back
- [ ] Create view `resources/views/auth/verify-email.blade.php` with resend button
- [ ] Register routes under `auth` middleware: `GET /email/verify`, `GET /email/verify/{id}/{hash}`, `POST /email/verification-notification`
- [ ] Add `verified` middleware to dashboard route group

#### 2f. Password Reset
- [ ] Create `App\Http\Controllers\Auth\ForgotPasswordController`
- [ ] Add `showForgotForm()` — return `auth.forgot-password` view
- [ ] Add `sendResetLink(Request $request)` — validate email, call `Password::sendResetLink()`, return status
- [ ] Create `App\Http\Controllers\Auth\ResetPasswordController`
- [ ] Add `showResetForm(Request $request, string $token)` — return `auth.reset-password` view with token
- [ ] Add `resetPassword(Request $request)` — call `Password::reset()`, update password with `Hash::make()`, login user, redirect
- [ ] Create views: `auth/forgot-password.blade.php`, `auth/reset-password.blade.php`
- [ ] Register routes: `GET /forgot-password`, `POST /forgot-password`, `GET /reset-password/{token}`, `POST /reset-password`
- [ ] Create branded `ResetPasswordNotification` mailable and override in `User::sendPasswordResetNotification()`

#### 2g. Rate Limiting & Security
- [ ] Add `throttle:5,1` to login and forgot-password POST routes
- [ ] Lock account after 10 failed attempts using `RateLimiter` facade
- [ ] Add CSRF protection — verify all auth forms use `@csrf`
- [ ] Hash all passwords with `Hash::make()` — never store plain text
- [ ] Redirect authenticated users away from guest routes using `RedirectIfAuthenticated` middleware

### 3. Roles & Permissions
- [ ] Install Spatie Permission `composer require spatie/laravel-permission`
- [ ] Publish and run migrations `php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"`
- [ ] Add `HasRoles` trait to `User` model
- [ ] Create `RolePermissionSeeder` with roles: `super-admin`, `admin`, `user`
- [ ] Define core permissions: `manage users`, `manage roles`, `view admin`, `manage settings`
- [ ] Assign permissions to roles in seeder
- [ ] Create `AdminMiddleware` to guard admin routes
- [ ] Register middleware in `bootstrap/app.php` (Laravel 11) or `Kernel.php`
- [ ] Run `php artisan db:seed --class=RolePermissionSeeder` and verify

---

## Phase 2 — Admin Panel & Core Features

### 4. Admin Panel
- [ ] Create `Admin` controller namespace `App\Http\Controllers\Admin`
- [ ] Define admin route group in `routes/web.php` with `auth` + `role:admin` middleware
- [ ] Build admin sidebar layout `resources/views/admin/layouts/sidebar.blade.php`
- [ ] Create dashboard view with metric cards (total users, roles, recent activity)
- [ ] Build **User index** page — paginated table with search
- [ ] Build **User create/edit** form — name, email, role assignment
- [ ] Build **User delete** with confirmation modal
- [ ] Build **Role index** page — list roles with permission badges
- [ ] Add breadcrumb component for admin navigation
- [ ] Protect all admin views with `@can` directives

### 5. File Management
- [ ] Install Spatie Media Library `composer require spatie/laravel-medialibrary`
- [ ] Publish config and run migrations
- [ ] Add `InteractsWithMedia` trait to `User` model (and any other models that need it)
- [ ] Configure default disk in `config/media-library.php` (local or S3)
- [ ] Create `MediaController` with upload, list, delete endpoints
- [ ] Build reusable Blade component `<x-media-upload>` with drag-and-drop
- [ ] Add image conversion for avatars (thumbnail 100×100)
- [ ] Set up S3/DigitalOcean Spaces config in `.env` (optional, swap from local)
- [ ] Test file upload, retrieval URL, and deletion

### 6. Notifications
- [ ] Create `notifications` database table `php artisan notifications:table && php artisan migrate`
- [ ] Create `WelcomeNotification` — sent on registration via email + database
- [ ] Build notification bell icon component in nav with unread count badge
- [ ] Create `NotificationController` — index (list), markAsRead, markAllRead
- [ ] Build `/notifications` page — list with read/unread state toggle
- [ ] Add notification dropdown in navbar with latest 5
- [ ] Add `PasswordResetNotification` override with branded email
- [ ] Test end-to-end: register → bell shows welcome notification

### 7. REST API
- [ ] Install Laravel Sanctum `composer require laravel/sanctum` (if not already)
- [ ] Publish Sanctum config and run migrations
- [ ] Add `HasApiTokens` trait to `User` model
- [ ] Create versioned route file `routes/api/v1.php` and register in `bootstrap/app.php`
- [ ] Create `ApiResponseTrait` with `success()`, `error()`, `paginated()` helpers
- [ ] Build `Api/V1/AuthController` — login (issue token), logout (revoke), me
- [ ] Build `Api/V1/UserController` — index, show, update (admin only)
- [ ] Add API rate limiting `throttle:60,1` to API routes
- [ ] Document endpoints in `README.md` or Postman collection
- [ ] Test with Postman / curl — login, get token, hit protected route

### 8. Settings System
- [ ] Create `settings` table migration: `key`, `value`, `group`, `type`
- [ ] Create `Setting` model with `get(key, default)` and `set(key, value)` static methods
- [ ] Cache settings with `Cache::rememberForever` — clear on update
- [ ] Create `SettingsSeeder` with defaults: `app_name`, `app_logo`, `mail_from_name`, `items_per_page`
- [ ] Build admin **Settings page** grouped by section (General, Mail, Media)
- [ ] Create `UserSettingController` for per-user preferences (theme, notifications)
- [ ] Add `user_settings` JSON column to `users` table or pivot table
- [ ] Test: update setting → verify cache clears → new value loads

### 9. Audit Logging
- [ ] Install Spatie Activity Log `composer require spatie/laravel-activitylog`
- [ ] Publish config and run migrations
- [ ] Add `LogsActivity` trait to `User` model (and other key models)
- [ ] Configure logged events: `created`, `updated`, `deleted`
- [ ] Log custom events: login, logout, role change, settings update
- [ ] Build admin **Activity Log** page — filterable by user, event type, date range
- [ ] Add pagination and search to activity log
- [ ] Set log retention policy (prune old records via scheduled command)
- [ ] Test: update a user → verify log entry appears in admin UI

---

## Phase 3 — Background Jobs & Developer Experience

### 10. Queue & Horizon
- [ ] Install Laravel Horizon `composer require laravel/horizon`
- [ ] Publish Horizon config `php artisan horizon:install`
- [ ] Configure Redis in `.env` (`QUEUE_CONNECTION=redis`)
- [ ] Set up queue workers in `config/horizon.php` — define supervisor environments
- [ ] Move email sending (welcome, password reset) to queued jobs
- [ ] Create `failed_jobs` table `php artisan queue:failed-table && php artisan migrate`
- [ ] Set up failed job alert notification to admin email
- [ ] Protect `/horizon` dashboard with `HorizonServiceProvider` gate
- [ ] Test: dispatch a job → see it in Horizon → confirm it processes

### 11. Factories & Seeders
- [ ] Create `UserFactory` with states: `admin()`, `unverified()`, `withAvatar()`
- [ ] Update `DatabaseSeeder` to call all seeders in correct order
- [ ] Create `AdminUserSeeder` — one super-admin with known credentials
- [ ] Create `DemoSeeder` — 50 fake users with roles and notifications
- [ ] Create `SettingsSeeder` — all default settings
- [ ] Add `--fresh` shortcut: `php artisan migrate:fresh --seed`
- [ ] Verify factories work in tests: `User::factory()->admin()->create()`

### 12. Feature Flags
- [ ] Create `feature_flags` table: `name`, `enabled`, `description`
- [ ] Create `FeatureFlag` model with `isEnabled(name)` static helper
- [ ] Register `@feature('flag-name')` Blade directive in `AppServiceProvider`
- [ ] Create `FeatureFlagSeeder` with initial flags: `new_dashboard`, `api_v2`, `beta_media`
- [ ] Build admin **Feature Flags** toggle UI — list with on/off switches
- [ ] Cache flag values with auto-clear on toggle
- [ ] Test: disable a flag → verify feature hidden → re-enable → visible again

---

## Phase 4 — Polish & Production Readiness

### 13. Testing Suite
- [ ] Install Pest `composer require pestphp/pest --dev && php artisan pest:install`
- [ ] Install Pest Laravel plugin `composer require pestphp/pest-plugin-laravel --dev`
- [ ] Write auth tests: register, login, logout, email verify, password reset
- [ ] Write permission tests: admin can access admin, user cannot
- [ ] Write API tests: login returns token, protected route rejects unauthenticated
- [ ] Write settings tests: get/set/cache behavior
- [ ] Write notification tests: notification created on register
- [ ] Write media tests: upload creates media record, delete removes file
- [ ] Aim for ≥ 80% coverage on core modules
- [ ] Run full suite `php artisan test` — all green before any deploy

### 14. Security Hardening
- [ ] Add global rate limiting in `AppServiceProvider` (login: 5/min, API: 60/min)
- [ ] Configure CORS in `config/cors.php` — restrict allowed origins
- [ ] Add security headers middleware: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- [ ] Enable HTTPS-only cookies: `SESSION_SECURE_COOKIE=true` in production
- [ ] Add `/health` endpoint returning `{"status":"ok","db":"ok","cache":"ok"}`
- [ ] Disable debug mode: `APP_DEBUG=false` in production `.env`
- [ ] Audit `php artisan route:list` — ensure no unintended public routes
- [ ] Run `php artisan config:cache`, `route:cache`, `view:cache` for production
- [ ] Test health endpoint and headers with [securityheaders.com](https://securityheaders.com)

### 15. CI/CD Pipeline
- [ ] Create `.github/workflows/ci.yml`
- [ ] CI steps: checkout → setup PHP 8.3 → install composer deps → copy `.env.testing` → run migrations → run Pest tests
- [ ] Add lint step with `./vendor/bin/pint --test` (Laravel Pint)
- [ ] Set up deployment step — deploy to **Laravel Forge** or SSH to VPS on push to `main`
- [ ] Add GitHub secrets: `FORGE_TOKEN` or `SSH_PRIVATE_KEY`, `APP_KEY`, etc.
- [ ] Create `Makefile` with shortcuts: `make test`, `make deploy`, `make fresh`
- [ ] Test full pipeline: push a commit → CI passes → auto-deploys

---

## Optional Extras

### Billing (Laravel Cashier)
- [ ] Install Cashier `composer require laravel/cashier`
- [ ] Set up Stripe keys in `.env`
- [ ] Add `Billable` trait to `User` model
- [ ] Create subscription plans seeder
- [ ] Build pricing page and checkout flow
- [ ] Build billing portal (manage subscription, invoices)

### Multi-tenancy
- [ ] Install `stancl/tenancy` or design a `teams` table manually
- [ ] Add `team_id` foreign key to all tenant-scoped models
- [ ] Create `TeamMiddleware` to scope queries globally
- [ ] Build team switcher UI in navbar

### Search (Laravel Scout)
- [ ] Install Scout `composer require laravel/scout`
- [ ] Install Meilisearch driver `composer require meilisearch/meilisearch-php`
- [ ] Add `Searchable` trait to `User` (and other models)
- [ ] Build search bar component with live results

### Real-time (Laravel Reverb)
- [ ] Install Reverb `php artisan install:broadcasting`
- [ ] Configure `BROADCAST_CONNECTION=reverb` in `.env`
- [ ] Create a sample event and broadcast channel
- [ ] Build a live notification toast using Echo + Alpine.js

---

## Quick Reference

| Command | Purpose |
|---|---|
| `php artisan migrate:fresh --seed` | Reset DB with all seeders |
| `php artisan test` | Run full Pest test suite |
| `php artisan horizon` | Start queue dashboard |
| `php artisan queue:work` | Start queue worker (dev) |
| `php artisan route:list` | Audit all routes |
| `php artisan make:model X -mfsc` | Model + migration + factory + seeder + controller |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build assets for production |

---

*laravelBase — built once, reused forever.*