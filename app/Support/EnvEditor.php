<?php

declare(strict_types=1);

namespace App\Support;

final class EnvEditor
{
    private string $contents;

    public function __construct(private readonly string $path)
    {
        $this->contents = is_file($path) ? (string) file_get_contents($path) : '';
    }

    public function get(string $key): ?string
    {
        if (! preg_match('/^'.preg_quote($key, '/').'=(.*)$/m', $this->contents, $matches)) {
            return null;
        }

        $value = trim($matches[1]);

        if (preg_match('/^"(.*)"$/', $value, $quoted)) {
            return str_replace(['\\"', '\\$', '\\\\'], ['"', '$', '\\'], $quoted[1]);
        }

        if (preg_match("/^'(.*)'$/", $value, $quoted)) {
            return $quoted[1];
        }

        return $value === 'null' ? null : $value;
    }

    public function set(string $key, string|bool|null $value): void
    {
        $pattern = '/^'.preg_quote($key, '/').'=.*$/m';

        if ($value === null) {
            $this->contents = (string) preg_replace('/^'.preg_quote($key, '/').'=.*(\R|$)/m', '', $this->contents);

            return;
        }

        $line = $key.'='.$this->format($value);

        if (preg_match($pattern, $this->contents)) {
            $this->contents = (string) preg_replace_callback($pattern, fn (): string => $line, $this->contents, 1);

            return;
        }

        $this->contents = rtrim($this->contents).PHP_EOL.$line.PHP_EOL;
    }

    /**
     * @return list<string>
     */
    public function keys(): array
    {
        preg_match_all('/^([A-Za-z0-9_]+)=/m', $this->contents, $matches);

        return $matches[1];
    }

    public function save(): void
    {
        file_put_contents($this->path, $this->contents);
    }

    private function format(string|bool $value): string
    {
        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }

        if ($value === '' || preg_match('/^[A-Za-z0-9_.\/:@+-]+$/', $value)) {
            return $value;
        }

        if (! str_contains($value, "'")) {
            return "'{$value}'";
        }

        return '"'.addcslashes($value, '"\\$').'"';
    }
}
