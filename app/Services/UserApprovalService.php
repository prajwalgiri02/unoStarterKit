<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class UserApprovalService
{
    public function __construct() {}

    public function isEnabled(): bool
    {
        return (bool) config('users.require_approval', false);
    }

    /**
     * @return Collection<int, User>
     */
    public function pendingUsers(): Collection
    {
        if (! $this->isEnabled()) {
            return new Collection;
        }

        return User::query()
            ->whereNull('approved_at')
            ->whereDoesntHave('roles', fn ($query) => $query->where('name', 'admin'))
            ->orderBy('created_at')
            ->get();
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
