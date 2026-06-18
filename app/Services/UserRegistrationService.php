<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;

class UserRegistrationService
{
    public function __construct() {}

    /**
     * @param  array{name: string, email: string, password: string}  $attributes
     */
    public function register(array $attributes): User
    {
        $user = new User($attributes);

        if (! $this->requiresApproval()) {
            $user->forceFill(['approved_at' => now()]);
        }

        $user->save();

        $user->assignRole('user');

        return $user;
    }

    public function requiresApproval(): bool
    {
        return (bool) config('users.require_approval', false);
    }
}
