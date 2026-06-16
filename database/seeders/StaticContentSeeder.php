<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\StaticContentType;
use App\Models\StaticContent;
use Illuminate\Database\Seeder;

class StaticContentSeeder extends Seeder
{
    public function run(): void
    {
        foreach (StaticContentType::cases() as $type) {
            StaticContent::updateOrCreate(
                ['type' => $type->value],
                [
                    'title' => $type->label(),
                    'description' => '',
                ],
            );
        }
    }
}
