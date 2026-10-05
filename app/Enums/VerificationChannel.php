<?php

declare(strict_types=1);

namespace App\Enums;

enum VerificationChannel: string
{
    case EMAIL = 'email';
    case PHONE = 'phone';

    public function otpChannel(): OtpChannel
    {
        return match ($this) {
            self::EMAIL => OtpChannel::EMAIL,
            self::PHONE => OtpChannel::SMS,
        };
    }

    public function otpPurpose(): OtpPurpose
    {
        return match ($this) {
            self::EMAIL => OtpPurpose::EMAIL_VERIFICATION,
            self::PHONE => OtpPurpose::PHONE_VERIFICATION,
        };
    }

    public function attribute(): string
    {
        return match ($this) {
            self::EMAIL => 'email',
            self::PHONE => 'phone',
        };
    }

    public function verifiedAtColumn(): string
    {
        return match ($this) {
            self::EMAIL => 'email_verified_at',
            self::PHONE => 'phone_verified_at',
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::EMAIL => 'email',
            self::PHONE => 'mobile number',
        };
    }

    public function isRequired(): bool
    {
        return (bool) config("users.verification.{$this->value}", false);
    }
}
