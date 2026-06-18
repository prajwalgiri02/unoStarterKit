<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Enums\OtpPurpose;
use App\Services\OtpService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordResetOtpVerified
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

        if ($otp->isExpired()) {
            return redirect()
                ->route('cms.password.otp.form', ['token' => $token])
                ->with('error', 'Your verification has expired. Please request a new code.');
        }

        if (! $this->otpService->isValidVerifiedOtp($otp)) {
            return redirect()
                ->route('cms.password.otp.form', ['token' => $token])
                ->withErrors([
                    'otp' => 'Verify your code before resetting your password.',
                ]);
        }

        $request->attributes->set('passwordResetOtp', $otp);

        return $next($request);
    }

    private function redirectToRequest(string $message): Response
    {
        return redirect()
            ->route('cms.password.request')
            ->with('error', $message);
    }
}
