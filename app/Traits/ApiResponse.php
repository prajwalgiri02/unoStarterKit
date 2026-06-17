<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

trait ApiResponse
{
    /**
     * Success Response
     *
     * @param mixed $data
     * @param string|null $message
     * @param int $code
     * @return JsonResponse
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
     *
     * @param string|null $message
     * @param int $code
     * @param mixed $errors
     * @return JsonResponse
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
     *
     * @param JsonResource $resource
     * @param string|null $message
     * @param int $code
     * @return JsonResponse
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
