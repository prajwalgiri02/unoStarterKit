<?php

declare(strict_types=1);

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Provides unique slug generation for Eloquent models.
 *
 * Usage:
 *   use HasSlug;
 *
 *   // Generate from the model's 'title' field, store in 'slug' column:
 *   $model->setSlug('title');
 *
 *   // Generate from 'name', store in a custom 'handle' column:
 *   $model->setSlug('name', 'handle');
 *
 *   // Get the slug string without assigning it:
 *   $slug = $model->generateUniqueSlug('title');
 *
 * @mixin Model
 */
trait HasSlug
{
    /**
     * Derive a URL-safe slug from the model attribute identified by $sourceField,
     * append a numeric suffix until the value is unique in the table, then assign
     * the result to $slugField on the model instance.
     *
     * Returns the model instance for fluent chaining.
     */
    public function setSlug(string $sourceField, string $slugField = 'slug'): static
    {
        /** @var Model $this */
        $ignoreId = $this->exists ? (int) $this->getKey() : null;

        $this->{$slugField} = $this->generateUniqueSlug($sourceField, $slugField, $ignoreId);

        return $this;
    }

    /**
     * Generate and return a unique slug derived from $sourceField without
     * assigning it to the model.
     *
     * @param  string  $sourceField  Model attribute to build the slug from (e.g. 'title', 'name')
     * @param  string  $slugField  Column that will store the slug (default: 'slug')
     * @param  int|null  $ignoreId  Primary key to exclude from the uniqueness check (pass the
     *                              model's own ID when updating so the current row is not treated
     *                              as a conflict)
     */
    public function generateUniqueSlug(
        string $sourceField,
        string $slugField = 'slug',
        ?int $ignoreId = null,
    ): string {
        $value = (string) ($this->{$sourceField} ?? '');
        $base = Str::slug($value);

        if ($base === '') {
            $base = Str::lower(Str::random(8));
        }

        $slug = $base;
        $counter = 1;

        while ($this->slugAlreadyExists($slug, $slugField, $ignoreId)) {
            $slug = $base.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Check whether the given slug value is already taken in the table.
     */
    private function slugAlreadyExists(
        string $slug,
        string $slugField,
        ?int $ignoreId,
    ): bool {
        /** @var Model $this */
        $query = static::query()->where($slugField, $slug);

        if ($ignoreId !== null) {
            $query->whereKeyNot($ignoreId);
        }

        return $query->exists();
    }
}
