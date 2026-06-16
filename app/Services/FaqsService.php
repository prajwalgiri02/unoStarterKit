<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Faq;
use Illuminate\Database\Eloquent\Collection;

class FaqsService
{
    /**
     * @return Collection<int, Faq>
     */
    public function listAll(): Collection
    {
        return Faq::query()
            ->orderBy('id')
            ->get();
    }

    /**
     * @param  array{question: string, answer: string}  $attributes
     */
    public function create(array $attributes): Faq
    {
        return Faq::create([
            'question' => $attributes['question'],
            'answer'   => $attributes['answer'],
        ]);
    }

    /**
     * @param  array{question: string, answer: string}  $attributes
     */
    public function update(Faq $faq, array $attributes): Faq
    {
        $faq->update([
            'question' => $attributes['question'],
            'answer'   => $attributes['answer'],
        ]);

        return $faq->refresh();
    }

    public function delete(Faq $faq): void
    {
        $faq->delete();
    }
}
