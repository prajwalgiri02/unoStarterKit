<?php

declare(strict_types=1);

namespace App\Http\Controllers\cms;

use App\Exceptions\OtpException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\VerifyPasswordOtpRequest;
use App\Models\Otp;
use App\Services\ProfileUpdateService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileOtpController extends Controller
{
    public function __construct(private readonly ProfileUpdateService $profileUpdateService) {}

    public function show(Request $request, string $token): Response|RedirectResponse
    {
        $otp = $this->findValidOtp($token);

        if ($otp === null) {
            return $this->invalidSession();
        }

        return Inertia::render('cms/Admin/Settings/OtpVerify', [
            'token' => $token,
            'email' => $this->profileUpdateService->maskEmail($otp->destination),
            'resendAvailableAt' => $this->profileUpdateService->resendAvailableAt($otp)?->toIso8601String(),
            'status' => $request->session()->get('status'),
        ]);
    }

    public function verify(VerifyPasswordOtpRequest $request, string $token): RedirectResponse
    {
        $otp = $this->findValidOtp($token);

        if ($otp === null) {
            return $this->invalidSession();
        }

        try {
            $this->profileUpdateService->verifyAndApply($otp, $request->validated('otp'));
        } catch (OtpException $e) {
            return back()->withErrors([$e->field => $e->getMessage()]);
        }

        return redirect()->route('cms.admin.settings.show')
            ->with('status', 'Profile updated successfully.');
    }

    public function resend(string $token): RedirectResponse
    {
        $otp = $this->findValidOtp($token);

        if ($otp === null) {
            return $this->invalidSession();
        }

        try {
            $this->profileUpdateService->resend($otp);
        } catch (OtpException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()
            ->with('resendAvailableAt', $this->profileUpdateService->resendAvailableAt($otp)?->toIso8601String())
            ->with('status', 'A new verification code has been sent.');
    }

    private function findValidOtp(string $token): ?Otp
    {
        $otp = $this->profileUpdateService->findByToken($token);

        return ($otp === null || $otp->isVerified()) ? null : $otp;
    }

    private function invalidSession(): RedirectResponse
    {
        return redirect()->route('cms.admin.settings.show')
            ->with('error', 'Invalid or expired verification session.');
    }
}
