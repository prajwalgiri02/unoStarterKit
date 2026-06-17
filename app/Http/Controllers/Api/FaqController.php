<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FaqResource;
use App\Services\FaqsService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class FaqController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly FaqsService $faqsService
    ) {}

    /**
     * Get all FAQs.
     */
    public function index(): JsonResponse
    {
        $faqs = $this->faqsService->listAll();

        return $this->successResponse(FaqResource::collection($faqs));
    }
}
