<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Support\Facades\File;

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
     * @return list<string> Files and directories that were deleted or edited.
     */
    public function remove(string $key, array $module): array
    {
        $changed = [];

        foreach ($module['paths'] as $relative) {
            $path = $this->path($relative);

            if (is_dir($path)) {
                File::deleteDirectory($path);
                $changed[] = $relative.'/';
            } elseif (is_file($path)) {
                File::delete($path);
                $changed[] = $relative;
            }
        }

        return [...$changed, ...$this->stripMarkedRegions($key)];
    }

    /**
     * Deletes every region between a start and end marker for this module in
     * shared files, including the marker lines.
     *
     * @return list<string>
     */
    private function stripMarkedRegions(string $key): array
    {
        $start = '@module:'.$key;
        $end = '@endmodule:'.$key;
        $pattern = '/^[^\n]*'.preg_quote($start, '/').'\b[^\n]*\n.*?^[^\n]*'.preg_quote($end, '/').'\b[^\n]*(?:\n|\z)/ms';
        $edited = [];

        foreach (self::SCANNED_DIRECTORIES as $directory) {
            if (! is_dir($this->path($directory))) {
                continue;
            }

            foreach (File::allFiles($this->path($directory)) as $file) {
                if (! in_array($file->getExtension(), self::SCANNED_EXTENSIONS, true)) {
                    continue;
                }

                $contents = $file->getContents();

                if (! str_contains($contents, $start)) {
                    continue;
                }

                $eol = str_contains($contents, "\r\n") ? "\r\n" : "\n";
                $normalized = str_replace("\r\n", "\n", $contents);
                $stripped = (string) preg_replace($pattern, '', $normalized);

                if ($stripped === $normalized) {
                    continue;
                }

                File::put($file->getPathname(), str_replace("\n", $eol, $stripped));
                $edited[] = $directory.'/'.str_replace('\\', '/', $file->getRelativePathname());
            }
        }

        return $edited;
    }

    private function path(string $relative): string
    {
        return $this->basePath.DIRECTORY_SEPARATOR.str_replace('/', DIRECTORY_SEPARATOR, $relative);
    }
}
