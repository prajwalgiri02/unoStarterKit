<?php

use App\Http\Controllers\cms\DashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'approved', 'role:admin'])->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});
