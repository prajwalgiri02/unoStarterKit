<?php

declare(strict_types=1);

namespace App\Http\Controllers\cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\cms\StoreNotificationRequest;
use App\Services\NotificationBroadcastService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function __construct(private readonly NotificationBroadcastService $service) {}

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
}
