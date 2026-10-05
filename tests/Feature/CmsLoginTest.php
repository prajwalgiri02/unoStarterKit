<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleAndPermission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CmsLoginTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermission::class);
    }

    public function test_login_page_renders_for_guests(): void
    {
        $this->get('/cms/login')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('auth/sign-in'));
    }

    public function test_admin_can_log_in(): void
    {
        $admin = $this->admin();

        $this->post('/cms/login', ['email' => $admin->email, 'password' => 'Secret@123'])
            ->assertRedirect();

        $this->assertAuthenticatedAs($admin);
    }

    public function test_wrong_password_is_rejected(): void
    {
        $admin = $this->admin();

        $this->post('/cms/login', ['email' => $admin->email, 'password' => 'wrong'])
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_non_admin_cannot_log_in_to_the_cms(): void
    {
        $user = User::factory()->create(['password' => 'Secret@123']);

        $this->post('/cms/login', ['email' => $user->email, 'password' => 'Secret@123'])
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_blocked_admin_cannot_log_in(): void
    {
        $admin = $this->admin();
        $admin->forceFill(['blocked_at' => now()])->save();

        $this->post('/cms/login', ['email' => $admin->email, 'password' => 'Secret@123'])
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_authenticated_admin_is_redirected_away_from_login(): void
    {
        $this->actingAs($this->admin())->get('/cms/login')->assertRedirect();
    }

    public function test_admin_can_log_out(): void
    {
        $this->actingAs($this->admin())
            ->post('/cms/logout')
            ->assertRedirect('/cms/login');

        $this->assertGuest();
    }

    public function test_guest_is_redirected_from_protected_pages(): void
    {
        $this->get('/cms/user-manager')->assertRedirect();
    }

    private function admin(): User
    {
        $admin = User::factory()->create(['password' => 'Secret@123']);
        $admin->assignRole('admin');

        return $admin;
    }
}
