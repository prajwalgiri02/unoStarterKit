<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUser extends Seeder
{
    public function run(): void
    {
        $user = User::updateOrCreate(
            [
                'email' => 'admin@appifany.com.au',
            ],
            [
                'name' => 'Admin',
                'password' => Hash::make('Test@123'),
                'approved_at' => now(),
            ],
        );

        $user->syncRoles(['admin']);
    }
}
