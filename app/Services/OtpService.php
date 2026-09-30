<?php

declare(strict_types=1);

namespace App\Services;

use App\Data\GeneratedOtp;
use App\Enums\ApiErrorCode;
use App\Enums\OtpChannel;
use App\Enums\OtpPurpose;
use App\Exceptions\OtpException;
use App\Models\Otp;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

final class OtpService
{
    /**
     * Create a new OTP or replace an existing OTP for the same
     * destination, channel, and purpose.
     */
    public function create(
        OtpChannel $channel,
        OtpPurpose $purpose,
        string $destination,
        array $metadata = [],
    ): GeneratedOtp {
        $destination = $this->normalizeDestination(
            $channel,
            $destination,
        );

        $settings = $this->settings($purpose);
        $plainCode = $this->generateCode($settings['length']);
        $plainFlowToken = Str::random(64);

        $otp = DB::transaction(function () use (
            $channel,
            $purpose,
            $destination,
            $plainCode,
            $plainFlowToken,
            $metadata,
            $settings,
        ): Otp {
            $otp = Otp::query()
                ->where('channel', $channel->value)
                ->where('purpose', $purpose->value)
                ->where('destination', $destination)
                ->lockForUpdate()
                ->first();

            $attributes = [
                'flow_token' => $this->hashFlowToken($plainFlowToken),
                'code' => Hash::make($plainCode),
                'attempts' => 0,
                'max_attempts' => $settings['max_attempts'],
                'resend_count' => 0,
                'max_resends' => $settings['max_resends'],
                'expires_at' => $this->expiresAt($settings),
                'verified_at' => null,
                'metadata' => $metadata,
            ];

            if ($otp) {
                $otp->update($attributes);

                return $otp->refresh();
            }

            return Otp::query()->create([
                'channel' => $channel->value,
                'purpose' => $purpose->value,
                'destination' => $destination,
                ...$attributes,
            ]);
        });

        return new GeneratedOtp(
            otp: $otp,
            code: $plainCode,
            flowToken: $plainFlowToken,
        );
    }

    /**
     * Replace the flow token and return the new plain token.
     */
    public function rotateFlowToken(Otp $otp): string
    {
        $plainFlowToken = Str::random(64);

        $otp->forceFill([
            'flow_token' => $this->hashFlowToken($plainFlowToken),
        ])->save();

        return $plainFlowToken;
    }

    /**
     * Find an OTP by its opaque flow token.
     */
    public function findByFlowToken(
        string $plainToken,
        ?OtpPurpose $purpose = null,
    ): ?Otp {
        $query = Otp::query()->where(
            'flow_token',
            $this->hashFlowToken($plainToken),
        );

        if ($purpose !== null) {
            $query->where('purpose', $purpose->value);
        }

        return $query->first();
    }

    /**
     * Generate and store another OTP for an existing request.
     */
    public function resend(
        Otp|int $otp,
        array $metadata = [],
    ): GeneratedOtp {
        $otpId = $this->getOtpId($otp);

        $result = DB::transaction(function () use (
            $otpId,
            $metadata,
        ): array {
            $otp = Otp::query()
                ->lockForUpdate()
                ->find($otpId);

            if (! $otp) {
                return ['status' => 'not_found'];
            }

            if ($otp->isVerified()) {
                return ['status' => 'already_verified'];
            }

            if ($otp->hasExceededResends()) {
                return ['status' => 'resend_limit'];
            }

            $settings = $this->settings($otp->purpose);

            $availableAt = $otp->updated_at
                ->copy()
                ->addSeconds(
                    $settings['resend_cooldown_seconds'],
                );

            if (now()->isBefore($availableAt) && ! $otp->isExpired()) {
                return [
                    'status' => 'cooldown',
                    'retry_after' => (int) ceil(
                        now()->diffInSeconds($availableAt),
                    ),
                ];
            }

            $plainCode = $this->generateCode(
                $settings['length'],
            );

            $otp->update([
                'code' => Hash::make($plainCode),
                'attempts' => 0,
                'resend_count' => $otp->resend_count + 1,
                'expires_at' => $this->expiresAt($settings),
                'verified_at' => null,
                'metadata' => array_merge(
                    $otp->metadata ?? [],
                    $metadata,
                ),
            ]);

            return [
                'status' => 'sent',
                'otp' => $otp->refresh(),
                'code' => $plainCode,
            ];
        });

        return match ($result['status']) {
            'sent' => new GeneratedOtp(
                otp: $result['otp'],
                code: $result['code'],
            ),

            'not_found' => throw new OtpException(
                'The OTP request could not be found.',
                reason: ApiErrorCode::OtpNotFound,
            ),

            'already_verified' => throw new OtpException(
                'This OTP has already been verified.',
                reason: ApiErrorCode::OtpAlreadyVerified,
            ),

            'resend_limit' => throw new OtpException(
                'The maximum number of OTP resends has been reached.',
                reason: ApiErrorCode::OtpResendLimit,
            ),

            'cooldown' => throw new OtpException(
                "Please wait {$result['retry_after']} seconds before requesting another OTP.",
                retryAfterSeconds: $result['retry_after'],
                reason: ApiErrorCode::OtpResendCooldown,
            ),

            default => throw new OtpException(
                'Unable to resend the OTP.',
            ),
        };
    }

