<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\SupportTicketStatus;
use App\Enums\SupportTicketType;
use App\Models\SupportTicket;
use App\Models\User;
use Database\Seeders\RoleAndPermission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class SupportTicketTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermission::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
    }

    public function test_guest_can_submit_contact_us(): void
    {
        $this->postJson('/api/contact-us', [
            'name' => 'Jane',
            'email' => 'jane@example.com',
            'message' => 'Hello',
        ])->assertCreated();

        $this->assertDatabaseHas('support_tickets', [
            'email' => 'jane@example.com',
            'type' => SupportTicketType::ContactUs->value,
            'status' => SupportTicketStatus::Pending->value,
            'user_id' => null,
        ]);
    }

    public function test_contact_us_links_the_authenticated_user(): void
    {
        $user = User::factory()->create();

        $this->withToken(Auth::guard('api')->login($user))
            ->postJson('/api/contact-us', [
                'name' => 'Jane',
                'email' => 'jane@example.com',
                'message' => 'Hello',
            ])->assertCreated();

        $this->assertDatabaseHas('support_tickets', ['user_id' => $user->id]);
    }

    public function test_contact_us_validates_input(): void
    {
        $this->postJson('/api/contact-us', ['email' => 'not-an-email'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'message']);
    }

    public function test_admin_can_list_and_filter_tickets(): void
    {
        $this->ticket(SupportTicketType::ContactUs);
        $this->ticket(SupportTicketType::Dispute);

        $this->actingAs($this->admin)
            ->get('/cms/messages?type=dispute')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('cms/messages-and-support/index')
                ->has('tickets.data', 1));
    }

    public function test_admin_can_resolve_a_ticket(): void
    {
        $ticket = $this->ticket(SupportTicketType::ContactUs);

        $this->actingAs($this->admin)
            ->patch("/cms/messages/{$ticket->id}/resolve")
            ->assertSessionHas('status');

        $ticket->refresh();

        $this->assertTrue($ticket->isResolved());
        $this->assertNotNull($ticket->resolved_at);
    }

    public function test_admin_can_delete_a_ticket(): void
    {
        $ticket = $this->ticket(SupportTicketType::Dispute);

        $this->actingAs($this->admin)
            ->delete("/cms/messages/{$ticket->id}")
            ->assertSessionHas('status');

        $this->assertDatabaseMissing('support_tickets', ['id' => $ticket->id]);
    }

    public function test_non_admin_cannot_manage_tickets(): void
    {
        $ticket = $this->ticket(SupportTicketType::ContactUs);

        $this->actingAs(User::factory()->create())
            ->patch("/cms/messages/{$ticket->id}/resolve")
            ->assertForbidden();

        $this->assertFalse($ticket->fresh()->isResolved());
    }

    private function ticket(SupportTicketType $type): SupportTicket
    {
        return SupportTicket::create([
            'name' => 'Jane',
            'email' => 'jane@example.com',
            'message' => 'Hello',
            'type' => $type,
            'status' => SupportTicketStatus::Pending,
        ]);
    }
}
