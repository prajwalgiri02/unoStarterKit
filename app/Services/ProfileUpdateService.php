<?php

declare(strict_types=1);

namespace App\Services;

use App\Data\GeneratedOtp;
use App\Enums\OtpChannel;
use App\Enums\OtpPurpose;
use App\Exceptions\OtpException;
use App\Models\Otp;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

final class ProfileUpdateService
{
    public function __construct(
        private readonly OtpService $otpService,
        private readonly OtpDeliveryService $otpDeliveryService,
    ) {}

    /**
     * @param  array<string, mixed>  $attributes
     * @return array{status: string, generated?: GeneratedOtp}
     */
    public function initiate(User $user, array $attributes): array
    {
        $requiresOtp = false;
        $pendingChanges = [];

        if (isset($attributes['email']) && $attributes['email'] !== $user->email) {
            $requiresOtp = true;
            $pendingChanges['email'] = $attributes['email'];
        }

        if (isset($attributes['password'])) {
            $requiresOtp = true;
            $pendingChanges['password'] = $attributes['password'];
        }

        if (! $requiresOtp) {
            return ['status' => 'no_otp_required'];
        }

        // We use the current email as destination for OTP
        $destination = $user->email;

        $generated = $this->otpService->create(
            channel: OtpChannel::EMAIL,
            purpose: OtpPurpose::PASSWORD_CHANGE, // Or EMAIL_VERIFICATION, using PASSWORD_CHANGE for general profile update
            destination: $destination,
            metadata: [
                'user_id' => $user->id,
                'pending_changes' => $pendingChanges,
                'other_changes' => array_diff_key($attributes, array_flip(['email', 'password'])),
            ],
        );

        try {
            $this->otpDeliveryService->send($generated);
        } catch (\Throwable $exception) {
            $this->otpService->cancel($generated->otp);
            report($exception);

            throw new OtpException(
                'The verification code could not be sent. Please try again.',
            );
        }

        return [
            'status' => 'otp_sent',
            'generated' => $generated,
        ];
    }

    public function verify(Otp $otp, string $code): void
    {
        $this->otpService->verify($otp, $code);
    }

    public function applyChanges(Otp $otp): User
    {
        $metadata = $otp->metadata;
        $userId = $metadata['user_id'];
        $pendingChanges = $metadata['pending_changes'];
        $otherChanges = $metadata['other_changes'] ?? [];

        $user = User::findOrFail($userId);

        DB::transaction(function () use ($user, $pendingChanges, $otherChanges, $otp) {
            $data = array_merge($otherChanges, $pendingChanges);
            
            if (isset($data['password'])) {
                $data['password'] = Hash::make($data['password']);
                $data['remember_token'] = Str::random(60);
            }

            $user->update($data);
            $this->otpService->consume($otp);
        });

        return $user;
    }

    public function resend(Otp $otp): void
    {
        $generated = $this->otpService->resend($otp);

        try {
            $this->otpDeliveryService->send($generated);
        } catch (\Throwable $exception) {
            report($exception);
            throw new OtpException('The verification code could not be sent. Please try again.');
        }
    }

    public function findByToken(string $token): ?Otp
    {
        return $this->otpService->findByFlowToken($token, OtpPurpose::PASSWORD_CHANGE);
    }

    public function maskEmail(string $email): string
    {
        [$username, $domain] = array_pad(explode('@', $email, 2), 2, '');
        if ($username === '' || $domain === '') return $email;
        $visibleCharacters = min(2, strlen($username));
        return substr($username, 0, $visibleCharacters) . str_repeat('*', max(2, strlen($username) - $visibleCharacters)) . '@' . $domain;
    }
}
