import { expensesRepository } from '../repositories/expenses.repository';
import { categoriesRepository } from '../repositories/categories.repository';
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
