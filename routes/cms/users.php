<?php

use App\Http\Controllers\cms\Auth\PendingUserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'approved', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::post('/users/{user}/approve', [PendingUserController::class, 'approve'])
        ->name('users.approve');
});
