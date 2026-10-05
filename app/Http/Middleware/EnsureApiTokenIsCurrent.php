<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\JWTGuard;
use Symfony\Component\HttpFoundation\Response;

class EnsureApiTokenIsCurrent
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->bearerToken() === null) {
            return $next($request);
        }

        /** @var JWTGuard $guard */
        $guard = auth('api');
        $user = $guard->user();

        if ($user instanceof User && (int) $guard->getPayload()->get('tv') !== (int) $user->token_version) {
            throw new AuthenticationException('Unauthenticated.', ['api']);
        }

        return $next($request);
    }
}
