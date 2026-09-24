<?php

declare(strict_types=1);

namespace App\Services\Sms;

use App\Contracts\SmsGateway;
use Illuminate\Support\Facades\Http;
use RuntimeException;

final class ClickSendSmsGateway implements SmsGateway
{
    private const ENDPOINT = 'https://rest.clicksend.com/v3/sms/send';

    public function __construct(
        private readonly ?string $username,
        private readonly ?string $apiKey,
        private readonly ?string $from = null,
        private readonly ?string $country = null,
    ) {}

    public function send(string $to, string $message): void
    {
        if (blank($this->username) || blank($this->apiKey)) {
            throw new RuntimeException('ClickSend is enabled but CLICKSEND_USERNAME or CLICKSEND_API_KEY is missing.');
        }

        $response = Http::withBasicAuth($this->username, $this->apiKey)
            ->acceptJson()
            ->timeout(15)
            ->post(self::ENDPOINT, [
                'messages' => [array_filter([
                    'source' => 'laravel',
                    'to' => $to,
                    'body' => $message,
                    'from' => $this->from,
                    'country' => $this->country,
                ])],
            ])
            ->throw();

        $status = $response->json('data.messages.0.status');

        if ($status !== 'SUCCESS') {
            throw new RuntimeException("ClickSend rejected the SMS to {$to}: ".($status ?? $response->json('response_code', 'UNKNOWN')));
        }
    }
}
