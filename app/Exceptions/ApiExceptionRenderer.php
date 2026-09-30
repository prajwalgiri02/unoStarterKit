<?php

declare(strict_types=1);

namespace App\Exceptions;

use App\Enums\ApiErrorCode;
use App\Support\ApiEnvelope;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenBlacklistedException;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenExpiredException;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenInvalidException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

final class ApiExceptionRenderer
{
    public function render(Throwable $exception): ?JsonResponse
    {
        return match (true) {
            $exception instanceof HttpResponseException => null,

            $exception instanceof ValidationException => ApiEnvelope::error(
                $exception->getMessage(),
                $exception->status,
                $exception->errors(),
                ApiErrorCode::ValidationFailed,
            ),

            $exception instanceof OtpException => ApiEnvelope::error(
                $exception->getMessage(),
                422,
                [$exception->field => [$exception->getMessage()]],
                $exception->reason,
                $exception->retryAfterSeconds !== null ? ['Retry-After' => (string) $exception->retryAfterSeconds] : [],
            ),

            $exception instanceof AuthenticationException => ApiEnvelope::error(
                'Unauthenticated.',
                401,
                code: ApiErrorCode::Unauthenticated,
            ),

            $exception instanceof TokenExpiredException => ApiEnvelope::error(
                'Your session has expired. Please log in again.',
                401,
                code: ApiErrorCode::TokenExpired,
            ),

            $exception instanceof TokenInvalidException,
            $exception instanceof TokenBlacklistedException => ApiEnvelope::error(
                'Your session is invalid. Please log in again.',
                401,
                code: ApiErrorCode::TokenInvalid,
            ),

            $exception instanceof HttpExceptionInterface => $this->httpError($exception),

            default => $this->serverError($exception),
        };
    }

    private function httpError(HttpExceptionInterface $exception): JsonResponse
    {
        $status = $exception->getStatusCode();

        $message = match ($status) {
            404 => 'The requested resource was not found.',
            405 => 'This method is not allowed for this endpoint.',
            429 => 'Too many attempts. Please try again later.',
            503 => 'The service is temporarily unavailable. Please try again later.',
            default => $exception->getMessage() ?: (Response::$statusTexts[$status] ?? 'Request failed.'),
        };

        return ApiEnvelope::error($message, $status, headers: $exception->getHeaders());
    }

    private function serverError(Throwable $exception): JsonResponse
    {
        $debug = config('app.debug')
            ? ['debug' => [
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
            ]]
            : [];

        return ApiEnvelope::error(
            'Something went wrong. Please try again later.',
            500,
            code: ApiErrorCode::ServerError,
            extra: $debug,
        );
    }
}
