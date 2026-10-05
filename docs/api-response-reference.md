# API Response Reference

unoStarterKit backend, for the mobile app.

This document describes the JSON the backend returns for every endpoint under `/api`: the response envelopes, every status and error code, and a sample body for each success and error case. Long values such as JWTs are shortened with `…`.

## Contents

- [Basics](#basics)
- [Response envelopes](#response-envelopes)
- [Status and error codes](#status-and-error-codes)
- [Tokens and sessions](#tokens-and-sessions)
- [Rate limits](#rate-limits)
- [Endpoint index](#endpoint-index)
- [Authentication](#authentication)
- [Sign-up verification](#sign-up-verification)
- [Password reset](#password-reset-not-logged-in)
- [Profile](#profile)
- [Notifications](#notifications)
- [Content and support](#content-and-support)
- [Responses shared by every endpoint](#responses-shared-by-every-endpoint)

---

## Basics

- Base path: `/api`. Send `Accept: application/json` on every request and `Content-Type: application/json` for JSON bodies (use `multipart/form-data` only for the avatar upload).
- Authenticated endpoints need `Authorization: Bearer <access_token>`.
- Decide success or failure from the HTTP status code. The `status` field in the body always repeats it.
- On errors, branch on `code`, never on `message`: codes are stable, messages may be reworded. Every message is safe to show to the user.

## Response envelopes

### Success

```json
{"status":200,"message":"Optional text or null","data":{ ... }}
```

`data` is an object, an array, an empty array or `null` depending on the endpoint.

### Paginated success

```json
{"status":200,"message":"...","data":[ ... ],"meta":{"current_page":1,"last_page":2,"per_page":20,"total":22,"from":1,"to":20}}
```

- `meta` is present only on paginated endpoints (currently the notifications list, which also adds `unread_count`).
- No more pages when `current_page == last_page`. Load the next page with `?page=N`.
- Empty result: `"data":[]`, `"total":0`, `"from":null`, `"to":null`, `"last_page":1`.

### Error

```json
{"status":422,"code":"validation_failed","message":"The email field is required.","errors":{"email":["The email field is required."]}}
```

- `errors` is `null`, except for validation and OTP errors, where it maps each field name to a list of messages. Show the first message under the field.
- `data` is added to a 403 `verification_required` error and lists what the user still has to verify (see [Sign-up verification](#sign-up-verification)).
- `debug` is added to 500 responses only when the server runs with `APP_DEBUG=true` (local development). It is never present in production.

## Status and error codes

| HTTP | `code` | When | Suggested handling |
|---|---|---|---|
| 401 | `invalid_credentials` | Wrong email or password on login | Show the message on the login form |
| 401 | `unauthenticated` | Token missing, invalid, expired or logged out on a protected endpoint | Clear the session and show login |
| 401 | `token_expired`, `token_invalid` | Reserved; not returned by the current endpoints | Clear the session and show login |
| 403 | `account_blocked` | Blocked account tries to log in or verify | Show the message |
| 403 | `verification_required` | Email or mobile number not verified yet (only when sign-up verification is enabled). A new code has been sent | Open the code screen for each channel in `data.verification_required` |
| 403 | `account_pending_approval` | Unapproved account tries to log in, registers, or finishes verifying (only when approval is enabled). No token is returned | Show the message |
| 403 | `forbidden` | Action not allowed, e.g. another user's notification | Show the message |
| 404 | `not_found` | Unknown endpoint, record or content type | Show the message or an empty state |
| 405 | `method_not_allowed` | Wrong HTTP method | Developer error |
| 422 | `reset_token_invalid` | Password reset with a `reset_token` that is wrong, expired (15 min) or already used | Show the message; restart the reset flow from step 1 |
| 422 | `validation_failed` | Field validation failed | Show `errors[field][0]` under each field |
| 422 | `otp_invalid`, `otp_expired`, `otp_attempt_limit` | Wrong code, expired code, or too many wrong codes | Show `errors.otp[0]`; on expired or attempt limit offer Resend |
| 422 | `otp_already_verified`, `otp_not_found` | Code already used, the email or mobile number is already verified, or there is no code to check | Continue to the next step, or restart the flow |
| 422 | `otp_resend_cooldown`, `otp_resend_limit` | Resend too soon, or too many resends | Wait `Retry-After` seconds, or restart the flow |
| 422 | `otp_delivery_failed`, `otp_error` | The code could not be sent, or another OTP error | Show the message; let the user retry |
| 429 | `too_many_requests` | Rate limit hit | Wait `Retry-After` seconds |
| 500 | `server_error` | Unexpected server failure | Show a generic error; the message is safe to show |
| 503 | `service_unavailable` | Maintenance mode | Show a maintenance screen and retry later |

## Tokens and sessions

- The login, register, verify and refresh responses include `expires_in` in seconds (3600 by default).
- Call `POST /api/auth/refresh` shortly before the token expires. Refresh needs a token that is still valid: once it has expired, the user must log in again.
- A missing, invalid, expired or logged-out token all return the same 401 `unauthenticated` body. Treat it as "session ended".
- After a password reset, every token issued before the reset returns 401 `unauthenticated` on all devices.
- After the account is deleted, its token returns 401 `unauthenticated`.

## Rate limits

- Login, register and the four password-reset endpoints allow 3 requests per 60 minutes per IP address.
- Verifying a sign-up code allows 6 requests per minute; resending one allows 3 requests per minute.
- Those responses include `X-RateLimit-Limit` and `X-RateLimit-Remaining`. A 429 also includes `Retry-After` (seconds).
- Resending a reset or sign-up code is also limited to once every 60 seconds (`otp_resend_cooldown`, with `Retry-After`).

## Endpoint index

| Method | Path | Token | Purpose |
|---|---|---|---|
| POST | `/api/auth/login` | No | Authentication |
| POST | `/api/auth/register` | No | Authentication |
| POST | `/api/auth/refresh` | Yes | Authentication |
| POST | `/api/auth/logout` | Yes | Authentication |
| POST | `/api/auth/verification/verify` | No | Sign-up verification |
| POST | `/api/auth/verification/resend` | No | Sign-up verification |
| POST | `/api/auth/password/forgot` | No | Password reset (not logged in) |
| POST | `/api/auth/password/verify` | No | Password reset (not logged in) |
| POST | `/api/auth/password/resend` | No | Password reset (not logged in) |
| POST | `/api/auth/password/reset` | No | Password reset (not logged in) |
| GET | `/api/profile` | Yes | Profile |
| GET | `/api/user` | Yes | Profile |
| POST | `/api/profile` | Yes | Profile |
| DELETE | `/api/profile` | Yes | Profile (delete account) |
| POST | `/api/change-password` | Yes | Profile |
| POST | `/api/device-tokens` | Yes | Profile |
| GET | `/api/notifications?page=N` | Yes | Notifications |
| PATCH | `/api/notifications/{id}/read` | Yes | Notifications |
| PATCH | `/api/notifications/mark-all-as-read` | Yes | Notifications |
| DELETE | `/api/notifications` | Yes | Notifications (clear all) |
| GET | `/api/faqs` | No | Content and support |
| GET | `/api/{type}` | No | Content and support |
| POST | `/api/contact-us` | Optional | Content and support |

---

## Authentication

### POST /api/auth/login

Token required: No. Returns the access token and the user. Store the token and send it as `Authorization: Bearer <token>`.

| Field | Rules |
|---|---|
| `email` | required, email, lowercase |
| `password` | required |
| `device_id` + `device_token` | optional; send both to register the device for push |
| `token_type` | optional: `fcm` \| `apns` |
| `platform` | optional: `android` \| `ios` \| `web` |
| `device_name`, `app_version` | optional |

**200 success**

Request body: `{"email": "sample.user@example.com", "password": "Password@123", "device_id": "device-123", "device_token": "fcm-token-abc", "platform": "android"}`
Response headers: `X-RateLimit-Limit: 3`, `X-RateLimit-Remaining: 2`

```json
{"status":200,"message":null,"data":{"access_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9…","token_type":"bearer","expires_in":3600,"user":{"id":2,"name":"Sample User","email":"sample.user@example.com","phone":null,"avatar":null,"location":null,"subscription_type":null,"roles":["user"],"is_blocked":false,"is_approved":true,"is_email_verified":true,"is_phone_verified":false,"pending_verifications":[],"approved_at":"2026-10-05T09:30:00+00:00","email_verified_at":"2026-10-05T09:30:00+00:00","phone_verified_at":null,"blocked_at":null,"created_at":"2026-10-05T09:30:00+00:00","updated_at":"2026-10-05T09:30:00+00:00"}}}
```

**401 wrong credentials**

Request body: `{"email": "sample.user@example.com", "password": "wrong-password"}`

```json
{"status":401,"code":"invalid_credentials","message":"Invalid email or password.","errors":null}
```

**422 missing fields**

```json
{"status":422,"code":"validation_failed","message":"The email field is required. (and 1 more error)","errors":{"email":["The email field is required."],"password":["The password field is required."]}}
```

**422 invalid email**

Request body: `{"email": "not-an-email", "password": ""}`

```json
{"status":422,"code":"validation_failed","message":"The email field must be a valid email address. (and 1 more error)","errors":{"email":["The email field must be a valid email address."],"password":["The password field is required."]}}
```

**403 blocked account**

```json
{"status":403,"code":"account_blocked","message":"Your account has been blocked.","errors":null}
```

**403 email not verified** (sign-up verification enabled; a new code is sent)

```json
{"status":403,"code":"verification_required","message":"Please verify your account. We have sent a verification code to your email.","errors":null,"data":{"verification_required":["email"],"otp_length":6}}
```

**403 account pending approval** (approval enabled)

```json
{"status":403,"code":"account_pending_approval","message":"Your account is pending approval.","errors":null}
```

**429 rate limited**

Response headers: `Retry-After: 3600`, `X-RateLimit-Limit: 3`, `X-RateLimit-Remaining: 0`

```json
{"status":429,"code":"too_many_requests","message":"Too many attempts. Please try again later.","errors":null}
```

### POST /api/auth/register

Token required: No. Same success body as login: the new user is logged in straight away. When sign-up verification is enabled, no token is returned; see [Sign-up verification](#sign-up-verification). When admin approval is enabled (and verification is not), the account is created but the response is 403 `account_pending_approval` with no token: show the message and let the user log in once an admin has approved them.

| Field | Rules |
|---|---|
| `name` | required, max 255 |
| `email` | required, email, lowercase, unique |
| `password` + `password_confirmation` | required, min 8, must match |
| `phone` | optional, Australian format (`0412 345 678` or `+61 2 1234 5678`); required when mobile verification is enabled |
| device fields | optional, same as login; not saved when no token is returned, so send them again at the first login |

**200 success**

Request body: `{"name": "New User", "email": "new.user@example.com", "password": "Password@123", "password_confirmation": "Password@123"}`

```json
{"status":200,"message":null,"data":{"access_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9…","token_type":"bearer","expires_in":3600,"user":{"id":11,"name":"New User","email":"new.user@example.com","phone":null,"avatar":null,"location":null,"subscription_type":null,"roles":["user"],"is_blocked":false,"is_approved":true,"is_email_verified":false,"is_phone_verified":false,"pending_verifications":[],"approved_at":"2026-10-05T09:30:00+00:00","email_verified_at":null,"phone_verified_at":null,"blocked_at":null,"created_at":"2026-10-05T09:30:00+00:00","updated_at":"2026-10-05T09:30:00+00:00"}}}
```

**200 verification required** (email verification enabled)

```json
{"status":200,"message":"We have sent a verification code to your email.","data":{"verification_required":["email"],"otp_length":6}}
```

**403 account created, pending approval** (approval enabled, no token)

```json
{"status":403,"code":"account_pending_approval","message":"Your account has been created and is pending approval.","errors":null}
```

**422 validation errors**

Request body: `{"name": "", "email": "sample.user@example.com", "password": "short", "password_confirmation": "different"}`

```json
{"status":422,"code":"validation_failed","message":"The name field is required. (and 3 more errors)","errors":{"name":["The name field is required."],"email":["The email has already been taken."],"password":["The password field confirmation does not match.","The password field must be at least 8 characters."]}}
```

### POST /api/auth/refresh

Token required: Yes. Returns a new token (same body as login). The current token must not have expired yet.

**200 success**

```json
{"status":200,"message":null,"data":{"access_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9…","token_type":"bearer","expires_in":3600,"user":{ ... }}}
```

**401 missing token**

```json
{"status":401,"code":"unauthenticated","message":"Unauthenticated.","errors":null}
```

### POST /api/auth/logout

Token required: Yes. The token is invalidated; later calls with it return 401.

| Field | Rules |
|---|---|
| `device_id` | required; removes this device's push token |

**422 missing device_id**

```json
{"status":422,"code":"validation_failed","message":"The device id field is required.","errors":{"device_id":["The device id field is required."]}}
```

**200 success**

Request body: `{"device_id": "device-123"}`

```json
{"status":200,"message":"Successfully logged out","data":null}
```

**401 token already logged out**

```json
{"status":401,"code":"unauthenticated","message":"Unauthenticated.","errors":null}
```

---

## Sign-up verification

Each project can require new users to verify their email, their mobile number, or both, with a one-time code before a token is issued. Both are off by default; the backend switches them on with `USER_REQUIRE_EMAIL_VERIFICATION` and `USER_REQUIRE_PHONE_VERIFICATION`. The app does not need to know the settings: it reacts to the responses below.

- Register returns `data.verification_required` (for example `["email"]` or `["email","phone"]`) and `data.otp_length` instead of `access_token`. A code has been sent to each listed channel: email codes by email, mobile codes by SMS. Show one code screen per channel.
- Verify each channel with `POST /api/auth/verification/verify`. While another channel is still listed, the response is 200 with the remaining `verification_required`. When nothing is left, the response is the normal login body with `access_token`.
- Login before verifying returns 403 `verification_required` with the same data, and a new code is sent, so go straight to the code screen.
- Admin approval: if the project also requires approval, finishing verification returns 403 `account_pending_approval` until an admin approves the account. Without sign-up verification, register itself returns that response.
- Profile changes: when `POST /api/profile` changes the email or mobile number, that channel must be verified again. The response message says a code was sent and `user.pending_verifications` lists the channel; verify it with the same endpoint (the current token keeps working).
- The user object includes `is_email_verified`, `is_phone_verified`, `email_verified_at`, `phone_verified_at` and `pending_verifications`.

### POST /api/auth/verification/verify

Token required: No. Checks a sign-up code and marks that channel verified. Returns the token once nothing is left to verify.

| Field | Rules |
|---|---|
| `email` | required, the account email |
| `channel` | required: `email` \| `phone` |
| `otp` | required, the code that was sent |
| device fields | optional, same as login; used when the token is issued |

**422 missing fields**

```json
{"status":422,"code":"validation_failed","message":"The email field is required. (and 2 more errors)","errors":{"email":["The email field is required."],"channel":["The channel field is required."],"otp":["The otp field is required."]}}
```

**422 wrong code**

Request body: `{"email": "verify.user@example.com", "channel": "email", "otp": "000000"}`

```json
{"status":422,"code":"otp_invalid","message":"The OTP is incorrect. 4 attempts remaining.","errors":{"otp":["The OTP is incorrect. 4 attempts remaining."]}}
```

**200 verified (returns the token)**

Request body: `{"email": "verify.user@example.com", "channel": "email", "otp": "439268", "device_id": "device-456", "device_token": "fcm-token-def", "platform": "ios"}`

```json
{"status":200,"message":null,"data":{"access_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9…","token_type":"bearer","expires_in":3600,"user":{ ... }}}
```

**422 already verified**

```json
{"status":422,"code":"otp_already_verified","message":"Your email is already verified.","errors":{"otp":["Your email is already verified."]}}
```

**200 register with email and mobile verification enabled**

Request body: `{"name": "Both User", "email": "both.user@example.com", "phone": "0412 345 678", "password": "Password@123", "password_confirmation": "Password@123"}`

```json
{"status":200,"message":"We have sent a verification code to your email and mobile number.","data":{"verification_required":["email","phone"],"otp_length":6}}
```

**200 email verified, mobile number still to verify**

```json
{"status":200,"message":"Email verified. Please also verify your mobile number.","data":{"verification_required":["phone"],"otp_length":6}}
```

**200 last channel verified (returns the token)**

Request body: `{"email": "both.user@example.com", "channel": "phone", "otp": "620745"}`

```json
{"status":200,"message":null,"data":{"access_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9…","token_type":"bearer","expires_in":3600,"user":{ ... "is_email_verified":true,"is_phone_verified":true,"pending_verifications":[] ... }}}
```

**403 verified, waiting for admin approval**

```json
{"status":403,"code":"account_pending_approval","message":"Your account is verified and pending approval.","errors":null}
```

### POST /api/auth/verification/resend

Token required: No. Sends a new code to that channel. Same response for unknown or already verified accounts. Blocked for 60 seconds after each send (see `Retry-After`).

| Field | Rules |
|---|---|
| `email` | required |
| `channel` | required: `email` \| `phone` |

**422 resend too soon (cooldown)**

Response headers: `Retry-After: 60`

```json
{"status":422,"code":"otp_resend_cooldown","message":"Please wait 60 seconds before requesting another OTP.","errors":{"otp":["Please wait 60 seconds before requesting another OTP."]}}
```

**200 new code sent** (also returned for an unknown email, with nothing sent)

```json
{"status":200,"message":"A new verification code has been sent.","data":null}
```

**422 invalid channel**

Request body: `{"email": "verify.user@example.com", "channel": "sms"}`

```json
{"status":422,"code":"validation_failed","message":"The selected channel is invalid.","errors":{"channel":["The selected channel is invalid."]}}
```

---

## Password reset (not logged in)

### POST /api/auth/password/forgot

Token required: No. Step 1: emails a verification code. The response is identical for registered and unknown emails, so the app cannot tell whether an account exists; always continue to the code screen.

| Field | Rules |
|---|---|
| `email` | required |

**200 code sent** (also returned for an unknown email, with nothing sent)

```json
{"status":200,"message":"Please check your email for a verification code.","data":null}
```

**422 missing email**

```json
{"status":422,"code":"validation_failed","message":"The email field is required.","errors":{"email":["The email field is required."]}}
```

### POST /api/auth/password/verify

Token required: No. Step 2: checks the code and returns a single-use `reset_token`, valid for `expires_in` seconds (15 minutes). Keep it in memory for step 3.

| Field | Rules |
|---|---|
| `email` | required, the email from step 1 |
| `otp` | required, the emailed code |

**422 missing fields**

```json
{"status":422,"code":"validation_failed","message":"The email field is required. (and 1 more error)","errors":{"email":["The email field is required."],"otp":["The otp field is required."]}}
```

**422 no reset in progress for this email**

```json
{"status":422,"code":"otp_invalid","message":"The verification code is incorrect.","errors":{"otp":["The verification code is incorrect."]}}
```

**422 wrong code**

```json
{"status":422,"code":"otp_invalid","message":"The OTP is incorrect. 4 attempts remaining.","errors":{"otp":["The OTP is incorrect. 4 attempts remaining."]}}
```

**200 verified (returns reset_token)**

```json
{"status":200,"message":"Code verified. You can now set a new password.","data":{"reset_token":"mI68tg4mfrwSEVKEDV6AYyp8qOIQXXeOhQ4ZjGTU12dzJWDNbZwKmfajOjSSci29","expires_in":900}}
```

**422 code already verified**

```json
{"status":422,"code":"otp_already_verified","message":"This OTP has already been verified.","errors":{"otp":["This OTP has already been verified."]}}
```

### POST /api/auth/password/resend

Token required: No. Sends a new code. Same response for unknown emails. Blocked for 60 seconds after each send (see `Retry-After`).

| Field | Rules |
|---|---|
| `email` | required |

**422 resend too soon (cooldown)**

Response headers: `Retry-After: 60`

```json
{"status":422,"code":"otp_resend_cooldown","message":"Please wait 60 seconds before requesting another OTP.","errors":{"otp":["Please wait 60 seconds before requesting another OTP."]}}
```

**200 new code sent** (also returned for an unknown email, with nothing sent)

```json
{"status":200,"message":"A new verification code has been sent.","data":null}
```

**422 missing email**

```json
{"status":422,"code":"validation_failed","message":"The email field is required.","errors":{"email":["The email field is required."]}}
```

### POST /api/auth/password/reset

Token required: No. Step 3: sets the new password. The `reset_token` works once. Afterwards every existing login token for that user returns 401, and the user logs in again with the new password.

| Field | Rules |
|---|---|
| `reset_token` | required, from step 2 |
| `password` + `password_confirmation` | required, min 8, must match |

**422 missing fields**

```json
{"status":422,"code":"validation_failed","message":"The reset token field is required. (and 1 more error)","errors":{"reset_token":["The reset token field is required."],"password":["The password field is required."]}}
```

**422 invalid, expired or already used reset_token**

```json
{"status":422,"code":"reset_token_invalid","message":"Your reset session has expired. Please request a new code.","errors":{"reset_token":["Your reset session has expired. Please request a new code."]}}
```

**422 password confirmation mismatch**

```json
{"status":422,"code":"validation_failed","message":"The password field confirmation does not match.","errors":{"password":["The password field confirmation does not match."]}}
```

**200 password reset**

```json
{"status":200,"message":"Your password has been reset. Please log in with your new password.","data":null}
```

**401 token issued before the reset no longer works**

```json
{"status":401,"code":"unauthenticated","message":"Unauthenticated.","errors":null}
```

---

## Profile

### GET /api/profile

Token required: Yes. The logged-in user.

**200 success**

```json
{"status":200,"message":null,"data":{"id":2,"name":"Sample User","email":"sample.user@example.com","phone":null,"avatar":null,"location":null,"subscription_type":null,"is_blocked":false,"is_approved":true,"is_email_verified":true,"is_phone_verified":false,"pending_verifications":[],"approved_at":"2026-10-05T09:30:00+00:00","email_verified_at":"2026-10-05T09:30:00+00:00","phone_verified_at":null,"blocked_at":null,"created_at":"2026-10-05T09:30:00+00:00","updated_at":"2026-10-05T09:30:00+00:00"}}
```

**401 missing token**

```json
{"status":401,"code":"unauthenticated","message":"Unauthenticated.","errors":null}
```

### GET /api/user

Token required: Yes. Same user object as `GET /api/profile`.

### POST /api/profile

Token required: Yes. Changing the email or mobile number while sign-up verification is enabled sends a code to the new address; verify it with `POST /api/auth/verification/verify`.

| Field | Rules |
|---|---|
| `name` | required |
| `email` | required, unique |
| `phone` | optional, Australian format; required when mobile verification is enabled |
| `avatar` | optional image (jpeg, png, jpg, gif, webp, max 2 MB); send as `multipart/form-data` |
| `password` + `password_confirmation` | optional |

**200 success**

Request body: `{"name": "Sample User Updated", "email": "sample.user@example.com", "phone": null}`

```json
{"status":200,"message":"Profile Updated Successfully","data":{"id":2,"name":"Sample User Updated","email":"sample.user@example.com","phone":null,"avatar":null,"location":null,"subscription_type":null,"roles":["user"],"is_blocked":false,"is_approved":true,"is_email_verified":true,"is_phone_verified":false,"pending_verifications":[],"approved_at":"2026-10-05T09:30:00+00:00","email_verified_at":"2026-10-05T09:30:00+00:00","phone_verified_at":null,"blocked_at":null,"created_at":"2026-10-05T09:30:00+00:00","updated_at":"2026-10-05T09:32:02+00:00"}}
```

**200 email changed** (email verification enabled)

Request body: `{"name": "Change User", "email": "changed.user@example.com"}`

```json
{"status":200,"message":"Profile Updated Successfully. We have sent a verification code to your new email.","data":{"id":10,"name":"Change User","email":"changed.user@example.com", ... "is_email_verified":false,"pending_verifications":["email"], ... }}
```

**422 validation errors**

Request body: `{"name": "", "email": "empty.user@example.com"}`

```json
{"status":422,"code":"validation_failed","message":"The name field is required. (and 1 more error)","errors":{"name":["The name field is required."],"email":["The email has already been taken."]}}
```

### DELETE /api/profile

Token required: Yes. Permanently deletes the logged-in user's account after confirming the password.

Deleted with the account: the user, their device tokens, verification codes, notification inbox and avatar file. Support tickets the user sent are kept, without a link to the user. The token stops working straight away. Admin accounts cannot be deleted from the app.

| Field | Rules |
|---|---|
| `password` | required, must match the current password |

**200 success**

Request body: `{"password": "Password@123"}`

```json
{"status":200,"message":"Account deleted successfully","data":null}
```

**422 wrong password** (nothing is deleted)

Request body: `{"password": "wrong-password"}`

```json
{"status":422,"code":"validation_failed","message":"The password is incorrect.","errors":{"password":["The password is incorrect."]}}
```

**422 missing password**

```json
{"status":422,"code":"validation_failed","message":"The password field is required.","errors":{"password":["The password field is required."]}}
```

**422 admin account**

```json
{"status":422,"code":"validation_failed","message":"Admin accounts cannot be deleted from the app.","errors":{"user":["Admin accounts cannot be deleted from the app."]}}
```

**401 missing or already used token**

```json
{"status":401,"code":"unauthenticated","message":"Unauthenticated.","errors":null}
```

### POST /api/change-password

Token required: Yes.

| Field | Rules |
|---|---|
| `current_password` | required |
| `new_password` + `new_password_confirmation` | required, min 8, must match |

**422 wrong current password**

Request body: `{"current_password": "wrong-password", "new_password": "Another@1234", "new_password_confirmation": "Another@1234"}`

```json
{"status":422,"code":"validation_failed","message":"The provided password does not match your current password.","errors":{"current_password":["The provided password does not match your current password."]}}
```

**422 validation errors**

Request body: `{"new_password": "short", "new_password_confirmation": "nope"}`

```json
{"status":422,"code":"validation_failed","message":"The current password field is required. (and 2 more errors)","errors":{"current_password":["The current password field is required."],"new_password":["The new password field confirmation does not match.","The new password field must be at least 8 characters."]}}
```

**200 success**

```json
{"status":200,"message":"Password Changed Successfully","data":null}
```

### POST /api/device-tokens

Token required: Yes. Registers or updates this device's push token.

| Field | Rules |
|---|---|
| `device_id`, `device_token` | required |
| `token_type` | optional: `fcm` \| `apns` |
| `platform` | optional: `android` \| `ios` \| `web` |
| `device_name`, `app_version` | optional |

**200 success**

Request body: `{"device_id": "device-123", "device_token": "fcm-token-abc", "token_type": "fcm", "platform": "android", "device_name": "Pixel 8", "app_version": "1.0.0"}`

```json
{"status":200,"message":"Device registered for push notifications.","data":null}
```

**422 validation errors**

Request body: `{"platform": "windows-phone"}`

```json
{"status":422,"code":"validation_failed","message":"The device id field is required. (and 2 more errors)","errors":{"device_id":["The device id field is required."],"device_token":["The device token field is required."],"platform":["The selected platform is invalid."]}}
```

---

## Notifications

### GET /api/notifications?page=N

Token required: Yes. Paginated: see the `meta` object. Lists the broadcasts sent to this user. Blocked accounts and accounts still waiting for approval do not receive broadcasts.

`meta.unread_count` is the number of unread notifications for the user across all pages, not only the current page. Use it for the badge.

| Field | Rules |
|---|---|
| `page` | optional query parameter, default 1; 20 items per page |

**200 page 1 with several items** (shortened to two items)

```json
{"status":200,"message":"Notifications retrieved successfully","data":[{"id":22,"type":"push","notifiable_type":"App\\Models\\User","notifiable_id":2,"data":{"body":"This is sample notification number 22.","data":[],"title":"Sample notification 22"},"read_at":null,"url":null,"created_at":"2026-10-05T09:30:00.000000Z","updated_at":"2026-10-05T09:30:00.000000Z"},{"id":21,"type":"push","notifiable_type":"App\\Models\\User","notifiable_id":2,"data":{"body":"This is sample notification number 21.","data":[],"title":"Sample notification 21"},"read_at":"2026-10-05T09:30:00.000000Z","url":null,"created_at":"2026-10-05T09:29:00.000000Z","updated_at":"2026-10-05T09:29:00.000000Z"}],"meta":{"current_page":1,"last_page":2,"per_page":20,"total":22,"from":1,"to":20,"unread_count":15}}
```

**200 last page** (`current_page == last_page`)

```json
{"status":200,"message":"Notifications retrieved successfully","data":[ ... ],"meta":{"current_page":2,"last_page":2,"per_page":20,"total":22,"from":21,"to":22,"unread_count":15}}
```

**200 empty result**

```json
{"status":200,"message":"Notifications retrieved successfully","data":[],"meta":{"current_page":1,"last_page":1,"per_page":20,"total":0,"from":null,"to":null,"unread_count":0}}
```

**401 missing or expired token**

```json
{"status":401,"code":"unauthenticated","message":"Unauthenticated.","errors":null}
```

### PATCH /api/notifications/{id}/read

Token required: Yes. Marks one notification as read.

**200 success**

```json
{"status":200,"message":"Notification marked as read","data":[]}
```

**403 notification belongs to another user**

```json
{"status":403,"code":"forbidden","message":"This action is unauthorized.","errors":null}
```

**404 unknown id**

```json
{"status":404,"code":"not_found","message":"The requested resource was not found.","errors":null}
```

### PATCH /api/notifications/mark-all-as-read

Token required: Yes.

**200 success**

```json
{"status":200,"message":"All notifications marked as read","data":[]}
```

### DELETE /api/notifications

Token required: Yes. Deletes every notification in the user's list. Other users are not affected. After this, `GET /api/notifications` returns an empty list with `unread_count` 0.

**200 success**

```json
{"status":200,"message":"All notifications cleared","data":[]}
```

---

## Content and support

### GET /api/faqs

Token required: No. All FAQs, not paginated.

**200 success**

```json
{"status":200,"message":null,"data":[{"id":1,"question":"How do I reset my password?","answer":"Use \"Forgot password\" on the login screen and follow the code we email you.","created_at":"2026-10-05T09:30:00.000000Z"},{"id":2,"question":"How do I contact support?","answer":"Use the Contact Us form in the app.","created_at":"2026-10-05T09:30:00.000000Z"}]}
```

### GET /api/{type}

Token required: No. `description` is HTML from the CMS editor; render it as HTML.

| Field | Rules |
|---|---|
| `type` | `terms_and_conditions` \| `privacy_policy` \| `community_guidelines` |

**200 success**

`GET /api/terms_and_conditions`

```json
{"status":200,"message":null,"data":{"id":1,"type":"terms_and_conditions","title":"Terms & Conditions","description":"<p>These are the sample terms and conditions.<\/p>","updated_at":"2026-10-05T09:30:00.000000Z"}}
```

**404 content not created yet**

`GET /api/privacy_policy`

```json
{"status":404,"code":"not_found","message":"Content not found.","errors":null}
```

**404 unknown type**

`GET /api/refund_policy`

```json
{"status":404,"code":"not_found","message":"The requested resource was not found.","errors":null}
```

### POST /api/contact-us

Token required: Optional. If a token is sent, the message is linked to that user.

| Field | Rules |
|---|---|
| `name` | required |
| `email` | required |
| `message` | required, max 5000 |

**201 success**

Request body: `{"name": "Sample User", "email": "sample.user@example.com", "message": "I need help with my account."}`
Response headers: `X-RateLimit-Limit: 5`, `X-RateLimit-Remaining: 4`

```json
{"status":201,"message":"Your message has been sent successfully.","data":[]}
```

**422 validation errors**

Request body: `{"email": "not-an-email"}`

```json
{"status":422,"code":"validation_failed","message":"The name field is required. (and 2 more errors)","errors":{"name":["The name field is required."],"email":["The email field must be a valid email address."],"message":["The message field is required."]}}
```

---

## Responses shared by every endpoint

These bodies are identical on every endpoint.

**405 wrong method**

`PUT /api/profile`

```json
{"status":405,"code":"method_not_allowed","message":"This method is not allowed for this endpoint.","errors":null}
```

**500 server error (production)**

```json
{"status":500,"code":"server_error","message":"Something went wrong. Please try again later.","errors":null}
```

**500 server error (`APP_DEBUG=true`)**

```json
{"status":500,"code":"server_error","message":"Something went wrong. Please try again later.","errors":null,"debug":{"exception":"RuntimeException","message":"Sample failure for documentation","file":"...","line":51}}
```

**503 maintenance mode**

```json
{"status":503,"code":"service_unavailable","message":"The service is temporarily unavailable. Please try again later.","errors":null}
```

A 401 with `unauthenticated` (see [Profile](#profile) or [Notifications](#notifications)) and a 429 with `too_many_requests` (see [Login](#post-apiauthlogin)) look the same on every endpoint.
