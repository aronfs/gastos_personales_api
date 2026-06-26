import { imageBucketService } from '../storage/image-bucket.service';
import type { UploadImageInput } from '../validators/images.validator';
import type { UploadFile } from '../storage/interfaces/storage-provider.interface';

export const imagesService = {
  async upload(file: UploadFile, input: UploadImageInput) {
    const folder = input.folder.replace(/^\/+|\/+$/g, '');
    const result = await imageBucketService.uploadImage(file, folder);

    return {
      file_name: result.fileName,
      path: result.path,
      url: result.url,
      size: result.size,
      mime_type: result.mimeType,
    };
  },
};
