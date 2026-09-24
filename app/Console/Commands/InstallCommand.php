<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Support\EnvEditor;
use App\Support\ModuleRemover;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Validator;
use PDO;
use Throwable;

use function Laravel\Prompts\confirm;
use function Laravel\Prompts\error;
use function Laravel\Prompts\info;
use function Laravel\Prompts\intro;
use function Laravel\Prompts\multiselect;
use function Laravel\Prompts\note;
use function Laravel\Prompts\outro;
use function Laravel\Prompts\password;
use function Laravel\Prompts\select;
use function Laravel\Prompts\spin;
use function Laravel\Prompts\text;
use function Laravel\Prompts\warning;

class InstallCommand extends Command
{
    protected $signature = 'uno:install
        {--only= : Reconfigure only these sections, comma separated (app, database, modules, auth, mail, storage, sms, firebase)}';

    protected $description = 'Configure the starter kit: environment, modules and services';

    private EnvEditor $env;

    private ModuleRemover $modules;

    /** @var array<string, mixed> */
    private array $answers = [];

    /** @var list<string> */
    private array $keptModules = [];

    /** @var list<string> */
    private array $loadedEnvKeys = [];

    public function handle(): int
    {
        $only = $this->onlySections();

        if ($only === false) {
            return self::FAILURE;
        }

        $this->ensureEnvFile();
        $this->env = new EnvEditor($this->laravel->environmentFilePath());
        $this->loadedEnvKeys = $this->env->keys();
        $this->modules = new ModuleRemover(base_path());

        intro($only === null ? 'unoStarterKit installer' : 'unoStarterKit: reconfigure '.implode(', ', $only));

        $installed = $this->installedModules();
        $this->keptModules = $installed;

        if ($only === null || in_array('modules', $only, true)) {
            $this->keptModules = $this->askModules($installed);
        }

        $asked = $this->askSections($only);
        $removed = array_values(array_diff($installed, $this->keptModules));

        if ($removed !== [] && ! $this->removeModules($removed)) {
            $this->keptModules = $installed;
        }

        $this->writeEnv($asked, fixed: $only === null);

        if ($only !== null) {
            outro('Done. Only the selected sections were changed.');

            return self::SUCCESS;
        }

        if (! $this->prepareDatabase()) {
            return self::FAILURE;
        }

        if (! $this->runSteps()) {
            return self::FAILURE;
        }

        $this->summary($asked);

        return self::SUCCESS;
    }

    /**
     * @return list<string>|null|false
     */
    private function onlySections(): array|null|false
    {
        $option = $this->option('only');

        if (blank($option)) {
            return null;
        }

        $valid = ['modules', ...array_keys(config('installer.sections'))];
        $only = array_values(array_filter(array_map('trim', explode(',', (string) $option))));
        $unknown = array_diff($only, $valid);

        if ($unknown !== []) {
            error('Unknown section(s): '.implode(', ', $unknown).'. Available: '.implode(', ', $valid).'.');

            return false;
        }

        return $only;
    }

    private function ensureEnvFile(): void
    {
        if (! is_file($this->laravel->environmentFilePath()) && is_file(base_path('.env.example'))) {
            File::copy(base_path('.env.example'), $this->laravel->environmentFilePath());
        }
    }

    /**
     * @return list<string>
     */
    private function installedModules(): array
    {
        return array_keys(array_filter(
            config('installer.modules'),
            fn (array $module): bool => $this->modules->isInstalled($module),
        ));
    }

    /**
     * @param  list<string>  $installed
     * @return list<string>
     */
    private function askModules(array $installed): array
    {
        $all = config('installer.modules');
        $missing = array_diff(array_keys($all), $installed);

        if ($missing !== []) {
            note('Already removed (cannot be re-added by the installer): '.implode(', ', array_map(fn (string $key): string => $all[$key]['label'], $missing)));
        }

        if ($installed === []) {
            return [];
        }

        return array_values(multiselect(
            label: 'Which sidebar modules does this project need?',
            options: array_map(fn (array $module): string => $module['label'], array_intersect_key($all, array_flip($installed))),
            default: $installed,
            scroll: 10,
            hint: 'Dashboard and Settings are always included. Unselected modules are deleted from the code.',
        ));
    }

