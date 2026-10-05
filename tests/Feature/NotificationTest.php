<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\User;
use App\Models\UserNotification;
use Database\Seeders\RoleAndPermission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermission::class);
    }

    public function test_api_lists_only_own_notifications_with_unread_count(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $this->inbox($user);
        $this->inbox($user, read: true);
        $this->inbox($other);

        $this->withToken(Auth::guard('api')->login($user))
            ->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.total', 2)
            ->assertJsonPath('meta.unread_count', 1);
    }

    public function test_api_mark_as_read(): void
    {
        $user = User::factory()->create();
        $item = $this->inbox($user);

        $this->withToken(Auth::guard('api')->login($user))
            ->patchJson("/api/notifications/{$item->id}/read")
            ->assertOk();

        $this->assertNotNull($item->fresh()->read_at);
    }

    public function test_api_cannot_mark_another_users_notification(): void
    {
        $owner = User::factory()->create();
        $item = $this->inbox($owner);

        $this->withToken(Auth::guard('api')->login(User::factory()->create()))
            ->patchJson("/api/notifications/{$item->id}/read")
            ->assertForbidden();

        $this->assertNull($item->fresh()->read_at);
    }

    public function test_api_mark_all_as_read(): void
    {
        $user = User::factory()->create();
        $this->inbox($user);
        $this->inbox($user);

        $this->withToken(Auth::guard('api')->login($user))
            ->patchJson('/api/notifications/mark-all-as-read')
            ->assertOk();

        $this->assertSame(0, UserNotification::whereNull('read_at')->count());
    }

    public function test_api_clear_all_removes_only_own_notifications(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $this->inbox($user);
        $this->inbox($user);
        $this->inbox($other);

        $this->withToken(Auth::guard('api')->login($user))
            ->deleteJson('/api/notifications')
            ->assertOk();

        $this->assertSame(0, UserNotification::where('notifiable_id', $user->id)->count());
        $this->assertSame(1, UserNotification::where('notifiable_id', $other->id)->count());
    }

    public function test_api_requires_authentication(): void
    {
        $this->getJson('/api/notifications')->assertUnauthorized();
        $this->deleteJson('/api/notifications')->assertUnauthorized();
    }

    public function test_admin_can_broadcast_a_notification(): void
    {
        Queue::fake();

        $this->actingAs($this->admin())
            ->post('/cms/notifications', ['title' => 'Hi', 'message' => 'Everyone', 'send_to_all' => true])
            ->assertSessionHas('status');

        $this->assertDatabaseHas('notifications', ['title' => 'Hi', 'message' => 'Everyone']);
    }

    public function test_broadcast_requires_title_and_message(): void
    {
        $this->actingAs($this->admin())
            ->post('/cms/notifications', [])
            ->assertSessionHasErrors(['title', 'message']);
    }

    public function test_non_admin_cannot_broadcast(): void
    {
        $this->actingAs(User::factory()->create())
            ->post('/cms/notifications', ['title' => 'Hi', 'message' => 'Everyone'])
            ->assertForbidden();

        $this->assertDatabaseCount('notifications', 0);
    }

    public function test_admin_inbox_mark_read_and_clear(): void
    {
        $admin = $this->admin();
        $first = $this->inbox($admin);
        $this->inbox($admin);

        $this->actingAs($admin)
            ->patch("/cms/notifications/{$first->id}/read")
            ->assertRedirect();

        $this->assertNotNull($first->fresh()->read_at);

        $this->actingAs($admin)
            ->patch('/cms/notifications/mark-all-read')
            ->assertSessionHas('status');

        $this->assertSame(0, UserNotification::whereNull('read_at')->count());

        $this->actingAs($admin)
            ->delete('/cms/notifications/clear-all')
            ->assertSessionHas('status');

        $this->assertDatabaseCount('user_notifications', 0);
    }

    public function test_admin_cannot_mark_another_users_notification_read(): void
    {
        $item = $this->inbox(User::factory()->create());

        $this->actingAs($this->admin())
            ->patch("/cms/notifications/{$item->id}/read")
            ->assertForbidden();

        $this->assertNull($item->fresh()->read_at);
    }

    private function admin(): User
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        return $admin;
    }

    private function inbox(User $user, bool $read = false): UserNotification
    {
        $notification = Notification::create(['title' => 'T', 'message' => 'M']);

        return UserNotification::create([
            'notification_id' => $notification->id,
            'notifiable_id' => $user->id,
            'notifiable_type' => User::class,
            'read_at' => $read ? now() : null,
        ]);
    }
}
