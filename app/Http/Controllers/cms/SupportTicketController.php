<?php

declare(strict_types=1);

namespace App\Http\Controllers\cms;

use App\Enums\SupportTicketType;
use App\Http\Controllers\Controller;
use App\Http\Resources\SupportTicketResource;
use App\Models\SupportTicket;
use App\Services\SupportTicketService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupportTicketController extends Controller
{
    public function __construct(private readonly SupportTicketService $supportTicketService) {}

    public function index(Request $request): Response
    {
        $filters = [
            'type' => $request->query('type', 'all'),
            'sort' => $request->query('sort', 'newest'),
        ];

        return Inertia::render('cms/messages-and-support/index', [
            'tickets' => SupportTicketResource::collection($this->supportTicketService->list($filters)),
            'ticket_types' => SupportTicketType::options(),
            'filters' => $filters,
        ]);
    }

    public function resolve(SupportTicket $ticket): RedirectResponse
    {
        $this->supportTicketService->resolve($ticket);

        return back()->with('status', 'Ticket marked as resolved.');
    }

    public function destroy(SupportTicket $ticket): RedirectResponse
    {
        $this->supportTicketService->delete($ticket);

        return redirect()->route('cms.admin.messages.index')->with('status', 'Ticket deleted.');
    }
}
