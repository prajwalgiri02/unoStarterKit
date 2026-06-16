<?php

declare(strict_types=1);

namespace App\Http\Controllers\cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\VerifyPasswordOtpRequest;
use App\Services\OtpService;
use App\Services\ProfileUpdateService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileOtpController extends Controller
{
    public function __construct(
        private readonly ProfileUpdateService $profileUpdateService,
        private readonly OtpService $otpService,
    ) {}

    public function show(Request $request, string $token): Response|RedirectResponse
    {
        $otp = $this->profileUpdateService->findByToken($token);

        if (! $otp || $otp->isVerified()) {
            return redirect()->route('cms.admin.settings.show')
                ->with('error', 'Invalid or expired verification session.');
        }

        $request->attributes->set(
            'resendAvailableAt',
            $this->otpService->resendAvailableAt($otp)?->toIso8601String(),
        );

        return Inertia::render('cms/Admin/Settings/OtpVerify', [
            'token' => $token,
            'email' => $this->profileUpdateService->maskEmail($otp->destination),
            'status' => $request->session()->get('status'),
        ]);
    }

    public function verify(VerifyPasswordOtpRequest $request, string $token): RedirectResponse
    {
        $otp = $this->profileUpdateService->findByToken($token);

        if (! $otp || $otp->isVerified()) {
            return redirect()->route('cms.admin.settings.show')
                ->with('error', 'Invalid or expired verification session.');
        }

        try {
            $this->profileUpdateService->verify($otp, $request->validated('otp'));
            $this->profileUpdateService->applyChanges($otp);
        } catch (\Exception $e) {
            return back()->withErrors(['otp' => $e->getMessage()]);
        }

        return redirect()->route('cms.admin.settings.show')
            ->with('status', 'Profile updated successfully.');
    }

    public function resend(Request $request, string $token): RedirectResponse
    {
        $otp = $this->profileUpdateService->findByToken($token);

        if (! $otp || $otp->isVerified()) {
            return redirect()->route('cms.admin.settings.show')
                ->with('error', 'Invalid or expired verification session.');
        }

        try {
            $this->profileUpdateService->resend($otp);
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }

        $request->session()->flash(
            'resendAvailableAt',
            $this->otpService->resendAvailableAt($otp)?->toIso8601String(),
        );

        return back()->with('status', 'A new verification code has been sent.');
    }
}
