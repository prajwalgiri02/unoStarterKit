<?php

namespace App\Http\Controllers\Api;

use App\Enums\ApiErrorCode;
use App\Enums\VerificationChannel;
use App\Exceptions\OtpException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ResendVerificationRequest;
use App\Http\Requests\Api\VerifyAccountRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\LogoutRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\DeviceTokenService;
use App\Services\UserRegistrationService;
use App\Services\UserVerificationService;
use App\Support\ApiEnvelope;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    use ApiResponse;

    /**
     * Create a new AuthController instance.
     *
     * @return void
     */
    public function __construct(
        private readonly UserRegistrationService $registrationService,
        private readonly DeviceTokenService $deviceTokens,
        private readonly UserVerificationService $verificationService,
    ) {}

    /**
     * Register a User.
     *
     * @return JsonResponse
     */
    public function register(RegisterRequest $request)
    {
        $user = DB::transaction(function () use ($request): User {
            $user = $this->registrationService->register($request->userAttributes());

            $this->verificationService->sendCodes($user, $user->pendingVerifications(), $this->otpMetadata($request));

            return $user;
        });

        if ($user->isPendingVerification()) {
            return $this->successResponse($this->verificationData($user), $this->codeSentMessage($user));
        }

        if ($user->isPendingApproval()) {
            return $this->errorResponse('Your account has been created and is pending approval.', 403, errorCode: ApiErrorCode::AccountPendingApproval);
        }

        $token = Auth::guard('api')->login($user);

        $this->registerDevice($user, $request->device());

        return $this->respondWithToken($token);
    }

    /**
     * Get a JWT via given credentials.
     *
     * @return JsonResponse
     */
    public function login(LoginRequest $request)
    {
        $credentials = $request->safe()->only(['email', 'password']);

        if (! $token = Auth::guard('api')->attempt($credentials)) {
            return $this->errorResponse('Invalid email or password.', 401, errorCode: ApiErrorCode::InvalidCredentials);
        }

        /** @var User $user */
        $user = Auth::guard('api')->user();

        if ($user !== null && $user->isBlocked()) {
            Auth::guard('api')->logout();

            return $this->errorResponse('Your account has been blocked.', 403, errorCode: ApiErrorCode::AccountBlocked);
        }

        if ($user !== null && $user->isPendingVerification()) {
            Auth::guard('api')->logout();

            $this->verificationService->sendCodes($user, $user->pendingVerifications(), $this->otpMetadata($request));

            return ApiEnvelope::error(
                'Please verify your account. '.$this->codeSentMessage($user),
                403,
                code: ApiErrorCode::VerificationRequired,
                extra: ['data' => $this->verificationData($user)],
            );
        }

        if ($user !== null && $user->isPendingApproval()) {
            Auth::guard('api')->logout();

            return $this->errorResponse('Your account is pending approval.', 403, errorCode: ApiErrorCode::AccountPendingApproval);
        }

        $this->registerDevice($user, $request->device());

        return $this->respondWithToken($token);
    }

    /**
     * @return JsonResponse
     */
    public function verify(VerifyAccountRequest $request)
    {
        $channel = $request->channel();

        $user = User::query()->where('email', $request->validated('email'))->first();

        if ($user !== null && $channel->isRequired() && $user->hasVerified($channel)) {
            throw new OtpException("Your {$channel->label()} is already verified.", reason: ApiErrorCode::OtpAlreadyVerified);
        }

        if ($user === null || ! in_array($channel, $user->pendingVerifications(), true)) {
            throw new OtpException('The verification code is incorrect.', reason: ApiErrorCode::OtpInvalid);
        }

        $user = $this->verificationService->verify($user, $channel, $request->validated('otp'));

        if ($user->isPendingVerification()) {
            return $this->successResponse(
                $this->verificationData($user),
                ucfirst($channel->label()).' verified. Please also verify your '.$this->pendingLabels($user).'.',
            );
        }

        if ($user->isBlocked()) {
            return $this->errorResponse('Your account has been blocked.', 403, errorCode: ApiErrorCode::AccountBlocked);
        }

        if ($user->isPendingApproval()) {
            return $this->errorResponse('Your account is verified and pending approval.', 403, errorCode: ApiErrorCode::AccountPendingApproval);
        }

        $token = Auth::guard('api')->login($user);

        $this->registerDevice($user, $request->device());

        return $this->respondWithToken($token);
    }

    /**
     * @return JsonResponse
     */
    public function resendVerification(ResendVerificationRequest $request)
    {
        $channel = $request->channel();

        $user = User::query()->where('email', $request->validated('email'))->first();

        if ($user !== null && in_array($channel, $user->pendingVerifications(), true)) {
            $this->verificationService->resend($user, $channel, $this->otpMetadata($request));
        }

        return $this->successResponse(null, 'A new verification code has been sent.');
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return JsonResponse
     */
    public function logout(LogoutRequest $request)
    {
        /** @var User $user */
        $user = Auth::guard('api')->user();

        $this->deviceTokens->removeForDevice($user, $request->validated('device_id'));

        Auth::guard('api')->logout();

        return $this->successResponse(null, 'Successfully logged out');
    }

    /**
     * Refresh a token.
     *
     * @return JsonResponse
     */
    public function refresh()
    {
        return $this->respondWithToken(Auth::guard('api')->refresh());
    }

    /**
     * @return array{verification_required: list<string>, otp_length: int}
     */
    private function verificationData(User $user): array
    {
        $channels = $user->pendingVerifications();

        return [
            'verification_required' => array_map(fn (VerificationChannel $channel): string => $channel->value, $channels),
            'otp_length' => $this->verificationService->otpLength($channels[0]),
        ];
    }

    private function codeSentMessage(User $user): string
    {
        return 'We have sent a verification code to your '.$this->pendingLabels($user).'.';
    }

    private function pendingLabels(User $user): string
    {
        return implode(' and ', array_map(
            fn (VerificationChannel $channel): string => $channel->label(),
            $user->pendingVerifications(),
        ));
    }

    /**
     * @return array{ip_address: string|null, user_agent: string|null}
     */
    private function otpMetadata(Request $request): array
    {
        return [
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ];
    }

    /**
     * @param  array<string, mixed>|null  $device
     */
    private function registerDevice(User $user, ?array $device): void
    {
        if ($device !== null) {
            $this->deviceTokens->register($user, $device);
        }
    }

    /**
     * Get the token array structure.
     *
     * @param  string  $token
     * @return JsonResponse
     */
    protected function respondWithToken($token)
    {
        return $this->successResponse([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::guard('api')->factory()->getTTL() * 60,
            'user' => new UserResource(Auth::guard('api')->user()),
        ]);
    }
}
