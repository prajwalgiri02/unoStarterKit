<?php

use App\Http\Controllers\cms\StaticContentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'approved', 'role:admin'])->name('admin.')->group(function () {
    Route::get('/static-content', [StaticContentController::class, 'index'])->name('static-content.index');
    Route::put('/static-content/{staticContent}', [StaticContentController::class, 'update'])->name('static-content.update');
});
