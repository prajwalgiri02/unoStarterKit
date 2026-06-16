<?php

use App\Http\Controllers\cms\SupportTicketController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'approved', 'role:admin'])->name('admin.')->group(function () {
    Route::get('/messages', [SupportTicketController::class, 'index'])->name('messages.index');
    Route::patch('/messages/{ticket}/resolve', [SupportTicketController::class, 'resolve'])->name('messages.resolve');
    Route::delete('/messages/{ticket}', [SupportTicketController::class, 'destroy'])->name('messages.destroy');
});
