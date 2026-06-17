<?php

namespace App\Http\Controllers\Api;

use App\Enums\SupportTicketType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ContactUsRequest;
use App\Services\SupportTicketService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class SupportTicketController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly SupportTicketService $supportTicketService
    ) {}

    /**
     * Store a contact us message.
     */
    public function contactUs(ContactUsRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['type'] = SupportTicketType::ContactUs;
        $data['user_id'] = Auth::guard('api')->id();

        $ticket = $this->supportTicketService->create($data);

        return $this->successResponse([], 'Your message has been sent successfully.', 201);
    }
}
