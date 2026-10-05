<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleAndPermission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProfileApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermission::class);
    }

    public function test_profile_returns_the_authenticated_user(): void
    {
        $user = User::factory()->create(['name' => 'Jane']);

        $this->withToken(Auth::guard('api')->login($user))
            ->getJson('/api/profile')
            ->assertOk()
            ->assertJsonFragment(['name' => 'Jane']);
    }

    public function test_profile_requires_authentication(): void
    {
        $this->getJson('/api/profile')->assertUnauthorized();
    }

    public function test_user_can_update_name(): void
    {
        $user = User::factory()->create();

        $this->withToken(Auth::guard('api')->login($user))
            ->postJson('/api/profile', ['name' => 'New Name', 'email' => $user->email])
            ->assertOk();

        $this->assertSame('New Name', $user->fresh()->name);
    }

    public function test_profile_update_validates_input(): void
    {
        $user = User::factory()->create();

        $this->withToken(Auth::guard('api')->login($user))
            ->postJson('/api/profile', ['email' => 'not-an-email'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email']);
    }

    public function test_profile_update_rejects_an_email_used_by_another_user(): void
    {
        $taken = User::factory()->create();
        $user = User::factory()->create();

        $this->withToken(Auth::guard('api')->login($user))
            ->postJson('/api/profile', ['name' => 'Jane', 'email' => $taken->email])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_user_can_change_password(): void
    {
        $user = User::factory()->create(['password' => 'Old@12345']);

        $this->withToken(Auth::guard('api')->login($user))
            ->postJson('/api/change-password', [
                'current_password' => 'Old@12345',
                'new_password' => 'New@12345',
                'new_password_confirmation' => 'New@12345',
            ])
            ->assertOk();

        $this->assertTrue(Hash::check('New@12345', $user->fresh()->password));
    }

    public function test_change_password_rejects_a_wrong_current_password(): void
    {
        $user = User::factory()->create(['password' => 'Old@12345']);

        $this->withToken(Auth::guard('api')->login($user))
            ->postJson('/api/change-password', [
                'current_password' => 'wrong',
                'new_password' => 'New@12345',
                'new_password_confirmation' => 'New@12345',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('current_password');

        $this->assertTrue(Hash::check('Old@12345', $user->fresh()->password));
    }

    public function test_change_password_requires_confirmation(): void
    {
        $user = User::factory()->create(['password' => 'Old@12345']);

        $this->withToken(Auth::guard('api')->login($user))
            ->postJson('/api/change-password', [
                'current_password' => 'Old@12345',
                'new_password' => 'New@12345',
                'new_password_confirmation' => 'Different@1',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('new_password');
    }
}
