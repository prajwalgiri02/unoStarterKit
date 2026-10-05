<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use App\Http\Requests\Concerns\ValidatesDevice;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    use ValidatesDevice;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'lowercase', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
            ...$this->deviceRules(),
        ];
    }

    /**
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $authenticated = Auth::attempt(
            $this->only('email', 'password'),
            $this->boolean('remember'),
        );

        if (! $authenticated) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        $user = Auth::user();

        if ($user !== null && ! $user->hasRole('admin')) {
            Auth::logout();

            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        if ($user !== null && $user->isPendingApproval()) {
            Auth::logout();

            throw ValidationException::withMessages([
                'email' => __('auth.approval_pending'),
            ]);
        }

        if ($user !== null && $user->isBlocked()) {
            Auth::logout();

            throw ValidationException::withMessages([
                'email' => __('auth.blocked'),
            ]);
        }
    }
}
