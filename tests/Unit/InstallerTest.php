<?php

declare(strict_types=1);

namespace Tests\Unit;

use Installer\EnvEditor;
use Installer\Installer;
use Installer\Prompter;
use PHPUnit\Framework\TestCase;

class InstallerTest extends TestCase
{
    private string $base;

    /** @var list<list<string>> */
    private array $commands = [];

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

        [$code, $output] = $this->install("1\nGrocery Go\nhttp://grocery.test\n2\n2\n0\ny\n");

        $this->assertSame(0, $code, $output);
        $this->assertSame([], $this->commands);
        $this->assertFileExists($this->base.'/.uno-install.json');

        file_put_contents($this->base.'/vendor/autoload.php', '<?php');
        [$code, $output] = $this->install('', finishOnly: true);

        $this->assertSame(0, $code, $output);
        $this->assertNotEmpty($this->commands);
        $this->assertFileDoesNotExist($this->base.'/.uno-install.json');
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
        $this->assertStringContainsString('php artisan uno:install', $output);
    }

    public function test_finish_without_saved_answers_under_composer_is_a_no_op(): void
    {
        [$code, $output] = $this->install('', finishOnly: true, fromComposer: true);

        $this->assertSame(0, $code);
        $this->assertSame([], $this->commands);
        $this->assertStringContainsString('php artisan uno:install', $output);
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
    private function install(string $input, ?array $only = null, bool $finishOnly = false, bool $fromComposer = false): array
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

        $installer = new Installer($this->base, $config, new Prompter($in, $out), function (array $command): array {
            $this->commands[] = $command;

            return [0, ''];
        });

        $code = $installer->run($only, $finishOnly, $fromComposer);
        rewind($out);

        return [$code, (string) stream_get_contents($out)];
    }
}
