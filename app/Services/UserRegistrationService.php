<?php

declare(strict_types=1);

namespace App\Services;

use App\Contracts\UserRepositoryInterface;
use App\Models\User;

class UserRegistrationService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
    ) {}

    /**
     * @param  array{name: string, email: string, password: string}  $attributes
     */
    public function register(array $attributes): User
    {
        $user = $this->userRepository->create([
            ...$attributes,
            'approved_at' => $this->shouldAutoApprove() ? now() : null,
        ]);

        $user->assignRole('user');

        return $user;
    }

    public function requiresApproval(): bool
    {
        return (bool) config('users.require_approval', false);
    }

    private function shouldAutoApprove(): bool
    {
        return ! $this->requiresApproval();
    }
}
