<?php

use App\Exceptions\ApiExceptionRenderer;
use App\Exceptions\OtpException;
use App\Http\Middleware\EnsureApiTokenIsCurrent;
use App\Http\Middleware\EnsurePasswordResetOtpPending;
use App\Http\Middleware\EnsurePasswordResetOtpVerified;
use App\Http\Middleware\EnsureUserApproved;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\HandlePrecognitiveRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Middleware\RoleMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->redirectGuestsTo('/cms/login');

        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);

        $middleware->api(append: [
            EnsureApiTokenIsCurrent::class,
        ]);

        $middleware->alias([
            'password-reset.pending' => EnsurePasswordResetOtpPending::class,
            'password-reset.verified' => EnsurePasswordResetOtpVerified::class,
            'approved' => EnsureUserApproved::class,
            'role' => RoleMiddleware::class,
            'precognitive' => HandlePrecognitiveRequests::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        $exceptions->render(
            fn (Throwable $exception, Request $request) => $request->is('api/*')
                ? app(ApiExceptionRenderer::class)->render($exception)
                : null,
        );

        $exceptions->render(function (
            OtpException $exception,
            Request $request,
        ) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => $exception->getMessage(),
                    'errors' => [
                        $exception->field => [$exception->getMessage()],
                    ],
                ], 422);
            }

            if ($exception->retryAfterSeconds !== null) {
                session()->flash(
                    'resendAvailableAt',
                    now()->addSeconds($exception->retryAfterSeconds)->toIso8601String(),
                );
            }

            throw ValidationException::withMessages([
                $exception->field => $exception->getMessage(),
            ]);
        });

        $exceptions->render(function (
            ThrottleRequestsException $exception,
            Request $request,
        ) {
            if ($request->expectsJson() && ! $request->header('X-Inertia')) {
                return response()->json([
                    'message' => 'Too many attempts. Please try again later.',
                ], 429, $exception->getHeaders());
            }

            $retryAfter = (int) ($exception->getHeaders()['Retry-After'] ?? 60);

            if ($request->routeIs('cms.password.otp.resend') && $retryAfter > 0) {
                session()->flash(
                    'resendAvailableAt',
                    now()->addSeconds($retryAfter)->toIso8601String(),
                );
            }

            $message = match (true) {
                $request->routeIs('cms.password.otp.resend') && $retryAfter > 0 => "Please wait {$retryAfter} seconds before resending.",
                $retryAfter > 0 => "Too many attempts. Please wait {$retryAfter} seconds before trying again.",
                default => 'Too many attempts. Please wait a moment before trying again.',
            };

            $field = match (true) {
                $request->routeIs('cms.password.otp.send'),
                $request->routeIs('cms.auth.login.store') => 'email',
                default => 'otp',
            };

            throw ValidationException::withMessages([
                $field => $message,
            ]);
        });
    })->create();
