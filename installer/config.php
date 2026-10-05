<?php

/*
|--------------------------------------------------------------------------
| Starter kit installer (php artisan uno:install)
|--------------------------------------------------------------------------
|
| fixed     Written to .env on every full install, never asked.
| modules   Sidebar modules. Unselected modules are deleted: every path in
|           "paths" plus every region wrapped in module markers in shared
|           files. The first path is used to detect whether it is installed.
| sections  Questions. "optional" sections are offered in a checklist,
|           "required_when" forces an optional section on; a list of
|           condition sets forces it when any one of them matches.
| steps     Run after .env is written, each in a fresh process.
|
| ask       (top level) set modules or services to false to skip that question:
|           every module stays installed, optional services are not asked.
|
| Field options: ask (false uses the default without asking), default_from
| (default is the snake_case of another answer), type (text|password|select|
| confirm|file), label, default,
| default_by [FIELD, [value => default]], options, required, rules,
| when [FIELD => value|values], when_module, hidden_value,
| remove_when_hidden, store and hint (file).
|
*/

return [

    'ask' => [
        'modules' => false,
        'services' => false,
    ],

    'fixed' => [
        'APP_ENV' => 'local',
        'APP_DEBUG' => true,
        'SESSION_DRIVER' => 'database',
        'QUEUE_CONNECTION' => 'database',
        'CACHE_STORE' => 'database',
    ],

    'modules' => [

        'user_manager' => [
            'label' => 'User Manager - view, edit, block and approve users',
            'paths' => [
                'routes/cms/user-manager.php',
                'routes/cms/users.php',
                'app/Http/Controllers/cms/UserManagerController.php',
                'app/Http/Controllers/cms/Auth/PendingUserController.php',
                'app/Http/Requests/UserManager',
                'app/Services/UserApprovalService.php',
                'resources/js/Pages/cms/user-management',
                'resources/js/Components/users',
                'resources/js/Pages/types/cms/user.ts',
                'tests/Feature/UserManagerTest.php',
            ],
        ],

        'support' => [
            'label' => 'Messages & Support (contact-us tickets)',
            'paths' => [
                'routes/cms/messages.php',
                'routes/api/support.php',
                'app/Enums/SupportTicketStatus.php',
                'app/Enums/SupportTicketType.php',
                'app/Http/Controllers/Api/SupportTicketController.php',
                'app/Http/Controllers/cms/SupportTicketController.php',
                'app/Http/Requests/Api/ContactUsRequest.php',
                'app/Http/Resources/SupportTicketResource.php',
                'app/Models/SupportTicket.php',
                'app/Services/SupportTicketService.php',
                'database/migrations/2026_06_16_091500_create_support_tickets_table.php',
                'database/seeders/SupportTicketSeeder.php',
                'resources/js/Pages/cms/messages-and-support',
                'resources/js/Components/messages',
                'resources/js/Pages/types/cms/message.ts',
            ],
        ],

        'static_content' => [
            'label' => 'Static Content - terms and privacy policy',
            'paths' => [
                'routes/cms/static-content.php',
                'routes/api/static-content.php',
                'app/Enums/StaticContentType.php',
                'app/Http/Controllers/Api/StaticContentController.php',
                'app/Http/Controllers/cms/StaticContentController.php',
                'app/Http/Requests/StaticContent',
                'app/Http/Resources/StaticContentResource.php',
                'app/Models/StaticContent.php',
                'app/Services/StaticContentService.php',
                'database/migrations/2026_06_15_104548_create_static_contents_table.php',
                'database/seeders/StaticContentSeeder.php',
                'resources/js/Pages/cms/static-content',
            ],
        ],

        'faqs' => [
            'label' => 'FAQs',
            'paths' => [
                'routes/cms/faq.php',
                'routes/api/faqs.php',
                'app/Http/Controllers/Api/FaqController.php',
                'app/Http/Controllers/cms/FaqController.php',
                'app/Http/Requests/Faq',
                'app/Http/Resources/FaqResource.php',
                'app/Models/Faq.php',
                'database/migrations/2026_06_16_035619_create_faqs_table.php',
                'resources/js/Pages/cms/faq',
                'resources/js/Pages/types/cms/faq.ts',
            ],
        ],

        'notifications' => [
            'label' => 'Notifications - broadcast and in-app inbox',
            'paths' => [
                'routes/cms/notifications.php',
                'routes/api/notification.php',
                'app/Http/Controllers/Api/NotificationController.php',
                'app/Http/Controllers/cms/NotificationController.php',
                'app/Enums/NotificationType.php',
                'app/Http/Requests/cms/StoreNotificationRequest.php',
                'app/Http/Resources/NotificationResource.php',
                'app/Jobs/BroadcastNotificationJob.php',
                'app/Models/Notification.php',
                'app/Models/UserNotification.php',
                'app/Policies/UserNotificationPolicy.php',
                'app/Services/AdminAlertService.php',
                'app/Services/NotificationBroadcastService.php',
                'app/Services/UserNotificationService.php',
                'database/migrations/2026_06_16_062946_create_notifications_table.php',
                'database/migrations/2026_06_16_063913_create_user_notifications_table.php',
                'database/migrations/2026_10_05_000000_add_type_to_notifications_table.php',
                'resources/js/Pages/cms/broadcast-notification',
                'resources/js/Components/notifications',
                'resources/js/Pages/types/cms/notification.ts',
                'tests/Feature/PushNotificationTest.php',
                'tests/Feature/AdminAlertTest.php',
            ],
        ],

    ],

    'sections' => [

        'app' => [
            'label' => 'Application',
            'fields' => [
                'APP_NAME' => ['type' => 'text', 'label' => 'Application name', 'required' => true],
                'APP_URL' => ['ask' => false, 'type' => 'text', 'label' => 'Application URL', 'default' => 'http://localhost', 'required' => true, 'rules' => 'url'],
            ],
        ],

        'database' => [
            'label' => 'Database',
            'fields' => [
                'DB_CONNECTION' => ['type' => 'select', 'label' => 'Database driver', 'default' => 'mysql', 'options' => [
                    'mysql' => 'MySQL / MariaDB',
                    'pgsql' => 'PostgreSQL',
                    'sqlite' => 'SQLite',
                ]],
                'DB_HOST' => ['ask' => false, 'type' => 'text', 'label' => 'Database host', 'default' => '127.0.0.1', 'required' => true, 'when' => ['DB_CONNECTION' => ['mysql', 'pgsql']], 'remove_when_hidden' => true],
                'DB_PORT' => ['ask' => false, 'type' => 'text', 'label' => 'Database port', 'default_by' => ['DB_CONNECTION', ['mysql' => '3306', 'pgsql' => '5432']], 'required' => true, 'rules' => 'integer', 'when' => ['DB_CONNECTION' => ['mysql', 'pgsql']], 'remove_when_hidden' => true],
                'DB_DATABASE' => ['ask' => false, 'default_from' => 'APP_NAME', 'type' => 'text', 'label' => 'Database name', 'required' => true, 'rules' => 'regex:/^[A-Za-z0-9_]+$/', 'when' => ['DB_CONNECTION' => ['mysql', 'pgsql']], 'remove_when_hidden' => true],
                'DB_USERNAME' => ['ask' => false, 'type' => 'text', 'label' => 'Database username', 'default' => 'root', 'when' => ['DB_CONNECTION' => ['mysql', 'pgsql']], 'remove_when_hidden' => true],
                'DB_PASSWORD' => ['ask' => false, 'type' => 'password', 'label' => 'Database password', 'when' => ['DB_CONNECTION' => ['mysql', 'pgsql']], 'remove_when_hidden' => true],
            ],
        ],

        'auth' => [
            'label' => 'Authentication',
            'fields' => [
                'USER_REQUIRE_APPROVAL' => ['type' => 'confirm', 'label' => 'Require admin approval for new users?', 'default' => false, 'when_module' => 'user_manager', 'hidden_value' => false],
                'USER_REQUIRE_EMAIL_VERIFICATION' => ['type' => 'confirm', 'label' => 'Require new users to verify their email with a code?', 'default' => false],
                'USER_REQUIRE_PHONE_VERIFICATION' => ['type' => 'confirm', 'label' => 'Require new users to verify their mobile number with an SMS code?', 'default' => false],
                'OTP_DELIVERY_CHANNELS' => ['type' => 'select', 'label' => 'OTP delivery channel', 'default' => 'mail', 'options' => [
                    'mail' => 'Email',
                    'sms' => 'SMS',
                    'both' => 'Email and SMS',
                ]],
            ],
        ],

        'mail' => [
            'label' => 'Mail',
            'optional' => true,
            'default' => true,
            'fields' => [
                'MAIL_MAILER' => ['type' => 'select', 'label' => 'Mailer', 'default' => 'smtp', 'options' => [
                    'smtp' => 'SMTP (Gmail, Mailtrap, etc.)',
                    'ses' => 'Amazon SES',
                    'log' => 'Log only (development)',
                ]],
                'MAIL_HOST' => ['type' => 'text', 'label' => 'SMTP host', 'default' => 'smtp.gmail.com', 'required' => true, 'when' => ['MAIL_MAILER' => 'smtp']],
                'MAIL_PORT' => ['type' => 'text', 'label' => 'SMTP port', 'default' => '587', 'rules' => 'integer', 'when' => ['MAIL_MAILER' => 'smtp']],
                'MAIL_USERNAME' => ['type' => 'text', 'label' => 'SMTP username', 'when' => ['MAIL_MAILER' => 'smtp']],
                'MAIL_PASSWORD' => ['type' => 'password', 'label' => 'SMTP password / app password', 'when' => ['MAIL_MAILER' => 'smtp']],
                'MAIL_FROM_ADDRESS' => ['type' => 'text', 'label' => 'From address', 'required' => true, 'rules' => 'email'],
            ],
        ],

        'storage' => [
            'label' => 'File uploads (local disk or Amazon S3)',
            'optional' => true,
            'default' => false,
            'fields' => [
                'UPLOAD_DISK' => ['type' => 'select', 'label' => 'Store uploads on', 'default' => 's3', 'options' => [
                    'public' => 'Local disk (storage/app/public)',
                    's3' => 'Amazon S3',
                ]],
                'AWS_ACCESS_KEY_ID' => ['type' => 'text', 'label' => 'AWS access key ID', 'required' => true, 'when' => ['UPLOAD_DISK' => 's3']],
                'AWS_SECRET_ACCESS_KEY' => ['type' => 'password', 'label' => 'AWS secret access key', 'required' => true, 'when' => ['UPLOAD_DISK' => 's3']],
                'AWS_DEFAULT_REGION' => ['type' => 'text', 'label' => 'AWS region', 'default' => 'ap-southeast-2', 'required' => true, 'when' => ['UPLOAD_DISK' => 's3']],
                'AWS_BUCKET' => ['type' => 'text', 'label' => 'S3 bucket', 'required' => true, 'when' => ['UPLOAD_DISK' => 's3']],
            ],
        ],

        'sms' => [
            'label' => 'SMS (ClickSend)',
            'optional' => true,
            'default' => false,
            'required_when' => [
                ['OTP_DELIVERY_CHANNELS' => ['sms', 'both']],
                ['USER_REQUIRE_PHONE_VERIFICATION' => [true, 'true']],
            ],
            'fields' => [
                'SMS_DRIVER' => ['type' => 'select', 'label' => 'SMS provider', 'default' => 'clicksend', 'options' => [
                    'clicksend' => 'ClickSend',
                    'log' => 'Log only (development)',
                ]],
                'CLICKSEND_USERNAME' => ['type' => 'text', 'label' => 'ClickSend username', 'required' => true, 'when' => ['SMS_DRIVER' => 'clicksend']],
                'CLICKSEND_API_KEY' => ['type' => 'password', 'label' => 'ClickSend API key', 'required' => true, 'when' => ['SMS_DRIVER' => 'clicksend']],
                'CLICKSEND_FROM' => ['type' => 'text', 'label' => 'Sender ID or number', 'when' => ['SMS_DRIVER' => 'clicksend']],
                'CLICKSEND_COUNTRY' => ['type' => 'text', 'label' => 'Default country code for local numbers', 'default' => 'AU', 'when' => ['SMS_DRIVER' => 'clicksend']],
            ],
        ],

        'firebase' => [
            'label' => 'Firebase push notifications',
            'optional' => true,
            'default' => false,
            'fields' => [
                'FIREBASE_CREDENTIALS' => [
                    'type' => 'file',
                    'label' => 'Path to the Firebase service account JSON',
                    'hint' => 'Firebase console > Project settings > Service accounts > Generate new private key',
                    'required' => true,
                    'store' => 'storage/app/private/firebase/credentials.json',
                ],
            ],
        ],

    ],

    'steps' => [
        ['label' => 'Generating application key', 'command' => ['php', 'artisan', 'key:generate', '--force'], 'unless_env' => 'APP_KEY'],
        ['label' => 'Generating JWT secret', 'command' => ['php', 'artisan', 'jwt:secret', '--force'], 'unless_env' => 'JWT_SECRET'],
        ['label' => 'Linking storage', 'command' => ['php', 'artisan', 'storage:link', '--force']],
        ['label' => 'Running migrations', 'command' => ['php', 'artisan', 'migrate', '--force']],
        ['label' => 'Seeding roles, admin user and content', 'command' => ['php', 'artisan', 'db:seed', '--force']],
        ['id' => 'npm_install', 'label' => 'Installing npm packages', 'command' => ['npm', 'install'], 'confirm' => 'Install frontend dependencies (npm install) after setup?'],
        ['id' => 'npm_build', 'label' => 'Building frontend assets', 'command' => ['npm', 'run', 'build'], 'confirm' => 'Build frontend assets (npm run build) after that?'],
    ],

];
