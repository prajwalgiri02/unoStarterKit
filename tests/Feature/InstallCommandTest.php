<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Support\EnvEditor;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class InstallCommandTest extends TestCase
{
    private string $envDirectory;

    protected function setUp(): void
    {
        parent::setUp();

        $this->envDirectory = sys_get_temp_dir().DIRECTORY_SEPARATOR.'uno-install-'.uniqid();
        File::ensureDirectoryExists($this->envDirectory);
        File::put($this->envDirectory.'/.env', implode("\n", [
            'APP_NAME=Old',
            'SMS_DRIVER=log',
            'CLICKSEND_API_KEY=existing-key',
            'MAIL_FROM_NAME="${APP_NAME}"',
            '',
        ]));

        $this->app->useEnvironmentPath($this->envDirectory);
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->envDirectory);

        parent::tearDown();
    }

    public function test_only_updates_the_selected_section(): void
    {
        $this->artisan('uno:install', ['--only' => 'sms'])
            ->expectsChoice('SMS provider', 'clicksend', ['clicksend' => 'ClickSend', 'log' => 'Log only (development)'])
            ->expectsQuestion('ClickSend username', 'grocery')
            ->expectsQuestion('ClickSend API key', '')
            ->expectsQuestion('Sender ID or number', 'Grocery Go')
            ->expectsQuestion('Default country code for local numbers', 'AU')
            ->assertSuccessful();

        $env = new EnvEditor($this->envDirectory.'/.env');

        $this->assertSame('clicksend', $env->get('SMS_DRIVER'));
        $this->assertSame('grocery', $env->get('CLICKSEND_USERNAME'));
        $this->assertSame('existing-key', $env->get('CLICKSEND_API_KEY'));
        $this->assertSame('Grocery Go', $env->get('CLICKSEND_FROM'));
        $this->assertSame('Old', $env->get('APP_NAME'));
        $this->assertStringContainsString('MAIL_FROM_NAME="${APP_NAME}"', File::get($this->envDirectory.'/.env'));
        $this->assertNull($env->get('APP_ENV'));
    }

    public function test_unknown_sections_are_rejected(): void
    {
        $this->artisan('uno:install', ['--only' => 'payments'])
            ->assertFailed();
    }

    public function test_env_editor_quotes_values_safely(): void
    {
        $env = new EnvEditor($this->envDirectory.'/.env');
        $env->set('DB_PASSWORD', 'pa$1 "word');
        $env->set('APP_NAME', 'Grocery Go');
        $env->set('APP_DEBUG', true);
        $env->set('SMS_DRIVER', null);
        $env->save();

        $reloaded = new EnvEditor($this->envDirectory.'/.env');

        $this->assertSame('pa$1 "word', $reloaded->get('DB_PASSWORD'));
        $this->assertSame('Grocery Go', $reloaded->get('APP_NAME'));
        $this->assertSame('true', $reloaded->get('APP_DEBUG'));
        $this->assertNull($reloaded->get('SMS_DRIVER'));
        $this->assertNotContains('SMS_DRIVER', $reloaded->keys());
    }
}
