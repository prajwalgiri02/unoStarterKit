<?php

declare(strict_types=1);

namespace App\Services;

use App\Contracts\UserRepositoryInterface;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class UserManagerService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
    ) {}

    /**
     * @return LengthAwarePaginator<int, User>
     */
    public function listUsers(?string $search = null, int $perPage = 15): LengthAwarePaginator
    {
        return $this->userRepository->search($search, $perPage);
    }

    public function getUser(User $user): User
    {
        return $user->loadMissing('roles');
    }

    public function updateUser(User $user, array $attributes, User $actor): User
    {
        $this->ensureActorCanManage($user, $actor);

        $payload = [
            'name' => $attributes['name'],
            'email' => $attributes['email'],
        ];

        if (! empty($attributes['password'])) {
            $payload['password'] = $attributes['password'];
        }

        return $this->userRepository->update($user, $payload);
    }

    public function deleteUser(User $user, User $actor): void
    {
        $this->ensureActorCanManage($user, $actor, allowSelf: false);

        $this->userRepository->delete($user);
    }

    public function toggleBlock(User $user, User $actor): User
    {
        $this->ensureActorCanManage($user, $actor, allowSelf: false);

        return $this->userRepository->toggleBlock($user);
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
}
