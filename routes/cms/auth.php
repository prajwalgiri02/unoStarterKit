<?php

use App\Http\Controllers\cms\Auth\ForgotPasswordController;
use App\Http\Controllers\cms\Auth\LoginController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::controller(LoginController::class)->group(function () {
        Route::get('/login', 'create')->name('auth.login');
        Route::post('/login', 'store')->name('auth.login.store')->middleware('throttle:5,1');
    });

    Route::get('/forgot-password', [ForgotPasswordController::class, 'create'])
        ->name('password.request');

    Route::post('/forgot-password', [ForgotPasswordController::class, 'store'])
        ->middleware('throttle:3,1')
        ->name('password.otp.send');

    Route::get('/forgot-password/verify/{token}', [ForgotPasswordController::class, 'verifyForm'])
        ->where('token', '[A-Za-z0-9]{64}')
        ->middleware('password-reset.pending')
        ->name('password.otp.form');

    Route::post('/forgot-password/verify/{token}', [ForgotPasswordController::class, 'verify'])
        ->where('token', '[A-Za-z0-9]{64}')
        ->middleware(['precognitive', 'password-reset.pending', 'throttle:6,1'])
        ->name('password.otp.verify');

    Route::post('/forgot-password/resend/{token}', [ForgotPasswordController::class, 'resend'])
        ->where('token', '[A-Za-z0-9]{64}')
        ->middleware(['password-reset.pending', 'throttle:3,1'])
        ->name('password.otp.resend');

    Route::get('/reset-password/{token}', [ForgotPasswordController::class, 'resetForm'])
        ->where('token', '[A-Za-z0-9]{64}')
        ->middleware('password-reset.verified')
        ->name('password.reset.form');

    Route::post('/reset-password/{token}', [ForgotPasswordController::class, 'reset'])
        ->where('token', '[A-Za-z0-9]{64}')
        ->middleware(['precognitive', 'password-reset.verified'])
        ->name('password.reset');

    Route::post('/forgot-password/cancel/{token}', [ForgotPasswordController::class, 'cancel'])
        ->where('token', '[A-Za-z0-9]{64}')
        ->middleware(['password-reset.pending', 'throttle:6,1'])
        ->name('password.reset.cancel');
});

Route::middleware('auth')->middleware('approved')->group(function () {
    Route::post('/logout', [LoginController::class, 'destroy'])->name('auth.logout');
});
