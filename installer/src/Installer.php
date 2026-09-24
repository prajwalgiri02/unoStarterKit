<?php

declare(strict_types=1);

namespace Installer;

use Closure;
use PDO;
use Throwable;

final class Installer
{
    private const STATE_FILE = '.uno-install.json';

    private EnvEditor $env;

    private ModuleRemover $modules;

    /** @var array<string, mixed> */
    private array $answers = [];

    /** @var list<string> */
    private array $keptModules = [];

    /**
     * @param  array<string, mixed>  $config
     * @param  Closure(list<string>, string): array{0: int, 1: string}|null  $runner
     */
    public function __construct(
        private readonly string $basePath,
        private readonly array $config,
        private readonly Prompter $io,
        private readonly ?Closure $runner = null,
    ) {
        $this->env = new EnvEditor($this->envPath());
        $this->modules = new ModuleRemover($basePath);
    }

    /**
     * @param  list<string>|null  $only
     */
    public function run(?array $only = null, bool $finishOnly = false, bool $fromComposer = false): int
    {
        try {
            if ($finishOnly) {
                $choices = $this->loadState();

                if ($choices === null && $fromComposer) {
                    $this->io->warning('Setup has not been completed yet. Run it now: php installer/setup.php');

                    return 0;
                }

                return $this->finish($choices ?? $this->askSteps());
            }

            return $this->ask($only, $fromComposer);
        } catch (InstallAborted $exception) {
            $this->io->line();
            $this->io->error($exception->getMessage());

            if ($fromComposer) {
                $this->io->warning('Setup was skipped so Composer can finish installing. Run it in your terminal: php installer/setup.php');

                return 0;
            }

            $this->io->warning('Run the installer again: php installer/setup.php');

            return 1;
        }
    }

    /**
     * @param  list<string>|null  $only
     */
    private function ask(?array $only, bool $fromComposer): int
    {
        $valid = ['modules', ...array_keys($this->config['sections'])];
        $unknown = $only === null ? [] : array_diff($only, $valid);

        if ($unknown !== []) {
            $this->io->error('Unknown section(s): '.implode(', ', $unknown).'. Available: '.implode(', ', $valid).'.');

            return 1;
        }

        $this->ensureEnvFile();
        $this->io->line();
        $this->io->line($only === null ? ' unoStarterKit installer' : ' unoStarterKit: reconfigure '.implode(', ', $only));
        $this->io->line(' Press Enter to accept the value shown in [brackets].');

        $installed = $this->installedModules();
        $this->keptModules = $installed;

        if ($only === null || in_array('modules', $only, true)) {
            $this->keptModules = $this->askModules($installed);
        }

        $asked = $this->askSections($only);
        $choices = $only === null ? $this->askSteps() : [];
        $removed = array_values(array_diff($installed, $this->keptModules));

        if ($removed !== [] && ! $this->removeModules($removed)) {
            $this->keptModules = $installed;
        }

        $this->writeEnv($asked, fixed: $only === null);

        if ($only !== null) {
            $this->io->line();
            $this->io->success('Done. Only the selected sections were changed.');

            return 0;
        }

        if (is_file($this->basePath.'/vendor/autoload.php')) {
            return $this->finish($choices);
        }

        $this->saveState($choices);

        if ($fromComposer) {
            $this->io->line();
            $this->io->success('All answers saved. Dependencies install next, then setup finishes automatically.');
            $this->io->info('If it does not, run: php artisan uno:install --finish');

            return 0;
        }

        return $this->installDependencies() ? $this->finish($choices) : 1;
    }

    private function installDependencies(): bool
    {
        $this->io->heading('Installing packages');
        $this->io->info('All questions are answered. This step takes a few minutes.');
        $this->io->line();

        [$code] = $this->execute(['composer', 'install', '--no-interaction', '--prefer-dist'], stream: true);

        if ($code !== 0) {
            $this->io->error('composer install failed.');
            $this->io->warning('Fix the problem above, then run: composer install && php artisan uno:install --finish');

            return false;
        }

        $this->io->success('Composer packages installed.');

        return true;
    }

