<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Contracts\UserRepositoryInterface;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
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

    public function findById(int $id): ?User
    {
        return User::query()
            ->with('roles')
            ->find($id);
    }

    /**
     * @return LengthAwarePaginator<int, User>
     */
    public function search(?string $search, int $perPage = 15): LengthAwarePaginator
    {
        return User::query()
            ->with('roles')
            ->when(
                filled($search),
                fn ($query) => $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                }),
            )
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();
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

    public function update(User $user, array $attributes): User
    {
        $user->fill($attributes);

        if (array_key_exists('password', $attributes) && filled($attributes['password'])) {
            $user->password = $attributes['password'];
        }

        $user->save();

        return $user->fresh(['roles']);
    }

    public function delete(User $user): bool
    {
        return (bool) $user->delete();
    }

    public function toggleBlock(User $user): User
    {
        $user->forceFill([
            'blocked_at' => $user->isBlocked() ? null : now(),
        ])->save();

        return $user->fresh(['roles']);
    }
}
