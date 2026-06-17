<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\StaticContent;
use Illuminate\Database\Eloquent\Collection;

class StaticContentService
{
    /**
     * @return Collection<int, StaticContent>
     */
    public function listAll(): Collection
    {
        return StaticContent::query()
            ->orderBy('id')
            ->get();
    }

    public function getByType(string $type): ?StaticContent
    {
        return StaticContent::query()
            ->where('type', $type)
            ->first();
    }

    /**
     * @param  array{title: string, description: string}  $attributes
     */
    public function update(StaticContent $staticContent, array $attributes): StaticContent
    {
        $staticContent->update([
            'title' => $attributes['title'],
            'description' => $attributes['description'],
        ]);

        return $staticContent->refresh();
    }
}
