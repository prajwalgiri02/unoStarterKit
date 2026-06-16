<?php

declare(strict_types=1);

namespace App\Enums;

enum SupportTicketStatus: string
{
    case Pending = 'pending';
    case Resolved = 'resolved';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Resolved => 'Resolved',
        };
    }

    public function badgeClass(): string
    {
        return match ($this) {
            self::Pending => 'badge-warning-outline',
            self::Resolved => 'badge-success-outline',
        };
    }
}
