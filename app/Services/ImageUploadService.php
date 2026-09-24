<?php

declare(strict_types=1);

namespace App\Services;

use Exception;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

final class ImageUploadService
{
    /**
     * The disk to use for uploads.
     */
    private string $disk;

    public function __construct(?string $disk = null)
    {
        $this->disk = $disk ?? config('filesystems.uploads', 'public');
    }

    /**
     * Upload an image to S3.
     *
     * @return string The path to the uploaded file
     *
     * @throws Exception
     */
    public function upload(UploadedFile $file, string $folder = 'uploads/images', ?string $filename = null): string
    {
        if (! $file->isValid()) {
            throw new Exception('Invalid file upload.');
        }

        // Generate a unique filename if not provided
        if (! $filename) {
            $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
        }

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk($this->disk);

        $path = $disk->putFileAs($folder, $file, $filename);

        if (! $path) {
            throw new Exception('Failed to upload image to S3.');
        }

        return $path;
    }

    /**
     * Delete an image from S3.
     */
    public function delete(?string $path): bool
    {
        if (! $path) {
            return false;
        }

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk($this->disk);

        if ($disk->exists($path)) {
            return $disk->delete($path);
        }

        return false;
    }

    /**
     * Get the full URL for an image.
     */
    public function getUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk($this->disk);

        return $disk->url($path);
    }

    /**
     * Get a temporary URL for an image (private buckets).
     */
    public function getTemporaryUrl(?string $path, \DateTimeInterface $expiration): ?string
    {
        if (! $path) {
            return null;
        }

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk($this->disk);

        return $disk->temporaryUrl($path, $expiration);
    }
}
