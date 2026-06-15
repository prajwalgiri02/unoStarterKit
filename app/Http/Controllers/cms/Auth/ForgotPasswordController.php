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
        return Inertia::render('cms/Auth/ForgotPassword', [
            'status' => $request->session()->get('status'),
            'error' => $request->session()->get('error'),
        ]);
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

        $status = 'If an account exists for that email, a verification code has been sent.';

        if ($generated === null) {
            return back()->with('status', $status);
        }

        return redirect()
            ->route('cms.password.otp.form', [
                'token' => $generated->flowToken,
            ])
            ->with('status', $status);
    }

    public function verifyForm(Request $request, string $token): Response
    {
        /** @var Otp $otp */
        $otp = $request->attributes->get('passwordResetOtp');

        return Inertia::render('cms/Auth/VerifyPasswordOtp', [
            'token' => $token,
            'status' => $request->session()->get('status'),
            'email' => $this->passwordResetService->maskEmail($otp->destination),
            'otpLength' => $this->passwordResetService->otpLength(),
            'isExpired' => (bool) $request->attributes->get('otpExpired', $otp->isExpired()),
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
            ->with('status', 'Verification successful. Create your new password.');
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

        return back()->with('status', 'A new verification code has been sent.');
    }

    public function resetForm(Request $request, string $token): Response
    {
        return Inertia::render('cms/Auth/ResetPassword', [
            'token' => $token,
            'status' => $request->session()->get('status'),
        ]);
    }

    public function reset(ResetPasswordRequest $request, string $token): RedirectResponse
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
                ->withErrors([
                    'email' => 'The account could not be found.',
                ]);
        }

        return redirect()
            ->route('cms.auth.login')
            ->with('status', 'Your password has been reset. You can now sign in.');
    }

    public function cancel(Request $request): RedirectResponse
    {
        /** @var Otp $otp */
        $otp = $request->attributes->get('passwordResetOtp');

        $this->passwordResetService->cancel($otp);

        return redirect()
            ->route('cms.auth.login')
            ->with('status', 'Password reset cancelled.');
    }
}
