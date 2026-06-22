<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FaqResource;
use App\Models\Faq;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class FaqController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $faqs = Faq::query()->orderBy('id')->get();

        return $this->successResponse(FaqResource::collection($faqs));
    }
}
