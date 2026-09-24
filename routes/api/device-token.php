<?php

use App\Http\Controllers\Api\DeviceTokenController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:api')->group(function () {
    Route::post('device-tokens', [DeviceTokenController::class, 'store']);
});
