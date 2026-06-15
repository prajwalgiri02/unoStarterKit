<?php

declare(strict_types=1);

namespace App\Exceptions;

use RuntimeException;

class OtpException extends RuntimeException
{
    public function __construct(
        string $message,
        public readonly string $field = 'otp',
        public readonly ?int $retryAfterSeconds = null,
    ) {
        parent::__construct($message);
    }
}
