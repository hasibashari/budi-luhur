import { IStorageService } from './storage.interface.js';
import { LocalStorageService } from './local.storage.js';
import { S3StorageService } from './s3.storage.js';

export * from './storage.interface.js';
export * from './local.storage.js';
export * from './s3.storage.js';

let storageInstance: IStorageService | null = null;

export function getStorageService(): IStorageService {
  if (storageInstance) {
    return storageInstance;
  }

  const driver = process.env.STORAGE_DRIVER || 'local';

  if (driver.toLowerCase() === 's3') {
    storageInstance = new S3StorageService();
  } else {
    storageInstance = new LocalStorageService();
  }

  return storageInstance;
}

