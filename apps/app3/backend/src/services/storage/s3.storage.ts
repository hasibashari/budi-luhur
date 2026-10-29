import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  IStorageService,
  StorageUploadResult,
  PresignedUploadResult,
} from './storage.interface.js';

export interface S3Config {
  region: string;
  bucket: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
  customDomain?: string; // CloudFront or CDN domain, e.g. "https://cdn.temani.id"
}

/**
 * AWS S3 Storage Service implementation.
 * Provides direct upload, presigned upload URLs, file deletion, and existence verification.
 */
export class S3StorageService implements IStorageService {
  private config: S3Config;
  private s3Client: S3Client | null = null;

  constructor(config?: Partial<S3Config>) {
    this.config = {
      region: config?.region || process.env.AWS_REGION || 'us-east-2',
      bucket: config?.bucket || process.env.AWS_S3_BUCKET || 'app3-storage',
      accessKeyId: config?.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: config?.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
      endpoint: config?.endpoint || process.env.AWS_ENDPOINT_URL_S3 || process.env.AWS_S3_ENDPOINT,
      customDomain: config?.customDomain || process.env.AWS_S3_CUSTOM_DOMAIN,
    };
  }

  private getClient(): S3Client {
    if (!this.s3Client) {
      this.s3Client = new S3Client({
        region: this.config.region,
        endpoint: this.config.endpoint,
        forcePathStyle: true,
        credentials:
          this.config.accessKeyId && this.config.secretAccessKey
            ? {
                accessKeyId: this.config.accessKeyId,
                secretAccessKey: this.config.secretAccessKey,
              }
            : undefined,
      });
    }
    return this.s3Client;
  }

  public extractKey(destinationPath: string): string {
    if (!destinationPath) return '';
    let key = destinationPath.trim();
    if (key.startsWith('http://') || key.startsWith('https://')) {
      try {
        const parsed = new URL(key);
        key = decodeURIComponent(parsed.pathname);
      } catch {
        // keep as is
      }
    }

    // Hapus nama bucket jika ada di awal pathname (misal: /app3-storage/articles/...)
    if (this.config.bucket) {
      const bucketPattern = new RegExp(`^/?${this.config.bucket}/`, 'i');
      key = key.replace(bucketPattern, '');
    }

    // Hapus awalan '/' atau 'uploads/' jika ada
    key = key.replace(/^(\/|uploads\/)+/, '');
    return key;
  }

  public async getPresignedUploadUrl(
    destinationPath: string,
    mimeType: string,
    expiresInSeconds: number = 300,
  ): Promise<PresignedUploadResult> {
    const cleanKey = this.extractKey(destinationPath);

    if (!this.config.bucket) {
      throw new Error(
        'S3 storage is selected but AWS_S3_BUCKET is not configured in environment variables.',
      );
    }

    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: cleanKey,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(this.getClient(), command, {
      expiresIn: expiresInSeconds,
    });

    return {
      mode: 's3-presigned',
      uploadUrl,
      fileUrl: this.getUrl(cleanKey),
      path: cleanKey,
      headers: {
        'Content-Type': mimeType,
      },
      expiresIn: expiresInSeconds,
    };
  }

  public async upload(
    fileBuffer: Buffer,
    destinationPath: string,
    mimeType: string,
  ): Promise<StorageUploadResult> {
    const cleanKey = this.extractKey(destinationPath);

    if (!this.config.bucket) {
      throw new Error(
        'S3 storage is selected but AWS_S3_BUCKET is not configured in environment variables.',
      );
    }

    await this.getClient().send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: cleanKey,
        Body: fileBuffer,
        ContentType: mimeType,
      }),
    );

    return {
      path: cleanKey,
      url: this.getUrl(cleanKey),
      size: fileBuffer.length,
      mimeType,
    };
  }

  public async delete(destinationPath: string): Promise<boolean> {
    const cleanKey = this.extractKey(destinationPath);
    try {
      await this.getClient().send(
        new DeleteObjectCommand({
          Bucket: this.config.bucket,
          Key: cleanKey,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  public getUrl(storedPath: string): string {
    if (!storedPath) return '';
    if (storedPath.startsWith('http://') || storedPath.startsWith('https://')) {
      return storedPath;
    }
    const cleanKey = this.extractKey(storedPath);

    if (this.config.customDomain) {
      return `${this.config.customDomain.replace(/\/+$/, '')}/${cleanKey}`;
    }

    if (this.config.endpoint) {
      return `${this.config.endpoint.replace(/\/+$/, '')}/${this.config.bucket}/${cleanKey}`;
    }

    return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${cleanKey}`;
  }

  public async exists(destinationPath: string): Promise<boolean> {
    const cleanKey = this.extractKey(destinationPath);
    try {
      await this.getClient().send(
        new HeadObjectCommand({
          Bucket: this.config.bucket,
          Key: cleanKey,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }
}
