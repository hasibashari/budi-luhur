export interface StorageUploadResult {
  path: string; // Relative path/key, e.g. "/uploads/articles/art_0541.png"
  url: string; // Full URL or relative access URL
  size: number;
  mimeType: string;
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