    /**
     * @param  list<string>  $command
     * @return array{0: int, 1: string}
     */
    private function execute(array $command, bool $stream = false): array
    {
        return ($this->runner ?? $this->defaultRunner(...))($command, $this->basePath, $stream);
    }

    private function ensureEnvFile(): void
    {
        if (! is_file($this->envPath()) && is_file($this->basePath.'/.env.example')) {
            copy($this->basePath.'/.env.example', $this->envPath());
            $this->env = new EnvEditor($this->envPath());
        }
    }

    /**
     * @return list<string>
     */
    private function installedModules(): array
    {
        return array_keys(array_filter(
            $this->config['modules'],
            fn (array $module): bool => $this->modules->isInstalled($module),
        ));
    }

    /**
     * @param  list<string>  $installed
     * @return list<string>
     */
    private function askModules(array $installed): array
    {
        $all = $this->config['modules'];
        $missing = array_diff(array_keys($all), $installed);

        if ($missing !== []) {
            $this->io->info('Already removed (the installer cannot add them back): '.implode(', ', array_map(fn (string $key): string => $all[$key]['label'], $missing)));
        }

        if ($installed === []) {
            return [];
        }

        $this->io->heading('Modules');
        $this->io->info('Dashboard and Settings are always included. Unselected modules are deleted from the code.');

        return array_values($this->io->multiselect(
            'Which sidebar modules does this project need?',
            array_map(fn (array $module): string => $module['label'], array_intersect_key($all, array_flip($installed))),
            $installed,
        ));
    }

    /**
     * @param  list<string>|null  $only
     * @return list<string>
     */
    private function askSections(?array $only): array
    {
        $sections = $this->config['sections'];
        $asked = [];

        foreach ($sections as $key => $section) {
            if (($section['optional'] ?? false) || ($only !== null && ! in_array($key, $only, true))) {
                continue;
            }

            $this->askSection($key, $section);
            $asked[] = $key;
        }

        foreach ($this->chooseOptionalSections($sections, $only) as $key) {
            $this->askSection($key, $sections[$key]);
            $asked[] = $key;
        }

        return $asked;
    }

    /**
     * @param  array<string, array<string, mixed>>  $sections
     * @param  list<string>|null  $only
     * @return list<string>
     */
    private function chooseOptionalSections(array $sections, ?array $only): array
    {
        $optional = array_filter($sections, fn (array $section): bool => $section['optional'] ?? false);

        if ($only !== null) {
            return array_values(array_intersect(array_keys($optional), $only));
        }

        $forced = array_keys(array_filter($optional, fn (array $section): bool => isset($section['required_when']) && $this->matches($section['required_when'])));
        $choices = array_diff_key($optional, array_flip($forced));

        foreach ($forced as $key) {
            $this->io->info("{$optional[$key]['label']} is required by your answers above.");
        }

        $chosen = [];

        if ($choices !== []) {
            $this->io->heading('Optional services');
            $this->io->info('Anything skipped can be added later with: php artisan uno:install --only=<section>');

            $chosen = $this->io->multiselect(
                'Which services do you want to configure now?',
                array_map(fn (array $section): string => $section['label'], $choices),
                array_keys(array_filter($choices, fn (array $section): bool => $section['default'] ?? false)),
            );
        }

        return array_values(array_filter(
            array_keys($optional),
            fn (string $key): bool => in_array($key, $forced, true) || in_array($key, $chosen, true),
        ));
    }

    /**
     * @param  array<string, mixed>  $section
     */
    private function askSection(string $key, array $section): void
    {
        do {
            $this->io->heading($section['label']);

            foreach ($section['fields'] as $envKey => $field) {
                $this->askField($envKey, $field);
            }
        } while ($key === 'database' && ! $this->databaseReady());
    }

