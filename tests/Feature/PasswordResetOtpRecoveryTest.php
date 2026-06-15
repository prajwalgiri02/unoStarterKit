<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\OtpPurpose;
use App\Exceptions\OtpException;
use App\Models\User;
use App\Services\OtpDeliveryService;
use App\Services\OtpService;
use App\Services\PasswordResetService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Fakes\FailingOtpDeliveryService;
use Tests\TestCase;

class PasswordResetOtpRecoveryTest extends TestCase
{
    use RefreshDatabase;

    public function test_failed_resend_restores_the_previous_otp_code(): void
    {
        $user = User::factory()->create([
            'email' => 'user@example.com',
        ]);

        $passwordResetService = app(PasswordResetService::class);
        $otpService = app(OtpService::class);

        $generated = $passwordResetService->initiate($user->email);
        $originalCode = $generated->code;
        $otp = $generated->otp;

        $this->travel(5)->minutes();

        $this->app->instance(
            OtpDeliveryService::class,
            new FailingOtpDeliveryService,
        );

        $passwordResetService = app(PasswordResetService::class);

        try {
            $passwordResetService->resend($otp->fresh());
            $this->fail('Expected an OTP delivery exception.');
        } catch (OtpException $exception) {
            $this->assertSame('Delivery failed.', $exception->getMessage());
        }

        $otpService->verify($otp->fresh(), $originalCode);

        $this->assertSame(0, $otp->fresh()->resend_count);
    }

    public function test_failed_reinitiate_restores_the_previous_otp_code(): void
    {
        $user = User::factory()->create([
            'email' => 'user@example.com',
        ]);

        $passwordResetService = app(PasswordResetService::class);
        $otpService = app(OtpService::class);

        $generated = $passwordResetService->initiate($user->email);
        $originalCode = $generated->code;
        $originalToken = $generated->flowToken;

        $this->app->instance(
            OtpDeliveryService::class,
            new FailingOtpDeliveryService,
        );

        $passwordResetService = app(PasswordResetService::class);

        try {
            $passwordResetService->initiate($user->email);
            $this->fail('Expected an OTP delivery exception.');
        } catch (OtpException $exception) {
            $this->assertSame('Delivery failed.', $exception->getMessage());
        }

        $otp = $otpService->findByFlowToken(
            $originalToken,
            OtpPurpose::PASSWORD_RESET,
        );

        $this->assertNotNull($otp);
        $otpService->verify($otp, $originalCode);
    }

    public function test_failed_first_initiate_removes_the_otp_record(): void
    {
        $user = User::factory()->create([
            'email' => 'user@example.com',
        ]);

        $this->app->instance(
            OtpDeliveryService::class,
            new FailingOtpDeliveryService,
        );

        $passwordResetService = app(PasswordResetService::class);

        try {
            $passwordResetService->initiate($user->email);
            $this->fail('Expected an OTP delivery exception.');
        } catch (OtpException) {
            // Expected.
        }

        $this->assertDatabaseCount('otps', 0);
    }
}
