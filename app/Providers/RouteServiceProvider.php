<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    public const HOME = '/cms/dashboard';

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->routes(function () {
            Route::middleware('api')
                ->prefix('api')
                ->name('api.')
                ->group(function () {
                    foreach (glob(base_path('routes/api/*.php')) as $file) {
                        require $file;
                    }
                });

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
