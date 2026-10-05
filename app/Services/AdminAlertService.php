<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\NotificationType;
use App\Models\Notification;
// @module:support
use App\Models\SupportTicket;
// @endmodule:support
use App\Models\User;
use Illuminate\Support\Facades\Route;

class AdminAlertService
{
    public function userRegistered(User $user, bool $awaitingApproval): void
    {
        $this->notify(
            title: 'New user registered',
            message: $awaitingApproval
                ? "{$user->name} registered and is waiting for approval."
                : "{$user->name} registered.",
            url: Route::has('cms.user-manager.show')
                ? route('cms.user-manager.show', $user, absolute: false)
                : null,
        );
    }

    // @module:support
    public function contactUsReceived(SupportTicket $ticket): void
    {
        $this->notify(
            title: 'New contact-us message',
            message: "{$ticket->name} ({$ticket->email}) sent a message.",
            url: route('cms.admin.messages.index', absolute: false),
        );
    }
    // @endmodule:support

    private function notify(string $title, string $message, ?string $url): void
    {
        $adminIds = User::query()
            ->whereHas('roles', fn ($roles) => $roles->where('name', 'admin'))
            ->pluck('id');

        if ($adminIds->isEmpty()) {
            return;
        }

        $notification = Notification::create([
            'type' => NotificationType::AdminAlert,
            'title' => $title,
            'message' => $message,
            'url' => $url,
            'sent_at' => now(),
        ]);

        $notification->userNotifications()->createMany(
            $adminIds->map(fn (int $id): array => [
                'notifiable_id' => $id,
                'notifiable_type' => User::class,
            ])->all(),
        );
    }
}
