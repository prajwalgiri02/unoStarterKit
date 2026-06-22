<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use App\Models\UserNotification;

class UserNotificationPolicy
{
    public function update(User $user, UserNotification $userNotification): bool
    {
        return $userNotification->notifiable_id === $user->id
            && $userNotification->notifiable_type === User::class;
    }
}
