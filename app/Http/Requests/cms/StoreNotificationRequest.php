<?php

declare(strict_types=1);

namespace App\Http\Requests\cms;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreNotificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'location' => ['nullable', 'string'],
            'subscription_type' => ['nullable', 'string'],
            'send_to_all' => ['boolean'],
            'url' => ['nullable', 'url'],
            'data' => ['nullable', 'array'],
            'scheduled_at' => ['nullable', 'date'],
        ];
    }
}
