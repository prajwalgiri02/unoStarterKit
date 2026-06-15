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

];
