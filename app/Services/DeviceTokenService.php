<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\FirebaseTokens;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DeviceTokenService
{
    /**
     * @param array{
     *     device_id: string,
     *     device_token: string,
     *     token_type?: string|null,
     *     platform?: string|null,
     *     device_name?: string|null,
     *     app_version?: string|null,
     * } $device
     */
    public function register(User $user, array $device): FirebaseTokens
    {
        return DB::transaction(function () use ($user, $device): FirebaseTokens {
            FirebaseTokens::query()
                ->where('device_token', $device['device_token'])
                ->where('device_id', '!=', $device['device_id'])
                ->delete();

            return FirebaseTokens::query()->updateOrCreate(
                ['device_id' => $device['device_id']],
                [
                    'user_id' => $user->id,
                    'device_token' => $device['device_token'],
                    'token_type' => $device['token_type'] ?? 'fcm',
                    'platform' => $device['platform'] ?? null,
                    'device_name' => $device['device_name'] ?? null,
                    'app_version' => $device['app_version'] ?? null,
                    'last_used_at' => now(),
                ],
            );
        });
    }

    public function removeForDevice(User $user, string $deviceId): void
    {
        $user->firebaseTokens()->where('device_id', $deviceId)->delete();
    }

    /**
     * @param  list<string>  $tokens
     */
    public function removeTokens(array $tokens): void
    {
        if ($tokens !== []) {
            FirebaseTokens::query()->whereIn('device_token', $tokens)->delete();
        }
    }
}
