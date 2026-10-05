<?php

declare(strict_types=1);

namespace Tests\Unit;

use Installer\EnvEditor;
use Installer\InstallAborted;
use Installer\Installer;
use Installer\Prompter;
use PHPUnit\Framework\TestCase;

class InstallerTest extends TestCase
{
    private string $base;

    /** @var list<list<string>> */
    private array $commands = [];

    private bool $failComposer = false;

    protected function setUp(): void
    {
        parent::setUp();

        $this->base = sys_get_temp_dir().DIRECTORY_SEPARATOR.'installer-'.uniqid();
        mkdir($this->base.'/routes', 0777, true);
        mkdir($this->base.'/vendor', 0777, true);
        file_put_contents($this->base.'/vendor/autoload.php', '<?php');
        file_put_contents($this->base.'/routes/faq.php', '<?php');
        file_put_contents($this->base.'/.env.example', "APP_NAME=\nSMS_DRIVER=log\nMAIL_FROM_NAME=\"\${APP_NAME}\"\n");
    }

    protected function tearDown(): void
    {
        $this->deleteDirectory($this->base);

        parent::tearDown();
    }

    private function deleteDirectory(string $directory): void
    {
        if (! is_dir($directory)) {
            return;
        }

        foreach (scandir($directory) as $item) {
            if ($item !== '.' && $item !== '..') {
                $path = $directory.DIRECTORY_SEPARATOR.$item;
                is_dir($path) ? $this->deleteDirectory($path) : unlink($path);
            }
        }

        rmdir($directory);
    }

    public function test_full_install_asks_everything_first_then_runs_the_steps(): void
    {
        [$code, $output] = $this->install("1\nGrocery Go\nnotaurl\nhttp://grocery.test\n2\n2\n0\ny\n");

        $this->assertSame(0, $code, $output);
        $this->assertStringContainsString('must be a valid URL', $output);
        $this->assertStringContainsString('Installation complete', $output);

        $env = new EnvEditor($this->base.'/.env');
        $this->assertSame('Grocery Go', $env->get('APP_NAME'));
        $this->assertSame('http://grocery.test', $env->get('APP_URL'));
        $this->assertSame('sqlite', $env->get('DB_CONNECTION'));
        $this->assertSame('local', $env->get('APP_ENV'));
        $this->assertSame('sms', $env->get('OTP_DELIVERY_CHANNELS'));
        $this->assertFileExists($this->base.'/routes/faq.php');

        $this->assertSame(['key:generate', 'storage:link', 'migrate', 'npm'], array_map(
            fn (array $command): string => $command[2] ?? $command[0],
            $this->commands,
        ));
        $this->assertFileDoesNotExist($this->base.'/.uno-install.json');
    }

    public function test_without_vendor_answers_are_saved_and_the_finish_step_runs_later(): void
    {
        unlink($this->base.'/vendor/autoload.php');

        [$code, $output] = $this->install("1\nGrocery Go\nhttp://grocery.test\n2\n2\n0\ny\n", fromComposer: true);

        $this->assertSame(0, $code, $output);
        $this->assertSame([], $this->commands);
        $this->assertFileExists($this->base.'/.uno-install.json');

        file_put_contents($this->base.'/vendor/autoload.php', '<?php');
        [$code, $output] = $this->install('', finishOnly: true);

        $this->assertSame(0, $code, $output);
        $this->assertNotEmpty($this->commands);
        $this->assertFileDoesNotExist($this->base.'/.uno-install.json');
    }

    public function test_outside_composer_it_installs_packages_after_the_questions(): void
    {
        unlink($this->base.'/vendor/autoload.php');

        [$code, $output] = $this->install("1\nGrocery Go\nhttp://grocery.test\n2\n2\n0\ny\n");

        $this->assertSame(0, $code, $output);
        $this->assertSame('composer', $this->commands[0][0]);
        $this->assertSame('install', $this->commands[0][1]);
        $this->assertGreaterThan(1, count($this->commands));
        $this->assertLessThan(strpos($output, 'Installing packages'), strpos($output, 'Application name'));
        $this->assertFileDoesNotExist($this->base.'/.uno-install.json');
    }

