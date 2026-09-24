<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\DeviceTokenRequest;
use App\Services\DeviceTokenService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class DeviceTokenController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly DeviceTokenService $deviceTokens,
    ) {}

    public function store(DeviceTokenRequest $request): JsonResponse
    {
        $this->deviceTokens->register($request->user('api'), $request->device());

        return $this->successResponse(null, 'Device registered for push notifications.');
    }
}
