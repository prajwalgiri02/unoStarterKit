<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandlePrecognitiveRequests
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->header('Precognition') !== 'true') {
            return $next($request);
        }

        return response()->noContent()->header('Precognition', 'true');
    }
}
