<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\ApiErrorCode;
use App\Enums\VerificationChannel;
use App\Exceptions\OtpException;
use App\Models\Otp;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class UserVerificationService
{
    public function __construct(
        private readonly OtpService $otpService,
        private readonly OtpDeliveryService $otpDeliveryService,
    ) {}

    /**
     * @param  list<VerificationChannel>  $channels
     * @param  array<string, mixed>  $metadata
     *
     * @throws OtpException
     */
    public function sendCodes(User $user, array $channels, array $metadata = []): void
    {
        foreach ($channels as $channel) {
            $this->send($user, $channel, $metadata);
        }
    }

    /**
     * @param  array<string, mixed>  $metadata
     *
     * @throws OtpException
     */
    public function send(User $user, VerificationChannel $channel, array $metadata = []): void
    {
        $existingOtp = $this->find($user, $channel);

        $snapshot = $existingOtp !== null
            ? $this->otpService->snapshot($existingOtp)
            : null;

        $generated = $this->otpService->create(
            channel: $channel->otpChannel(),
            purpose: $channel->otpPurpose(),
            destination: $this->destination($user, $channel),
            metadata: $metadata,
        );

        $this->deliver($channel, fn () => $this->otpDeliveryService->send($generated), function () use ($generated, $snapshot): void {
            $snapshot !== null
                ? $this->otpService->restore($generated->otp, $snapshot)
                : $this->otpService->cancel($generated->otp);
        });
    }

    /**
     * @param  array<string, mixed>  $metadata
     *
     * @throws OtpException
     */
    public function resend(User $user, VerificationChannel $channel, array $metadata = []): void
    {
        $otp = $this->find($user, $channel);

        if ($otp === null || $otp->isVerified()) {
            $this->send($user, $channel, $metadata);

            return;
        }

        $snapshot = $this->otpService->snapshot($otp);

        $generated = $this->otpService->resend(
            otp: $otp,
            metadata: $metadata,
        );

        $this->deliver($channel, fn () => $this->otpDeliveryService->send($generated), function () use ($otp, $snapshot): void {
            $this->otpService->restore($otp, $snapshot);
        });
    }

    /**
     * @throws OtpException
     */
    public function verify(User $user, VerificationChannel $channel, string $code): User
    {
        $otp = $this->find($user, $channel);

        if ($otp === null) {
            throw new OtpException('The verification code is incorrect.', reason: ApiErrorCode::OtpInvalid);
        }

        $this->otpService->verify(
            otp: $otp,
            submittedCode: $code,
        );

        DB::transaction(function () use ($user, $channel, $otp): void {
            $user->forceFill([
                $channel->verifiedAtColumn() => now(),
            ])->save();

            $this->otpService->consume($otp);
        });

        return $user->refresh();
    }

    public function otpLength(VerificationChannel $channel): int
    {
        return $this->otpService->length($channel->otpPurpose());
    }

    private function find(User $user, VerificationChannel $channel): ?Otp
    {
        return $this->otpService->findForDestination(
            channel: $channel->otpChannel(),
            purpose: $channel->otpPurpose(),
            destination: $this->destination($user, $channel),
        );
    }

    private function destination(User $user, VerificationChannel $channel): string
    {
        return (string) $user->{$channel->attribute()};
    }

    /**
     * @throws OtpException
     */
    private function deliver(VerificationChannel $channel, callable $send, callable $rollback): void
    {
        try {
            $send();
        } catch (OtpException $exception) {
            $rollback();

            throw new OtpException(
                $exception->getMessage(),
                $channel->attribute(),
                reason: $exception->reason,
            );
        } catch (\Throwable $exception) {
            $rollback();
            report($exception);

            throw new OtpException(
                'The verification code could not be sent. Please try again.',
                $channel->attribute(),
                reason: ApiErrorCode::OtpDeliveryFailed,
            );
        }
    }
}