    /**
     * Verify a submitted OTP.
     */
    public function verify(
        Otp|int $otp,
        string $submittedCode,
    ): Otp {
        $otpId = $this->getOtpId($otp);

        $result = DB::transaction(function () use (
            $otpId,
            $submittedCode,
        ): array {
            $otp = Otp::query()
                ->lockForUpdate()
                ->find($otpId);

            if (! $otp) {
                return ['status' => 'not_found'];
            }

            if ($otp->isVerified()) {
                return ['status' => 'already_verified'];
            }

            if ($otp->isExpired()) {
                return ['status' => 'expired'];
            }

            if ($otp->hasExceededAttempts()) {
                return ['status' => 'attempt_limit'];
            }

            if (! Hash::check($submittedCode, $otp->code)) {
                $otp->increment('attempts');

                return [
                    'status' => 'invalid',
                    'attempts_remaining' => max(
                        0,
                        $otp->max_attempts - $otp->attempts,
                    ),
                ];
            }

            $otp->update([
                'verified_at' => now(),
                'expires_at' => now()->addMinutes(15), // Extend expiry after verification
            ]);

            return [
                'status' => 'verified',
                'otp' => $otp->refresh(),
            ];
        });

        return match ($result['status']) {
            'verified' => $result['otp'],

            'not_found' => throw new OtpException(
                'The OTP request could not be found.',
                reason: ApiErrorCode::OtpNotFound,
            ),

            'already_verified' => throw new OtpException(
                'This OTP has already been verified.',
                reason: ApiErrorCode::OtpAlreadyVerified,
            ),

            'expired' => throw new OtpException(
                'Your verification code has expired. Resend a new code below.',
                reason: ApiErrorCode::OtpExpired,
            ),

            'attempt_limit' => throw new OtpException(
                'Too many incorrect attempts. Request a new code.',
                reason: ApiErrorCode::OtpAttemptLimit,
            ),

            'invalid' => throw new OtpException(
                "The OTP is incorrect. {$result['attempts_remaining']} attempts remaining.",
                reason: ApiErrorCode::OtpInvalid,
            ),

            default => throw new OtpException(
                'Unable to verify the OTP.',
            ),
        };
    }

    /**
     * Delete the OTP after its intended action is completed.
     */
    public function consume(Otp|int $otp): void
    {
        Otp::query()
            ->whereKey($this->getOtpId($otp))
            ->delete();
    }

    /**
     * Delete an existing OTP without verifying it.
     */
    public function cancel(Otp|int $otp): void
    {
        $this->consume($otp);
    }

    /**
     * Delete expired OTP records.
     */
    public function clearExpired(): int
    {
        return Otp::query()
            ->where('expires_at', '<=', now())
            ->delete();
    }

    /**
     * Check whether an OTP is verified and still valid.
     */
    public function isValidVerifiedOtp(Otp|int $otp): bool
    {
        return Otp::query()
            ->whereKey($this->getOtpId($otp))
            ->whereNotNull('verified_at')
            ->where('expires_at', '>', now())
            ->exists();
    }

