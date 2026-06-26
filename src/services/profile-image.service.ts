import { profileImageRepository } from '../repositories/profile-image.repository';
import { imageBucketService } from '../storage/image-bucket.service';
import type { UploadFile } from '../storage/interfaces/storage-provider.interface';

export const profileImageService = {
  async getByUserId(userId: string) {
    const image = await profileImageRepository.findByUserId(userId);
    if (!image) {
      throw { statusCode: 404, message: 'Profile image not found' };
    }

    return {
      id: image.id,
      user_id: image.userId,
      file_name: image.fileName,
      file_url: image.fileUrl,
      mime_type: image.mimeType,
      file_size: image.fileSize,
      created_at: image.createdAt,
      updated_at: image.updatedAt,
    };
  },

  async getFileUrl(userId: string): Promise<string> {
    const image = await profileImageRepository.findByUserId(userId);
    if (!image) {
      throw { statusCode: 404, message: 'Profile image not found' };
    }
    return image.fileUrl;
  },

  async upload(userId: string, file: UploadFile) {
    const folder = `users/profile/${userId}`;

    const existing = await profileImageRepository.findByUserId(userId);
    if (existing) {
      await imageBucketService.deleteImage(existing.filePath);
      await profileImageRepository.delete(userId);
    }

    const result = await imageBucketService.uploadImage(file, folder);

    const image = await profileImageRepository.create({
      userId,
      fileName: result.fileName,
      filePath: result.path,
      fileUrl: result.url,
      mimeType: result.mimeType,
      fileSize: result.size,
    });

    return {
      id: image.id,
      user_id: image.userId,
      file_name: image.fileName,
      file_url: image.fileUrl,
      mime_type: image.mimeType,
      file_size: image.fileSize,
      created_at: image.createdAt,
      updated_at: image.updatedAt,
    };
  },

  async delete(userId: string) {
    const image = await profileImageRepository.findByUserId(userId);
    if (!image) {
      throw { statusCode: 404, message: 'Profile image not found' };
    }

    await imageBucketService.deleteImage(image.filePath);
    await profileImageRepository.delete(userId);
  },
};
