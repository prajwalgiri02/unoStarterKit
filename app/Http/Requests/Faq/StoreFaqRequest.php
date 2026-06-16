<?php

declare(strict_types=1);

namespace App\Http\Requests\Faq;

use Illuminate\Foundation\Http\FormRequest;

class StoreFaqRequest extends FormRequest
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
            'question' => ['required', 'string', 'max:500'],
            'answer'   => ['required', 'string'],
        ];
    }

    /**
     * @return array{question: string, answer: string}
     */
    public function faqAttributes(): array
    {
        return $this->safe()->only(['question', 'answer']);
    }
}
