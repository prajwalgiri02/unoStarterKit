<?php

declare(strict_types=1);

namespace App\Http\Controllers\cms\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\UserApprovalService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class PendingUserController extends Controller
{
    public function __construct(
        private readonly UserApprovalService $userApprovalService,
    ) {}

    public function index(): Response|RedirectResponse
    {
        if (! $this->userApprovalService->isEnabled()) {
            return redirect()->route('cms.auth.login');
        }

        $users = $this->userApprovalService->pendingUsers();

        return Inertia::render('cms/Admin/PendingUsers', [
            'users' => $users->map(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at?->toIso8601String(),
            ])->values(),
        ]);
    }

    public function approve(User $user): RedirectResponse
    {
        if (! $this->userApprovalService->isEnabled()) {
            throw new NotFoundHttpException;
        }

        $this->userApprovalService->approve($user);

        return back()->with('status', 'User approved successfully.');
    }
}