    public function resendAvailableAt(Otp $otp): ?Carbon
    {
        $settings = $this->settings($otp->purpose);

        $availableAt = $otp->updated_at
            ->copy()
            ->addSeconds($settings['resend_cooldown_seconds']);

        return now()->isBefore($availableAt) ? $availableAt : null;
    }

    public function findForDestination(
        OtpChannel $channel,
        OtpPurpose $purpose,
        string $destination,
    ): ?Otp {
        return Otp::query()
            ->where('channel', $channel->value)
            ->where('purpose', $purpose->value)
            ->where(
                'destination',
                $this->normalizeDestination($channel, $destination),
            )
            ->first();
    }

    /**
     * @return array{
     *     flow_token: string|null,
     *     code: string,
     *     attempts: int,
     *     max_attempts: int,
     *     resend_count: int,
     *     max_resends: int,
     *     expires_at: Carbon,
     *     verified_at: Carbon|null,
     *     metadata: array<string, mixed>|null,
     *     updated_at: Carbon,
     * }
     */
    public function snapshot(Otp $otp): array
    {
        $otp->refresh();

        return [
            'flow_token' => $otp->flow_token,
            'code' => $otp->code,
            'attempts' => $otp->attempts,
            'max_attempts' => $otp->max_attempts,
            'resend_count' => $otp->resend_count,
            'max_resends' => $otp->max_resends,
            'expires_at' => $otp->expires_at,
            'verified_at' => $otp->verified_at,
            'metadata' => $otp->metadata,
            'updated_at' => $otp->updated_at,
        ];
    }

    /**
     * @param  array{
     *     flow_token: string|null,
     *     code: string,
     *     attempts: int,
     *     max_attempts: int,
     *     resend_count: int,
     *     max_resends: int,
     *     expires_at: Carbon,
     *     verified_at: Carbon|null,
     *     metadata: array<string, mixed>|null,
     *     updated_at: Carbon,
     * }  $snapshot
     */
    public function restore(Otp|int $otp, array $snapshot): void
    {
        Otp::query()
            ->whereKey($this->getOtpId($otp))
            ->update($snapshot);
    }

    private function getOtpId(Otp|int $otp): int
    {
        return $otp instanceof Otp
            ? (int) $otp->getKey()
            : $otp;
    }

    private function normalizeDestination(
        OtpChannel $channel,
        string $destination,
    ): string {
        return match ($channel) {
            OtpChannel::EMAIL => Str::lower(
                trim($destination),
            ),

            OtpChannel::SMS => preg_replace(
                '/\s+/',
                '',
                trim($destination),
            ) ?? trim($destination),

            default => trim($destination),
        };
    }

    public function length(OtpPurpose $purpose): int
    {
        return $this->settings($purpose)['length'];
    }

    /**
     * @return array{
     *     length: int,
     *     expires_in_minutes: float,
     *     max_attempts: int,
     *     max_resends: int,
     *     resend_cooldown_seconds: int
     * }
     */
    private function settings(OtpPurpose $purpose): array
    {
        $settings = array_replace(
            config('otp.defaults', []),
            config("otp.purposes.{$purpose->value}", []),
        );

        return [
            'length' => (int) ($settings['length'] ?? 6),
            'expires_in_minutes' => (float) (
                $settings['expires_in_minutes'] ?? 10
            ),
            'max_attempts' => (int) (
                $settings['max_attempts'] ?? 5
            ),
            'max_resends' => (int) (
                $settings['max_resends'] ?? 3
            ),
            'resend_cooldown_seconds' => (int) (
                $settings['resend_cooldown_seconds'] ?? 60
            ),
        ];
    }

    private function generateCode(int $length): string
    {
        if ($length < 4 || $length > 9) {
            throw new OtpException(
                'OTP length must be between 4 and 9 digits.',
            );
        }

        $minimum = 10 ** ($length - 1);
        $maximum = (10 ** $length) - 1;

        return (string) random_int($minimum, $maximum);
    }

    /**
     * @param  array{expires_in_minutes?: float|int}  $settings
     */
    private function expiresAt(array $settings): Carbon
    {
        $seconds = (int) round(
            (float) ($settings['expires_in_minutes'] ?? 10) * 60,
        );

        return now()->addSeconds(max($seconds, 30));
    }

    private function hashFlowToken(string $plainToken): string
    {
        return hash('sha256', $plainToken);
    }
}
