<?php

return [
    'defaults' => [
        'length' => (int) env('OTP_LENGTH', 6),
        'expires_in_minutes' => 10,
        'max_attempts' => 5,
        'max_resends' => 3,
        'resend_cooldown_seconds' => 60,
    ],

    /*
    |--------------------------------------------------------------------------
    | OTP delivery channels
    |--------------------------------------------------------------------------
    |
    | Control how OTP codes are delivered. Supported values:
    | - "mail"  : email only
    | - "sms"   : SMS only
    | - "both"  : email and SMS
    |
    | You may also pass an array such as ["mail", "sms"].
    | Purpose-specific delivery settings below override this default.
    |
    */

    'delivery' => [
        'channels' => env('OTP_DELIVERY_CHANNELS', 'mail'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Purpose-specific settings
    |--------------------------------------------------------------------------
    |
    | These settings override the defaults for a particular OTP purpose.
    |
    */

    'purposes' => [
        'password_reset' => [
            'expires_in_minutes' => 10,
            'delivery' => [
                'channels' => env('OTP_DELIVERY_CHANNELS', 'mail'),
            ],
        ],

        'password_change' => [
            'expires_in_minutes' => 5,
        ],

        'email_verification' => [
            'expires_in_minutes' => 0.5,
        ],

        'phone_verification' => [
            'expires_in_minutes' => 0.5,
            'delivery' => [
                'channels' => 'sms',
            ],
        ],
    ],
];
