export interface UploadResult {
  fileName: string;
  path: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface UploadFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface StorageProvider {
  upload(fileName: string, buffer: Buffer, mimeType: string, folder: string): Promise<UploadResult>;

  delete(relativePath: string): Promise<void>;

  getBuffer(relativePath: string): Promise<Buffer>;
}
