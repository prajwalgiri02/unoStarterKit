<?php

declare(strict_types=1);

namespace Installer;

use Closure;

final class Prompter
{
    public const MAX_ATTEMPTS = 5;

    private bool $usingConsole = false;

    /**
     * @param  resource  $input
     * @param  resource  $output
     * @param  Closure(): mixed|null  $fallbackInput  Opens the real console when the input stream is already at its end.
     */
    public function __construct(
        private $input,
        private $output,
        private readonly bool $hideSecrets = false,
        private ?Closure $fallbackInput = null,
    ) {}

    public static function forTerminal(): self
    {
        return new self(
            STDIN,
            STDOUT,
            hideSecrets: function_exists('stream_isatty') && stream_isatty(STDIN),
            fallbackInput: fn () => @fopen(PHP_OS_FAMILY === 'Windows' ? 'CON' : '/dev/tty', 'r'),
        );
    }

    public function line(string $text = ''): void
    {
        fwrite($this->output, $text.PHP_EOL);
    }

    public function heading(string $text): void
    {
        $this->line();
        $this->line("── {$text} ".str_repeat('─', max(3, 60 - strlen($text))));
    }

    public function info(string $text): void
    {
        $this->line(" {$text}");
    }

    public function success(string $text): void
    {
        $this->line(" ✓ {$text}");
    }

    public function warning(string $text): void
    {
        $this->line(" ! {$text}");
    }

    public function error(string $text): void
    {
        $this->line(" ✗ {$text}");
    }

    /**
     * @param  callable(string): ?string|null  $validate
     */
    public function text(string $label, ?string $default = null, bool $required = false, ?callable $validate = null): string
    {
        return $this->ask(function () use ($label, $default): string {
            $suffix = $default !== null && $default !== '' ? " [{$default}]" : '';
            $answer = $this->prompt("{$label}{$suffix}: ");

            return $answer === '' && $default !== null ? $default : $answer;
        }, $required, $validate);
    }

    /**
     * @param  callable(string): ?string|null  $validate
     */
    public function password(string $label, bool $required = false, ?string $current = null, ?callable $validate = null): string
    {
        $keep = $current !== null && $current !== '';

        $answer = $this->ask(function () use ($label, $keep): string {
            $this->write($label.($keep ? ' (Enter keeps the current value)' : '').': ');
            $value = $this->readSecret();
            $this->line();

            return $value;
        }, $required && ! $keep, fn (string $value): ?string => $value === '' || $validate === null ? null : $validate($value));

        return $answer === '' && $keep ? (string) $current : $answer;
    }

    public function confirm(string $label, bool $default = true): bool
    {
        return (bool) $this->ask(function () use ($label, $default): ?bool {
            $answer = strtolower($this->prompt($label.($default ? ' (Y/n)' : ' (y/N)').': '));

            if ($answer === '') {
                return $default;
            }

            if (in_array($answer, ['y', 'yes'], true)) {
                return true;
            }

            if (in_array($answer, ['n', 'no'], true)) {
                return false;
            }

            $this->error('Please answer yes or no.');

            return null;
        });
    }

    /**
     * @param  array<int|string, string>  $options
     */
    public function select(string $label, array $options, int|string|null $default = null): int|string
    {
        $keys = array_keys($options);
        $defaultNumber = $default === null ? 1 : ((int) array_search($default, $keys, false)) + 1;

        return $this->ask(function () use ($label, $options, $keys, $defaultNumber): int|string|null {
            $this->line();
            $this->line(" {$label}");

            foreach (array_values($options) as $index => $optionLabel) {
                $this->line(sprintf('   %d. %s', $index + 1, $optionLabel));
            }

            $answer = $this->prompt("Type a number [{$defaultNumber}]: ");
            $number = $answer === '' ? $defaultNumber : $this->number($answer);

            if ($number === null || $number < 1 || $number > count($keys)) {
                $this->error('Please type one of the numbers listed above.');

                return null;
            }

            return $keys[$number - 1];
        });
    }

    /**
     * @param  array<int|string, string>  $options
     * @param  list<int|string>  $default
     * @return list<int|string>
     */
    public function multiselect(string $label, array $options, array $default = [], bool $required = false): array
    {
        $keys = array_keys($options);
        $defaultNumbers = array_map(fn (int|string $key): int => ((int) array_search($key, $keys, false)) + 1, $default);

        return $this->ask(function () use ($label, $options, $keys, $defaultNumbers, $required): ?array {
            $this->line();
            $this->line(" {$label}");

            foreach (array_values($options) as $index => $optionLabel) {
                $this->line(sprintf('   %d. %s', $index + 1, $optionLabel));
            }

            $none = $required ? '' : ', 0 for none';
            $answer = $this->prompt('Type numbers separated by commas'.$none.' ['.implode(',', $defaultNumbers).']: ');

            if ($answer === '') {
                return array_map(fn (int $number): int|string => $keys[$number - 1], $defaultNumbers);
            }

            if ($answer === '0' && ! $required) {
                return [];
            }

            $selected = [];

            foreach (explode(',', $answer) as $part) {
                $number = $this->number(trim($part));

                if ($number === null || $number < 1 || $number > count($keys)) {
                    $this->error('"'.trim($part).'" is not one of the numbers listed above.');

                    return null;
                }

                $selected[$number] = $keys[$number - 1];
            }

            ksort($selected);

            return array_values($selected);
        }, $required);
    }

    /**
     * @param  callable(): mixed  $read
     * @param  callable(mixed): ?string|null  $validate
     */
    private function ask(callable $read, bool $required = false, ?callable $validate = null): mixed
    {
        for ($attempt = 1; $attempt <= self::MAX_ATTEMPTS; $attempt++) {
            $value = $read();

            if ($value === null) {
                continue;
            }

            if ($required && ($value === '' || $value === [])) {
                $this->error('An answer is required.');

                continue;
            }

            $error = $validate === null ? null : $validate($value);

            if ($error !== null && $error !== '') {
                $this->error($error);

                continue;
            }

            return $value;
        }

        throw new InstallAborted('Too many invalid answers.');
    }

    private function prompt(string $text): string
    {
        $this->write($text);

        return trim($this->readLine());
    }

    private function write(string $text): void
    {
        fwrite($this->output, $text);
    }

    private function readLine(): string
    {
        $line = fgets($this->input);

        if ($line === false && $this->fallbackInput !== null) {
            $console = ($this->fallbackInput)();
            $this->fallbackInput = null;

            if (is_resource($console)) {
                $this->input = $console;
                $this->usingConsole = true;
                $line = fgets($this->input);
            }
        }

        if ($line === false) {
            throw new InstallAborted('Input ended before all questions were answered.');
        }

        return rtrim($line, "\r\n");
    }

    private function readSecret(): string
    {
        if (! $this->hideSecrets && ! $this->usingConsole) {
            return trim($this->readLine());
        }

        if (DIRECTORY_SEPARATOR === '\\') {
            $command = 'powershell -NoProfile -Command "$p = Read-Host -AsSecureString; '
                .'[Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($p))"';
            $value = shell_exec($command);

            return $value === null || $value === false ? trim($this->readLine()) : trim($value);
        }

        $tty = $this->usingConsole ? ' < /dev/tty' : '';
        shell_exec('stty -echo'.$tty);

        try {
            return trim($this->readLine());
        } finally {
            shell_exec('stty echo'.$tty);
        }
    }

    private function number(string $value): ?int
    {
        return ctype_digit($value) ? (int) $value : null;
    }
}
