<?php

namespace App\Http\Controllers\cms;

use App\Http\Controllers\Controller;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserNotificationController extends Controller
{
    /**
     * Display a listing of the user's notifications.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $notifications = UserNotification::where('notifiable_id', $user->id)
            ->where('notifiable_type', get_class($user))
            ->with('notification')
            ->latest()
            ->paginate(20);

        return response()->json($notifications);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(UserNotification $userNotification)
    {
        // Ensure the notification belongs to the authenticated user
        if ($userNotification->notifiable_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $userNotification->update(['read_at' => now()]);

        return response()->json(['message' => 'Notification marked as read']);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead()
    {
        $user = Auth::user();
        UserNotification::where('notifiable_id', $user->id)
            ->where('notifiable_type', get_class($user))
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read']);
    }
}
