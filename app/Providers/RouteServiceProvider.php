<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    public const HOME = '/';

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->routes(function () {
            Route::middleware('web')
                ->prefix('cms')
                ->name('cms.')
                ->group(function () {
                    foreach (glob(base_path('routes/cms/*.php')) as $file) {
                        require $file;
                    }
                });
        });
    }
}
