import { incomesRepository } from '../repositories/incomes.repository';
import { expensesRepository } from '../repositories/expenses.repository';
import { categoriesRepository } from '../repositories/categories.repository';
import { prisma } from '../config/database';

export const dashboardService = {
  async getSummary(userId: string) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    const allTimeStart = new Date(2000, 0, 1);

    const [
      totalIncome,
      totalExpense,
      monthlyIncome,
      monthlyExpense,
      incomeCategoryTotals,
      expenseCategoryTotals,
    ] = await Promise.all([
      incomesRepository.getTotalByPeriod(userId, allTimeStart, now),
      expensesRepository.getTotalByPeriod(userId, allTimeStart, now),
      incomesRepository.getTotalByPeriod(userId, monthStart, monthEnd),
      expensesRepository.getTotalByPeriod(userId, monthStart, monthEnd),
      incomesRepository.getCategoryTotals(userId, monthStart, monthEnd),
      expensesRepository.getCategoryTotals(userId, monthStart, monthEnd),
    ]);

    // Fetch category details for summaries
    const incomeCategoryIds = incomeCategoryTotals.map((c) => c.categoryId);
    const expenseCategoryIds = expenseCategoryTotals.map((c) => c.categoryId);

    const allCategoryIds = [...new Set([...incomeCategoryIds, ...expenseCategoryIds])];
    const categories = await prisma.category.findMany({
      where: { id: { in: allCategoryIds } },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    const incomeCategorySummary = incomeCategoryTotals.map((item) => {
      const cat = categoryMap.get(item.categoryId);
      return {
        categoryId: item.categoryId,
        categoryName: cat?.name || 'Unknown',
        categoryColor: cat?.color || null,
        categoryIcon: cat?.icon || null,
        total: Number(Number(item._sum.amount || 0).toFixed(2)),
        count: item._count,
      };
    });

    const expenseCategorySummary = expenseCategoryTotals.map((item) => {
      const cat = categoryMap.get(item.categoryId);
      return {
        categoryId: item.categoryId,
        categoryName: cat?.name || 'Unknown',
        categoryColor: cat?.color || null,
        categoryIcon: cat?.icon || null,
        total: Number(Number(item._sum.amount || 0).toFixed(2)),
        count: item._count,
      };
    });

    const roundedTotalIncome = Number(totalIncome.toFixed(2));
    const roundedTotalExpense = Number(totalExpense.toFixed(2));
    const roundedMonthlyIncome = Number(monthlyIncome.toFixed(2));
    const roundedMonthlyExpense = Number(monthlyExpense.toFixed(2));

    return {
      totalIncome: roundedTotalIncome,
      totalExpense: roundedTotalExpense,
      currentBalance: Number((roundedTotalIncome - roundedTotalExpense).toFixed(2)),
      monthlyIncome: roundedMonthlyIncome,
      monthlyExpense: roundedMonthlyExpense,
      monthlyBalance: Number((roundedMonthlyIncome - roundedMonthlyExpense).toFixed(2)),
      categorySummary: {
        income: incomeCategorySummary,
        expense: expenseCategorySummary,
      },
      period: {
        month: currentMonth + 1,
        year: currentYear,
        monthStart: monthStart.toISOString().split('T')[0],
        monthEnd: monthEnd.toISOString().split('T')[0],
      },
    };
  },
};
