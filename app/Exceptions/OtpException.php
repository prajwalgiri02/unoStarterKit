<?php

declare(strict_types=1);

namespace App\Exceptions;

use App\Enums\ApiErrorCode;
use RuntimeException;

class OtpException extends RuntimeException
{
    public function __construct(
        string $message,
        public readonly string $field = 'otp',
        public readonly ?int $retryAfterSeconds = null,
        public readonly ApiErrorCode $reason = ApiErrorCode::OtpError,
    ) {
        parent::__construct($message);
    }
}
