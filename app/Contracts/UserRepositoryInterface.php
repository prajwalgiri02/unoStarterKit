<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface UserRepositoryInterface
{
    public function create(array $attributes): User;

    /**
     * @return Collection<int, User>
     */
    public function pendingApproval(): Collection;

    public function approve(User $user): User;
}
