export interface StorageUploadResult {
  path: string; // Relative path/key, e.g. "/uploads/articles/art_0541.png"
  url: string; // Full URL or relative access URL
  size: number;
  mimeType: string;
}

export interface PresignedUploadResult {
  mode: 's3-presigned' | 'local-fallback';
  uploadUrl: string; // Pre-signed PUT URL for S3, or local upload POST endpoint
  fileUrl: string; // Final public URL of the uploaded object
  path: string; // Storage key/path (e.g. articles/art_1234_1730000000.png)
  headers?: Record<string, string>;
  expiresIn?: number; // In seconds
}

export interface IStorageService {
  /**
   * Upload / save a file buffer to storage
   */
  upload(
    fileBuffer: Buffer,
    destinationPath: string, // e.g. "articles/art_0541.png"
    mimeType: string,
  ): Promise<StorageUploadResult>;

  /**
   * Generate a pre-signed URL for direct upload from the client
   */
  getPresignedUploadUrl?(
    destinationPath: string,
    mimeType: string,
    expiresInSeconds?: number,
  ): Promise<PresignedUploadResult>;

  /**
   * Delete a file by path/key
   */
  delete(destinationPath: string): Promise<boolean>;

  /**
   * Resolve public URL for a stored file
   */
  getUrl(storedPath: string): string;

  /**
   * Check if file exists in storage
   */
  exists(destinationPath: string): Promise<boolean>;
}

