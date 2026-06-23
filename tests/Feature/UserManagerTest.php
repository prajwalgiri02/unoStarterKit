<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleAndPermission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermission::class);
    }

    public function test_guest_cannot_access_user_manager(): void
    {
        $this->get(route('cms.user-manager.index'))
            ->assertRedirect(route('cms.auth.login'));
    }

    public function test_non_admin_cannot_access_user_manager(): void
    {
        $user = User::factory()->create();
        $user->assignRole('user');

        $this->actingAs($user)
            ->get(route('cms.user-manager.index'))
            ->assertForbidden();
    }

    public function test_admin_can_search_and_list_users(): void
    {
        $admin = User::factory()->create(['name' => 'Admin User']);
        $admin->assignRole('admin');

        $matchingUser = User::factory()->create([
            'name' => 'Jane Searchable',
            'email' => 'jane-search@example.com',
        ]);
        $matchingUser->assignRole('user');

        User::factory()->create([
            'name' => 'Other Person',
            'email' => 'other@example.com',
        ])->assignRole('user');

        $this->actingAs($admin)
            ->get(route('cms.user-manager.index', ['search' => 'Jane Searchable']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('cms/user-management/index')
                ->where('filters.search', 'Jane Searchable')
                ->has('users.data', 1)
                ->where('users.data.0.email', 'jane-search@example.com'));
    }

    public function test_admin_can_view_edit_block_and_delete_user(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $target = User::factory()->create([
            'name' => 'Target User',
            'email' => 'target@example.com',
        ]);
        $target->assignRole('user');

        $this->actingAs($admin)
            ->get(route('cms.user-manager.show', $target))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('cms/user-management/view')
                ->where('user.data.email', 'target@example.com'));

        $this->actingAs($admin)
            ->get(route('cms.user-manager.edit', $target))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('cms/user-management/edit')
                ->where('user.data.email', 'target@example.com'));

        $this->actingAs($admin)
            ->put(route('cms.user-manager.update', $target), [
                'name' => 'Updated User',
                'email' => 'updated@example.com',
            ])
            ->assertRedirect(route('cms.user-manager.show', $target))
            ->assertSessionHas('status');

        $this->assertDatabaseHas('users', [
            'id' => $target->id,
            'name' => 'Updated User',
            'email' => 'updated@example.com',
        ]);

        $this->actingAs($admin)
            ->post(route('cms.user-manager.toggle-block', $target))
            ->assertRedirect()
            ->assertSessionHas('status');

        $this->assertNotNull($target->fresh()->blocked_at);

        $this->actingAs($admin)
            ->post(route('cms.user-manager.toggle-block', $target))
            ->assertRedirect()
            ->assertSessionHas('status');

        $this->assertNull($target->fresh()->blocked_at);

        $this->actingAs($admin)
            ->delete(route('cms.user-manager.destroy', $target))
            ->assertRedirect(route('cms.user-manager.index'))
            ->assertSessionHas('status');

        $this->assertDatabaseMissing('users', [
            'id' => $target->id,
        ]);
    }

    public function test_admin_cannot_delete_their_own_account(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin)
            ->from(route('cms.user-manager.show', $admin))
            ->delete(route('cms.user-manager.destroy', $admin))
            ->assertSessionHasErrors('user');

        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
        ]);
    }

    public function test_blocked_user_cannot_sign_in(): void
    {
        $user = User::factory()->create([
            'email' => 'blocked@example.com',
            'password' => 'password123',
            'blocked_at' => now(),
        ]);
        $user->assignRole('user');

        $response = $this->post('/cms/login', [
            'email' => 'blocked@example.com',
            'password' => 'password123',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }
}
