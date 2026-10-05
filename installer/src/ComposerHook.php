<?php

declare(strict_types=1);

namespace Installer;

use Composer\Script\Event;

final class ComposerHook
{
    public static function install(Event $event): bool
    {
        return self::run($event, finish: false);
    }

    public static function finish(Event $event): bool
    {
        return self::run($event, finish: true);
    }

    private static function run(Event $event, bool $finish): bool
    {
        $base = dirname(__DIR__, 2);
        $installer = new Installer($base, require $base.'/installer/config.php', Prompter::forComposer($event->getIO()));

        return $installer->run(finishOnly: $finish, fromComposer: true) === 0;
    }
}
