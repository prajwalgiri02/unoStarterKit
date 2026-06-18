<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\VerifyPasswordOtpRequest;
use App\Services\PasswordResetService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ForgotPasswordController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly PasswordResetService $passwordResetService,
    ) {}

    /**
     * Initiate the password reset process.
     */
    public function sendResetOtp(ForgotPasswordRequest $request): JsonResponse
    {
        $generated = $this->passwordResetService->initiate(
            email: $request->validated('email'),
            metadata: [
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ],
        );

        if ($generated === null) {
            return $this->errorResponse('We couldn\'t find an account with that email address.', 404);
        }

        return $this->successResponse(null, 'A verification code has been sent to your email.');
    }

    /**
     * Verify the OTP code.
     */
    public function verifyOtp(VerifyPasswordOtpRequest $request): JsonResponse
    {
        $email = $request->validated('email');
        $otp = $this->passwordResetService->findForEmail($email);

        if (! $otp) {
            return $this->errorResponse('No active password reset request found for this email.', 400);
        }

        try {
            $this->passwordResetService->verify(
                otp: $otp,
                code: $request->validated('otp'),
            );

            return $this->successResponse(null, 'Verification successful. You can now reset your password.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Resend the OTP code.
     */
    public function resendOtp(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);
        $email = $request->input('email');
        $otp = $this->passwordResetService->findForEmail($email);

        if (! $otp) {
            return $this->errorResponse('No active password reset request found for this email.', 400);
        }

        try {
            $this->passwordResetService->resend(
                otp: $otp,
                metadata: [
                    'last_resend_ip' => $request->ip(),
                    'last_resend_user_agent' => $request->userAgent(),
                ],
            );

            return $this->successResponse(null, 'A new verification code has been sent.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Reset the password.
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $email = $request->validated('email');
        $otp = $this->passwordResetService->findForEmail($email);

        if (! $otp) {
            return $this->errorResponse('No active password reset request found for this email.', 400);
        }

        if (! $otp->isVerified()) {
            return $this->errorResponse('The verification code has not been verified yet.', 400);
        }

        $user = $this->passwordResetService->resetPassword(
            otp: $otp,
            password: $request->validated('password'),
        );

        if (! $user) {
            return $this->errorResponse('The account could not be found.', 404);
        }

        return $this->successResponse(null, 'Your password has been reset successfully.');
    }
}