    /**
     * @param  array<string, mixed>  $field
     */
    private function askField(string $key, array $field): void
    {
        if (! $this->visible($field)) {
            if (array_key_exists('hidden_value', $field)) {
                $this->answers[$key] = $field['hidden_value'];
            } elseif ($field['remove_when_hidden'] ?? false) {
                $this->answers[$key] = null;
            }

            return;
        }

        $current = $this->env->get($key);
        $default = $current !== null && $current !== '' ? $current : $this->defaultFor($field);
        $label = $field['label'];
        $required = (bool) ($field['required'] ?? false);
        $validate = fn (string $value): ?string => $this->checkRules($label, $field['rules'] ?? null, $value);

        $this->answers[$key] = match ($field['type'] ?? 'text') {
            'select' => $this->io->select($label, $field['options'], array_key_exists((string) $default, $field['options']) ? (string) $default : null),
            'confirm' => $this->io->confirm($label, filter_var($default ?? false, FILTER_VALIDATE_BOOLEAN)),
            'password' => $this->io->password($label, $required, $current, $validate),
            'file' => $this->askFile($field, $current),
            default => $this->io->text($label, $default === null ? null : (string) $default, $required, $validate),
        };
    }

    /**
     * @param  array<string, mixed>  $field
     */
    private function askFile(array $field, ?string $current): string
    {
        if (isset($field['hint'])) {
            $this->io->info($field['hint']);
        }

        $path = $this->io->text(
            $field['label'],
            $current,
            (bool) ($field['required'] ?? false),
            fn (string $value): ?string => $this->serviceAccountError($value),
        );

        $source = $this->resolvePath($path);
        $target = $this->basePath.'/'.$field['store'];

        if (! is_dir(dirname($target))) {
            mkdir(dirname($target), 0777, true);
        }

        if (realpath($source) !== realpath($target)) {
            copy($source, $target);
        }

        $projectId = json_decode((string) file_get_contents($target), true)['project_id'] ?? 'unknown';
        $this->io->success("Firebase project: {$projectId}. Credentials copied to {$field['store']}.");

        return $field['store'];
    }

    private function serviceAccountError(string $value): ?string
    {
        $path = $this->resolvePath($value);

        if (! is_file($path)) {
            return 'File not found.';
        }

        $json = json_decode((string) file_get_contents($path), true);

        if (! is_array($json) || ($json['type'] ?? null) !== 'service_account' || empty($json['private_key']) || empty($json['project_id'])) {
            return 'This is not a Firebase service account JSON file.';
        }

        return null;
    }

    private function resolvePath(string $value): string
    {
        $path = trim($value, " \t\"'");

        return file_exists($path) ? $path : $this->basePath.'/'.$path;
    }

