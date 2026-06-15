<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Contracts\UserRepositoryInterface;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class UserRepository implements UserRepositoryInterface
{
    public function create(array $attributes): User
    {
        $user = new User($attributes);

        if (array_key_exists('approved_at', $attributes)) {
            $user->forceFill(['approved_at' => $attributes['approved_at']]);
        }

        $user->save();

        return $user;
    }

    /**
     * @return Collection<int, User>
     */
    public function pendingApproval(): Collection
    {
        return User::query()
            ->whereNull('approved_at')
            ->whereDoesntHave('roles', fn ($query) => $query->where('name', 'admin'))
            ->orderBy('created_at')
            ->get();
    }

    public function approve(User $user): User
    {
        $user->forceFill([
            'approved_at' => now(),
        ])->save();

        return $user->fresh();
    }
}
