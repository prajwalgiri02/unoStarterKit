<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\DeviceTokenType;
use App\Models\User;
use Kreait\Firebase\Contract\Messaging;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;

class PushNotificationService
{
    private const MAX_TOKENS_PER_REQUEST = 500;

    public function __construct(
        private readonly DeviceTokenService $deviceTokens,
    ) {}

    public function isEnabled(): bool
    {
        $project = config('firebase.default');
        $credentials = config("firebase.projects.{$project}.credentials");

        if (! is_string($credentials) || trim($credentials) === '') {
            return false;
        }

        if (str_starts_with(trim($credentials), '{')) {
            return true;
        }

        return is_file($credentials) || is_file(base_path($credentials));
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function sendToUser(User $user, string $title, string $body, array $data = []): void
    {
        $tokens = $user->firebaseTokens()
            ->where('token_type', DeviceTokenType::FCM)
            ->pluck('device_token')
            ->all();

        $this->sendToTokens($tokens, $title, $body, $data);
    }

    /**
     * @param  list<string>  $tokens
     * @param  array<string, mixed>  $data
     */
    public function sendToTokens(array $tokens, string $title, string $body, array $data = []): void
    {
        $tokens = array_values(array_unique(array_filter($tokens)));

        if ($tokens === [] || ! $this->isEnabled()) {
            return;
        }

        $message = CloudMessage::new()
            ->withNotification(Notification::create($title, $body))
            ->withData($this->stringifyData($data))
            ->withDefaultSounds();

        $messaging = app(Messaging::class);

        foreach (array_chunk($tokens, self::MAX_TOKENS_PER_REQUEST) as $chunk) {
            $report = $messaging->sendMulticast($message, $chunk);

            $this->deviceTokens->removeTokens([
                ...$report->invalidTokens(),
                ...$report->unknownTokens(),
            ]);
        }
    }

    /**
     * FCM only accepts string values in the data payload.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, string>
     */
    private function stringifyData(array $data): array
    {
        return collect($data)
            ->reject(fn (mixed $value): bool => $value === null)
            ->map(fn (mixed $value): string => is_scalar($value)
                ? (is_bool($value) ? ($value ? 'true' : 'false') : (string) $value)
                : (string) json_encode($value))
            ->all();
    }
}
