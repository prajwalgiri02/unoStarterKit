<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StaticContentResource;
use App\Services\StaticContentService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class StaticContentController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly StaticContentService $staticContentService
    ) {}

    /**
     * Get static content by type.
     */
    public function show(string $type): JsonResponse
    {
        $content = $this->staticContentService->getByType($type);

        if (! $content) {
            return $this->errorResponse('Content not found.', 404);
        }

        return $this->resourceResponse(new StaticContentResource($content));
    }
}
