import { CategoryType } from '@prisma/client';
import { prisma } from '../config/database';
import { PaginationParams } from '../utils/pagination';

export const categoriesRepository = {
  async findAll(userId: string, params: PaginationParams, type?: CategoryType) {
    const where = {
      userId,
      ...(type && { type }),
    };

    const [total, categories] = await Promise.all([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        skip: params.skip,
        take: params.limit,
        orderBy: [{ type: 'asc' }, { name: 'asc' }],
      }),
    ]);

    return { total, categories };
  },

  async findById(id: string, userId: string) {
    return prisma.category.findFirst({
      where: { id, userId },
    });
  },

  async findByNameAndType(userId: string, name: string, type: CategoryType) {
    return prisma.category.findUnique({
      where: { userId_name_type: { userId, name, type } },
    });
  },

  async create(data: {
    userId: string;
    name: string;
    icon?: string | null;
    color?: string | null;
    type: CategoryType;
  }) {
    return prisma.category.create({ data });
  },

  async update(
    id: string,
    userId: string,
    data: { name?: string; icon?: string | null; color?: string | null },
  ) {
    return prisma.category.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.category.delete({ where: { id } });
  },

  async hasTransactions(id: string): Promise<boolean> {
    const [incomes, expenses] = await Promise.all([
      prisma.income.count({ where: { categoryId: id } }),
      prisma.expense.count({ where: { categoryId: id } }),
    ]);
    return incomes + expenses > 0;
  },
};