    /**
     * @param  list<string>|null  $only
     * @return list<string>
     */
    private function askSections(?array $only): array
    {
        $sections = config('installer.sections');
        $asked = [];

        foreach ($sections as $key => $section) {
            if (($section['optional'] ?? false) || ($only !== null && ! in_array($key, $only, true))) {
                continue;
            }

            $this->askSection($section);
            $asked[] = $key;
        }

        foreach ($this->chooseOptionalSections($sections, $only) as $key) {
            $this->askSection($sections[$key]);
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
            info("{$optional[$key]['label']} is required by your answers above.");
        }

        $chosen = $choices === [] ? [] : multiselect(
            label: 'Which services do you want to configure now?',
            options: array_map(fn (array $section): string => $section['label'], $choices),
            default: array_keys(array_filter($choices, fn (array $section): bool => $section['default'] ?? false)),
            hint: 'Anything skipped can be added later with: php artisan uno:install --only=<section>',
        );

        return array_values(array_filter(
            array_keys($optional),
            fn (string $key): bool => in_array($key, $forced, true) || in_array($key, $chosen, true),
        ));
    }

    /**
     * @param  array<string, mixed>  $section
     */
    private function askSection(array $section): void
    {
        note($section['label']);

        foreach ($section['fields'] as $envKey => $field) {
            $this->askField($envKey, $field);
        }
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
        $default = filled($current) ? $current : $this->defaultFor($field);
        $label = $field['label'];
        $required = (bool) ($field['required'] ?? false);
        $validate = $this->validator($label, $field['rules'] ?? null);

        $this->answers[$key] = match ($field['type'] ?? 'text') {
            'select' => select(
                label: $label,
                options: $field['options'],
                default: array_key_exists((string) $default, $field['options']) ? (string) $default : array_key_first($field['options']),
            ),
            'confirm' => confirm(label: $label, default: filter_var($default ?? false, FILTER_VALIDATE_BOOLEAN)),
            'password' => $this->askPassword($label, $required, $current, $validate),
            'file' => $this->askFile($field, $current),
            default => text(label: $label, default: (string) ($default ?? ''), required: $required, validate: $validate),
        };
    }

    private function askPassword(string $label, bool $required, ?string $current, \Closure $validate): string
    {
        $value = password(
            label: $label,
            required: $required && blank($current),
            validate: fn (string $value): ?string => $value === '' ? null : $validate($value),
            hint: filled($current) ? 'Leave blank to keep the current value.' : '',
        );

        return $value === '' && filled($current) ? $current : $value;
    }

