import { prisma } from '../config/database';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import type { MovementFilters, MovementType } from '../validators/movements.validator';

// ─── Shared Movement shape ────────────────────────────────────────────────────

export interface Movement {
  id: string;
  type: MovementType;
  amount: number;
  description: string | null;
  category: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  };
  transactionDate: string;
  createdAt: string;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function buildDateFilter(startDate?: string, endDate?: string) {
  if (!startDate && !endDate) return undefined;
  return {
    ...(startDate && { gte: new Date(startDate) }),
    ...(endDate && { lte: new Date(endDate) }),
  };
}

function toMovement(
  record: {
    id: string;
    amount: unknown;
    description: string | null;
    transactionDate: Date;
    createdAt: Date;
    category: { id: string; name: string; icon: string | null; color: string | null };
  },
  type: MovementType,
): Movement {
  return {
    id: record.id,
    type,
    amount: Number(record.amount),
    description: record.description,
    category: {
      id: record.category.id,
      name: record.category.name,
      icon: record.category.icon,
      color: record.category.color,
    },
    transactionDate: record.transactionDate.toISOString().split('T')[0],
    createdAt: record.createdAt.toISOString(),
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const movementsService = {
  /**
   * GET /movements
   * Fetches incomes and/or expenses, merges them, sorts by transactionDate DESC,
   * and returns a paginated slice.
   *
   * Pagination is applied AFTER merging so the page boundaries are consistent
   * across a unified sorted list.
   */
  async getAll(
    userId: string,
    rawPage: unknown,
    rawLimit: unknown,
    filters: MovementFilters,
  ) {
    const { page, limit } = parsePagination(rawPage, rawLimit);
    const dateFilter = buildDateFilter(filters.startDate, filters.endDate);

    const categoryWhere = filters.categoryId ? { categoryId: filters.categoryId } : {};
    const dateWhere = dateFilter ? { transactionDate: dateFilter } : {};
    const baseWhere = { userId, ...categoryWhere, ...dateWhere };

    const includeCategory = { category: true } as const;

    // Fetch only the relevant tables based on the `type` filter
    const [rawIncomes, rawExpenses] = await Promise.all([
      filters.type === 'EXPENSE'
        ? Promise.resolve([])
        : prisma.income.findMany({
            where: baseWhere,
            orderBy: { transactionDate: 'desc' },
            include: includeCategory,
          }),
      filters.type === 'INCOME'
        ? Promise.resolve([])
        : prisma.expense.findMany({
            where: baseWhere,
            orderBy: { transactionDate: 'desc' },
            include: includeCategory,
          }),
    ]);

    // Transform to unified Movement shape
    const incomeMovements = rawIncomes.map((r) => toMovement(r, 'INCOME'));
    const expenseMovements = rawExpenses.map((r) => toMovement(r, 'EXPENSE'));

    // Merge and sort DESC by transactionDate, then by createdAt as tie-breaker
    const merged = [...incomeMovements, ...expenseMovements].sort((a, b) => {
      const dateDiff =
        new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Paginate the merged result
    const total = merged.length;
    const skip = (page - 1) * limit;
    const movements = merged.slice(skip, skip + limit);
    const meta = buildPaginationMeta(total, page, limit);

    return { movements, meta };
  },

  /**
   * GET /movements/:id
   * Looks in incomes first; if not found, looks in expenses.
   */
  async getById(id: string, userId: string): Promise<Movement> {
    const income = await prisma.income.findFirst({
      where: { id, userId },
      include: { category: true },
    });

    if (income) {
      return toMovement(income, 'INCOME');
    }

    const expense = await prisma.expense.findFirst({
      where: { id, userId },
      include: { category: true },
    });

    if (expense) {
      return toMovement(expense, 'EXPENSE');
    }

    throw { statusCode: 404, message: 'Movement not found' };
  },

  /**
   * GET /movements/summary
   * Returns aggregate totals for the given date range (defaults to current month).
   */
  async getSummary(userId: string, startDate?: string, endDate?: string) {
    const now = new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate
      ? new Date(endDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const dateWhere = { transactionDate: { gte: start, lte: end } };

    const [incomeAgg, expenseAgg, incomeCount, expenseCount] = await Promise.all([
      prisma.income.aggregate({
        where: { userId, ...dateWhere },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { userId, ...dateWhere },
        _sum: { amount: true },
      }),
      prisma.income.count({ where: { userId, ...dateWhere } }),
      prisma.expense.count({ where: { userId, ...dateWhere } }),
    ]);

    const totalIncome = Number(incomeAgg._sum.amount || 0);
    const totalExpense = Number(expenseAgg._sum.amount || 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      movementsCount: incomeCount + expenseCount,
      incomeCount,
      expenseCount,
      period: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      },
    };
  },
};
