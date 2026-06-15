<?php

namespace App\Enums;

enum OtpChannel: string
{
    case EMAIL = 'email';
    case SMS = 'sms';
}
