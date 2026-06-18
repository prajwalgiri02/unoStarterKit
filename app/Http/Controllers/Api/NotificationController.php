<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\UserNotification;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    use ApiResponse;

    /**
     * Get the authenticated user's notifications.
     */
    public function index(): JsonResponse
    {
        $notifications = auth('api')->user()->userNotifications()->with('notification')->latest()->get();

        return $this->successResponse(NotificationResource::collection($notifications), 'Notifications retrieved successfully');
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(UserNotification $notification): JsonResponse
    {
        if ($notification->notifiable_id !== auth('api')->id() || $notification->notifiable_type !== get_class(auth('api')->user())) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $notification->update(['read_at' => now()]);

        return $this->successResponse([], 'Notification marked as read');
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(): JsonResponse
    {
        auth('api')->user()->userNotifications()
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return $this->successResponse([], 'All notifications marked as read');
    }
}
