<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class VerifyPasswordOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $length = (int) (array_replace(
            config('otp.defaults', []),
            config('otp.purposes.password_reset', []),
        )['length'] ?? 6);

        return [
            'otp' => [
                'required',
                'string',
                "digits:{$length}",
            ],
        ];
    }
}
