<?php

namespace App\Http\Controllers\cms;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Display a listing of the notifications.
     */
    public function index()
    {
        $notifications = Notification::with('creator')->latest()->paginate(20);

        return Inertia::render('cms/broadcast-notification/index', [
            'notifications' => $notifications,
        ]);
    }

    /**
     * Store a newly created notification in storage and broadcast it.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'location' => 'nullable|string',
            'subscription_type' => 'nullable|string', // e.g., "lifetime,free,annual,monthly"
            'send_to_all' => 'boolean',
            'url' => 'nullable|url',
            'data' => 'nullable|array',
            'scheduled_at' => 'nullable|date',
        ]);

        DB::transaction(function () use ($validated) {
            $broadcast = Notification::create([
                'title' => $validated['title'],
                'message' => $validated['message'],
                'location' => $validated['location'] ?? null,
                'subscription_type' => $validated['subscription_type'] ?? null,
                'send_to_all' => $validated['send_to_all'] ?? false,
                'url' => $validated['url'] ?? null,
                'data' => $validated['data'] ?? null,
                'scheduled_at' => $validated['scheduled_at'] ?? null,
                'created_by' => Auth::id(),
                'sent_at' => $validated['scheduled_at'] ? null : now(),
            ]);

            // If not scheduled for future, send it immediately
            if (! $broadcast->scheduled_at) {
                $this->sendBroadcast($broadcast);
            }
        });

        return back()->with('status', 'Notification broadcasted successfully.');
    }

    /**
     * Send the broadcast to eligible users.
     */
    protected function sendBroadcast(Notification $broadcast)
    {
        $query = User::query();

        // Apply filters if not sending to all
        if (! $broadcast->send_to_all) {
            if ($broadcast->location) {
                $query->where('location', $broadcast->location);
            }

            if ($broadcast->subscription_type) {
                $types = array_map('trim', explode(',', $broadcast->subscription_type));
                $query->whereIn('subscription_type', $types);
            }
        }

        // Process users in chunks to handle large datasets
        $query->with('firebaseTokens')->chunk(500, function ($users) use ($broadcast) {
            foreach ($users as $user) {
                // 1. Create in-app notification record
                UserNotification::create([
                    'notification_id' => $broadcast->id,
                    'notifiable_id' => $user->id,
                    'notifiable_type' => User::class,
                ]);

                // 2. Send Push Notification via Firebase
                $tokens = $user->firebaseTokens->pluck('device_token')->toArray();
                if (! empty($tokens)) {
                    $this->sendToFirebase($tokens, $broadcast);
                }
            }
        });

        // Mark as sent
        $broadcast->update(['sent_at' => now()]);
    }

    /**
     * Send push notification to Firebase tokens.
     */
    protected function sendToFirebase(array $tokens, Notification $broadcast)
    {
        // Log the attempt
        Log::info('Sending FCM notification to '.count($tokens)." tokens for broadcast ID: {$broadcast->id}");

        // Implementation note:
        // You should use a package like 'kreait/laravel-firebase' or direct HTTP calls to FCM V1 API.
        // For production, this should ideally be handled by a queued Job.

        /* Example implementation:
        foreach ($tokens as $token) {
            // Http::withToken($fcmToken)->post('https://fcm.googleapis.com/v1/projects/my-project/messages:send', [...]);
        }
        */
    }
}
