<?php

declare(strict_types=1);

namespace App\Enums;

enum SupportTicketType: string
{
    case ContactUs = 'contact_us';
    case Dispute = 'dispute';

    public function label(): string
    {
        return match ($this) {
            self::ContactUs => 'Contact Us',
            self::Dispute => 'Dispute',
        };
    }

    public function badgeClass(): string
    {
        return match ($this) {
            self::ContactUs => 'badge-info-outline',
            self::Dispute => 'badge-primary-outline',
        };
    }

    /** @return list<array{value: string, label: string, badge_class: string}> */
    public static function options(): array
    {
        return array_map(
            fn (self $type): array => [
                'value' => $type->value,
                'label' => $type->label(),
                'badge_class' => $type->badgeClass(),
            ],
            self::cases(),
        );
    }
}
