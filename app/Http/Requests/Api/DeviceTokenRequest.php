<?php

declare(strict_types=1);

namespace App\Http\Requests\Api;

use App\Http\Requests\Concerns\ValidatesDevice;
use Illuminate\Foundation\Http\FormRequest;

class DeviceTokenRequest extends FormRequest
{
    use ValidatesDevice;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return $this->deviceRules(required: true);
    }
}