    public function test_a_failed_package_install_stops_before_the_setup_steps(): void
    {
        unlink($this->base.'/vendor/autoload.php');
        $this->failComposer = true;

        [$code, $output] = $this->install("1\nGrocery Go\nhttp://grocery.test\n2\n2\n0\ny\n");

        $this->assertSame(1, $code);
        $this->assertCount(1, $this->commands);
        $this->assertStringContainsString('composer install failed', $output);
        $this->assertFileExists($this->base.'/.uno-install.json');
    }

    public function test_prompts_switched_off_in_config_use_defaults_and_keep_every_module(): void
    {
        [$code, $output] = $this->install("Grocery Go\n2\n1\ny\n", tweak: function (array $config): array {
            $config['ask'] = ['modules' => false, 'services' => false];
            $config['sections']['app']['fields']['APP_URL']['ask'] = false;
            $config['sections']['app']['fields']['APP_SLUG'] = ['ask' => false, 'default_from' => 'APP_NAME', 'type' => 'text', 'label' => 'Slug'];

            return $config;
        });

        $env = new EnvEditor($this->base.'/.env');

        $this->assertSame(0, $code, $output);
        $this->assertSame('http://localhost', $env->get('APP_URL'));
        $this->assertSame('grocery_go', $env->get('APP_SLUG'));
        $this->assertStringNotContainsString('sidebar modules', $output);
        $this->assertStringNotContainsString('Which services', $output);
        $this->assertStringNotContainsString('Application URL', $output);
        $this->assertFileExists($this->base.'/routes/faq.php');
        $this->assertContains('migrate', array_map(fn (array $command): string => $command[2] ?? '', $this->commands));
    }

    public function test_invalid_answers_are_reasked_then_the_installer_stops(): void
    {
        [$code, $output] = $this->install("n\nn\nn\nn\nn\n", only: ['auth']);

        $this->assertSame(1, $code);
        $this->assertSame(5, substr_count($output, 'Please type one of the numbers'), $output);
        $this->assertStringContainsString('Too many invalid answers', $output);
    }

    public function test_it_stops_cleanly_when_input_ends(): void
    {
        [$code, $output] = $this->install('');

        $this->assertSame(1, $code);
        $this->assertStringContainsString('Input ended before all questions were answered', $output);
        $this->assertLessThan(40, substr_count($output, "\n"));
    }

    public function test_under_composer_a_dead_input_skips_setup_without_failing(): void
    {
        [$code, $output] = $this->install('', fromComposer: true);

        $this->assertSame(0, $code);
        $this->assertStringContainsString('the questions were skipped', $output);
    }

    public function test_finish_without_saved_answers_under_composer_is_a_no_op(): void
    {
        [$code, $output] = $this->install('', finishOnly: true, fromComposer: true);

        $this->assertSame(0, $code);
        $this->assertSame([], $this->commands);
        $this->assertStringContainsString('php installer/setup.php', $output);
    }

    public function test_only_updates_the_selected_section_and_keeps_secrets(): void
    {
        file_put_contents($this->base.'/.env', "APP_NAME=Old\nSMS_DRIVER=log\nCLICKSEND_API_KEY=existing-key\n");

        [$code] = $this->install("1\ngrocery\n\nGrocery Go\nAU\n", only: ['sms']);

        $env = new EnvEditor($this->base.'/.env');

        $this->assertSame(0, $code);
        $this->assertSame('clicksend', $env->get('SMS_DRIVER'));
        $this->assertSame('grocery', $env->get('CLICKSEND_USERNAME'));
        $this->assertSame('existing-key', $env->get('CLICKSEND_API_KEY'));
        $this->assertSame('Old', $env->get('APP_NAME'));
        $this->assertNull($env->get('APP_ENV'));
        $this->assertSame([], $this->commands);
    }

    public function test_unknown_sections_are_rejected(): void
    {
        [$code, $output] = $this->install('', only: ['payments']);

        $this->assertSame(1, $code);
        $this->assertStringContainsString('Unknown section(s): payments', $output);
    }