    /**
     * @param  array<string, mixed>  $field
     */
    private function askFile(array $field, ?string $current): string
    {
        $path = text(
            label: $field['label'],
            default: (string) ($current ?? ''),
            required: (bool) ($field['required'] ?? false),
            validate: fn (string $value): ?string => $this->serviceAccountError($value),
            hint: $field['hint'] ?? '',
        );

        $source = $this->resolvePath($path);
        $target = base_path($field['store']);

        File::ensureDirectoryExists(dirname($target));

        if (realpath($source) !== realpath($target)) {
            File::copy($source, $target);
        }

        $projectId = json_decode((string) file_get_contents($target), true)['project_id'] ?? 'unknown';
        info("Firebase project: {$projectId}. Credentials copied to {$field['store']}.");

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

        return file_exists($path) ? $path : base_path($path);
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

    private function validator(string $label, ?string $rules): \Closure
    {
        return function (string $value) use ($label, $rules): ?string {
            if ($rules === null || $value === '') {
                return null;
            }

            return Validator::make(['value' => $value], ['value' => $rules], [], ['value' => strtolower($label)])
                ->errors()
                ->first('value') ?: null;
        };
    }

    /**
     * @param  list<string>  $removed
     */
    private function removeModules(array $removed): bool
    {
        $labels = array_map(fn (string $key): string => config("installer.modules.{$key}.label"), $removed);

        warning('These modules will be permanently deleted from the code: '.implode(', ', $labels));

        if (! confirm(label: 'Delete them?', default: true, hint: 'They cannot be re-added by the installer later.')) {
            info('Keeping all modules.');

            return false;
        }

        foreach ($removed as $key) {
            $changed = $this->modules->remove($key, config("installer.modules.{$key}"));
            info('Removed '.config("installer.modules.{$key}.label").' ('.count($changed).' files changed)');
        }

        return true;
    }

    /**
     * @param  list<string>  $asked
     */
    private function writeEnv(array $asked, bool $fixed): void
    {
        $sections = config('installer.sections');

        foreach ($asked as $section) {
            foreach (array_keys($sections[$section]['fields']) as $key) {
                if (array_key_exists($key, $this->answers)) {
                    $this->env->set($key, $this->stringify($this->answers[$key]));
                }
            }
        }

        if ($fixed) {
            foreach (config('installer.fixed') as $key => $value) {
                $this->env->set($key, $this->stringify($value));
            }
        }

        if (! in_array('user_manager', $this->keptModules, true)) {
            $this->env->set('USER_REQUIRE_APPROVAL', false);
        }

        $this->env->save();
        info('.env updated.');
    }

    private function stringify(mixed $value): string|bool|null
    {
        return is_bool($value) || $value === null ? $value : (string) $value;
    }

    private function prepareDatabase(): bool
    {
        $driver = $this->current('DB_CONNECTION');

        if ($driver === 'sqlite') {
            File::ensureDirectoryExists(database_path());

            if (! is_file(database_path('database.sqlite'))) {
                File::put(database_path('database.sqlite'), '');
            }

            return true;
        }

        $name = (string) $this->current('DB_DATABASE');

        if (! preg_match('/^[A-Za-z0-9_]+$/', $name)) {
            error("Invalid database name [{$name}].");

            return false;
        }

        try {
            spin(fn () => $this->createDatabase((string) $driver, $name), "Creating database {$name}");
            info("Database {$name} is ready.");

            return true;
        } catch (Throwable $exception) {
            error("Could not connect to the database: {$exception->getMessage()}");

            if (confirm(label: 'Continue without it?', default: false)) {
                return true;
            }

            warning('Your answers are saved in .env. Fix the database and run: php artisan uno:install');

            return false;
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

    private function runSteps(): bool
    {
        foreach (config('installer.steps') as $step) {
            $env = new EnvEditor($this->laravel->environmentFilePath());

            if (isset($step['unless_env']) && filled($env->get($step['unless_env']))) {
                continue;
            }

            if (isset($step['confirm']) && ! confirm(label: $step['confirm'], default: true)) {
                continue;
            }

            $command = $step['command'];

            if ($command[0] === 'php') {
                $command[0] = PHP_BINARY;
            }

            // Values loaded from the old .env are inherited by child processes and
            // would override the new file, so every old and new key is unset for them.
            $inherited = array_fill_keys([...$this->loadedEnvKeys, ...$env->keys()], false);

            $result = spin(
                fn () => Process::path(base_path())->env($inherited)->timeout(1800)->run($command),
                $step['label'],
            );

            if ($result->failed()) {
                error("{$step['label']} failed.");
                $this->line(trim($result->errorOutput() ?: $result->output()));
                warning('Fix the problem above and run: php artisan uno:install');

                return false;
            }

            info("✓ {$step['label']}");
        }

        return true;
    }

    /**
     * @param  list<string>  $asked
     */
    private function summary(array $asked): void
    {
        $sections = config('installer.sections');
        $skipped = array_diff(array_keys($sections), $asked);
        $modules = array_map(fn (string $key): string => config("installer.modules.{$key}.label"), $this->keptModules);
        $url = rtrim((string) $this->current('APP_URL'), '/');

        note(implode(PHP_EOL, array_filter([
            "Admin panel:  {$url}/cms/login",
            'Start dev:    composer dev',
            'Modules:      '.($modules === [] ? 'none' : implode(', ', $modules)),
            $skipped === [] ? null : 'Not set up:   '.implode(', ', $skipped).' (php artisan uno:install --only='.implode(',', $skipped).')',
        ])));

        outro('Installation complete.');
    }
}
