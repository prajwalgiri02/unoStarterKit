<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class UserNotificationService
{
    public function paginate(User $user, int $perPage = 20): LengthAwarePaginator
    {
        return UserNotification::where('notifiable_id', $user->id)
            ->where('notifiable_type', User::class)
            ->with('notification')
            ->latest()
            ->paginate($perPage);
    }

    public function latest(User $user, int $limit = 10): Collection
    {
        return UserNotification::where('notifiable_id', $user->id)
            ->where('notifiable_type', User::class)
            ->with('notification')
            ->latest()
            ->limit($limit)
            ->get();
    }

    public function markAsRead(UserNotification $userNotification): void
    {
        $userNotification->update(['read_at' => now()]);
    }

    public function markAllAsRead(User $user): void
    {
        UserNotification::where('notifiable_id', $user->id)
            ->where('notifiable_type', User::class)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function clearAll(User $user): void
    {
        UserNotification::where('notifiable_id', $user->id)
            ->where('notifiable_type', User::class)
            ->delete();
    }
}
