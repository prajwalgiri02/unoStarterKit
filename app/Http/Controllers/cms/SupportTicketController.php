<?php

declare(strict_types=1);

namespace App\Http\Controllers\cms;

use App\Enums\SupportTicketType;
use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Services\SupportTicketService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupportTicketController extends Controller
{
    public function __construct(
        private readonly SupportTicketService $supportTicketService,
    ) {}

    public function index(Request $request): Response
    {
        $filters = [
            'type' => $request->query('type', 'all'),
            'sort' => $request->query('sort', 'newest'),
        ];

        $tickets = $this->supportTicketService->list($filters);

        $ticketTypes = array_map(
            fn (SupportTicketType $type): array => [
                'value' => $type->value,
                'label' => $type->label(),
                'badge_class' => $type->badgeClass(),
            ],
            SupportTicketType::cases(),
        );

        return Inertia::render('cms/Admin/Messages/Index', [
            'tickets' => $tickets->map(fn (SupportTicket $ticket): array => [
                'id' => $ticket->id,
                'name' => $ticket->name,
                'email' => $ticket->email,
                'message' => $ticket->message,
                'type' => $ticket->type->value,
                'type_label' => $ticket->type->label(),
                'type_badge_class' => $ticket->type->badgeClass(),
                'status' => $ticket->status->value,
                'status_label' => $ticket->status->label(),
                'status_badge_class' => $ticket->status->badgeClass(),
                'resolved_at' => $ticket->resolved_at?->toDateString(),
                'date' => $ticket->created_at?->format('m/d/Y'),
                'created_at' => $ticket->created_at?->toIso8601String(),
            ])->values(),
            'ticket_types' => $ticketTypes,
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
        $ticket->delete();

        return redirect()->route('cms.admin.messages.index')->with('status', 'Ticket deleted.');
    }
}