    public function test_env_editor_quotes_values_safely(): void
    {
        file_put_contents($this->base.'/.env', "APP_NAME=Old\nSMS_DRIVER=log\n");
        $env = new EnvEditor($this->base.'/.env');
        $env->set('DB_PASSWORD', 'pa$1 "word');
        $env->set('APP_NAME', 'Grocery Go');
        $env->set('APP_DEBUG', true);
        $env->set('SMS_DRIVER', null);
        $env->save();

        $reloaded = new EnvEditor($this->base.'/.env');

        $this->assertSame('pa$1 "word', $reloaded->get('DB_PASSWORD'));
        $this->assertSame('Grocery Go', $reloaded->get('APP_NAME'));
        $this->assertSame('true', $reloaded->get('APP_DEBUG'));
        $this->assertNull($reloaded->get('SMS_DRIVER'));
        $this->assertNotContains('SMS_DRIVER', $reloaded->keys());
    }

    /**
     * @param  list<string>|null  $only
     * @return array{0: int, 1: string}
     */
    public function test_admin_credentials_are_asked_saved_and_the_password_is_cleared_after_seeding(): void
    {
        [$code, $output] = $this->install("Grocery Go\nadmin@grocery.test\nSecret@123\n2\n1\ny\n", tweak: $this->withAdminSection());

        $env = new EnvEditor($this->base.'/.env');

        $this->assertSame(0, $code, $output);
        $this->assertSame('admin@grocery.test', $env->get('ADMIN_EMAIL'));
        $this->assertSame('', $env->get('ADMIN_PASSWORD'));
        $this->assertStringContainsString('Admin login:  admin@grocery.test', $output);
        $this->assertStringNotContainsString('Secret@123', $output);
    }

    public function test_a_blank_admin_password_is_generated_and_shown_once(): void
    {
        [$code, $output] = $this->install("Grocery Go\nadmin@grocery.test\n\n2\n1\ny\n", tweak: $this->withAdminSection());

        $this->assertSame(0, $code, $output);
        $this->assertSame(1, preg_match('/Generated password: (\S{16})\b/', $output, $matches), $output);
        $this->assertStringContainsString("{$matches[1]} (generated, shown once)", $output);
        $this->assertSame('', (new EnvEditor($this->base.'/.env'))->get('ADMIN_PASSWORD'));
    }

    public function test_a_short_admin_password_is_asked_again(): void
    {
        [$code, $output] = $this->install("Grocery Go\nadmin@grocery.test\nshort\nSecret@123\n2\n1\ny\n", tweak: $this->withAdminSection());

        $this->assertSame(0, $code, $output);
        $this->assertStringContainsString('must be at least 8 characters', $output);
    }

    public function test_the_admin_section_cannot_be_reconfigured_with_only(): void
    {
        [$code, $output] = $this->install('', only: ['admin'], tweak: $this->withAdminSection());

        $this->assertSame(1, $code);
        $this->assertStringContainsString('Unknown section(s): admin', $output);
    }

    public function test_the_composer_prompter_reads_answers_from_the_composer_io(): void
    {
        $io = $this->composerIo(['Grocery Go', '', 'secret'], interactive: true);
        $prompter = Prompter::forComposer($io);

        $this->assertSame('Grocery Go', $prompter->text('Name'));
        $this->assertSame('fallback', $prompter->text('Slug', 'fallback'));
        $this->assertSame('secret', $prompter->password('Password'));
        $this->assertSame(['ask', 'ask', 'askAndHideAnswer'], $io->methods);
    }

    public function test_the_composer_prompter_aborts_when_composer_is_not_interactive(): void
    {
        $prompter = Prompter::forComposer($this->composerIo(['ignored'], interactive: false));

        $this->expectException(InstallAborted::class);

        $prompter->text('Name');
    }

    public function test_the_composer_prompter_aborts_when_the_input_ends(): void
    {
        $prompter = Prompter::forComposer($this->composerIo([], interactive: true));

        $this->expectException(InstallAborted::class);

        $prompter->text('Name');
    }

    /**
     * @param  list<string>  $answers
     */
    private function composerIo(array $answers, bool $interactive): object
    {
        return new class($answers, $interactive)
        {
            /** @var list<string> */
            public array $methods = [];

            /**
             * @param  list<string>  $answers
             */
            public function __construct(private array $answers, private readonly bool $interactive) {}

            public function isInteractive(): bool
            {
                return $this->interactive;
            }

            public function ask(string $question, mixed $default = null): mixed
            {
                $this->methods[] = 'ask';

                return $this->next();
            }

            public function askAndHideAnswer(string $question): mixed
            {
                $this->methods[] = 'askAndHideAnswer';

                return $this->next();
            }

            private function next(): string
            {
                if ($this->answers === []) {
                    throw new \RuntimeException('Aborted');
                }

                return array_shift($this->answers);
            }
        };
    }

