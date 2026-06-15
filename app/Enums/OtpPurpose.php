<?php

namespace App\Enums;

enum OtpPurpose: string
{
    case PASSWORD_RESET = 'password_reset';
    case PASSWORD_CHANGE = 'password_change';
    case EMAIL_VERIFICATION = 'email_verification';
    case PHONE_VERIFICATION = 'phone_verification';
    case LOGIN_VERIFICATION = 'login_verification';
}
