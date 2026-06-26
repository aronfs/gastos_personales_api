import path from 'path';
import { randomUUID } from 'crypto';
import { env } from '../config/env';
import { LocalStorageProvider } from './providers/local-storage.provider';
import type { StorageProvider, UploadResult, UploadFile } from './interfaces/storage-provider.interface';

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export class ImageBucketService {
  constructor(private readonly provider: StorageProvider) {}

  async uploadImage(file: UploadFile, folder: string): Promise<UploadResult> {
    const ext = MIME_TO_EXT[file.mimetype] || path.extname(file.originalname).toLowerCase().replace('.', '');
    const uniqueName = `${randomUUID().split('-')[0]}_${Date.now()}.${ext}`;

    return this.provider.upload(uniqueName, file.buffer, file.mimetype, folder);
  }

  async deleteImage(relativePath: string): Promise<void> {
    await this.provider.delete(relativePath);
  }

  async getImage(relativePath: string): Promise<Buffer> {
    return this.provider.getBuffer(relativePath);
  }
}

export const imageBucketService = new ImageBucketService(
  new LocalStorageProvider(env.IMAGE_STORAGE_PATH),
);
