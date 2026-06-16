<?php

use App\Http\Controllers\cms\ProfileController;
use App\Http\Controllers\cms\ProfileOtpController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'approved', 'role:admin'])->name('admin.')->group(function () {
    Route::get('/settings', [ProfileController::class, 'show'])->name('settings.show');
    Route::put('/settings', [ProfileController::class, 'update'])->name('settings.update');

    Route::get('/settings/verify/{token}', [ProfileOtpController::class, 'show'])->name('settings.otp.form');
    Route::post('/settings/verify/{token}', [ProfileOtpController::class, 'verify'])->name('settings.otp.verify');
    Route::post('/settings/resend/{token}', [ProfileOtpController::class, 'resend'])->name('settings.otp.resend');
});
