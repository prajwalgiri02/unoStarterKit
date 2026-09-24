<?php

namespace App\Providers;

use App\Contracts\SmsGateway;
use App\Services\Sms\ClickSendSmsGateway;
use App\Services\Sms\LogSmsGateway;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(SmsGateway::class, fn (): SmsGateway => match (config('services.sms.driver')) {
            'clicksend' => new ClickSendSmsGateway(
                username: config('services.clicksend.username'),
                apiKey: config('services.clicksend.api_key'),
                from: config('services.clicksend.from'),
                country: config('services.clicksend.country'),
            ),
            default => new LogSmsGateway,
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Password::defaults(function (): Password {
            return Password::min(8);
        });
    }
}
