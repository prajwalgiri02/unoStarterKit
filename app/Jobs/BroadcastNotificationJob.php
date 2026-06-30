<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Notification;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class BroadcastNotificationJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Notification $notification) {}

    public function handle(): void
    {
        $query = User::query();

        if (! $this->notification->send_to_all) {
            if ($this->notification->location) {
                $query->where('location', $this->notification->location);
            }

            if ($this->notification->subscription_type) {
                $types = array_map('trim', explode(',', $this->notification->subscription_type));
                $query->whereIn('subscription_type', $types);
            }
        }

        $query->with('firebaseTokens')->chunk(500, function ($users): void {
            foreach ($users as $user) {
                UserNotification::create([
                    'notification_id' => $this->notification->id,
                    'notifiable_id' => $user->id,
                    'notifiable_type' => User::class,
                ]);

                $tokens = $user->firebaseTokens->pluck('device_token')->toArray();

                if (! empty($tokens)) {
                    $this->sendToFirebase($tokens);
                }
            }
        });

        $this->notification->update(['sent_at' => now()]);
    }

    private function sendToFirebase(array $tokens): void
    {
        Log::info('Sending FCM notification to '.count($tokens)." tokens for broadcast ID: {$this->notification->id}");

        // Use kreait/laravel-firebase or direct FCM V1 HTTP calls here.
        // Example:
        // Http::withToken($fcmToken)->post('https://fcm.googleapis.com/v1/projects/my-project/messages:send', [...]);
    }
}
