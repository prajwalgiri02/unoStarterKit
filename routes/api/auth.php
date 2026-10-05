<?php

use App\Http\Controllers\Api\Auth\ForgotPasswordController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:3,60');
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:3,60');

    Route::prefix('verification')->group(function () {
        Route::post('verify', [AuthController::class, 'verify'])->middleware('throttle:6,1');
        Route::post('resend', [AuthController::class, 'resendVerification'])->middleware('throttle:3,1');
    });

    Route::prefix('password')->group(function () {
        Route::post('forgot', [ForgotPasswordController::class, 'sendResetOtp'])->middleware('throttle:3,60');
        Route::post('verify', [ForgotPasswordController::class, 'verifyOtp'])->middleware('throttle:3,60');
        Route::post('resend', [ForgotPasswordController::class, 'resendOtp'])->middleware('throttle:3,60');
        Route::post('reset', [ForgotPasswordController::class, 'resetPassword'])->middleware('throttle:3,60');
    });

    Route::middleware('auth:api')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
    });
});
