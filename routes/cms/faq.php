<?php

use App\Http\Controllers\cms\FaqController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'approved', 'role:admin'])->name('admin.')->group(function () {
    Route::get('/faqs', [FaqController::class, 'index'])->name('faqs.index');
    Route::post('/faqs', [FaqController::class, 'store'])->name('faqs.store');
    Route::put('/faqs/{faq}', [FaqController::class, 'update'])->name('faqs.update');
    Route::delete('/faqs/{faq}', [FaqController::class, 'destroy'])->name('faqs.destroy');
});
