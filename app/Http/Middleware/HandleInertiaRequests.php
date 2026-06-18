<?php

namespace App\Http\Middleware;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
                'success' => fn () => $request->session()->get('success') ?? $request->session()->get('status'),
                'error' => fn () => $request->session()->get('error'),
                'otp_required' => fn () => $request->session()->get('otp_required'),
                'otp_token' => fn () => $request->session()->get('otp_token'),
                'new_email' => fn () => $request->session()->get('new_email'),
                'seconds_remaining' => fn () => $request->session()->get('seconds_remaining'),
            ],
            'resendAvailableAt' => $request->routeIs(['cms.password.otp.*', 'cms.admin.settings.otp.*'])
                ? $this->resolveResendAvailableAt($request)
                : null,
        ];
    }

    private function resolveResendAvailableAt(Request $request): ?string
    {
        $candidates = array_filter([
            $request->attributes->get('resendAvailableAt'),
            $request->session()->get('resendAvailableAt'),
        ], fn (mixed $value): bool => is_string($value) && $value !== '');

        if ($candidates === []) {
            return null;
        }

        return collect($candidates)
            ->map(fn (string $timestamp): Carbon => Carbon::parse($timestamp))
            ->sortByDesc(fn (Carbon $timestamp): int => $timestamp->getTimestamp())
            ->first()
            ?->toIso8601String();
    }
}
