<?php

declare(strict_types=1);

namespace App\Http\Controllers\cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\cms\StoreNotificationRequest;
use App\Services\NotificationBroadcastService;
use App\Services\UserNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function __construct(
        private readonly NotificationBroadcastService $service,
        private readonly UserNotificationService $userNotificationService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('cms/broadcast-notification/index', [
            'notifications' => $this->service->paginate(),
        ]);
    }

    public function store(StoreNotificationRequest $request): RedirectResponse
    {
        $this->service->create($request->validated());

        return back()->with('status', 'Notification broadcasted successfully.');
    }

    public function markAllAsRead(): RedirectResponse
    {
        $this->userNotificationService->markAllAsRead(Auth::user());

        return back()->with('status', 'All notifications marked as read.');
    }

    public function clearAll(): RedirectResponse
    {
        $this->userNotificationService->clearAll(Auth::user());

        return back()->with('status', 'All notifications cleared.');
    }
}
