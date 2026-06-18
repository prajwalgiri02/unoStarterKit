<?php

use App\Http\Controllers\Api\Auth\ForgotPasswordController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::prefix('password')->group(function () {
        Route::post('forgot', [ForgotPasswordController::class, 'sendResetOtp']);
        Route::post('verify', [ForgotPasswordController::class, 'verifyOtp']);
        Route::post('resend', [ForgotPasswordController::class, 'resendOtp']);
        Route::post('reset', [ForgotPasswordController::class, 'resetPassword']);
    });

    Route::middleware('auth:api')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::post('me', [AuthController::class, 'me']);
    });
});
