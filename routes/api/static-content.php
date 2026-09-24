<?php

use App\Enums\StaticContentType;
use App\Http\Controllers\Api\StaticContentController;
use Illuminate\Support\Facades\Route;

Route::get('/{type}', [StaticContentController::class, 'show'])
    ->whereIn('type', array_column(StaticContentType::cases(), 'value'));
