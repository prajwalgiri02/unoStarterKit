<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class UserApprovalService
{
    public function __construct() {}

    public function isEnabled(): bool
    {
        return (bool) config('users.require_approval', false);
    }

    /**
     * @return Builder<User>
     */
    public function pendingUsersQuery(): Builder
    {
        return User::query()
            ->whereNull('approved_at')
            ->whereDoesntHave('roles', fn ($query) => $query->where('name', 'admin'));
    }

    public function pendingCount(): int
    {
        return $this->isEnabled() ? $this->pendingUsersQuery()->count() : 0;
    }

    public function approve(User $user): User
    {
        if (! $this->isEnabled()) {
            throw new NotFoundHttpException;
        }

        if ($user->hasRole('admin')) {
            throw new NotFoundHttpException;
        }

        if ($user->approved_at !== null) {
            return $user;
        }

        $user->forceFill([
            'approved_at' => now(),
        ])->save();

        return $user->fresh();
    }
}
