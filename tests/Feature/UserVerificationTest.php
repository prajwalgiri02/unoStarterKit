<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Contracts\SmsGateway;
use App\Enums\OtpPurpose;
use App\Mail\OtpMail;
use App\Models\User;
use Database\Seeders\RoleAndPermission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class UserVerificationTest extends TestCase
{
    use RefreshDatabase;

    /** @var list<array{to: string, message: string}> */
    private array $sms = [];

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermission::class);

        Mail::fake();

        $sms = &$this->sms;
        $this->app->instance(SmsGateway::class, new class($sms) implements SmsGateway
        {
            public function __construct(private array &$sent) {}

            public function send(string $to, string $message): void
            {
                $this->sent[] = ['to' => $to, 'message' => $message];
            }
        });
    }

    public function test_register_returns_a_token_when_verification_is_disabled(): void
    {
        $this->register()
            ->assertOk()
            ->assertJsonStructure(['data' => ['access_token', 'user']]);

        Mail::assertNothingSent();
    }

    public function test_register_sends_an_email_code_instead_of_a_token(): void
    {
        $this->enable(email: true);

        $this->register()
            ->assertOk()
            ->assertJsonPath('data.verification_required', ['email'])
            ->assertJsonPath('data.otp_length', config('otp.defaults.length'))
            ->assertJsonMissingPath('data.access_token');

        $this->assertNull(User::query()->where('email', 'jane@example.com')->value('email_verified_at'));
        Mail::assertSent(OtpMail::class, fn (OtpMail $mail): bool => $mail->hasTo('jane@example.com')
            && $mail->purpose === OtpPurpose::EMAIL_VERIFICATION);
    }

    public function test_verifying_the_email_code_logs_the_user_in(): void
    {
        $this->enable(email: true);
        $this->register();

        $this->verify('email', $this->lastEmailCode())
            ->assertOk()
            ->assertJsonPath('data.user.is_email_verified', true)
            ->assertJsonPath('data.user.pending_verifications', [])
            ->assertJsonStructure(['data' => ['access_token']]);

        $this->assertNotNull(User::query()->where('email', 'jane@example.com')->value('email_verified_at'));
        $this->assertDatabaseCount('otps', 0);
    }

    public function test_a_wrong_code_is_rejected(): void
    {
        $this->enable(email: true);
        $this->register();

        $this->verify('email', '000000')
            ->assertUnprocessable()
            ->assertJsonPath('code', 'otp_invalid');

        $this->assertNull(User::query()->where('email', 'jane@example.com')->value('email_verified_at'));
    }

    public function test_login_is_refused_and_a_new_code_is_sent_until_verified(): void
    {
        $this->enable(email: true);
        $user = User::factory()->unverified()->create(['email' => 'jane@example.com']);
        $user->assignRole('user');

        $this->postJson('/api/auth/login', ['email' => 'jane@example.com', 'password' => 'password'])
            ->assertForbidden()
            ->assertJsonPath('code', 'verification_required')
            ->assertJsonPath('data.verification_required', ['email']);

        $this->verify('email', $this->lastEmailCode())->assertOk();

        $this->postJson('/api/auth/login', ['email' => 'jane@example.com', 'password' => 'password'])
            ->assertOk()
            ->assertJsonStructure(['data' => ['access_token']]);
    }

    public function test_resend_sends_a_new_code_after_the_cooldown(): void
    {
        $this->enable(email: true);
        $this->register();

        $this->postJson('/api/auth/verification/resend', ['email' => 'jane@example.com', 'channel' => 'email'])
            ->assertUnprocessable()
            ->assertJsonPath('code', 'otp_resend_cooldown');

        $this->travel(61)->seconds();

        $this->postJson('/api/auth/verification/resend', ['email' => 'jane@example.com', 'channel' => 'email'])
            ->assertOk();

        Mail::assertSentCount(2);
        $this->verify('email', $this->lastEmailCode())->assertOk();
    }

    public function test_unknown_emails_get_the_same_resend_response_and_cannot_verify(): void
    {
        $this->enable(email: true);

        $this->postJson('/api/auth/verification/resend', ['email' => 'nobody@example.com', 'channel' => 'email'])
            ->assertOk();

        $this->verify('email', '123456', 'nobody@example.com')
            ->assertUnprocessable()
            ->assertJsonPath('code', 'otp_invalid');

        Mail::assertNothingSent();
    }

    public function test_an_already_verified_account_does_not_get_a_token_from_verify(): void
    {
        $this->enable(email: true);
        User::factory()->create(['email' => 'jane@example.com'])->assignRole('user');

        $this->verify('email', '123456')
            ->assertUnprocessable()
            ->assertJsonPath('code', 'otp_already_verified')
            ->assertJsonMissingPath('data.access_token');
    }

    public function test_phone_verification_requires_a_phone_and_sends_an_sms(): void
    {
        $this->enable(phone: true);

        $this->register(['phone' => null])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('phone');

        $this->register()
            ->assertOk()
            ->assertJsonPath('data.verification_required', ['phone']);

        $this->assertSame('0412345678', $this->sms[0]['to']);
        Mail::assertNothingSent();

        $this->verify('phone', $this->lastSmsCode())
            ->assertOk()
            ->assertJsonPath('data.user.is_phone_verified', true);
    }

    public function test_both_channels_must_be_verified_before_a_token_is_issued(): void
    {
        $this->enable(email: true, phone: true);

        $this->register()
            ->assertJsonPath('data.verification_required', ['email', 'phone']);

        $this->verify('email', $this->lastEmailCode())
            ->assertOk()
            ->assertJsonPath('data.verification_required', ['phone'])
            ->assertJsonMissingPath('data.access_token');

        $this->verify('phone', $this->lastSmsCode())
            ->assertOk()
            ->assertJsonStructure(['data' => ['access_token']]);
    }

    public function test_verified_users_still_wait_for_admin_approval(): void
    {
        $this->enable(email: true);
        config(['users.require_approval' => true]);

        $this->register();

        $this->verify('email', $this->lastEmailCode())
            ->assertForbidden()
            ->assertJsonPath('code', 'account_pending_approval');

        $this->assertNotNull(User::query()->where('email', 'jane@example.com')->value('email_verified_at'));
    }

    public function test_changing_the_email_on_the_profile_verifies_it_again(): void
    {
        $this->enable(email: true);
        $user = User::factory()->create(['email' => 'jane@example.com']);
        $user->assignRole('user');

        $this->actingAs($user, 'api')
            ->postJson('/api/profile', ['name' => $user->name, 'email' => 'new@example.com'])
            ->assertOk()
            ->assertJsonPath('data.is_email_verified', false)
            ->assertJsonPath('data.pending_verifications', ['email']);

        Mail::assertSent(OtpMail::class, fn (OtpMail $mail): bool => $mail->hasTo('new@example.com'));

        Auth::forgetGuards();

        $this->verify('email', $this->lastEmailCode(), 'new@example.com')
            ->assertOk()
            ->assertJsonPath('data.user.is_email_verified', true);
    }

    public function test_saving_the_profile_without_changing_the_email_keeps_it_verified(): void
    {
        $this->enable(email: true);
        $user = User::factory()->create(['email' => 'jane@example.com']);
        $user->assignRole('user');

        $this->actingAs($user, 'api')
            ->postJson('/api/profile', ['name' => 'New Name', 'email' => 'jane@example.com'])
            ->assertOk()
            ->assertJsonPath('data.is_email_verified', true);

        Mail::assertNothingSent();
    }

    public function test_admins_are_never_asked_to_verify(): void
    {
        $this->enable(email: true, phone: true);
        $admin = User::factory()->unverified()->phoneUnverified()->create(['phone' => '0412345678']);
        $admin->assignRole('admin');

        $this->postJson('/api/auth/login', ['email' => $admin->email, 'password' => 'password'])
            ->assertOk();

        Mail::assertNothingSent();
    }

    private function enable(bool $email = false, bool $phone = false): void
    {
        config([
            'users.verification.email' => $email,
            'users.verification.phone' => $phone,
        ]);
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function register(array $overrides = []): TestResponse
    {
        return $this->postJson('/api/auth/register', array_merge([
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '0412 345 678',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ], $overrides));
    }

    private function verify(string $channel, string $otp, string $email = 'jane@example.com'): TestResponse
    {
        return $this->postJson('/api/auth/verification/verify', [
            'email' => $email,
            'channel' => $channel,
            'otp' => $otp,
        ]);
    }

    private function lastEmailCode(): string
    {
        return Mail::sent(OtpMail::class)->last()->code;
    }

    private function lastSmsCode(): string
    {
        preg_match('/code is (\d+)/', end($this->sms)['message'], $matches);

        return $matches[1];
    }
}
