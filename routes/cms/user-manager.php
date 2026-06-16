<?php

use App\Http\Controllers\cms\UserManagerController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'approved', 'role:admin'])
    ->prefix('user-manager')
    ->name('user-manager.')
    ->group(function () {
        Route::get('/', [UserManagerController::class, 'index'])->name('index');
        Route::get('/{user}', [UserManagerController::class, 'show'])->name('show');
        Route::get('/{user}/edit', [UserManagerController::class, 'edit'])->name('edit');
        Route::put('/{user}', [UserManagerController::class, 'update'])->name('update');
        Route::delete('/{user}', [UserManagerController::class, 'destroy'])->name('destroy');
        Route::post('/{user}/toggle-block', [UserManagerController::class, 'toggleBlock'])
            ->name('toggle-block');
    });
