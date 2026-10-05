<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\NotificationType;
use App\Jobs\BroadcastNotificationJob;
use App\Models\Notification;
use App\Models\User;
use App\Models\UserNotification;
use Database\Seeders\RoleAndPermission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAlertTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermission::class);
        config(['firebase.projects.app.credentials' => null]);

        $this->admin = User::factory()->approved()->create();
        $this->admin->assignRole('admin');
    }

    public function test_registration_alerts_admins(): void
    {
        $this->register()->assertOk();

        $user = User::query()->where('email', 'jane@example.com')->firstOrFail();
        $alert = Notification::query()->where('type', NotificationType::AdminAlert)->sole();

        $this->assertSame('New user registered', $alert->title);
        $this->assertSame('Jane Doe registered.', $alert->message);
        $this->assertSame("/cms/user-manager/{$user->id}", $alert->url);
        $this->assertSame([$this->admin->id], $alert->userNotifications()->pluck('notifiable_id')->all());
    }

    public function test_registration_alert_mentions_approval_when_required(): void
    {
        config(['users.require_approval' => true]);

        $this->register();

        $this->assertSame(
            'Jane Doe registered and is waiting for approval.',
            Notification::query()->where('type', NotificationType::AdminAlert)->value('message'),
        );
    }

    // @module:support
    public function test_contact_us_message_alerts_admins(): void
    {
        $this->postJson('/api/contact-us', [
            'name' => 'Sam Sender',
            'email' => 'sam@example.com',
            'message' => 'Hello there',
        ])->assertCreated();

        $alert = Notification::query()->where('type', NotificationType::AdminAlert)->sole();

        $this->assertSame('New contact-us message', $alert->title);
        $this->assertSame('Sam Sender (sam@example.com) sent a message.', $alert->message);
        $this->assertSame('/cms/messages', $alert->url);
        $this->assertTrue($this->admin->userNotifications()->exists());
    }
    // @endmodule:support

    public function test_broadcast_history_excludes_admin_alerts(): void
    {
        $this->register();

        Notification::create([
            'title' => 'Sale today',
            'message' => 'Everything is half price',
            'send_to_all' => true,
            'created_by' => $this->admin->id,
        ]);

        $this->actingAs($this->admin)
            ->get(route('cms.admin.notifications.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('notifications.data', 1)
                ->where('notifications.data.0.title', 'Sale today'));
    }

    public function test_broadcast_skips_admins_blocked_and_unapproved_users(): void
    {
        config(['users.require_approval' => true]);

        $active = User::factory()->approved()->create();
        $active->assignRole('user');

        $blocked = User::factory()->approved()->create(['blocked_at' => now()]);
        $blocked->assignRole('user');

        $pending = User::factory()->pendingApproval()->create();
        $pending->assignRole('user');

        $notification = Notification::create([
            'title' => 'Sale today',
            'message' => 'Everything is half price',
            'send_to_all' => true,
            'created_by' => $this->admin->id,
        ]);

        BroadcastNotificationJob::dispatchSync($notification);

        $this->assertSame(
            [$active->id],
            UserNotification::query()->where('notification_id', $notification->id)->pluck('notifiable_id')->all(),
        );
    }

    public function test_admin_can_mark_one_inbox_notification_as_read(): void
    {
        $this->register();

        $item = $this->admin->userNotifications()->sole();

        $this->actingAs($this->admin)
            ->from('/cms/dashboard')
            ->patch(route('cms.admin.notifications.read', $item))
            ->assertRedirect('/cms/dashboard');

        $this->assertNotNull($item->fresh()->read_at);
    }

    public function test_admin_cannot_mark_another_admins_notification_as_read(): void
    {
        $this->register();

        $otherAdmin = User::factory()->approved()->create();
        $otherAdmin->assignRole('admin');

        $item = $this->admin->userNotifications()->sole();

        $this->actingAs($otherAdmin)
            ->patch(route('cms.admin.notifications.read', $item))
            ->assertForbidden();

        $this->assertNull($item->fresh()->read_at);
    }

    private function register()
    {
        return $this->postJson('/api/auth/register', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);
    }
}
