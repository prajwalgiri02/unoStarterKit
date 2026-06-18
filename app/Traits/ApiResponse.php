<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;

trait ApiResponse
{
    /**
     * Success Response
     */
    protected function successResponse(mixed $data, ?string $message = null, int $code = 200): JsonResponse
    {
        return response()->json([
            'status' => $code,
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    /**
     * Error Response
     */
    protected function errorResponse(?string $message, int $code, mixed $errors = null): JsonResponse
    {
        return response()->json([
            'status' => $code,
            'message' => $message,
            'errors' => $errors,
        ], $code);
    }

    /**
     * Resource Response
     */
    protected function resourceResponse(JsonResource $resource, ?string $message = null, int $code = 200): JsonResponse
    {
        return response()->json([
            'status' => $code,
            'message' => $message,
            'data' => $resource,
        ], $code);
    }
}
