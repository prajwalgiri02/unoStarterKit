<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserManagerService
{
    public function __construct() {}

    /**
     * @return LengthAwarePaginator<int, User>
     */
    public function listUsers(?string $search = null, int $perPage = 15): LengthAwarePaginator
    {
        return User::query()
            ->with('roles')
            // Exclude users with the 'admin' role
            ->whereDoesntHave('roles', function ($query) {
                $query->where('name', 'admin');
            })
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

    public function getUser(User $user): User
    {
        return $user->loadMissing('roles');
    }

    public function updateUser(User $user, array $attributes, User $actor): User
    {
        $this->ensureActorCanManage($user, $actor);

        $payload = array_intersect_key($attributes, array_flip([
            'name',
            'email',
            'avatar',
            'location',
            'subscription_type',
            'password',
        ]));

        $user->fill($payload);

        if (array_key_exists('password', $payload) && filled($payload['password'])) {
            $user->password = $payload['password'];
        }

        $user->save();

        return $user->fresh(['roles']);
    }

    public function deleteUser(User $user, User $actor): void
    {
        $this->ensureActorCanManage($user, $actor, allowSelf: false);

        $user->delete();
    }

    public function toggleBlock(User $user, User $actor): User
    {
        $this->ensureActorCanManage($user, $actor, allowSelf: false);

        $user->forceFill([
            'blocked_at' => $user->isBlocked() ? null : now(),
        ])->save();

        return $user->fresh(['roles']);
    }

    private function ensureActorCanManage(
        User $user,
        User $actor,
        bool $allowSelf = true,
    ): void {
        if (! $allowSelf && $user->is($actor)) {
            throw ValidationException::withMessages([
                'user' => 'You cannot perform this action on your own account.',
            ]);
        }

        if ($user->hasRole('admin') && ! $user->is($actor)) {
            $adminCount = User::role('admin')->count();

            if ($adminCount <= 1) {
                throw ValidationException::withMessages([
                    'user' => 'The last admin account cannot be modified this way.',
                ]);
            }
        }
    }

    public function changePassword(User $user, string $newPassword, ?string $currentPassword = null): User
    {
        if ($currentPassword !== null && ! Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => 'The provided password does not match your current password.',
            ]);
        }

        $user->password = $newPassword;
        $user->save();

        return $user->fresh(['roles']);
    }
}
