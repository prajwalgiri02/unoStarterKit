<?php

declare(strict_types=1);

namespace App\Http\Requests\StaticContent;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStaticContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') ?? false;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
        ];
    }

    /**
     * @return array{title: string, description: string}
     */
    public function contentAttributes(): array
    {
        return $this->safe()->only(['title', 'description']);
    }
}
