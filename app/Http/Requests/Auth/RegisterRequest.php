<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use App\Enums\VerificationChannel;
use App\Http\Requests\Concerns\ValidatesDevice;
use App\Models\User;
use App\Rules\AustralianPhoneNumber;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    use ValidatesDevice;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)],
            'password' => ['required', 'string', 'confirmed', Password::defaults()],
            'phone' => [VerificationChannel::PHONE->isRequired() ? 'required' : 'nullable', 'string', new AustralianPhoneNumber],
            ...$this->deviceRules(),
        ];
    }

    /**
     * @return array{name: string, email: string, password: string, phone?: string|null}
     */
    public function userAttributes(): array
    {
        return $this->safe()->only(['name', 'email', 'password', 'phone']);
    }
}
