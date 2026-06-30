<?php

use App\Http\Controllers\Api\SupportTicketController;
use Illuminate\Support\Facades\Route;

Route::post('contact-us', [SupportTicketController::class, 'contactUs'])->middleware('throttle:5,60');
