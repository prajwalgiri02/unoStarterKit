<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;

class UserRegistrationService
{
    public function __construct(
        // @module:notifications
        private readonly AdminAlertService $adminAlertService,
        // @endmodule:notifications
    ) {}

    /**
     * @param  array{name: string, email: string, password: string, phone?: string|null}  $attributes
     */
    public function register(array $attributes): User
    {
        $user = new User($attributes);

        if (! $this->requiresApproval()) {
            $user->forceFill(['approved_at' => now()]);
        }

        $user->save();

        $user->assignRole('user');

        // @module:notifications
        $this->adminAlertService->userRegistered($user, $this->requiresApproval());
        // @endmodule:notifications

        return $user;
    }

    public function requiresApproval(): bool
    {
        return (bool) config('users.require_approval', false);
    }
}
