<?php

declare(strict_types=1);

namespace Installer;

use FilesystemIterator;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

final class ModuleRemover
{
    private const SCANNED_DIRECTORIES = ['app', 'bootstrap', 'config', 'database', 'resources/js', 'routes', 'tests'];

    private const SCANNED_EXTENSIONS = ['php', 'ts', 'tsx'];

    public function __construct(private readonly string $basePath) {}

    /**
     * @param  array{paths: list<string>}  $module
     */
    public function isInstalled(array $module): bool
    {
        return file_exists($this->path($module['paths'][0]));
    }

    /**
     * @param  array{paths: list<string>}  $module
     * @return list<string>
     */
    public function remove(string $key, array $module): array
    {
        $changed = [];

        foreach ($module['paths'] as $relative) {
            $path = $this->path($relative);

            if (is_dir($path)) {
                $this->deleteDirectory($path);
                $changed[] = $relative.'/';
            } elseif (is_file($path)) {
                unlink($path);
                $changed[] = $relative;
            }
        }

        return [...$changed, ...$this->stripMarkedRegions($key)];
    }

    /**
     * @return list<string>
     */
    private function stripMarkedRegions(string $key): array
    {
        $start = '@module:'.$key;
        $end = '@endmodule:'.$key;
        $pattern = '/^[^\n]*'.preg_quote($start, '/').'\b[^\n]*\n.*?^[^\n]*'.preg_quote($end, '/').'\b[^\n]*(?:\n|\z)/ms';
        $edited = [];

        foreach (self::SCANNED_DIRECTORIES as $directory) {
            foreach ($this->files($this->path($directory)) as $file) {
                if (! in_array(pathinfo($file, PATHINFO_EXTENSION), self::SCANNED_EXTENSIONS, true)) {
                    continue;
                }

                $contents = (string) file_get_contents($file);

                if (! str_contains($contents, $start)) {
                    continue;
                }

                $eol = str_contains($contents, "\r\n") ? "\r\n" : "\n";
                $normalized = str_replace("\r\n", "\n", $contents);
                $stripped = (string) preg_replace($pattern, '', $normalized);

                if ($stripped === $normalized) {
                    continue;
                }

                file_put_contents($file, str_replace("\n", $eol, $stripped));
                $edited[] = $this->relative($file);
            }
        }

        return $edited;
    }

    /**
     * @return iterable<string>
     */
    private function files(string $directory): iterable
    {
        if (! is_dir($directory)) {
            return;
        }

        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($directory, FilesystemIterator::SKIP_DOTS),
        );

        foreach ($iterator as $file) {
            if ($file->isFile()) {
                yield $file->getPathname();
            }
        }
    }

    private function deleteDirectory(string $directory): void
    {
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($directory, FilesystemIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST,
        );

        foreach ($iterator as $item) {
            $item->isDir() && ! $item->isLink() ? rmdir($item->getPathname()) : unlink($item->getPathname());
        }

        rmdir($directory);
    }

    private function relative(string $file): string
    {
        return ltrim(str_replace('\\', '/', substr($file, strlen($this->basePath))), '/');
    }

    private function path(string $relative): string
    {
        return $this->basePath.DIRECTORY_SEPARATOR.str_replace('/', DIRECTORY_SEPARATOR, $relative);
    }
}
