<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\SupportTicketStatus;
use App\Enums\SupportTicketType;
use App\Models\SupportTicket;
use Illuminate\Database\Eloquent\Collection;

class SupportTicketService
{
    /**
     * @param  array{type?: string, sort?: string}  $filters
     * @return Collection<int, SupportTicket>
     */
    public function list(array $filters = []): Collection
    {
        $query = SupportTicket::query();

        $type = $filters['type'] ?? 'all';
        if ($type !== 'all') {
            $typeEnum = SupportTicketType::tryFrom($type);
            if ($typeEnum !== null) {
                $query->where('type', $typeEnum->value);
            }
        }

        $sort = $filters['sort'] ?? 'newest';

        match ($sort) {
            'name_asc' => $query->orderBy('name'),
            'name_desc' => $query->orderByDesc('name'),
            'oldest' => $query->oldest(),
            default => $query->latest(),
        };

        return $query->get();
    }

    public function resolve(SupportTicket $ticket): SupportTicket
    {
        $ticket->update([
            'status' => SupportTicketStatus::Resolved,
            'resolved_at' => now(),
        ]);

        return $ticket->refresh();
    }
}
