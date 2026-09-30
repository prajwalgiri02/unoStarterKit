<?php

declare(strict_types=1);

namespace App\Services;

use App\Contracts\SmsGateway;
use App\Data\GeneratedOtp;
use App\Enums\ApiErrorCode;
use App\Enums\OtpChannel;
use App\Enums\OtpPurpose;
use App\Exceptions\OtpException;
use App\Mail\OtpMail;
use App\Models\Otp;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class OtpDeliveryService
{
    public function __construct(
        private readonly SmsGateway $smsGateway,
    ) {}

    /**
     * @throws OtpException
     */
    public function send(GeneratedOtp $generated): void
    {
        $channels = $this->deliveryChannels($generated->otp->purpose);

        if ($channels === []) {
            throw new OtpException(
                'No OTP delivery channels are configured.',
                reason: ApiErrorCode::OtpDeliveryFailed,
            );
        }

        $failures = [];

        foreach ($channels as $channel) {
            try {
                match ($channel) {
                    OtpChannel::EMAIL => $this->sendEmail($generated),
                    OtpChannel::SMS => $this->sendSms($generated),
                };
            } catch (OtpException $exception) {
                $failures[] = $exception;
            } catch (\Throwable $exception) {
                report($exception);

                $failures[] = new OtpException(
                    'The verification code could not be sent. Please try again.',
                    reason: ApiErrorCode::OtpDeliveryFailed,
                );
            }
        }

        if ($failures !== [] && count($failures) === count($channels)) {
            throw $failures[0];
        }
    }

    private function sendEmail(GeneratedOtp $generated): void
    {
        Mail::to($generated->otp->destination)->send(
            new OtpMail(
                code: $generated->code,
                purpose: $generated->otp->purpose,
                expiresInMinutes: $this->expiresInMinutes($generated->otp),
            ),
        );
    }

    /**
     * @throws OtpException
     */
    private function sendSms(GeneratedOtp $generated): void
    {
        $phone = $this->resolveSmsDestination($generated->otp);

        if ($phone === null) {
            throw new OtpException(
                'SMS delivery is enabled, but no phone number is available for this account.',
                reason: ApiErrorCode::OtpDeliveryFailed,
            );
        }

        $this->smsGateway->send(
            $phone,
            $this->buildSmsMessage($generated),
        );
    }

    /**
     * @return list<OtpChannel>
     */
    private function deliveryChannels(OtpPurpose $purpose): array
    {
        $configured = config(
            "otp.purposes.{$purpose->value}.delivery.channels",
            config('otp.delivery.channels', 'mail'),
        );

        if (is_string($configured)) {
            $configured = $this->normalizeChannelConfig($configured);
        }

        return collect($configured)
            ->map(function (mixed $channel): ?OtpChannel {
                if ($channel instanceof OtpChannel) {
                    return $channel;
                }

                return match (strtolower((string) $channel)) {
                    'mail', 'email' => OtpChannel::EMAIL,
                    'sms' => OtpChannel::SMS,
                    default => null,
                };
            })
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    private function expiresInMinutes(Otp $otp): int
    {
        $settings = array_replace(
            config('otp.defaults', []),
            config("otp.purposes.{$otp->purpose->value}", []),
        );

        return max(1, (int) round((float) ($settings['expires_in_minutes'] ?? 10)));
    }

    private function buildSmsMessage(GeneratedOtp $generated): string
    {
        $label = match ($generated->otp->purpose) {
            OtpPurpose::PASSWORD_RESET => 'password reset',
            OtpPurpose::PASSWORD_CHANGE => 'password change',
            OtpPurpose::EMAIL_VERIFICATION => 'email verification',
            OtpPurpose::PHONE_VERIFICATION => 'phone verification',
            OtpPurpose::LOGIN_VERIFICATION => 'login verification',
        };

        return sprintf(
            'Your %s code is %s. It expires in %d minutes.',
            $label,
            $generated->code,
            $this->expiresInMinutes($generated->otp),
        );
    }

    private function resolveSmsDestination(Otp $otp): ?string
    {
        if ($otp->channel === OtpChannel::SMS) {
            return $otp->destination;
        }

        $user = User::query()
            ->where('email', $otp->destination)
            ->first();

        $phone = $user?->phone ?? null;

        if (! is_string($phone) || trim($phone) === '') {
            return null;
        }

        return preg_replace('/\s+/', '', trim($phone)) ?: null;
    }

    /**
     * @return list<string>
     */
    private function normalizeChannelConfig(string $configured): array
    {
        $value = strtolower(trim($configured, " \t\n\r\0\x0B;,"));

        if ($value === '') {
            return ['mail'];
        }

        return match ($value) {
            'both' => ['mail', 'sms'],
            'mail', 'email' => ['mail'],
            'sms' => ['sms'],
            default => array_values(array_filter(array_map(
                static fn (string $channel): string => trim($channel, " \t\n\r\0\x0B;,"),
                preg_split('/[,\s]+/', $value) ?: [],
            ))),
        };
    }
}
