<?php

declare(strict_types=1);

namespace App\Http\Requests\Api;

use App\Enums\VerificationChannel;
use App\Http\Requests\Concerns\ValidatesDevice;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VerifyAccountRequest extends FormRequest
{
    use ValidatesDevice;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255'],
            'channel' => ['required', Rule::enum(VerificationChannel::class)],
            'otp' => ['required', 'string'],
            ...$this->deviceRules(),
        ];
    }

    public function channel(): VerificationChannel
    {
        return VerificationChannel::from($this->validated('channel'));
    }
}
