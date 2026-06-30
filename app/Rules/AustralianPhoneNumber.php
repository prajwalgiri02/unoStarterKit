<?php

declare(strict_types=1);

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class AustralianPhoneNumber implements ValidationRule
{
    /**
     * Accepts domestic (0X) and international (+61X) formats for:
     *   - Mobile:   04XX XXX XXX
     *   - Landline: 02/03/07/08 XXXX XXXX
     * Spaces and hyphens are allowed as separators.
     */
    private const PATTERN = '/^(\+61|0)[23478](?:[ -]?\d){8}$/';

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $normalised = preg_replace('/\s+/', ' ', trim((string) $value));

        if (! preg_match(self::PATTERN, $normalised)) {
            $fail('The :attribute must be a valid Australian phone number (e.g. 0412 345 678 or +61 2 1234 5678).');
        }
    }
}
