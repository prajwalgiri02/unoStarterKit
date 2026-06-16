<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\StaticContentType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['type', 'title', 'description'])]
class StaticContent extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => StaticContentType::class,
        ];
    }
}
