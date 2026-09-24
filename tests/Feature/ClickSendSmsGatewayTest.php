<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Contracts\SmsGateway;
use App\Services\Sms\ClickSendSmsGateway;
use App\Services\Sms\LogSmsGateway;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Tests\TestCase;

class ClickSendSmsGatewayTest extends TestCase
{
    public function test_log_driver_is_used_by_default(): void
    {
        config(['services.sms.driver' => 'log']);

        $this->assertInstanceOf(LogSmsGateway::class, app(SmsGateway::class));
    }

    public function test_clicksend_driver_sends_the_sms(): void
    {
        $this->useClickSend();

        Http::fake([
            'rest.clicksend.com/*' => Http::response([
                'response_code' => 'SUCCESS',
                'data' => ['messages' => [['status' => 'SUCCESS']]],
            ]),
        ]);

        app(SmsGateway::class)->send('0412345678', 'Your code is 123456');

        Http::assertSent(fn (Request $request): bool => $request->url() === 'https://rest.clicksend.com/v3/sms/send'
            && $request->hasHeader('Authorization', 'Basic '.base64_encode('user:secret'))
            && $request['messages'][0]['to'] === '0412345678'
            && $request['messages'][0]['body'] === 'Your code is 123456'
            && $request['messages'][0]['from'] === 'GroceryGo'
            && $request['messages'][0]['country'] === 'AU');
    }

    public function test_rejected_message_throws(): void
    {
        $this->useClickSend();

        Http::fake([
            'rest.clicksend.com/*' => Http::response([
                'response_code' => 'SUCCESS',
                'data' => ['messages' => [['status' => 'INVALID_RECIPIENT']]],
            ]),
        ]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('INVALID_RECIPIENT');

        app(SmsGateway::class)->send('0400000000', 'Your code is 123456');
    }

    public function test_missing_credentials_throw_a_clear_error(): void
    {
        config([
            'services.sms.driver' => 'clicksend',
            'services.clicksend.username' => null,
            'services.clicksend.api_key' => null,
        ]);

        Http::fake();

        $this->expectExceptionMessage('CLICKSEND_USERNAME or CLICKSEND_API_KEY is missing');

        app(SmsGateway::class)->send('0412345678', 'Your code is 123456');
    }

    private function useClickSend(): void
    {
        config([
            'services.sms.driver' => 'clicksend',
            'services.clicksend.username' => 'user',
            'services.clicksend.api_key' => 'secret',
            'services.clicksend.from' => 'GroceryGo',
            'services.clicksend.country' => 'AU',
        ]);

        $this->assertInstanceOf(ClickSendSmsGateway::class, app(SmsGateway::class));
    }
}
