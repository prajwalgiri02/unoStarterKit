<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Enums\OtpPurpose;
use App\Services\OtpService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordResetOtpPending
{
    public function __construct(
        private readonly OtpService $otpService,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->route('token');

        if (! is_string($token) || $token === '') {
            return $this->redirectToRequest('Invalid password reset link.');
        }

        $otp = $this->otpService->findByFlowToken(
            $token,
            OtpPurpose::PASSWORD_RESET,
        );

        if (! $otp) {
            return $this->redirectToRequest(
                'Your verification link is invalid. Request a new code.',
            );
        }

        // If it's verified and NOT expired, go to reset form
        if ($this->otpService->isValidVerifiedOtp($otp)) {
            return redirect()
                ->route('cms.password.reset.form', ['token' => $token])
                ->with('status', 'Your code is already verified. Create your new password.');
        }

        // We allow the request to proceed even if expired or already verified (but expired)
        // so the user can see the status on the page and use the "Resend" button.
        $request->attributes->set('passwordResetOtp', $otp);
        $request->attributes->set('otpExpired', $otp->isExpired());
        $request->attributes->set('otpVerified', $otp->isVerified());

        if (! $otp->isExpired()) {
            $availableAt = $this->otpService->resendAvailableAt($otp);

            if ($availableAt !== null) {
                $request->attributes->set(
                    'resendAvailableAt',
                    $availableAt->toIso8601String(),
                );
            }
        }

        return $next($request);
    }

    private function redirectToRequest(string $message): Response
    {
        return redirect()
            ->route('cms.password.request')
            ->with('error', $message);
    }
}
