<?php

declare(strict_types=1);

namespace App\Data;

use App\Models\Otp;

final readonly class GeneratedOtp
{
    public function __construct(
        public Otp $otp,
        public string $code,
        public string $flowToken = '',
    ) {}
}
