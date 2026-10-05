<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleAndPermission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class DeleteAccountTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermission::class);
    }

    public function test_user_can_delete_own_account_with_password(): void
    {
        $user = User::factory()->create(['password' => 'Secret@123']);
        $user->firebaseTokens()->create(['device_id' => 'phone', 'device_token' => 'token']);

        $this->withToken(Auth::guard('api')->login($user))
            ->deleteJson('/api/profile', ['password' => 'Secret@123'])
            ->assertOk();

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
        $this->assertDatabaseMissing('firebase_tokens', ['device_id' => 'phone']);
    }

    public function test_wrong_password_does_not_delete_account(): void
    {
        $user = User::factory()->create(['password' => 'Secret@123']);

        $this->withToken(Auth::guard('api')->login($user))
            ->deleteJson('/api/profile', ['password' => 'wrong'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('password');

        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }

    public function test_password_is_required(): void
    {
        $user = User::factory()->create();

        $this->withToken(Auth::guard('api')->login($user))
            ->deleteJson('/api/profile')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('password');
    }

    public function test_guest_cannot_delete_account(): void
    {
        $this->deleteJson('/api/profile', ['password' => 'x'])->assertUnauthorized();
    }

    public function test_admin_cannot_delete_account_from_api(): void
    {
        $admin = User::factory()->create(['password' => 'Secret@123']);
        $admin->assignRole('admin');

        $this->withToken(Auth::guard('api')->login($admin))
            ->deleteJson('/api/profile', ['password' => 'Secret@123'])
            ->assertUnprocessable();

        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }
}
