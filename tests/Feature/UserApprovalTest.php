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

    public function test_registration_logs_in_immediately_when_approval_is_disabled(): void
    {
        config(['users.require_approval' => false]);

        $response = $this->post('/cms/register', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect('/');
        $this->assertAuthenticatedAs(User::query()->where('email', 'jane@example.com')->first());
    }

    public function test_registration_requires_approval_before_login_when_enabled(): void
    {
        config(['users.require_approval' => true]);

        $response = $this->post('/cms/register', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response
            ->assertRedirect(route('cms.auth.login'))
            ->assertSessionHas('status');

        $this->assertGuest();

        $user = User::query()->where('email', 'jane@example.com')->first();
        $this->assertNotNull($user);
        $this->assertNull($user->approved_at);
        $this->assertTrue($user->hasRole('user'));
    }

    public function test_pending_user_cannot_sign_in_until_approved(): void
    {
        config(['users.require_approval' => true]);

        $user = User::factory()->pendingApproval()->create([
            'email' => 'pending@example.com',
            'password' => 'password123',
        ]);
        $user->assignRole('user');

        $response = $this->post('/cms/login', [
            'email' => 'pending@example.com',
            'password' => 'password123',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
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

        $response->assertRedirect('/');
        $this->assertAuthenticatedAs($admin);
    }

    public function test_admin_can_approve_pending_users(): void
    {
        config(['users.require_approval' => true]);

        $admin = User::factory()->approved()->create([
            'email' => 'admin@example.com',
            'password' => 'password123',
        ]);
        $admin->assignRole('admin');

        $pendingUser = User::factory()->pendingApproval()->create([
            'email' => 'pending@example.com',
            'password' => 'password123',
        ]);
        $pendingUser->assignRole('user');

        $this->actingAs($admin)
            ->post(route('cms.admin.users.approve', $pendingUser))
            ->assertRedirect(route('cms.admin.users.pending'))
            ->assertSessionHas('status');

        $this->assertNotNull($pendingUser->fresh()->approved_at);

        auth()->logout();

        $this->post('/cms/login', [
            'email' => 'pending@example.com',
            'password' => 'password123',
        ])->assertRedirect('/');

        $this->assertAuthenticatedAs($pendingUser->fresh());
    }

    public function test_non_admin_cannot_access_pending_user_approval_routes(): void
    {
        config(['users.require_approval' => true]);

        $user = User::factory()->approved()->create([
            'password' => 'password123',
        ]);
        $user->assignRole('user');

        $pendingUser = User::factory()->pendingApproval()->create();
        $pendingUser->assignRole('user');

        $this->actingAs($user)
            ->get(route('cms.admin.users.pending'))
            ->assertForbidden();

        $this->actingAs($user)
            ->post(route('cms.admin.users.approve', $pendingUser))
            ->assertForbidden();
    }
}
