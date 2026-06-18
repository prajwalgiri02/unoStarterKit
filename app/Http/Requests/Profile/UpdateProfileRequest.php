<?php

declare(strict_types=1);

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,'.$this->user()->id],
            'password' => ['nullable', 'string', Password::defaults(), 'confirmed'],
            'password_confirmation' => ['nullable', 'string'],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
        ];
    }

    public function profileAttributes(): array
    {
        $attrs = $this->only(['name', 'email']);

        if ($this->filled('password')) {
            $attrs['password'] = $this->input('password');
        }

        return $attrs;
    }
}
