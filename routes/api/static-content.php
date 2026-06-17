<?php

use App\Http\Controllers\Api\StaticContentController;
use Illuminate\Support\Facades\Route;

Route::get('/{type}', [StaticContentController::class, 'show']);
