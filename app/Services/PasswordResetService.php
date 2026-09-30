<?php

declare(strict_types=1);

namespace App\Services;

use App\Data\GeneratedOtp;
use App\Enums\OtpChannel;
use App\Enums\OtpPurpose;
use App\Exceptions\OtpException;
use App\Models\Otp;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

final class PasswordResetService
{
    public function __construct(
        private readonly OtpService $otpService,
        private readonly OtpDeliveryService $otpDeliveryService,
    ) {}

    /**
     * @param  array<string, mixed>  $metadata
     *
     * @throws OtpException
     */
    public function initiate(string $email, array $metadata = []): ?GeneratedOtp
    {
        $email = Str::lower(trim($email));

        if (! User::query()->where('email', $email)->exists()) {
            return null;
        }

        $existingOtp = $this->otpService->findForDestination(
            channel: OtpChannel::EMAIL,
            purpose: OtpPurpose::PASSWORD_RESET,
            destination: $email,
        );

        $snapshot = $existingOtp !== null
            ? $this->otpService->snapshot($existingOtp)
            : null;

        $generated = $this->otpService->create(
            channel: OtpChannel::EMAIL,
            purpose: OtpPurpose::PASSWORD_RESET,
            destination: $email,
            metadata: $metadata,
        );

        try {
            $this->otpDeliveryService->send($generated);
        } catch (OtpException $exception) {
            $this->rollbackInitiatedOtp($generated->otp, $snapshot);

            throw new OtpException(
                $exception->getMessage(),
                'email',
            );
        } catch (\Throwable $exception) {
            $this->rollbackInitiatedOtp($generated->otp, $snapshot);
            report($exception);

            throw new OtpException(
                'The verification code could not be sent. Please try again.',
                'email',
            );
        }

        return $generated;
    }

    /**
     * @throws OtpException
     */
    public function verify(Otp $otp, string $code): void
    {
        $this->otpService->verify(
            otp: $otp,
            submittedCode: $code,
        );
    }

    /**
     * @param  array<string, mixed>  $metadata
     *
     * @throws OtpException
     */
    public function resend(Otp $otp, array $metadata = []): void
    {
        $snapshot = $this->otpService->snapshot($otp);

        try {
            $generated = $this->otpService->resend(
                otp: $otp,
                metadata: $metadata,
            );
        } catch (OtpException $exception) {
            throw $exception;
        }

        try {
            $this->otpDeliveryService->send($generated);
        } catch (OtpException $exception) {
            $this->otpService->restore($otp, $snapshot);

            throw $exception;
        } catch (\Throwable $exception) {
            $this->otpService->restore($otp, $snapshot);
            report($exception);

            throw new OtpException(
                'The verification code could not be sent. Please try again.',
            );
        }
    }

    /**
     * @throws OtpException
     */
    public function resetPassword(Otp $otp, string $password): ?User
    {
        $user = User::query()
            ->where('email', $otp->destination)
            ->first();

        if (! $user) {
            $this->otpService->consume($otp);

            return null;
        }

        DB::transaction(function () use ($user, $password, $otp): void {
            $user->forceFill([
                'password' => Hash::make($password),
                'remember_token' => Str::random(60),
            ])->save();

            $this->otpService->consume($otp);
        });

        event(new PasswordReset($user));

        return $user;
    }

    public function cancel(?Otp $otp): void
    {
        if ($otp) {
            $this->otpService->cancel($otp);
        }
    }

    public function findByToken(string $token): ?Otp
    {
        return $this->otpService->findByFlowToken(
            $token,
            OtpPurpose::PASSWORD_RESET,
        );
    }

    public function otpLength(): int
    {
        return $this->otpService->length(OtpPurpose::PASSWORD_RESET);
    }

    public function maskEmail(string $email): string
    {
        [$username, $domain] = array_pad(explode('@', $email, 2), 2, '');

        if ($username === '' || $domain === '') {
            return $email;
        }

        $visibleCharacters = min(2, strlen($username));

        return substr($username, 0, $visibleCharacters)
            .str_repeat('*', max(2, strlen($username) - $visibleCharacters))
            .'@'
            .$domain;
    }

    public function findForEmail(string $email): ?Otp
    {
        return $this->otpService->findForDestination(
            channel: OtpChannel::EMAIL,
            purpose: OtpPurpose::PASSWORD_RESET,
            destination: $email,
        );
    }

    /**
     * @param  array<string, mixed>|null  $snapshot
     */
    private function rollbackInitiatedOtp(Otp $otp, ?array $snapshot): void
    {
        if ($snapshot !== null) {
            $this->otpService->restore($otp, $snapshot);

            return;
        }

        $this->otpService->cancel($otp);
    }
}
