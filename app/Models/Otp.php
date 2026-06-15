<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\OtpChannel;
use App\Enums\OtpPurpose;
use Illuminate\Database\Eloquent\Model;

class Otp extends Model
{
    protected $fillable = [
        'channel',
        'purpose',
        'destination',
        'flow_token',
        'code',
        'attempts',
        'max_attempts',
        'resend_count',
        'max_resends',
        'expires_at',
        'verified_at',
        'metadata',
    ];

    protected $hidden = [
        'code',
    ];

    protected function casts(): array
    {
        return [
            'channel' => OtpChannel::class,
            'purpose' => OtpPurpose::class,
            'expires_at' => 'datetime',
            'verified_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isVerified(): bool
    {
        return $this->verified_at !== null;
    }

    public function hasExceededAttempts(): bool
    {
        return $this->attempts >= $this->max_attempts;
    }

    public function hasExceededResends(): bool
    {
        return $this->resend_count >= $this->max_resends;
    }
}
