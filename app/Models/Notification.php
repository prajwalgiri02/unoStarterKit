<?php

namespace App\Models;

use App\Enums\NotificationType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Notification extends Model
{
    protected $fillable = [
        'type',
        'title',
        'message',
        'location',
        'subscription_type',
        'send_to_all',
        'url',
        'data',
        'scheduled_at',
        'sent_at',
        'created_by',
    ];

    protected $attributes = [
        'type' => 'broadcast',
    ];

    protected $casts = [
        'type' => NotificationType::class,
        'data' => 'array',
        'send_to_all' => 'boolean',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    public function userNotifications(): HasMany
    {
        return $this->hasMany(UserNotification::class, 'notification_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
