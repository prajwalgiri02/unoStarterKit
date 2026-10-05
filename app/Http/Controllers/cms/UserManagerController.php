<?php

declare(strict_types=1);

namespace App\Http\Controllers\cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserManager\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserApprovalService;
use App\Services\UserManagerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserManagerController extends Controller
{
    public function __construct(
        private readonly UserManagerService $userManagerService,
        private readonly UserApprovalService $userApprovalService,
    ) {}

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $search = $search !== '' ? $search : null;

        $approvalEnabled = $this->userApprovalService->isEnabled();
        $status = $this->option($request, 'status', ['active', 'blocked']);
        $approval = $approvalEnabled ? $this->option($request, 'approval', ['approved', 'pending']) : null;

        $users = $this->userManagerService->listUsers($search, $status, $approval);

        return Inertia::render('cms/user-management/index', [
            'users' => UserResource::collection($users),
            'pendingUsers' => $approvalEnabled
                ? UserResource::collection($this->userManagerService->listPendingUsers($search))
                : null,
            'pendingCount' => $this->userApprovalService->pendingCount(),
            'approvalEnabled' => $approvalEnabled,
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? '',
                'approval' => $approval ?? '',
            ],
        ]);
    }

    /**
     * @param  list<string>  $allowed
     */
    private function option(Request $request, string $key, array $allowed): ?string
    {
        $value = $request->string($key)->toString();

        return in_array($value, $allowed, true) ? $value : null;
    }

    public function show(User $user): Response
    {
        $user = $this->userManagerService->getUser($user);

        return Inertia::render('cms/user-management/view', [
            'user' => new UserResource($user),
        ]);
    }

    public function edit(User $user): Response
    {
        $user = $this->userManagerService->getUser($user);

        return Inertia::render('cms/user-management/edit', [
            'user' => new UserResource($user),
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
}
