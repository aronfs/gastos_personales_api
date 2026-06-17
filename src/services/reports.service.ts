import { reportsRepository } from '../repositories/reports.repository';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const reportsService = {
  async getMonthlyReport(userId: string, rawYear?: string, rawMonth?: string) {
    const now = new Date();
    const year = rawYear ? parseInt(rawYear, 10) : now.getFullYear();
    const month = rawMonth ? parseInt(rawMonth, 10) : now.getMonth() + 1;

    if (month < 1 || month > 12) {
      throw { statusCode: 400, message: 'Month must be between 1 and 12' };
    }

    const { incomes, expenses } = await reportsRepository.getMonthlyReport(userId, year, month);

    const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
    const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    return {
      period: {
        year,
        month,
        monthName: MONTH_NAMES[month - 1],
      },
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        transactionCount: incomes.length + expenses.length,
      },
      incomes: incomes.map((i) => ({
        ...i,
        amount: Number(i.amount),
      })),
      expenses: expenses.map((e) => ({
        ...e,
        amount: Number(e.amount),
      })),
    };
  },

  async getYearlyReport(userId: string, rawYear?: string) {
    const now = new Date();
    const year = rawYear ? parseInt(rawYear, 10) : now.getFullYear();

    const { incomesByMonth, expensesByMonth } = await reportsRepository.getYearlyReport(
      userId,
      year,
    );

    // Build complete 12-month array
    const months = Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const incomeData = incomesByMonth.find((r) => r.month === monthNum);
      const expenseData = expensesByMonth.find((r) => r.month === monthNum);

      const income = Number(incomeData?.total || 0);
      const expense = Number(expenseData?.total || 0);

      return {
        month: monthNum,
        monthName: MONTH_NAMES[i],
        income,
        expense,
        balance: income - expense,
        incomeCount: incomeData?.count || 0,
        expenseCount: expenseData?.count || 0,
      };
    });

    const totalIncome = months.reduce((sum, m) => sum + m.income, 0);
    const totalExpense = months.reduce((sum, m) => sum + m.expense, 0);

    return {
      year,
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      },
      months,
    };
  },

  async getCategoriesReport(userId: string, rawStartDate?: string, rawEndDate?: string) {
    const now = new Date();
    const startDate = rawStartDate
      ? new Date(rawStartDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = rawEndDate
      ? new Date(rawEndDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const { incomesByCategory, expensesByCategory } = await reportsRepository.getCategoriesReport(
      userId,
      startDate,
      endDate,
    );

    const totalIncome = incomesByCategory.reduce((sum, c) => sum + Number(c.total), 0);
    const totalExpense = expensesByCategory.reduce((sum, c) => sum + Number(c.total), 0);

    const incomeWithPercentage = incomesByCategory.map((c) => ({
      ...c,
      total: Number(c.total),
      percentage: totalIncome > 0 ? Math.round((Number(c.total) / totalIncome) * 100 * 10) / 10 : 0,
    }));

    const expenseWithPercentage = expensesByCategory.map((c) => ({
      ...c,
      total: Number(c.total),
      percentage:
        totalExpense > 0 ? Math.round((Number(c.total) / totalExpense) * 100 * 10) / 10 : 0,
    }));

    return {
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      },
      incomeCategories: incomeWithPercentage,
      expenseCategories: expenseWithPercentage,
    };
  },
};
