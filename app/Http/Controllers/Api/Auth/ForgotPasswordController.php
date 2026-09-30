<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Auth;

use App\Enums\ApiErrorCode;
use App\Exceptions\OtpException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ResendPasswordResetOtpRequest;
use App\Http\Requests\Api\ResetPasswordWithTokenRequest;
use App\Http\Requests\Api\VerifyPasswordResetOtpRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Services\PasswordResetService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class ForgotPasswordController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly PasswordResetService $passwordResetService,
    ) {}

    /**
     * Send a reset code. The response is the same whether or not the account exists.
     */
    public function sendResetOtp(ForgotPasswordRequest $request): JsonResponse
    {
        $this->passwordResetService->initiate(
            email: $request->validated('email'),
            metadata: [
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ],
        );

        return $this->successResponse(null, 'Please check your email for a verification code.');
    }

    /**
     * Verify the code and issue a single-use reset token.
     */
    public function verifyOtp(VerifyPasswordResetOtpRequest $request): JsonResponse
    {
        $otp = $this->passwordResetService->findForEmail($request->validated('email'));

        if (! $otp) {
            throw new OtpException('The verification code is incorrect.', reason: ApiErrorCode::OtpInvalid);
        }

        $this->passwordResetService->verify(
            otp: $otp,
            code: $request->validated('otp'),
        );

        $otp->refresh();

        return $this->successResponse([
            'reset_token' => $this->passwordResetService->issueResetToken($otp),
            'expires_in' => max(0, (int) now()->diffInSeconds($otp->expires_at)),
        ], 'Code verified. You can now set a new password.');
    }

    /**
     * Send a new code. The response is the same whether or not a reset is in progress.
     */
    public function resendOtp(ResendPasswordResetOtpRequest $request): JsonResponse
    {
        $otp = $this->passwordResetService->findForEmail($request->validated('email'));

        if ($otp) {
            $this->passwordResetService->resend(
                otp: $otp,
                metadata: [
                    'last_resend_ip' => $request->ip(),
                    'last_resend_user_agent' => $request->userAgent(),
                ],
            );
        }

        return $this->successResponse(null, 'A new verification code has been sent.');
    }

    /**
     * Set the new password using the reset token from the verify step.
     */
    public function resetPassword(ResetPasswordWithTokenRequest $request): JsonResponse
    {
        $otp = $this->passwordResetService->findByToken($request->validated('reset_token'));

        $user = $otp && $this->passwordResetService->isReadyForReset($otp)
            ? $this->passwordResetService->resetPassword(
                otp: $otp,
                password: $request->validated('password'),
            )
            : null;

        if (! $user) {
            $message = 'Your reset session has expired. Please request a new code.';

            return $this->errorResponse($message, 422, ['reset_token' => [$message]], ApiErrorCode::ResetTokenInvalid);
        }

        return $this->successResponse(null, 'Your password has been reset. Please log in with your new password.');
    }
}
