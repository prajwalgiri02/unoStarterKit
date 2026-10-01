<?php

declare(strict_types=1);

namespace App\Http\Controllers\cms\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\VerifyPasswordOtpRequest;
use App\Models\Otp;
use App\Services\PasswordResetService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ForgotPasswordController extends Controller
{
    public function __construct(
        private readonly PasswordResetService $passwordResetService,
    ) {}

    public function create(Request $request): Response
    {
        return Inertia::render('auth/forgot-password');
    }

    public function store(ForgotPasswordRequest $request): RedirectResponse
    {
        $generated = $this->passwordResetService->initiate(
            email: $request->validated('email'),
            metadata: [
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ],
        );

        if ($generated === null) {
            return back()->withErrors(['email' => 'We couldn\'t find an account with that email address.']);
        }

        return redirect()
            ->route('cms.password.otp.form', [
                'token' => $generated->flowToken,
            ])
            ->with('success', 'A verification code has been sent to your email.');
    }

    public function verifyForm(Request $request, string $token): Response
    {
        /** @var Otp $otp */
        $otp = $request->attributes->get('passwordResetOtp');

        return Inertia::render('auth/verify-otp', [
            'token' => $token,
            'status' => $request->session()->get('status'),
            'email' => $this->passwordResetService->maskEmail($otp->destination),
            'otpLength' => $this->passwordResetService->otpLength(),
            'isExpired' => (bool) $request->attributes->get('otpExpired', $otp->isExpired()),
            'otp' => [
                'requestReason' => $otp->purpose->value,
                'createdAt' => $otp->created_at->toIso8601String(),
                'updatedAt' => $otp->updated_at->toIso8601String(),
                'expiresAt' => $otp->expires_at->toIso8601String(),
                'verifiedAt' => $otp->verified_at?->toIso8601String(),
                'resendAvailableAt' => $this->passwordResetService->resendAvailableAt($otp)?->toIso8601String(),
            ],
        ]);
    }

    public function verify(VerifyPasswordOtpRequest $request, string $token): RedirectResponse
    {
        /** @var Otp $otp */
        $otp = $request->attributes->get('passwordResetOtp');

        $this->passwordResetService->verify(
            otp: $otp,
            code: $request->validated('otp'),
        );

        return redirect()
            ->route('cms.password.reset.form', ['token' => $token])
            ->with('success', 'Verification successful. Create your new password.');
    }

    public function resend(Request $request, string $token): RedirectResponse
    {
        /** @var Otp $otp */
        $otp = $request->attributes->get('passwordResetOtp');

        $this->passwordResetService->resend(
            otp: $otp,
            metadata: [
                'last_resend_ip' => $request->ip(),
                'last_resend_user_agent' => $request->userAgent(),
            ],
        );

        return back()->with('success', 'A new verification code has been sent.');
    }

    public function resetForm(Request $request, string $token): Response
    {
        /** @var Otp $otp */
        $otp = $request->attributes->get('passwordResetOtp');

        return Inertia::render('auth/change-password', [
            'token' => $token,
            'email' => $otp->destination,
            'status' => $request->session()->get('status'),
        ]);
    }

    public function reset(ResetPasswordRequest $request, string $token): Response|RedirectResponse
    {
        /** @var Otp $otp */
        $otp = $request->attributes->get('passwordResetOtp');

        $user = $this->passwordResetService->resetPassword(
            otp: $otp,
            password: $request->validated('password'),
        );

        if (! $user) {
            return redirect()
                ->route('cms.password.request')
                ->with('error', 'The account could not be found.');
        }

        return Inertia::render('auth/change-password', [
            'token' => $token,
            'passwordChanged' => true,
        ]);
    }

    public function cancel(Request $request): RedirectResponse
    {
        /** @var Otp $otp */
        $otp = $request->attributes->get('passwordResetOtp');

        $this->passwordResetService->cancel($otp);

        return redirect()
            ->route('cms.auth.login')
            ->with('success', 'Password reset cancelled.');
    }
}
