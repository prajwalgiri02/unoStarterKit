<?php

declare(strict_types=1);

namespace App\Services;

use App\Jobs\BroadcastNotificationJob;
use App\Models\Notification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class NotificationBroadcastService
{
    public function paginate(int $perPage = 20): LengthAwarePaginator
    {
        return Notification::with('creator')->latest()->paginate($perPage);
    }

    /**
     * @param array{
     *     title: string,
     *     message: string,
     *     location?: string|null,
     *     subscription_type?: string|null,
     *     send_to_all?: bool,
     *     url?: string|null,
     *     data?: array<mixed>|null,
     *     scheduled_at?: string|null,
     * } $data
     */
    public function create(array $data): Notification
    {
        $isScheduled = ! empty($data['scheduled_at']);

        $notification = Notification::create([
            'title' => $data['title'],
            'message' => $data['message'],
            'location' => $data['location'] ?? null,
            'subscription_type' => $data['subscription_type'] ?? null,
            'send_to_all' => $data['send_to_all'] ?? false,
            'url' => $data['url'] ?? null,
            'data' => $data['data'] ?? null,
            'scheduled_at' => $data['scheduled_at'] ?? null,
            'created_by' => Auth::id(),
            'sent_at' => $isScheduled ? null : now(),
        ]);

        if (! $isScheduled) {
            BroadcastNotificationJob::dispatch($notification);
        }

        return $notification;
    }
}
