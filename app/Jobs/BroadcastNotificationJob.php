<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\DeviceTokenType;
use App\Models\Notification;
use App\Models\User;
use App\Models\UserNotification;
use App\Services\PushNotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class BroadcastNotificationJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Notification $notification) {}

    public function handle(PushNotificationService $push): void
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

        $query
            ->with(['firebaseTokens' => fn ($tokens) => $tokens->where('token_type', DeviceTokenType::FCM)])
            ->chunkById(500, function ($users) use ($push): void {
                foreach ($users as $user) {
                    UserNotification::create([
                        'notification_id' => $this->notification->id,
                        'notifiable_id' => $user->id,
                        'notifiable_type' => User::class,
                    ]);
                }

                $push->sendToTokens(
                    $users->flatMap->firebaseTokens->pluck('device_token')->all(),
                    $this->notification->title,
                    $this->notification->message,
                    $this->payload(),
                );
            });

        $this->notification->update(['sent_at' => now()]);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(): array
    {
        return [
            ...($this->notification->data ?? []),
            'notification_id' => $this->notification->id,
            'url' => $this->notification->url,
        ];
    }
}
