<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface UserRepositoryInterface
{
    public function create(array $attributes): User;

    public function findById(int $id): ?User;

    /**
     * @return LengthAwarePaginator<int, User>
     */
    public function search(?string $search, int $perPage = 15): LengthAwarePaginator;

    /**
     * @return Collection<int, User>
     */
    public function pendingApproval(): Collection;

    public function approve(User $user): User;

    public function update(User $user, array $attributes): User;

    public function delete(User $user): bool;

    public function toggleBlock(User $user): User;
}
