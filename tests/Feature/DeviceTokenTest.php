<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\FirebaseTokens;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class DeviceTokenTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_saves_the_device_token(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
            'device_id' => 'device-1',
            'device_token' => 'fcm-token-1',
            'platform' => 'android',
            'device_name' => 'Pixel 9',
            'app_version' => '1.0.0',
        ])->assertOk();

        $this->assertDatabaseHas('firebase_tokens', [
            'user_id' => $user->id,
            'device_id' => 'device-1',
            'device_token' => 'fcm-token-1',
            'token_type' => 'fcm',
            'platform' => 'android',
        ]);
    }

    public function test_login_without_device_details_still_works(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertOk();

        $this->assertDatabaseCount('firebase_tokens', 0);
    }

    public function test_device_id_and_token_must_be_sent_together(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
            'device_id' => 'device-1',
        ])->assertUnprocessable()->assertJsonValidationErrors('device_token');
    }

    public function test_device_moves_to_the_user_who_logged_in_last(): void
    {
        $first = User::factory()->create();
        $second = User::factory()->create();

        $this->registerDevice($first, 'device-1', 'fcm-token-1');
        $this->registerDevice($second, 'device-1', 'fcm-token-2');

        $this->assertDatabaseCount('firebase_tokens', 1);
        $this->assertDatabaseHas('firebase_tokens', [
            'user_id' => $second->id,
            'device_id' => 'device-1',
            'device_token' => 'fcm-token-2',
        ]);
    }

    public function test_refreshed_token_replaces_the_old_one(): void
    {
        $user = User::factory()->create();

        $this->registerDevice($user, 'device-1', 'old-token');
        $this->registerDevice($user, 'device-1', 'new-token');

        $this->assertSame(['new-token'], $user->firebaseTokens()->pluck('device_token')->all());
    }

    public function test_logout_requires_device_id(): void
    {
        $user = User::factory()->create();

        $this->withToken(Auth::guard('api')->login($user))
            ->postJson('/api/auth/logout')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('device_id');
    }

    public function test_logout_deletes_only_that_devices_token(): void
    {
        $user = User::factory()->create();

        $this->registerDevice($user, 'phone', 'phone-token');
        $this->registerDevice($user, 'tablet', 'tablet-token');

        $this->withToken(Auth::guard('api')->login($user))
            ->postJson('/api/auth/logout', ['device_id' => 'phone'])
            ->assertOk();

        $this->assertDatabaseMissing('firebase_tokens', ['device_id' => 'phone']);
        $this->assertDatabaseHas('firebase_tokens', ['device_id' => 'tablet', 'user_id' => $user->id]);
    }

    public function test_logout_does_not_delete_another_users_device(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();

        $this->registerDevice($owner, 'phone', 'phone-token');

        $this->withToken(Auth::guard('api')->login($other))
            ->postJson('/api/auth/logout', ['device_id' => 'phone'])
            ->assertOk();

        $this->assertTrue(FirebaseTokens::query()->where('device_id', 'phone')->exists());
    }

    private function registerDevice(User $user, string $deviceId, string $token): void
    {
        $this->withToken(Auth::guard('api')->login($user))
            ->postJson('/api/device-tokens', [
                'device_id' => $deviceId,
                'device_token' => $token,
                'platform' => 'ios',
            ])
            ->assertOk();

        Auth::guard('api')->forgetUser();
    }
}
