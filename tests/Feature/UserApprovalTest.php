<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleAndPermission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserApprovalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermission::class);
    }

    public function test_cms_has_no_registration_route(): void
    {
        $this->get('/cms/register')->assertNotFound();
        $this->post('/cms/register')->assertNotFound();
    }

    public function test_app_user_cannot_sign_in_to_the_cms(): void
    {
        $user = User::factory()->approved()->create([
            'email' => 'user@example.com',
            'password' => 'password123',
        ]);
        $user->assignRole('user');

        $this->post('/cms/login', [
            'email' => 'user@example.com',
            'password' => 'password123',
        ])->assertSessionHasErrors(['email' => __('auth.failed')]);

        $this->assertGuest();
    }

    public function test_registration_returns_a_token_when_approval_is_disabled(): void
    {
        $this->registerViaApi()
            ->assertOk()
            ->assertJsonStructure(['data' => ['access_token', 'user']]);
    }

    public function test_registration_returns_no_token_while_approval_is_pending(): void
    {
        config(['users.require_approval' => true]);

        $this->registerViaApi()
            ->assertForbidden()
            ->assertJsonPath('code', 'account_pending_approval')
            ->assertJsonMissingPath('data.access_token');

        $user = User::query()->where('email', 'jane@example.com')->firstOrFail();
        $this->assertNull($user->approved_at);
        $this->assertTrue($user->hasRole('user'));
        $this->assertDatabaseCount('firebase_tokens', 0);
    }

    public function test_pending_user_cannot_sign_in_until_approved(): void
    {
        config(['users.require_approval' => true]);

        $user = User::factory()->pendingApproval()->create([
            'email' => 'pending@example.com',
            'password' => 'password123',
        ]);
        $user->assignRole('user');

        $this->postJson('/api/auth/login', [
            'email' => 'pending@example.com',
            'password' => 'password123',
        ])
            ->assertForbidden()
            ->assertJsonPath('code', 'account_pending_approval');
    }

    public function test_admin_can_sign_in_without_approval_when_feature_is_enabled(): void
    {
        config(['users.require_approval' => true]);

        $admin = User::factory()->pendingApproval()->create([
            'email' => 'admin@example.com',
            'password' => 'password123',
        ]);
        $admin->assignRole('admin');

        $response = $this->post('/cms/login', [
            'email' => 'admin@example.com',
            'password' => 'password123',
        ]);

        $response->assertRedirect('/cms/dashboard');
        $this->assertAuthenticatedAs($admin);
    }

    // @module:user_manager
    public function test_admin_can_approve_pending_users(): void
    {
        config(['users.require_approval' => true]);

        $admin = User::factory()->approved()->create();
        $admin->assignRole('admin');

        $pendingUser = User::factory()->pendingApproval()->create([
            'email' => 'pending@example.com',
            'password' => 'password123',
        ]);
        $pendingUser->assignRole('user');

        $this->actingAs($admin)
            ->from(route('cms.user-manager.index'))
            ->post(route('cms.admin.users.approve', $pendingUser))
            ->assertRedirect(route('cms.user-manager.index'))
            ->assertSessionHas('status');

        $this->assertNotNull($pendingUser->fresh()->approved_at);

        $this->postJson('/api/auth/login', [
            'email' => 'pending@example.com',
            'password' => 'password123',
        ])->assertOk();
    }

    public function test_user_manager_lists_every_pending_user_regardless_of_page(): void
    {
        config(['users.require_approval' => true]);

        $admin = User::factory()->approved()->create();
        $admin->assignRole('admin');

        $pendingUser = User::factory()->pendingApproval()->create(['created_at' => now()->subYear()]);
        $pendingUser->assignRole('user');

        User::factory()->approved()->count(20)->create()->each->assignRole('user');

        $this->actingAs($admin)
            ->get(route('cms.user-manager.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('cms/user-management/index')
                ->has('pendingUsers.data', 1)
                ->where('pendingUsers.data.0.id', $pendingUser->id)
                ->where('users.data', fn ($users) => collect($users)->doesntContain('id', $pendingUser->id)));
    }

    public function test_pending_users_route_is_removed(): void
    {
        $admin = User::factory()->approved()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin)->get('/cms/admin/users/pending')->assertNotFound();
    }

    public function test_non_admin_cannot_approve_users(): void
    {
        config(['users.require_approval' => true]);

        $user = User::factory()->approved()->create();
        $user->assignRole('user');

        $pendingUser = User::factory()->pendingApproval()->create();
        $pendingUser->assignRole('user');

        $this->actingAs($user)
            ->post(route('cms.admin.users.approve', $pendingUser))
            ->assertForbidden();
    }
    // @endmodule:user_manager

    private function registerViaApi()
    {
        return $this->postJson('/api/auth/register', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'device_id' => 'device-1',
            'device_token' => 'fcm-token-1',
            'platform' => 'android',
        ]);
    }
}
