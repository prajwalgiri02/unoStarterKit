<?php

namespace App\Http\Controllers\Api;

use App\Enums\ApiErrorCode;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\LogoutRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\DeviceTokenService;
use App\Services\UserRegistrationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

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
    ) {}

    /**
     * Register a User.
     *
     * @return JsonResponse
     */
    public function register(RegisterRequest $request)
    {
        $user = $this->registrationService->register($request->userAttributes());

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

        if ($user !== null && $user->isPendingApproval()) {
            Auth::guard('api')->logout();

            return $this->errorResponse('Your account is pending approval.', 403, errorCode: ApiErrorCode::AccountPendingApproval);
        }

        if ($user !== null && $user->isBlocked()) {
            Auth::guard('api')->logout();

            return $this->errorResponse('Your account has been blocked.', 403, errorCode: ApiErrorCode::AccountBlocked);
        }

        $this->registerDevice($user, $request->device());

        return $this->respondWithToken($token);
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
