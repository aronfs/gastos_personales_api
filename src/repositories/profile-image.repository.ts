import { prisma } from '../config/database';

export const profileImageRepository = {
  async findByUserId(userId: string) {
    return prisma.userImage.findUnique({ where: { userId } });
  },

  async create(data: {
    userId: string;
    fileName: string;
    filePath: string;
    fileUrl: string;
    mimeType: string;
    fileSize: number;
  }) {
    return prisma.userImage.create({ data });
  },

  async update(
    userId: string,
    data: {
      fileName: string;
      filePath: string;
      fileUrl: string;
      mimeType: string;
      fileSize: number;
    },
  ) {
    return prisma.userImage.update({ where: { userId }, data });
  },

  async delete(userId: string) {
    return prisma.userImage.delete({ where: { userId } });
  },
};
