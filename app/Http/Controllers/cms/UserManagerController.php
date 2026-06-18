<?php

declare(strict_types=1);

namespace App\Http\Controllers\cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserManager\UpdateUserRequest;
use App\Models\User;
use App\Services\UserManagerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserManagerController extends Controller
{
    public function __construct(
        private readonly UserManagerService $userManagerService,
    ) {}

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $search = $search !== '' ? $search : null;

        $users = $this->userManagerService->listUsers($search);

        return Inertia::render('cms/user-management/index', [
            'users' => $users->through(fn (User $user): array => $this->transformUser($user)),
            'filters' => [
                'search' => $search ?? '',
            ],
        ]);
    }

    public function show(User $user): Response
    {
        $user = $this->userManagerService->getUser($user);

        return Inertia::render('cms/user-management/view', [
            'user' => $this->transformUser($user),
        ]);
    }

    public function edit(User $user): Response
    {
        $user = $this->userManagerService->getUser($user);

        return Inertia::render('cms/user-management/edit', [
            'user' => $this->transformUser($user),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $this->userManagerService->updateUser(
            $user,
            $request->userAttributes(),
            $request->user(),
        );

        return redirect()
            ->route('cms.user-manager.show', $user)
            ->with('status', 'User updated successfully.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->userManagerService->deleteUser($user, $request->user());

        return redirect()
            ->route('cms.user-manager.index')
            ->with('status', 'User deleted successfully.');
    }

    public function toggleBlock(Request $request, User $user): RedirectResponse
    {
        $updatedUser = $this->userManagerService->toggleBlock($user, $request->user());

        $message = $updatedUser->isBlocked()
            ? 'User blocked successfully.'
            : 'User unblocked successfully.';

        return redirect()
            ->back()
            ->with('status', $message);
    }

    /**
     * @return array{
     *     id: int,
     *     name: string,
     *     email: string,
     *     roles: list<string>,
     *     is_blocked: bool,
     *     is_approved: bool,
     *     approved_at: string|null,
     *     blocked_at: string|null,
     *     created_at: string|null,
     *     updated_at: string|null
     * }
     */
    private function transformUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->roles->pluck('name')->values()->all(),
            'is_blocked' => $user->isBlocked(),
            'is_approved' => $user->isApproved(),
            'approved_at' => $user->approved_at?->toIso8601String(),
            'blocked_at' => $user->blocked_at?->toIso8601String(),
            'created_at' => $user->created_at?->toIso8601String(),
            'updated_at' => $user->updated_at?->toIso8601String(),
        ];
    }
}
