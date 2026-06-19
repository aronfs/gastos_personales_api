import { prisma } from '../config/database';
import { PaginationParams } from '../utils/pagination';

export const expensesRepository = {
  async findAll(
    userId: string,
    params: PaginationParams,
    filters: { categoryId?: string; startDate?: string; endDate?: string },
  ) {
    const where = {
      userId,
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.startDate || filters.endDate
        ? {
            transactionDate: {
              ...(filters.startDate && { gte: new Date(filters.startDate) }),
              ...(filters.endDate && { lte: new Date(filters.endDate) }),
            },
          }
        : {}),
    };

    const [total, expenses] = await Promise.all([
      prisma.expense.count({ where }),
      prisma.expense.findMany({
        where,
        skip: params.skip,
        take: params.limit,
        orderBy: { transactionDate: 'desc' },
        include: {
          category: true,
          expenseProducts: {
            include: {
              product: true,
            },
          },
        },
      }),
    ]);

    return { total, expenses };
  },

  async findById(id: string, userId: string) {
    return prisma.expense.findFirst({
      where: { id, userId },
      include: {
        category: true,
        expenseProducts: {
          include: {
            product: true,
          },
        },
      },
    });
  },

  async create(data: {
    userId: string;
    categoryId: string;
    amount: number;
    description?: string | null;
    transactionDate: Date;
  }) {
    return prisma.expense.create({
      data,
      include: {
        category: true,
        expenseProducts: {
          include: {
            product: true,
          },
        },
      },
    });
  },

  async update(
    id: string,
    userId: string,
    data: {
      categoryId?: string;
      amount?: number;
      description?: string | null;
      transactionDate?: Date;
    },
  ) {
    return prisma.expense.update({
      where: { id },
      data,
      include: {
        category: true,
        expenseProducts: {
          include: {
            product: true,
          },
        },
      },
    });
  },

  async delete(id: string) {
    return prisma.expense.delete({ where: { id } });
  },

  async getTotalByPeriod(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const result = await prisma.expense.aggregate({
      where: {
        userId,
        transactionDate: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });
    return Number(result._sum.amount || 0);
  },

  async getMonthlyTotals(userId: string, year: number) {
    const results = await prisma.$queryRaw<{ month: number; total: number }[]>`
      SELECT 
        EXTRACT(MONTH FROM transaction_date)::int AS month,
        SUM(amount)::float AS total
      FROM expenses
      WHERE user_id = ${userId}::uuid
        AND EXTRACT(YEAR FROM transaction_date) = ${year}
      GROUP BY month
      ORDER BY month
    `;
    return results;
  },

  async getCategoryTotals(userId: string, startDate: Date, endDate: Date) {
    return prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        transactionDate: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
      _count: true,
    });
  },
};
