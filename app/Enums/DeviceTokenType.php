<?php

declare(strict_types=1);

namespace App\Enums;

enum DeviceTokenType: string
{
    case FCM = 'fcm';
    case APNS = 'apns';
}
