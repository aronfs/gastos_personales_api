import { prisma } from '../config/database';
import { PaginationParams } from '../utils/pagination';

export const productsRepository = {
  async findAll(
    params: PaginationParams,
    filters: { categoryId?: string; active?: boolean },
  ) {
    const where = {
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.active !== undefined && { active: filters.active }),
    };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip: params.skip,
        take: params.limit,
        orderBy: { name: 'asc' },
        include: {
          category: true,
        },
      }),
    ]);

    return { total, products };
  },

  async findById(id: string) {
    return prisma.product.findFirst({
      where: { id },
      include: { category: true },
    });
  },

  async findByIds(ids: string[]) {
    return prisma.product.findMany({
      where: { id: { in: ids }, active: true },
    });
  },

  async create(data: {
    categoryId: string;
    name: string;
    description?: string | null;
    unitPrice: number;
  }) {
    return prisma.product.create({
      data,
      include: { category: true },
    });
  },

  async update(
    id: string,
    data: {
      categoryId?: string;
      name?: string;
      description?: string | null;
      unitPrice?: number;
      active?: boolean;
    },
  ) {
    return prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });
  },

  async delete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { active: false },
    });
  },
};
