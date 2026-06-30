<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\UserNotification;
use App\Services\UserNotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class NotificationController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly UserNotificationService $service) {}

    public function index(): JsonResponse
    {
        $notifications = $this->service->paginate(auth('api')->user());

        return $this->successResponse(NotificationResource::collection($notifications), 'Notifications retrieved successfully');
    }

    public function markAsRead(UserNotification $notification): JsonResponse
    {
        Gate::forUser(auth('api')->user())->authorize('update', $notification);

        $this->service->markAsRead($notification);

        return $this->successResponse([], 'Notification marked as read');
    }

    public function markAllAsRead(): JsonResponse
    {
        $this->service->markAllAsRead(auth('api')->user());

        return $this->successResponse([], 'All notifications marked as read');
    }
}
