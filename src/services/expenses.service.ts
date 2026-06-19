import { expensesRepository } from '../repositories/expenses.repository';
import { categoriesRepository } from '../repositories/categories.repository';
import { incomesRepository } from '../repositories/incomes.repository';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { CategoryType } from '@prisma/client';
import type { CreateExpenseInput, UpdateExpenseInput } from '../validators/expenses.validator';

export const expensesService = {
  async getAll(
    userId: string,
    rawPage: unknown,
    rawLimit: unknown,
    filters: { categoryId?: string; startDate?: string; endDate?: string },
  ) {
    const pagination = parsePagination(rawPage, rawLimit);
    const { total, expenses } = await expensesRepository.findAll(userId, pagination, filters);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);
    return { expenses, meta };
  },

  async getById(id: string, userId: string) {
    const expense = await expensesRepository.findById(id, userId);
    if (!expense) {
      throw { statusCode: 404, message: 'Expense not found' };
    }
    return expense;
  },

  async create(userId: string, data: CreateExpenseInput) {
    const category = await categoriesRepository.findById(data.categoryId, userId);
    if (!category) {
      throw { statusCode: 404, message: 'Category not found' };
    }
    if (category.type !== CategoryType.EXPENSE) {
      throw { statusCode: 400, message: 'Category must be of type EXPENSE' };
    }

    const now = new Date();
    const allTimeStart = new Date(2000, 0, 1);
    const [rawTotalIncome, rawTotalExpense] = await Promise.all([
      incomesRepository.getTotalByPeriod(userId, allTimeStart, now),
      expensesRepository.getTotalByPeriod(userId, allTimeStart, now),
    ]);
    const totalIncome = Number(rawTotalIncome.toFixed(2));
    const totalExpense = Number(rawTotalExpense.toFixed(2));
    const currentBalance = Number((totalIncome - totalExpense).toFixed(2));

    if (currentBalance <= 0) {
      throw { statusCode: 400, message: 'sin saldo restante estas en cero 0' };
    }

    if (data.amount > currentBalance) {
      throw { statusCode: 400, message: 'supera el saldo restante' };
    }

    return expensesRepository.create({
      userId,
      categoryId: data.categoryId,
      amount: data.amount,
      description: data.description ?? null,
      transactionDate: new Date(data.transactionDate),
    });
  },

  async update(id: string, userId: string, data: UpdateExpenseInput) {
    const expense = await expensesRepository.findById(id, userId);
    if (!expense) {
      throw { statusCode: 404, message: 'Expense not found' };
    }

    if (data.categoryId) {
      const category = await categoriesRepository.findById(data.categoryId, userId);
      if (!category) {
        throw { statusCode: 404, message: 'Category not found' };
      }
      if (category.type !== CategoryType.EXPENSE) {
        throw { statusCode: 400, message: 'Category must be of type EXPENSE' };
      }
    }

    return expensesRepository.update(id, userId, {
      categoryId: data.categoryId,
      amount: data.amount,
      description: data.description ?? undefined,
      transactionDate: data.transactionDate ? new Date(data.transactionDate) : undefined,
    });
  },

  async delete(id: string, userId: string) {
    const expense = await expensesRepository.findById(id, userId);
    if (!expense) {
      throw { statusCode: 404, message: 'Expense not found' };
    }
    await expensesRepository.delete(id);
  },
};
