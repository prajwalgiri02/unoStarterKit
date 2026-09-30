<?php

namespace App\Traits;

use App\Enums\ApiErrorCode;
use App\Support\ApiEnvelope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;

trait ApiResponse
{
    /**
     * Success Response
     */
    protected function successResponse(mixed $data, ?string $message = null, int $code = 200): JsonResponse
    {
        return ApiEnvelope::success($data, $message, $code);
    }

    /**
     * Error Response
     */
    protected function errorResponse(
        ?string $message,
        int $code,
        mixed $errors = null,
        ApiErrorCode|string|null $errorCode = null,
    ): JsonResponse {
        return ApiEnvelope::error($message, $code, $errors, $errorCode);
    }

    /**
     * Resource Response
     */
    protected function resourceResponse(JsonResource $resource, ?string $message = null, int $code = 200): JsonResponse
    {
        return ApiEnvelope::success($resource, $message, $code);
    }
}
