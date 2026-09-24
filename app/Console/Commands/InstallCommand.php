<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Installer\EnvEditor;

class InstallCommand extends Command
{
    protected $signature = 'uno:install
        {--only= : Reconfigure only these sections, comma separated (app, database, modules, auth, mail, storage, sms, firebase)}
        {--finish : Only run the post-install steps (key, migrations, seeding, npm)}';

    protected $description = 'Configure the starter kit: environment, modules and services';

    public function handle(): int
    {
        $command = [PHP_BINARY, base_path('installer/setup.php')];

        if (filled($this->option('only'))) {
            $command[] = '--only='.$this->option('only');
        }

        if ($this->option('finish')) {
            $command[] = '--finish';
        }

        $loaded = (new EnvEditor($this->laravel->environmentFilePath()))->keys();
        $environment = array_diff_key(getenv(), array_flip($loaded));

        $process = proc_open($command, [STDIN, STDOUT, STDERR], $pipes, base_path(), $environment);

        return is_resource($process) ? proc_close($process) : self::FAILURE;
    }
}
