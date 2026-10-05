<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\AdminUser;
use Database\Seeders\RoleAndPermission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminUserSeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermission::class);
    }

    public function test_it_creates_the_admin_from_the_configured_credentials(): void
    {
        config(['users.admin.email' => 'owner@example.com', 'users.admin.password' => 'Chosen@123']);

        $this->seed(AdminUser::class);

        $admin = User::where('email', 'owner@example.com')->firstOrFail();

        $this->assertTrue($admin->hasRole('admin'));
        $this->assertNotNull($admin->approved_at);
        $this->assertTrue(Hash::check('Chosen@123', $admin->password));
    }

    public function test_it_generates_a_password_when_none_is_configured(): void
    {
        config(['users.admin.email' => 'owner@example.com', 'users.admin.password' => null]);

        $this->artisan('db:seed', ['--class' => AdminUser::class])
            ->expectsOutputToContain('Generated admin password for owner@example.com')
            ->assertSuccessful();

        $admin = User::where('email', 'owner@example.com')->firstOrFail();

        $this->assertNotSame('', $admin->password);
        $this->assertFalse(Hash::check('Test@123', $admin->password));
    }

    public function test_it_does_not_reset_the_password_of_an_existing_admin(): void
    {
        $existing = User::factory()->create(['email' => 'owner@example.com', 'password' => 'Original@123']);

        config(['users.admin.email' => 'owner@example.com', 'users.admin.password' => 'Other@12345']);

        $this->seed(AdminUser::class);

        $this->assertTrue(Hash::check('Original@123', $existing->fresh()->password));
        $this->assertTrue($existing->fresh()->hasRole('admin'));
    }

    public function test_it_creates_nothing_without_an_admin_email(): void
    {
        config(['users.admin.email' => null, 'users.admin.password' => 'Chosen@123']);

        $this->artisan('db:seed', ['--class' => AdminUser::class])
            ->expectsOutputToContain('ADMIN_EMAIL is not set')
            ->assertSuccessful();

        $this->assertDatabaseCount('users', 0);
    }

    public function test_no_default_credentials_are_seeded(): void
    {
        config(['users.admin.email' => null]);

        $this->seed();

        $this->assertDatabaseMissing('users', ['email' => 'developers@appifany.com.au']);
    }
}
