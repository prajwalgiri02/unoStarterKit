<?php

declare(strict_types=1);

namespace App\Enums;

enum StaticContentType: string
{
    case TermsAndConditions = 'terms_and_conditions';
    case CommunityGuidelines = 'community_guidelines';
    case PrivacyPolicy = 'privacy_policy';

    public function label(): string
    {
        return match ($this) {
            self::TermsAndConditions => 'Terms & Conditions',
            self::CommunityGuidelines => 'Community Guidelines',
            self::PrivacyPolicy => 'Privacy Policy',
        };
    }
}
