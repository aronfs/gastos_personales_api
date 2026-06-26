import fs from 'fs/promises';
import path from 'path';
import type { StorageProvider, UploadResult } from '../interfaces/storage-provider.interface';

/**
 * Implementación local del StorageProvider.
 * Guarda los archivos en el sistema de archivos del servidor.
 * Para migrar a S3/Azure/GCP, solo hay que crear un nuevo provider
 * que implemente StorageProvider y cambiar la instancia en el contenedor.
 */
export class LocalStorageProvider implements StorageProvider {
  constructor(private readonly basePath: string) {}

  /**
   * Resuelve la ruta absoluta asegurando que no haya path traversal.
   */
  private resolveSafePath(relativePath: string): string {
    const resolved = path.resolve(this.basePath, relativePath);

    if (!resolved.startsWith(path.resolve(this.basePath))) {
      throw { statusCode: 400, message: 'Invalid path: directory traversal detected' };
    }

    return resolved;
  }

  async upload(
    fileName: string,
    buffer: Buffer,
    _mimeType: string,
    folder: string,
  ): Promise<UploadResult> {
    const safeFolder = folder.replace(/\.\.\//g, '').replace(/^\/+|\/+$/g, '');
    const relativePath = `${safeFolder}/${fileName}`;
    const absolutePath = this.resolveSafePath(relativePath);

    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, buffer);

    return {
      fileName,
      path: relativePath,
      url: `/storage/images/${relativePath}`,
      size: buffer.length,
      mimeType: _mimeType,
    };
  }

  async delete(relativePath: string): Promise<void> {
    const absolutePath = this.resolveSafePath(relativePath);

    try {
      await fs.unlink(absolutePath);
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        return;
      }
      throw { statusCode: 500, message: 'Failed to delete file' };
    }
  }

  async getBuffer(relativePath: string): Promise<Buffer> {
    const absolutePath = this.resolveSafePath(relativePath);

    try {
      return await fs.readFile(absolutePath);
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        throw { statusCode: 404, message: 'File not found' };
      }
      throw { statusCode: 500, message: 'Failed to read file' };
    }
  }
}
