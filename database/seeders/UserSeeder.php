<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Database\Factories\UserFactory;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $phases = [
            'active1' => fn (UserFactory $factory) => $factory->approved(),
            'active2' => fn (UserFactory $factory) => $factory->approved(),
            'active3' => fn (UserFactory $factory) => $factory->approved(),
            'email-unverified' => fn (UserFactory $factory) => $factory->approved()->unverified(),
            'phone-unverified' => fn (UserFactory $factory) => $factory->approved()->phoneUnverified(),
            'both-unverified' => fn (UserFactory $factory) => $factory->approved()->unverified()->phoneUnverified(),
            'awaiting-approval' => fn (UserFactory $factory) => $factory->pendingApproval(),
            'unverified-awaiting-approval' => fn (UserFactory $factory) => $factory->pendingApproval()->unverified()->phoneUnverified(),
            'blocked' => fn (UserFactory $factory) => $factory->approved()->state(['blocked_at' => now()]),
            'blocked-unverified' => fn (UserFactory $factory) => $factory->approved()->unverified()->state(['blocked_at' => now()]),
        ];

        $daysAgo = count($phases);

        foreach ($phases as $phase => $state) {
            $email = "{$phase}@example.com";
            $daysAgo--;

            if (User::where('email', $email)->exists()) {
                continue;
            }

            $state(User::factory())->create([
                'email' => $email,
                'password' => 'Test@123',
                'phone' => fake()->numerify('04########'),
                'location' => fake()->city(),
                'subscription_type' => fake()->randomElement(['free', 'premium']),
                'created_at' => now()->subDays($daysAgo),
            ])->syncRoles(['user']);
        }
    }
}
