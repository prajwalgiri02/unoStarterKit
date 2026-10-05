<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AdminUser extends Seeder
{
    public function run(): void
    {
        $email = config('users.admin.email');

        if (blank($email)) {
            $this->command?->warn('ADMIN_EMAIL is not set, so no admin account was created. Run "php artisan uno:install" or set ADMIN_EMAIL and ADMIN_PASSWORD in .env, then seed again.');

            return;
        }

        $user = User::firstOrNew(['email' => $email]);

        if (! $user->exists) {
            $password = config('users.admin.password');

            if (blank($password)) {
                $password = Str::password(16, symbols: false);

                $this->command?->warn("Generated admin password for {$email}: {$password}");
                $this->command?->warn('It is shown once. Change it after the first login.');
            }

            $user->password = $password;
        }

        $user->forceFill([
            'name' => $user->name ?: 'Admin',
            'approved_at' => $user->approved_at ?? now(),
        ])->save();

        $user->syncRoles(['admin']);
    }
}
