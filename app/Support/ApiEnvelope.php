<?php

declare(strict_types=1);

namespace App\Support;

use App\Enums\ApiErrorCode;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;

final class ApiEnvelope
{
    public static function success(mixed $data = null, ?string $message = null, int $status = 200): JsonResponse
    {
        $body = [
            'status' => $status,
            'message' => $message,
            'data' => $data,
        ];

        $paginator = match (true) {
            $data instanceof ResourceCollection && $data->resource instanceof LengthAwarePaginator => $data->resource,
            $data instanceof LengthAwarePaginator => $data,
            default => null,
        };

        if ($paginator !== null) {
            $body['data'] = $data instanceof ResourceCollection ? $data->resolve(request()) : $paginator->items();
            $body['meta'] = [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ];
        }

        return response()->json($body, $status);
    }

    /**
     * @param  array<string, string>  $headers
     * @param  array<string, mixed>  $extra
     */
    public static function error(
        ?string $message,
        int $status,
        mixed $errors = null,
        ApiErrorCode|string|null $code = null,
        array $headers = [],
        array $extra = [],
    ): JsonResponse {
        $code ??= ApiErrorCode::fromStatus($status);

        return response()->json([
            'status' => $status,
            'code' => $code instanceof ApiErrorCode ? $code->value : $code,
            'message' => $message,
            'errors' => $errors,
            ...$extra,
        ], $status, $headers);
    }
}
