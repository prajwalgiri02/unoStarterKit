<?php

declare(strict_types=1);

namespace App\Http\Requests\Concerns;

use App\Enums\DevicePlatform;
use App\Enums\DeviceTokenType;
use Illuminate\Validation\Rule;

trait ValidatesDevice
{
    /**
     * @return array<string, mixed>
     */
    protected function deviceRules(bool $required = false): array
    {
        return [
            'device_id' => [$required ? 'required' : 'required_with:device_token', 'string', 'max:255'],
            'device_token' => [$required ? 'required' : 'required_with:device_id', 'string', 'max:4096'],
            'token_type' => ['nullable', Rule::enum(DeviceTokenType::class)],
            'platform' => ['nullable', Rule::enum(DevicePlatform::class)],
            'device_name' => ['nullable', 'string', 'max:255'],
            'app_version' => ['nullable', 'string', 'max:50'],
        ];
    }

    /**
     * @return array{device_id: string, device_token: string, token_type?: string|null, platform?: string|null, device_name?: string|null, app_version?: string|null}|null
     */
    public function device(): ?array
    {
        $device = $this->safe()->only([
            'device_id',
            'device_token',
            'token_type',
            'platform',
            'device_name',
            'app_version',
        ]);

        return isset($device['device_id'], $device['device_token']) ? $device : null;
    }
}
