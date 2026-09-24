# unoStarterKit

Laravel 13 + React/Inertia starter kit with a CMS admin panel and a JWT-authenticated API for mobile apps.

Included out of the box:

- CMS admin panel (React, Inertia, Tailwind)
- JWT API authentication
- Roles & permissions (spatie/laravel-permission)
- OTP verification over email and/or SMS (ClickSend)
- Optional admin approval for new users
- Push notifications (Firebase Cloud Messaging)
- File uploads to local disk or Amazon S3
- Support tickets, FAQs, static content, notifications

---

## Requirements

- PHP 8.3+
- Composer 2
- Node.js 20+ and npm
- MySQL / MariaDB, PostgreSQL, or SQLite

---

## Creating a new project

```bash
composer create-project prajwalgiri02/unostarterkit my-project \
  --repository='{"type":"vcs","url":"git@github.com:prajwalgiri02/unoStarterKit.git"}'
```

Or clone it and run the installer yourself:

```bash
git clone git@github.com:prajwalgiri02/unoStarterKit.git my-project
cd my-project
composer install
php artisan uno:install
```

The installer starts automatically after `composer create-project`.

---

## The installer

`php artisan uno:install` asks for everything the application needs, writes it to `.env`, and sets the project up. You never have to edit `.env` by hand.

### What it asks

| Section | Questions | Always asked |
|---|---|---|
| Application | Name, URL | Yes |
| Database | Driver, host, port, database name, username, password | Yes |
| Authentication | Require admin approval for new users? OTP delivery channel (email / SMS / both) | Yes |
| Mail | SMTP host, port, username, password, from address | Optional |
| Firebase | Path to the service account JSON file | Optional |
| File storage | AWS access key, secret, region, bucket | Optional |
| SMS | ClickSend username, API key, sender ID | Optional |

Optional sections are offered as a checklist. Tick the ones this project uses; the rest are skipped and can be added later with `--only` (see below).

Values that are the same for every project are set automatically and not asked:

- `APP_ENV=local`, `APP_DEBUG=true`
- `QUEUE_CONNECTION=database`, `CACHE_STORE=database`, `SESSION_DRIVER=database`

### What it does after the questions

1. Writes all answers to `.env`
2. Creates the database if it does not exist
3. Generates `APP_KEY` and `JWT_SECRET` (only if they are empty)
4. Links storage (`storage:link`)
5. Runs migrations
6. Seeds roles, permissions and the default admin user
7. Optionally installs npm packages and builds the frontend

### Default admin login

| Email | Password |
|---|---|
| `developers@appifany.com.au` | `Test@123` |

Change this password after the first login on any shared or deployed environment.

---

## Configuring one section later (`--only`)

Every section can be reconfigured on its own at any time:

```bash
php artisan uno:install --only=sms
```

This:

- asks **only** the questions for that section
- shows the current value as the default, so pressing Enter keeps it
- leaves password fields unchanged if you leave them blank
- updates **only** that section's lines in `.env`
- does **not** run migrations, seeders, key generation or npm

### Available sections

| Section | Use it when |
|---|---|
| `app` | Renaming the app or changing its URL |
| `database` | Moving to a different database or changing credentials |
| `auth` | Turning admin approval on/off, or switching OTP between email, SMS or both |
| `mail` | Setting up or changing the mail server |
| `firebase` | Adding push notifications, or replacing the service account file |
| `storage` | Moving uploads to S3 or changing the bucket |
| `sms` | Adding ClickSend, or switching between real SMS and log-only |

Several sections can be given at once, separated by commas:

```bash
php artisan uno:install --only=mail,sms
```

### Examples

**The client now wants OTP by SMS.**

```bash
php artisan uno:install --only=sms,auth
```

Enter the ClickSend credentials, then choose "SMS" or "Email and SMS" as the OTP channel.

**Moving uploads from the local disk to S3.**

```bash
php artisan uno:install --only=storage
```

Existing files on the local disk are not copied to S3; move them yourself if needed.

**Firebase project changed.**

```bash
php artisan uno:install --only=firebase
```

Give the path to the new service account JSON. It replaces `storage/app/private/firebase/credentials.json`.

**Changed database credentials.**

```bash
php artisan uno:install --only=database
php artisan migrate
```

`--only` never touches the database itself, so run migrations yourself if the new database is empty.

### After using `--only`

If config caching is enabled (usually on servers), clear it so the new values are picked up:

```bash
php artisan config:clear
```

---

## Services

### SMS (ClickSend)

SMS is controlled entirely by `.env`:

```env
SMS_DRIVER=clicksend
CLICKSEND_USERNAME=
CLICKSEND_API_KEY=
CLICKSEND_FROM=
CLICKSEND_COUNTRY=AU
```

SMS is only used for OTPs when `OTP_DELIVERY_CHANNELS` is `sms` or `both`.

Set `SMS_DRIVER=log` during development to write messages to `storage/logs/laravel.log` instead of sending them.

### Push notifications (Firebase)

1. Firebase console → Project settings → Service accounts → **Generate new private key**
2. Run `php artisan uno:install --only=firebase` and give the path to the downloaded file

The file is copied to `storage/app/private/firebase/credentials.json`, which is ignored by git. Never commit it.

Push notifications are sent only when `FIREBASE_CREDENTIALS` points to a valid file. Without it, notifications are still saved in the database and shown in the app, but no push is sent.

#### Device tokens (mobile app)

Send the device details on login or register:

```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "secret",
  "device_id": "unique-id-of-this-install",
  "device_token": "fcm-registration-token",
  "platform": "android",
  "token_type": "fcm",
  "device_name": "Pixel 9",
  "app_version": "1.0.0"
}
```

`device_id` and `device_token` must be sent together. `platform` is `android`, `ios` or `web`; `token_type` is `fcm` (default) or `apns`. Only `fcm` tokens receive pushes.

When Firebase gives the app a new token, update it:

```json
POST /api/device-tokens        (requires the JWT)
{ "device_id": "...", "device_token": "...", "platform": "ios" }
```

On logout, `device_id` is required and that device's token is deleted:

```json
POST /api/auth/logout          (requires the JWT)
{ "device_id": "unique-id-of-this-install" }
```

One device belongs to one user: if another user logs in on the same device, the token moves to them. Tokens that Firebase reports as invalid are deleted automatically after each send.

---

## Development

```bash
composer dev
```

Starts the web server, queue worker, log viewer and Vite together.

```bash
composer test
```

Runs the test suite.
