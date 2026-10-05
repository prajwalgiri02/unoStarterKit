<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Faq;
use App\Models\User;
use Database\Seeders\RoleAndPermission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FaqTest extends TestCase
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

    public function test_api_lists_faqs_without_authentication(): void
    {
        Faq::create(['question' => 'How?', 'answer' => 'Like this.']);

        $this->getJson('/api/faqs')
            ->assertOk()
            ->assertJsonFragment(['question' => 'How?']);
    }

    public function test_admin_can_create_update_and_delete_a_faq(): void
    {
        $this->actingAs($this->admin)
            ->post('/cms/faqs', ['question' => 'Q1', 'answer' => 'A1'])
            ->assertSessionHas('status');

        $faq = Faq::firstOrFail();

        $this->actingAs($this->admin)
            ->put("/cms/faqs/{$faq->id}", ['question' => 'Q2', 'answer' => 'A2'])
            ->assertSessionHas('status');

        $this->assertDatabaseHas('faqs', ['id' => $faq->id, 'question' => 'Q2', 'answer' => 'A2']);

        $this->actingAs($this->admin)
            ->delete("/cms/faqs/{$faq->id}")
            ->assertSessionHas('status');

        $this->assertDatabaseMissing('faqs', ['id' => $faq->id]);
    }

    public function test_faq_requires_question_and_answer(): void
    {
        $this->actingAs($this->admin)
            ->post('/cms/faqs', [])
            ->assertSessionHasErrors(['question', 'answer']);
    }

    public function test_non_admin_cannot_manage_faqs(): void
    {
        $this->actingAs(User::factory()->create())
            ->post('/cms/faqs', ['question' => 'Q', 'answer' => 'A'])
            ->assertForbidden();

        $this->assertDatabaseCount('faqs', 0);
    }

    public function test_guest_is_redirected_from_the_faq_page(): void
    {
        $this->get('/cms/faqs')->assertRedirect();
    }
}
