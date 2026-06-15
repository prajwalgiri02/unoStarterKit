<?php

declare(strict_types=1);

namespace App\Mail;

use App\Enums\OtpPurpose;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $code,
        public readonly OtpPurpose $purpose,
        public readonly int $expiresInMinutes,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subjectForPurpose(),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.otp',
            with: [
                'code' => $this->code,
                'purposeLabel' => $this->labelForPurpose(),
                'expiresInMinutes' => $this->expiresInMinutes,
            ],
        );
    }

    private function subjectForPurpose(): string
    {
        return match ($this->purpose) {
            OtpPurpose::PASSWORD_RESET => 'Your password reset code',
            OtpPurpose::PASSWORD_CHANGE => 'Your password change code',
            OtpPurpose::EMAIL_VERIFICATION => 'Your email verification code',
            OtpPurpose::PHONE_VERIFICATION => 'Your phone verification code',
            OtpPurpose::LOGIN_VERIFICATION => 'Your login verification code',
        };
    }

    private function labelForPurpose(): string
    {
        return match ($this->purpose) {
            OtpPurpose::PASSWORD_RESET => 'password reset',
            OtpPurpose::PASSWORD_CHANGE => 'password change',
            OtpPurpose::EMAIL_VERIFICATION => 'email verification',
            OtpPurpose::PHONE_VERIFICATION => 'phone verification',
            OtpPurpose::LOGIN_VERIFICATION => 'login verification',
        };
    }
}
