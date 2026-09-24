<?php

declare(strict_types=1);

use Installer\Installer;
use Installer\Prompter;

$basePath = dirname(__DIR__);

foreach (['InstallAborted', 'EnvEditor', 'ModuleRemover', 'Prompter', 'Installer'] as $class) {
    require_once __DIR__.'/src/'.$class.'.php';
}

$only = null;
$finishOnly = false;
$fromComposer = false;

foreach (array_slice($argv, 1) as $argument) {
    if (str_starts_with($argument, '--only=')) {
        $only = array_values(array_filter(array_map('trim', explode(',', substr($argument, 7)))));
    } elseif ($argument === '--finish') {
        $finishOnly = true;
    } elseif ($argument === '--from-composer') {
        $fromComposer = true;
    }
}

$installer = new Installer($basePath, require __DIR__.'/config.php', Prompter::forTerminal());

exit($installer->run($only, $finishOnly, $fromComposer));
