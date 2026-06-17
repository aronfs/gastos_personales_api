import { prisma } from '../config/database';
import { PaginationParams } from '../utils/pagination';

export const usersRepository = {
  async findAll(params: PaginationParams, search?: string, active?: boolean) {
    const where = {
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(active !== undefined && { active }),
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: params.skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          roles: {
            include: { role: true },
          },
        },
      }),
    ]);

    return { total, users };
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: { role: true },
        },
        settings: true,
      },
    });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async create(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    roleIds?: string[];
  }) {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        roles: {
          create: (data.roleIds || []).map((roleId) => ({ roleId })),
        },
        settings: {
          create: {
            currency: 'USD',
            language: 'es',
            theme: 'light',
            notificationsEnabled: true,
          },
        },
      },
      include: {
        roles: { include: { role: true } },
      },
    });
  },

  async update(id: string, data: { firstName?: string; lastName?: string; active?: boolean }) {
    return prisma.user.update({
      where: { id },
      data,
      include: {
        roles: { include: { role: true } },
      },
    });
  },

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  },

  async findRoleByName(name: string) {
    return prisma.role.findUnique({ where: { name } });
  },
};
