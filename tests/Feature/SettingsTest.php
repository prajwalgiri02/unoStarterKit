<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Mail\OtpMail;
use App\Models\User;
use Database\Seeders\RoleAndPermission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermission::class);
        Mail::fake();

        $this->admin = User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'email_verified_at' => null,
        ]);
        $this->admin->assignRole('admin');
    }

    public function test_name_change_is_saved_without_a_code(): void
    {
        $this->actingAs($this->admin)
            ->put('/cms/settings', ['name' => 'New Name', 'email' => 'admin@example.com'])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('status', 'Profile updated successfully.');

        $this->assertSame('New Name', $this->admin->fresh()->name);
        Mail::assertNothingSent();
    }

    public function test_phone_is_not_required_for_admins_when_phone_verification_is_on(): void
    {
        config(['users.verification.phone' => true]);

        $this->actingAs($this->admin)
            ->put('/cms/settings', ['name' => 'Admin', 'email' => 'admin@example.com'])
            ->assertSessionHasNoErrors();
    }

    public function test_email_change_sends_the_code_to_the_new_address_and_applies_on_verify(): void
    {
        $this->actingAs($this->admin)
            ->put('/cms/settings', ['name' => 'Admin', 'email' => 'new@example.com'])
            ->assertSessionHas('otp_required', true);

        Mail::assertSent(OtpMail::class, fn (OtpMail $mail): bool => $mail->hasTo('new@example.com'));
        Mail::assertNotSent(OtpMail::class, fn (OtpMail $mail): bool => $mail->hasTo('admin@example.com'));

        $this->assertSame('admin@example.com', $this->admin->fresh()->email);

        $code = Mail::sent(OtpMail::class)->last()->code;
        $token = session('otp_token');

        $this->actingAs($this->admin)
            ->post("/cms/settings/verify/{$token}", ['otp' => $code])
            ->assertRedirect(route('cms.admin.settings.show'));

        $admin = $this->admin->fresh();
        $this->assertSame('new@example.com', $admin->email);
        $this->assertNotNull($admin->email_verified_at);
    }

    public function test_password_only_change_sends_the_code_to_the_current_address(): void
    {
        $this->actingAs($this->admin)
            ->put('/cms/settings', [
                'name' => 'Admin',
                'email' => 'admin@example.com',
                'password' => 'NewPassword123!',
                'password_confirmation' => 'NewPassword123!',
            ])
            ->assertSessionHas('otp_required', true);

        Mail::assertSent(OtpMail::class, fn (OtpMail $mail): bool => $mail->hasTo('admin@example.com'));
    }

    public function test_settings_verify_page_route_is_removed(): void
    {
        $this->actingAs($this->admin)
            ->get('/cms/settings/verify/'.str_repeat('a', 64))
            ->assertMethodNotAllowed();
    }
}
