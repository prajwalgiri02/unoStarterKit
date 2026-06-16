<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class UserNotification extends Model
{
    protected $fillable = [
        'broadcast_id',
        'notifiable_id',
        'notifiable_type',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    public function broadcast(): BelongsTo
    {
        return $this->belongsTo(Notification::class, 'broadcast_id');
    }

    public function notifiable(): MorphTo
    {
        return $this->morphTo();
    }
}
