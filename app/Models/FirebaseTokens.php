<?php

namespace App\Models;

use App\Enums\DevicePlatform;
use App\Enums\DeviceTokenType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FirebaseTokens extends Model
{
    protected $fillable = [
        'user_id',
        'device_id',
        'device_token',
        'token_type',
        'platform',
        'device_name',
        'app_version',
        'last_used_at',
    ];

    protected $casts = [
        'token_type' => DeviceTokenType::class,
        'platform' => DevicePlatform::class,
        'last_used_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
