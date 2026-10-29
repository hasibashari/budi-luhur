import { IStorageService, StorageUploadResult } from './storage.interface.js';

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
 *
 * Designed for future cloud deployment. When ready to migrate to S3:
 * 1. Install `@aws-sdk/client-s3`: `npm install @aws-sdk/client-s3`
 * 2. Set environment variables in `.env`:
 *    - `STORAGE_DRIVER=s3`
 *    - `AWS_REGION=ap-southeast-1`
 *    - `AWS_S3_BUCKET=temani-app3-assets`
 *    - `AWS_ACCESS_KEY_ID=...`
 *    - `AWS_SECRET_ACCESS_KEY=...`
 *    - `AWS_S3_CUSTOM_DOMAIN=https://...` (optional)
 */
export class S3StorageService implements IStorageService {
  private config: S3Config;

  constructor(config?: Partial<S3Config>) {
    this.config = {
      region: config?.region || process.env.AWS_REGION || 'ap-southeast-1',
      bucket: config?.bucket || process.env.AWS_S3_BUCKET || '',
      accessKeyId: config?.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: config?.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
      endpoint: config?.endpoint || process.env.AWS_S3_ENDPOINT,
      customDomain: config?.customDomain || process.env.AWS_S3_CUSTOM_DOMAIN,
    };
  }

  public async upload(
    fileBuffer: Buffer,
    destinationPath: string,
    mimeType: string,
  ): Promise<StorageUploadResult> {
    const cleanKey = destinationPath.replace(/^(\/|uploads\/)+/, '');

    if (!this.config.bucket) {
      throw new Error(
        'S3 storage is selected but AWS_S3_BUCKET is not configured in environment variables.',
      );
    }

    // Dynamic import to avoid hard dependency on @aws-sdk/client-s3 when running locally
    try {
      // @ts-ignore
      const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
      const s3Client = new S3Client({
        region: this.config.region,
        endpoint: this.config.endpoint,
        credentials:
          this.config.accessKeyId && this.config.secretAccessKey
            ? {
                accessKeyId: this.config.accessKeyId,
                secretAccessKey: this.config.secretAccessKey,
              }
            : undefined,
      });

      await s3Client.send(
        new PutObjectCommand({
          Bucket: this.config.bucket,
          Key: cleanKey,
          Body: fileBuffer,
          ContentType: mimeType,
        }),
      );

      const url = this.getUrl(cleanKey);
      return {
        path: cleanKey,
        url,
        size: fileBuffer.length,
        mimeType,
      };
    } catch (err: any) {
      if (err.code === 'ERR_MODULE_NOT_FOUND' || err.message?.includes('Cannot find module')) {
        throw new Error(
          'AWS SDK is not installed. Run `npm install @aws-sdk/client-s3` to enable AWS S3 storage driver.',
        );
      }
      throw err;
    }
  }

  public async delete(destinationPath: string): Promise<boolean> {
    const cleanKey = destinationPath.replace(/^(\/|uploads\/)+/, '');
    try {
      // @ts-ignore
      const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
      const s3Client = new S3Client({ region: this.config.region, endpoint: this.config.endpoint });
      await s3Client.send(
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
    const cleanKey = storedPath.replace(/^(\/|uploads\/)+/, '');

    if (this.config.customDomain) {
      return `${this.config.customDomain.replace(/\/+$/, '')}/${cleanKey}`;
    }

    return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${cleanKey}`;
  }

  public async exists(destinationPath: string): Promise<boolean> {
    const cleanKey = destinationPath.replace(/^(\/|uploads\/)+/, '');
    try {
      // @ts-ignore
      const { S3Client, HeadObjectCommand } = await import('@aws-sdk/client-s3');
      const s3Client = new S3Client({ region: this.config.region, endpoint: this.config.endpoint });
      await s3Client.send(
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

