<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Require admin approval for new users
    |--------------------------------------------------------------------------
    |
    | When enabled, newly registered users must be approved by an admin before
    | they can sign in. Users with the "admin" role are always treated as
    | approved. Disable this for applications that do not need a review step.
    |
    */

    'require_approval' => env('USER_REQUIRE_APPROVAL', false),

    /*
    |--------------------------------------------------------------------------
    | Require new users to verify their email and/or mobile number
    |--------------------------------------------------------------------------
    |
    | When enabled, API users must enter a one-time code before a token is
    | issued. Phone codes are sent by SMS. Admins are never asked to verify.
    |
    */

    'verification' => [
        'email' => env('USER_REQUIRE_EMAIL_VERIFICATION', false),
        'phone' => env('USER_REQUIRE_PHONE_VERIFICATION', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | First admin account
    |--------------------------------------------------------------------------
    |
    | Created by the database seeder when no user with this email exists. A
    | blank password is replaced by a random one that is printed once. The
    | password is only used on creation; an existing account is never reset.
    |
    */

    'admin' => [
        'email' => env('ADMIN_EMAIL'),
        'password' => env('ADMIN_PASSWORD'),
    ],

];
