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

You need SSH access to the GitHub repository. Creating a project is two commands, like `laravel new`:

```bash
composer create-project prajwalgiri02/unostarterkit grocery-go --no-install --no-scripts --remove-vcs --repository='{"type":"vcs","url":"git@github.com:prajwalgiri02/unoStarterKit.git","no-api":true}'
cd grocery-go
php installer/setup.php
```

In PowerShell, escape the JSON quotes in the first command:

```powershell
composer create-project prajwalgiri02/unostarterkit grocery-go --no-install --no-scripts --remove-vcs --repository='{\"type\":\"vcs\",\"url\":\"git@github.com:prajwalgiri02/unoStarterKit.git\",\"no-api\":true}'
```

What happens:

1. **Command 1** downloads only the kit's files, which takes a few seconds. `--no-install` skips the Composer packages, `--no-scripts` stops Composer from running anything, and `--remove-vcs` gives the project a fresh start without the kit's `.git` history and without Composer asking about it.
2. **Command 2** runs the installer in your own terminal, so it can read your keyboard. It asks every question first, then installs the Composer packages, then finishes setup (keys, database, seeding, npm).

Composer installs the latest tagged release (`v1.0.0`, `v1.1.0`, ...). To install the latest `main` instead, add `dev-main` after the project name.

### One command with `uno`

Install the `uno` command once per computer and creating a project is a single command, like `laravel new`:

```bash
uno grocery-go
```

It runs the two commands above for you. To install it, copy the file for your system from the `tools/` folder of this repository into a folder that is on your PATH:

- **Windows:** copy `tools/uno.cmd` to a PATH folder such as `C:\ProgramData\ComposerSetup\bin` (where `composer` lives).
- **Mac / Linux:** copy `tools/uno` to `/usr/local/bin/uno` and run `chmod +x /usr/local/bin/uno`.

To get the file without cloning the whole repository, download it from GitHub or from any existing project created with the kit (`tools/` is included in every project).
### Why not one command?

Composer runs scripts without connecting your keyboard on Windows, so a script cannot ask questions there. Running the installer yourself as the second command avoids that. (`composer create-project` without the flags still works: the installer skips its questions when it detects it cannot read input and tells you to run `php installer/setup.php`.)

### Cloning instead

```bash
git clone git@github.com:prajwalgiri02/unoStarterKit.git grocery-go
cd grocery-go
rm -rf .git          # PowerShell: Remove-Item -Recurse -Force .git
php installer/setup.php
```

`php installer/setup.php` works without `vendor/`; it installs the packages itself after the questions. Inside an existing project you can also use `php artisan uno:install`.
### Publishing a new version of the kit

```bash
git tag v1.0.0
git push origin v1.0.0
```

New projects pick up the newest tag. Existing projects are not affected.

---

## The installer

The installer asks for everything the application needs, removes the modules you do not want, writes `.env`, and sets the project up. You never have to edit `.env` by hand. It starts automatically after `composer create-project`, and you can run it yourself with `php artisan uno:install`.

### Modules

The first question is which sidebar modules the project needs:

| Module | Includes |
|---|---|
| User Manager | User list, view, edit, block, delete, and approving new users |
| Messages & Support | Contact-us tickets (CMS page and `POST /api/contact-us`) |
| Static Content | Terms, privacy policy, community guidelines (CMS page and `GET /api/{type}`) |
| FAQs | FAQ management (CMS page and `GET /api/faqs`) |
| Notifications | Broadcast notifications, the header inbox, `GET /api/notifications` |

Dashboard, Settings, authentication, profile and device tokens are always included.

**Unselected modules are deleted from the code**, not hidden: their routes, controllers, models, migrations, seeders, pages, components and tests are removed, and their sidebar entry and any shared code is stripped. The installer shows the list and asks for confirmation first. A deleted module cannot be added back by the installer; copy it from this repository if you need it later.

Shared code that belongs to a module is wrapped in markers, which the installer uses to strip it:

```php
// @module:notifications
...
// @endmodule:notifications
```

When you add code to a shared file that only makes sense with a module, wrap it in that module's markers. When you add a new file to a module, add it to that module's `paths` in `config/installer.php`.

### What it asks

| Section | Questions | Always asked |
|---|---|---|
| Modules | Which sidebar modules to keep | Yes |
| Application | Name, URL | Yes |
| Database | Driver, host, port, database name, username, password | Yes |
| Authentication | Require admin approval for new users? (only with User Manager), OTP delivery channel | Yes |
| Mail | Mailer, SMTP host, port, username, password, from address | Optional |
| File uploads | Local disk or Amazon S3 (access key, secret, region, bucket) | Optional |
| SMS | ClickSend username, API key, sender ID, country | Optional, required when OTP uses SMS |
| Firebase | Path to the service account JSON file | Optional |

Optional sections are offered as a checklist. Tick the ones this project uses; the rest are skipped and can be added later with `--only` (see below).

All questions, defaults and module file lists live in `config/installer.php`, so what the installer asks can be changed there without touching the command.

Values that are the same for every project are set automatically and not asked:

- `APP_ENV=local`, `APP_DEBUG=true`
- `QUEUE_CONNECTION=database`, `CACHE_STORE=database`, `SESSION_DRIVER=database`

### What it does after the questions

The installer runs in two phases, so all questions are answered before anything slow happens:

**Phase 1: questions (needs no Composer packages).**
1. Asks every question, including whether to run `npm install` and `npm run build` afterwards
2. Checks the database connection and creates the database if it does not exist; a wrong password is re-asked straight away
3. Deletes the modules you did not select (after confirmation)
4. Writes all answers to `.env`

**Phase 2: setup (after Composer has installed the packages).**
5. Generates `APP_KEY` and `JWT_SECRET` (only if they are empty)
6. Links storage (`storage:link`)
7. Runs migrations
8. Seeds roles, the default admin user and module content
9. Runs `npm install` and `npm run build` if you said yes

If a step in phase 2 fails, the installer stops and tells you what went wrong. Your answers are already saved, so fix the problem and run `php artisan uno:install --finish` to repeat only phase 2.

`php artisan uno:install` (or `php installer/setup.php` when `vendor/` does not exist yet) runs both phases in one go.

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
| `modules` | Removing modules the project no longer needs (modules cannot be added back) |
| `app` | Renaming the app or changing its URL |
| `database` | Moving to a different database or changing credentials |
| `auth` | Turning admin approval on/off, or switching OTP between email, SMS or both |
| `mail` | Setting up or changing the mail server |
| `firebase` | Adding push notifications, or replacing the service account file |
| `storage` | Switching uploads between the local disk and S3, or changing the bucket |
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
