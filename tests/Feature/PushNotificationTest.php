<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Jobs\BroadcastNotificationJob;
use App\Models\FirebaseTokens;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Kreait\Firebase\Contract\Messaging;
use Kreait\Firebase\Exception\Messaging\NotFound;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\MessageTarget;
use Kreait\Firebase\Messaging\MulticastSendReport;
use Kreait\Firebase\Messaging\SendReport;
use Mockery;
use Tests\TestCase;

class PushNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_nothing_is_sent_when_firebase_is_not_configured(): void
    {
        config(['firebase.projects.app.credentials' => null]);

        $messaging = Mockery::mock(Messaging::class);
        $messaging->shouldNotReceive('sendMulticast');
        $this->app->instance(Messaging::class, $messaging);

        $user = $this->userWithToken('device-1', 'token-1');

        BroadcastNotificationJob::dispatchSync($this->notification());

        $this->assertDatabaseHas('user_notifications', ['notifiable_id' => $user->id]);
    }

    public function test_broadcast_sends_push_and_removes_dead_tokens(): void
    {
        config(['firebase.projects.app.credentials' => '{"type":"service_account"}']);

        $this->userWithToken('device-1', 'live-token');
        $this->userWithToken('device-2', 'dead-token');
        FirebaseTokens::query()->create([
            'user_id' => User::factory()->create()->id,
            'device_id' => 'device-3',
            'device_token' => 'apns-token',
            'token_type' => 'apns',
        ]);

        $messaging = Mockery::mock(Messaging::class);
        $messaging->shouldReceive('sendMulticast')
            ->once()
            ->withArgs(function (CloudMessage $message, array $tokens): bool {
                sort($tokens);

                $payload = json_decode((string) json_encode($message), true);

                return $tokens === ['dead-token', 'live-token']
                    && $payload['notification']['title'] === 'Sale today'
                    && $payload['data']['url'] === 'https://example.com/sale';
            })
            ->andReturn(MulticastSendReport::withItems([
                SendReport::success(MessageTarget::with(MessageTarget::TOKEN, 'live-token'), []),
                SendReport::failure(
                    MessageTarget::with(MessageTarget::TOKEN, 'dead-token'),
                    NotFound::becauseTokenNotFound('dead-token'),
                ),
            ]));
        $this->app->instance(Messaging::class, $messaging);

        BroadcastNotificationJob::dispatchSync($this->notification());

        $this->assertDatabaseHas('firebase_tokens', ['device_token' => 'live-token']);
        $this->assertDatabaseMissing('firebase_tokens', ['device_token' => 'dead-token']);
    }

    private function userWithToken(string $deviceId, string $token): User
    {
        $user = User::factory()->create();

        FirebaseTokens::query()->create([
            'user_id' => $user->id,
            'device_id' => $deviceId,
            'device_token' => $token,
            'token_type' => 'fcm',
        ]);

        return $user;
    }

    private function notification(): Notification
    {
        return Notification::query()->create([
            'title' => 'Sale today',
            'message' => 'Everything is 20% off',
            'send_to_all' => true,
            'url' => 'https://example.com/sale',
            'created_by' => User::factory()->create()->id,
        ]);
    }
}
