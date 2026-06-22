<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupportTicketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'message' => $this->message,
            'type' => $this->type->value,
            'type_label' => $this->type->label(),
            'type_badge_class' => $this->type->badgeClass(),
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'status_badge_class' => $this->status->badgeClass(),
            'resolved_at' => $this->resolved_at?->toDateString(),
            'date' => $this->created_at?->format('m/d/Y'),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
