<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\VerificationChannel;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserManagerService
{
    public function __construct(
        private readonly UserApprovalService $userApprovalService,
    ) {}

    /**
     * @return LengthAwarePaginator<int, User>
     */
    public function listUsers(?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        return $this->search(User::query(), $search)
            ->with('roles')
            ->whereDoesntHave('roles', fn ($query) => $query->where('name', 'admin'))
            ->when($this->userApprovalService->isEnabled(), fn ($query) => $query->whereNotNull('approved_at'))
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * @return LengthAwarePaginator<int, User>
     */
    public function listPendingUsers(?string $search = null, int $perPage = 2): LengthAwarePaginator
    {
        $paginate = fn (?int $page = null): LengthAwarePaginator => $this
            ->search($this->userApprovalService->pendingUsersQuery(), $search)
            ->with('roles')
            ->orderBy('created_at')
            ->paginate($perPage, pageName: 'pending_page', page: $page)
            ->withQueryString();

        $users = $paginate();

        return $users->isEmpty() && $users->currentPage() > 1 ? $paginate($users->lastPage()) : $users;
    }

    /**
     * @param  Builder<User>  $query
     * @return Builder<User>
     */
    private function search(Builder $query, ?string $search): Builder
    {
        return $query->when(
            filled($search),
            fn ($query) => $query->where(function ($query) use ($search): void {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            }),
        );
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
            'phone',
            'avatar',
            'location',
            'subscription_type',
            'password',
        ]));

        $user->fill($payload);

        foreach (VerificationChannel::cases() as $channel) {
            if ($channel->isRequired() && $user->isDirty($channel->attribute())) {
                $user->{$channel->verifiedAtColumn()} = null;
            }
        }

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
