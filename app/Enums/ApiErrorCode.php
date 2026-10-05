<?php

declare(strict_types=1);

namespace App\Enums;

enum ApiErrorCode: string
{
    case BadRequest = 'bad_request';
    case Unauthenticated = 'unauthenticated';
    case TokenExpired = 'token_expired';
    case TokenInvalid = 'token_invalid';
    case Forbidden = 'forbidden';
    case NotFound = 'not_found';
    case MethodNotAllowed = 'method_not_allowed';
    case Conflict = 'conflict';
    case ValidationFailed = 'validation_failed';
    case TooManyRequests = 'too_many_requests';
    case ServerError = 'server_error';
    case ServiceUnavailable = 'service_unavailable';

    case InvalidCredentials = 'invalid_credentials';
    case AccountPendingApproval = 'account_pending_approval';
    case AccountBlocked = 'account_blocked';
    case VerificationRequired = 'verification_required';

    case ResetTokenInvalid = 'reset_token_invalid';
    case OtpNotFound = 'otp_not_found';
    case OtpAlreadyVerified = 'otp_already_verified';
    case OtpExpired = 'otp_expired';
    case OtpInvalid = 'otp_invalid';
    case OtpAttemptLimit = 'otp_attempt_limit';
    case OtpResendLimit = 'otp_resend_limit';
    case OtpResendCooldown = 'otp_resend_cooldown';
    case OtpDeliveryFailed = 'otp_delivery_failed';
    case OtpError = 'otp_error';

    public static function fromStatus(int $status): self
    {
        return match (true) {
            $status === 401 => self::Unauthenticated,
            $status === 403 => self::Forbidden,
            $status === 404 => self::NotFound,
            $status === 405 => self::MethodNotAllowed,
            $status === 409 => self::Conflict,
            $status === 422 => self::ValidationFailed,
            $status === 429 => self::TooManyRequests,
            $status === 503 => self::ServiceUnavailable,
            $status >= 500 => self::ServerError,
            default => self::BadRequest,
        };
    }
}
