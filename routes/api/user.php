<?php

use App\Http\Resources\UserResource;
use App\Support\ApiEnvelope;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return ApiEnvelope::success(new UserResource($request->user()));
})->middleware('auth:api');
