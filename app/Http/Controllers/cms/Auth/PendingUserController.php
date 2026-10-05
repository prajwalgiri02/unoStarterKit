<?php

declare(strict_types=1);

namespace App\Http\Controllers\cms\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\UserApprovalService;
use Illuminate\Http\RedirectResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class PendingUserController extends Controller
{
    public function __construct(
        private readonly UserApprovalService $userApprovalService,
    ) {}

    public function approve(User $user): RedirectResponse
    {
        if (! $this->userApprovalService->isEnabled()) {
            throw new NotFoundHttpException;
        }

        $this->userApprovalService->approve($user);

        return back()->with('status', 'User approved successfully.');
    }
}
