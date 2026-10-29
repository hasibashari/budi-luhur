import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { IStorageService, StorageUploadResult } from './storage.interface.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class LocalStorageService implements IStorageService {
  private baseDir: string;
  private urlPrefix: string;

  constructor(customBaseDir?: string, urlPrefix: string = '/uploads') {
    // Default directory: <backendRoot>/public/uploads
    this.baseDir = customBaseDir || path.resolve(__dirname, '../../../public/uploads');
    this.urlPrefix = urlPrefix.replace(/\/+$/, '');
  }

  public getBaseDir(): string {
    return this.baseDir;
  }

  public async upload(
    fileBuffer: Buffer,
    destinationPath: string,
    mimeType: string,
  ): Promise<StorageUploadResult> {
    const cleanRelativePath = destinationPath.replace(/^(\/|uploads\/)+/, '');
    const absolutePath = path.resolve(this.baseDir, cleanRelativePath);

    // Security check: ensure path does not escape baseDir
    if (!absolutePath.startsWith(path.resolve(this.baseDir))) {
      throw new Error(`Directory traversal detected: ${destinationPath}`);
    }

    const dir = path.dirname(absolutePath);
    await fs.promises.mkdir(dir, { recursive: true });

    // Atomic write to avoid partial file reads
    const tempPath = `${absolutePath}.tmp.${Date.now()}`;
    await fs.promises.writeFile(tempPath, fileBuffer);
    await fs.promises.rename(tempPath, absolutePath);

    // Verify file exists and has content
    const stats = await fs.promises.stat(absolutePath);
    if (stats.size === 0) {
      throw new Error(`Written file is empty: ${absolutePath}`);
    }

    const publicPath = `${this.urlPrefix}/${cleanRelativePath}`;

    return {
      path: publicPath,
      url: publicPath,
      size: stats.size,
      mimeType,
    };
  }

  public async delete(destinationPath: string): Promise<boolean> {
    const cleanRelativePath = destinationPath.replace(/^(\/|uploads\/)+/, '');
    const absolutePath = path.resolve(this.baseDir, cleanRelativePath);

    if (!absolutePath.startsWith(path.resolve(this.baseDir))) {
      throw new Error(`Directory traversal detected: ${destinationPath}`);
    }

    try {
      if (fs.existsSync(absolutePath)) {
        await fs.promises.unlink(absolutePath);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public getUrl(storedPath: string): string {
    if (!storedPath) return '';
    if (storedPath.startsWith('http://') || storedPath.startsWith('https://')) {
      return storedPath;
    }
    const clean = storedPath.startsWith('/') ? storedPath : `/${storedPath}`;
    return clean;
  }

  public async exists(destinationPath: string): Promise<boolean> {
    const cleanRelativePath = destinationPath.replace(/^(\/|uploads\/)+/, '');
    const absolutePath = path.resolve(this.baseDir, cleanRelativePath);
    try {
      await fs.promises.access(absolutePath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }
}