    private function withAdminSection(): \Closure
    {
        return function (array $config): array {
            $config['ask'] = ['modules' => false, 'services' => false];
            $config['sections']['app']['fields']['APP_URL']['ask'] = false;

            $admin = ['label' => 'Admin account', 'install_only' => true, 'fields' => [
                'ADMIN_EMAIL' => ['type' => 'text', 'label' => 'Admin email', 'required' => true, 'rules' => 'email'],
                'ADMIN_PASSWORD' => ['type' => 'password', 'label' => 'Admin password', 'rules' => 'min:8', 'generate' => 16],
            ]];

            $config['sections'] = ['app' => $config['sections']['app'], 'admin' => $admin] + $config['sections'];
            $config['steps'][] = ['label' => 'Seed', 'command' => ['php', 'artisan', 'db:seed'], 'scrub' => ['ADMIN_PASSWORD']];

            return $config;
        };
    }

    private function install(string $input, ?array $only = null, bool $finishOnly = false, bool $fromComposer = false, ?\Closure $tweak = null): array
    {
        $in = fopen('php://memory', 'r+');
        fwrite($in, $input);
        rewind($in);
        $out = fopen('php://memory', 'r+');

        $config = [
            'fixed' => ['APP_ENV' => 'local', 'APP_DEBUG' => true],
            'modules' => [
                'faqs' => ['label' => 'FAQs', 'paths' => ['routes/faq.php']],
            ],
            'sections' => [
                'app' => ['label' => 'Application', 'fields' => [
                    'APP_NAME' => ['type' => 'text', 'label' => 'Application name', 'required' => true],
                    'APP_URL' => ['type' => 'text', 'label' => 'Application URL', 'default' => 'http://localhost', 'rules' => 'url'],
                ]],
                'database' => ['label' => 'Database', 'fields' => [
                    'DB_CONNECTION' => ['type' => 'select', 'label' => 'Database driver', 'default' => 'sqlite', 'options' => ['mysql' => 'MySQL', 'sqlite' => 'SQLite']],
                    'DB_PASSWORD' => ['type' => 'password', 'label' => 'Password', 'when' => ['DB_CONNECTION' => 'mysql'], 'remove_when_hidden' => true],
                ]],
                'auth' => ['label' => 'Authentication', 'fields' => [
                    'OTP_DELIVERY_CHANNELS' => ['type' => 'select', 'label' => 'OTP channel', 'default' => 'mail', 'options' => ['mail' => 'Email', 'sms' => 'SMS']],
                ]],
                'sms' => ['label' => 'SMS', 'optional' => true, 'default' => false, 'fields' => [
                    'SMS_DRIVER' => ['type' => 'select', 'label' => 'Provider', 'default' => 'clicksend', 'options' => ['clicksend' => 'ClickSend', 'log' => 'Log']],
                    'CLICKSEND_USERNAME' => ['type' => 'text', 'label' => 'Username', 'required' => true],
                    'CLICKSEND_API_KEY' => ['type' => 'password', 'label' => 'API key'],
                    'CLICKSEND_FROM' => ['type' => 'text', 'label' => 'Sender'],
                    'CLICKSEND_COUNTRY' => ['type' => 'text', 'label' => 'Country', 'default' => 'AU'],
                ]],
            ],
            'steps' => [
                ['label' => 'Key', 'command' => ['php', 'artisan', 'key:generate'], 'unless_env' => 'APP_KEY'],
                ['label' => 'Storage', 'command' => ['php', 'artisan', 'storage:link']],
                ['label' => 'Migrate', 'command' => ['php', 'artisan', 'migrate']],
                ['id' => 'npm_install', 'label' => 'npm', 'command' => ['npm', 'install'], 'confirm' => 'Install npm packages?'],
            ],
        ];

        $config = $tweak === null ? $config : $tweak($config);

        $installer = new Installer($this->base, $config, new Prompter($in, $out), function (array $command): array {
            $this->commands[] = $command;

            return [$this->failComposer && $command[0] === 'composer' ? 1 : 0, ''];
        });

        $code = $installer->run($only, $finishOnly, $fromComposer);
        rewind($out);

        return [$code, (string) stream_get_contents($out)];
    }
}
