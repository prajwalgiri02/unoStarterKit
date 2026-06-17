<?php

use App\Http\Controllers\Api\FaqController;
use Illuminate\Support\Facades\Route;

Route::get('faqs', [FaqController::class, 'index']);
