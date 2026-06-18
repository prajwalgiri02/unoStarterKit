<?php

namespace App\Services;

use Aws\S3\S3Client;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Exception;

class VideoUploadService
{
    protected string $bucket;
    protected S3Client $s3Client;

    public function __construct()
    {
        $this->bucket = config('filesystems.disks.s3.bucket');
        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('s3');
        $this->s3Client = $disk->getClient();
    }

    /**
     * Save a video chunk and return the path if the upload is complete.
     *
     * @param array{file_id: string, chunk_number: int, total_chunks: int, chunk: UploadedFile, file_name?: string} $data
     * @return array{file_id: string, file_name: string, progress: float, completed: bool, file_path: string|null}
     * @throws Exception
     */
    public function saveVideo(array $data): array
    {
        $fileId = $data['file_id'];
        $chunkNumber = (int) $data['chunk_number'];
        $totalChunks = (int) $data['total_chunks'];
        $chunk = $data['chunk'];
        $fileName = $data['file_name'] ?? $chunk->getClientOriginalName();

        $cacheKeyUploadId = "video_upload_id_{$fileId}";
        $cacheKeyParts = "video_upload_parts_{$fileId}";
        $cacheKeyProgress = "video_upload_progress_{$fileId}";
        $cacheKeyFilePath = "video_uploaded_file_{$fileId}";

        $s3Key = "uploads/videos/{$fileId}_{$fileName}";

        try {
            // Start multipart upload if it's the first chunk or we don't have an upload ID
            if ($chunkNumber === 1 || !Cache::has($cacheKeyUploadId)) {
                $result = $this->s3Client->createMultipartUpload([
                    'Bucket' => $this->bucket,
                    'Key' => $s3Key,
                    'ContentType' => $chunk->getMimeType(),
                ]);
                Cache::put($cacheKeyUploadId, $result['UploadId'], now()->addHours(6));
            }

            $uploadId = Cache::get($cacheKeyUploadId);

            if (!$uploadId) {
                throw new Exception("UploadId missing for file {$fileId}");
            }

            // Track uploaded parts
            $parts = Cache::get($cacheKeyParts, []);
            
            // Check if this chunk was already uploaded to avoid redundant S3 calls
            $existingPart = collect($parts)->firstWhere('PartNumber', $chunkNumber);
            
            if (!$existingPart) {
                Log::info("Uploading chunk {$chunkNumber}/{$totalChunks} for file {$fileId}");
                
                $uploadPart = $this->s3Client->uploadPart([
                    'Bucket' => $this->bucket,
                    'Key' => $s3Key,
                    'UploadId' => $uploadId,
                    'PartNumber' => $chunkNumber,
                    'Body' => fopen($chunk->getRealPath(), 'rb'),
                ]);

                $parts[] = [
                    'PartNumber' => $chunkNumber,
                    'ETag' => $uploadPart['ETag'],
                ];
                
                // Sort parts by PartNumber to ensure they are in order for completion
                usort($parts, fn($a, $b) => $a['PartNumber'] <=> $b['PartNumber']);
                
                Cache::put($cacheKeyParts, $parts, now()->addHours(6));
            } else {
                Log::info("Chunk {$chunkNumber} already uploaded for file {$fileId}, skipping S3 call.");
            }

            // Track progress based on total parts uploaded
            $progress = round((count($parts) / $totalChunks) * 100, 2);
            Cache::put($cacheKeyProgress, $progress, now()->addHours(6));

                // Complete multipart upload on last chunk
            if ($chunkNumber === $totalChunks) {
                $this->s3Client->completeMultipartUpload([
                    'Bucket' => $this->bucket,
                    'Key' => $s3Key,
                    'UploadId' => $uploadId,
                    'MultipartUpload' => ['Parts' => $parts],
                ]);

                // Cleanup all temporary upload data
                $this->cleanup($fileId);
            }

            return [
                'file_id' => $fileId,
                'file_name' => $fileName,
                'progress' => $progress,
                'completed' => $chunkNumber === $totalChunks,
                'file_path' => $chunkNumber === $totalChunks ? $s3Key : null,
            ];

        } catch (Exception $e) {
            Log::error("S3 chunk upload failed for file {$fileId}: {$e->getMessage()}", [
                'file_id' => $fileId,
                'chunk_number' => $chunkNumber,
                'exception' => $e
            ]);
            throw $e;
        }
    }

    /**
     * Get upload progress
     */
    public function getProgress(string $fileId): float
    {
        return (float) Cache::get("video_upload_progress_{$fileId}", 0);
    }

    /**
     * Get uploaded S3 file path
     */
    public function getUploadedFilePath(string $fileId): ?string
    {
        return Cache::get("video_uploaded_file_{$fileId}");
    }

    /**
     * Cleanup cache for a file
     */
    public function cleanup(string $fileId): void
    {
        Cache::forget("video_upload_id_{$fileId}");
        Cache::forget("video_upload_parts_{$fileId}");
        Cache::forget("video_upload_progress_{$fileId}");
        Cache::forget("video_uploaded_file_{$fileId}");
    }
}
