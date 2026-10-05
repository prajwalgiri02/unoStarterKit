<?php

declare(strict_types=1);

namespace App\Services;

use App\Data\GeneratedOtp;
use App\Enums\ApiErrorCode;
use App\Enums\OtpChannel;
use App\Enums\OtpPurpose;
use App\Exceptions\OtpException;
use App\Models\Otp;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

final class ProfileUpdateService
{
    public function __construct(
        private readonly OtpService $otpService,
        private readonly OtpDeliveryService $otpDeliveryService,
        private readonly ImageUploadService $imageUploadService,
    ) {}

    /**
     * @param  array<string, mixed>  $attributes
     * @return array{status: string, generated?: GeneratedOtp}
     */
    public function initiate(User $user, array $attributes, ?UploadedFile $avatar = null): array
    {
        if ($avatar !== null) {
            $attributes['avatar'] = $this->imageUploadService->upload($avatar, 'avatars');
        }

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
            $oldAvatar = $user->avatar;

            $user->update($attributes);

            $this->deleteReplacedAvatar($oldAvatar, $user->avatar);

            return ['status' => 'updated'];
        }

        $generated = $this->otpService->create(
            channel: OtpChannel::EMAIL,
            purpose: OtpPurpose::PASSWORD_CHANGE,
            destination: $pendingChanges['email'] ?? $user->email,
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
                reason: ApiErrorCode::OtpDeliveryFailed,
            );
        }

        return [
            'status' => 'otp_sent',
            'generated' => $generated,
        ];
    }

    public function otpLength(): int
    {
        return $this->otpService->length(OtpPurpose::PASSWORD_CHANGE);
    }

    public function verifyAndApply(Otp $otp, string $code): User
    {
        $this->otpService->verify($otp, $code);

        return $this->applyChanges($otp);
    }

    public function applyChanges(Otp $otp): User
    {
        $metadata = $otp->metadata;
        $userId = $metadata['user_id'];
        $pendingChanges = $metadata['pending_changes'];
        $otherChanges = $metadata['other_changes'] ?? [];

        $user = User::findOrFail($userId);
        $oldAvatar = $user->avatar;

        DB::transaction(function () use ($user, $pendingChanges, $otherChanges, $otp) {
            $data = array_merge($otherChanges, $pendingChanges);

            if (isset($data['email'])) {
                $data['email_verified_at'] = now();
            }

            if (isset($data['password'])) {
                $data['password'] = Hash::make($data['password']);
                $data['remember_token'] = Str::random(60);
            }

            $user->forceFill($data)->save();
            $this->otpService->consume($otp);
        });

        $this->deleteReplacedAvatar($oldAvatar, $user->avatar);

        return $user;
    }

    private function deleteReplacedAvatar(?string $oldAvatar, ?string $newAvatar): void
    {
        if ($oldAvatar && $oldAvatar !== $newAvatar) {
            $this->imageUploadService->delete($oldAvatar);
        }
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

    public function resendAvailableAt(Otp $otp): ?Carbon
    {
        return $this->otpService->resendAvailableAt($otp);
    }

    public function resendCooldownRemaining(Otp $otp): int
    {
        return $this->otpService->resendCooldownRemaining($otp);
    }
}
