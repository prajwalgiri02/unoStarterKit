<?php

declare(strict_types=1);

namespace App\Http\Controllers\cms;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\UserNotification;
use App\Services\UserNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserNotificationController extends Controller
{
    public function __construct(private readonly UserNotificationService $service) {}

    public function index(Request $request): JsonResponse
    {
        $notifications = $this->service->paginate($request->user());

        return response()->json(NotificationResource::collection($notifications)->response()->getData(true));
    }

    public function markAsRead(Request $request, UserNotification $userNotification): JsonResponse
    {
        $this->authorize('update', $userNotification);

        $this->service->markAsRead($userNotification);

        return response()->json(['message' => 'Notification marked as read.']);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $this->service->markAllAsRead($request->user());

        return response()->json(['message' => 'All notifications marked as read.']);
    }
}