    private function checkRules(string $label, ?string $rules, string $value): ?string
    {
        if ($rules === null || $value === '') {
            return null;
        }

        $name = strtolower($label);

        foreach (explode('|', $rules) as $rule) {
            $error = match (true) {
                $rule === 'url' => filter_var($value, FILTER_VALIDATE_URL) === false ? "The {$name} must be a valid URL, for example http://myapp.test." : null,
                $rule === 'email' => filter_var($value, FILTER_VALIDATE_EMAIL) === false ? "The {$name} must be a valid email address." : null,
                $rule === 'integer' => ctype_digit($value) ? null : "The {$name} must be a whole number.",
                str_starts_with($rule, 'regex:') => preg_match(substr($rule, 6), $value) === 1 ? null : "The {$name} has an invalid format (letters, numbers and underscores only).",
                default => null,
            };

            if ($error !== null) {
                return $error;
            }
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $field
     */
    private function visible(array $field): bool
    {
        if (isset($field['when_module']) && ! in_array($field['when_module'], $this->keptModules, true)) {
            return false;
        }

        return ! isset($field['when']) || $this->matches($field['when']);
    }

    /**
     * @param  array<string, string|list<string>>  $conditions
     */
    private function matches(array $conditions): bool
    {
        foreach ($conditions as $key => $expected) {
            if (! in_array($this->current($key), (array) $expected, true)) {
                return false;
            }
        }

        return true;
    }

    private function current(string $key): mixed
    {
        return array_key_exists($key, $this->answers) ? $this->answers[$key] : $this->env->get($key);
    }

    /**
     * @param  array<string, mixed>  $field
     */
    private function defaultFor(array $field): mixed
    {
        if (isset($field['default_by'])) {
            [$dependsOn, $map] = $field['default_by'];

            return $map[$this->current($dependsOn)] ?? ($field['default'] ?? null);
        }

        return $field['default'] ?? null;
    }

    private function databaseReady(): bool
    {
        $driver = (string) $this->current('DB_CONNECTION');

        if ($driver === 'sqlite') {
            if (! is_dir($this->basePath.'/database')) {
                mkdir($this->basePath.'/database', 0777, true);
            }

            if (! is_file($this->basePath.'/database/database.sqlite')) {
                touch($this->basePath.'/database/database.sqlite');
            }

            return true;
        }

        try {
            $this->createDatabase($driver, (string) $this->current('DB_DATABASE'));
            $this->io->success('Connected to the database and it is ready.');

            return true;
        } catch (Throwable $exception) {
            $this->io->error('Could not connect to the database: '.$exception->getMessage());

            if ($this->io->confirm('Re-enter the database details?', true)) {
                return false;
            }

            $this->io->warning('Continuing without a working database. Migrations will fail until it is fixed (php artisan uno:install --only=database).');

            return true;
        }
    }

    private function createDatabase(string $driver, string $name): void
    {
        $host = (string) $this->current('DB_HOST');
        $port = (string) $this->current('DB_PORT');
        $dsn = $driver === 'pgsql'
            ? "pgsql:host={$host};port={$port};dbname=postgres"
            : "mysql:host={$host};port={$port}";

        $pdo = new PDO($dsn, (string) $this->current('DB_USERNAME'), (string) $this->current('DB_PASSWORD'), [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5,
        ]);

        if ($driver === 'pgsql') {
            $exists = $pdo->query('SELECT 1 FROM pg_database WHERE datname = '.$pdo->quote($name))->fetchColumn();

            if (! $exists) {
                $pdo->exec("CREATE DATABASE \"{$name}\"");
            }

            return;
        }

        $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    }

    /**
     * @return array<string, bool>
     */
    private function askSteps(): array
    {
        $choices = [];
        $heading = false;

        foreach ($this->config['steps'] as $step) {
            if (! isset($step['confirm'])) {
                continue;
            }

            if (! $heading) {
                $this->io->heading('Frontend');
                $heading = true;
            }

            $choices[$step['id']] = $this->io->confirm($step['confirm'], true);
        }

        return $choices;
    }

    /**
     * @param  list<string>  $removed
     */
    private function removeModules(array $removed): bool
    {
        $labels = array_map(fn (string $key): string => $this->config['modules'][$key]['label'], $removed);

        $this->io->line();
        $this->io->warning('These modules will be permanently deleted from the code: '.implode(', ', $labels));

        if (! $this->io->confirm('Delete them? They cannot be re-added by the installer', true)) {
            $this->io->info('Keeping all modules.');

            return false;
        }

        foreach ($removed as $key) {
            $changed = $this->modules->remove($key, $this->config['modules'][$key]);
            $this->io->success('Removed '.$this->config['modules'][$key]['label'].' ('.count($changed).' files changed)');
        }

        return true;
    }

    /**
     * @param  list<string>  $asked
     */
    private function writeEnv(array $asked, bool $fixed): void
    {
        foreach ($asked as $section) {
            foreach (array_keys($this->config['sections'][$section]['fields']) as $key) {
                if (array_key_exists($key, $this->answers)) {
                    $this->env->set($key, is_bool($this->answers[$key]) || $this->answers[$key] === null ? $this->answers[$key] : (string) $this->answers[$key]);
                }
            }
        }

        if ($fixed) {
            foreach ($this->config['fixed'] as $key => $value) {
                $this->env->set($key, is_bool($value) ? $value : (string) $value);
            }
        }

        if (! in_array('user_manager', $this->keptModules, true)) {
            $this->env->set('USER_REQUIRE_APPROVAL', false);
        }

        $this->env->save();
        $this->io->success('.env updated.');
    }

    /**
     * @param  array<string, bool>  $choices
     */
    private function saveState(array $choices): void
    {
        file_put_contents($this->basePath.'/'.self::STATE_FILE, json_encode(['choices' => $choices], JSON_PRETTY_PRINT));
    }

    /**
     * @return array<string, bool>|null
     */
    private function loadState(): ?array
    {
        $path = $this->basePath.'/'.self::STATE_FILE;

        if (! is_file($path)) {
            return null;
        }

        $state = json_decode((string) file_get_contents($path), true);

        return is_array($state) ? ($state['choices'] ?? []) : null;
    }

    /**
     * @param  array<string, bool>  $choices
     */
    private function finish(array $choices): int
    {
        $this->io->heading('Setting up');

        foreach ($this->config['steps'] as $step) {
            $env = new EnvEditor($this->envPath());

            if (isset($step['unless_env']) && ($env->get($step['unless_env']) ?? '') !== '') {
                continue;
            }

            if (isset($step['confirm']) && ! ($choices[$step['id']] ?? false)) {
                continue;
            }

            $command = $step['command'];

            if ($command[0] === 'php') {
                $command[0] = PHP_BINARY;
            }

            $this->io->info("→ {$step['label']}...");
            [$code, $output] = $this->execute($command);

            if ($code !== 0) {
                $this->io->error("{$step['label']} failed.");
                $this->io->line(trim($output));
                $this->io->warning('Fix the problem above, then run: php installer/setup.php --finish');

                return 1;
            }

            $this->io->success($step['label']);
        }

        $state = $this->basePath.'/'.self::STATE_FILE;

        if (is_file($state)) {
            unlink($state);
        }

        $this->summary();

        return 0;
    }

    /**
     * @param  list<string>  $command
     * @return array{0: int, 1: string}
     */
    private function defaultRunner(array $command, string $cwd, bool $stream = false): array
    {
        $line = $this->commandLine($command);

        if ($stream) {
            chdir($cwd);
            passthru($line, $code);

            return [$code, ''];
        }

        $line .= ' 2>&1';
        $process = proc_open($line, [0 => ['pipe', 'r'], 1 => ['pipe', 'w']], $pipes, $cwd);

        if (! is_resource($process)) {
            return [1, 'Could not start: '.$line];
        }

        fclose($pipes[0]);
        $output = (string) stream_get_contents($pipes[1]);
        fclose($pipes[1]);

        return [proc_close($process), $output];
    }

    /**
     * @param  list<string>  $command
     */
    private function commandLine(array $command): string
    {
        $program = array_shift($command);

        if (preg_match('/[\s\\\\\/]/', $program) === 1) {
            $program = escapeshellarg($program);
        }

        return implode(' ', [$program, ...array_map('escapeshellarg', $command)]);
    }

    private function summary(): void
    {
        $env = new EnvEditor($this->envPath());
        $modules = array_map(fn (string $key): string => $this->config['modules'][$key]['label'], $this->installedModules());
        $url = rtrim((string) ($env->get('APP_URL') ?? 'http://localhost'), '/');

        $this->io->line();
        $this->io->success('Installation complete.');
        $this->io->line("   Admin panel:  {$url}/cms/login");
        $this->io->line('   Start dev:    composer dev');
        $this->io->line('   Modules:      '.($modules === [] ? 'none' : implode('; ', $modules)));
        $this->io->line('   Add later:    php artisan uno:install --only=mail,storage,sms,firebase');
    }

    private function envPath(): string
    {
        return $this->basePath.'/.env';
    }
}
