import { prisma } from '../config/database';

export const reportsRepository = {
  async getMonthlyReport(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [incomes, expenses] = await Promise.all([
      prisma.income.findMany({
        where: {
          userId,
          transactionDate: { gte: startDate, lte: endDate },
        },
        include: { category: true },
        orderBy: { transactionDate: 'asc' },
      }),
      prisma.expense.findMany({
        where: {
          userId,
          transactionDate: { gte: startDate, lte: endDate },
        },
        include: { category: true },
        orderBy: { transactionDate: 'asc' },
      }),
    ]);

    return { incomes, expenses };
  },

  async getYearlyReport(userId: string, year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const [incomesByMonth, expensesByMonth] = await Promise.all([
      prisma.$queryRaw<{ month: number; total: number; count: number }[]>`
        SELECT 
          EXTRACT(MONTH FROM transaction_date)::int AS month,
          SUM(amount)::float AS total,
          COUNT(*)::int AS count
        FROM incomes
        WHERE user_id = ${userId}::uuid
          AND transaction_date BETWEEN ${startDate} AND ${endDate}
        GROUP BY month
        ORDER BY month
      `,
      prisma.$queryRaw<{ month: number; total: number; count: number }[]>`
        SELECT 
          EXTRACT(MONTH FROM transaction_date)::int AS month,
          SUM(amount)::float AS total,
          COUNT(*)::int AS count
        FROM expenses
        WHERE user_id = ${userId}::uuid
          AND transaction_date BETWEEN ${startDate} AND ${endDate}
        GROUP BY month
        ORDER BY month
      `,
    ]);

    return { incomesByMonth, expensesByMonth };
  },

  async getCategoriesReport(userId: string, startDate: Date, endDate: Date) {
    const [incomesByCategory, expensesByCategory] = await Promise.all([
      prisma.$queryRaw<
        { categoryId: string; categoryName: string; total: number; count: number }[]
      >`
        SELECT 
          c.id AS "categoryId",
          c.name AS "categoryName",
          c.color,
          c.icon,
          SUM(i.amount)::float AS total,
          COUNT(*)::int AS count
        FROM incomes i
        JOIN categories c ON c.id = i.category_id
        WHERE i.user_id = ${userId}::uuid
          AND i.transaction_date BETWEEN ${startDate} AND ${endDate}
        GROUP BY c.id, c.name, c.color, c.icon
        ORDER BY total DESC
      `,
      prisma.$queryRaw<
        { categoryId: string; categoryName: string; total: number; count: number }[]
      >`
        SELECT 
          c.id AS "categoryId",
          c.name AS "categoryName",
          c.color,
          c.icon,
          SUM(e.amount)::float AS total,
          COUNT(*)::int AS count
        FROM expenses e
        JOIN categories c ON c.id = e.category_id
        WHERE e.user_id = ${userId}::uuid
          AND e.transaction_date BETWEEN ${startDate} AND ${endDate}
        GROUP BY c.id, c.name, c.color, c.icon
        ORDER BY total DESC
      `,
    ]);

    return { incomesByCategory, expensesByCategory };
  },
};
