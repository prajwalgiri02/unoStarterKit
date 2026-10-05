<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\StaticContentType;
use App\Models\StaticContent;
use App\Models\User;
use Database\Seeders\RoleAndPermission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaticContentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermission::class);
    }

    public function test_api_returns_content_by_type(): void
    {
        $this->content(StaticContentType::PrivacyPolicy, 'Privacy');

        $this->getJson('/api/privacy_policy')
            ->assertOk()
            ->assertJsonFragment(['title' => 'Privacy']);
    }

    public function test_api_returns_404_when_content_is_missing(): void
    {
        $this->getJson('/api/terms_and_conditions')->assertNotFound();
    }

    public function test_api_ignores_unknown_types(): void
    {
        $this->getJson('/api/something_else')->assertNotFound();
    }

    public function test_admin_can_update_content(): void
    {
        $content = $this->content(StaticContentType::TermsAndConditions, 'Old');

        $this->actingAs($this->admin())
            ->put("/cms/static-content/{$content->id}", ['title' => 'New', 'description' => 'New body'])
            ->assertSessionHas('status');

        $this->assertDatabaseHas('static_contents', ['id' => $content->id, 'title' => 'New', 'description' => 'New body']);
    }

    public function test_update_validates_input(): void
    {
        $content = $this->content(StaticContentType::TermsAndConditions, 'Old');

        $this->actingAs($this->admin())
            ->put("/cms/static-content/{$content->id}", [])
            ->assertSessionHasErrors(['title', 'description']);
    }

    public function test_non_admin_cannot_update_content(): void
    {
        $content = $this->content(StaticContentType::TermsAndConditions, 'Old');

        $this->actingAs(User::factory()->create())
            ->put("/cms/static-content/{$content->id}", ['title' => 'New', 'description' => 'New'])
            ->assertForbidden();

        $this->assertDatabaseHas('static_contents', ['id' => $content->id, 'title' => 'Old']);
    }

    private function admin(): User
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        return $admin;
    }

    private function content(StaticContentType $type, string $title): StaticContent
    {
        return StaticContent::create([
            'type' => $type,
            'title' => $title,
            'description' => 'Body',
        ]);
    }
}
