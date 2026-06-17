import { incomesRepository } from '../repositories/incomes.repository';
import { categoriesRepository } from '../repositories/categories.repository';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { CategoryType } from '@prisma/client';
import type { CreateIncomeInput, UpdateIncomeInput } from '../validators/incomes.validator';

export const incomesService = {
  async getAll(
    userId: string,
    rawPage: unknown,
    rawLimit: unknown,
    filters: { categoryId?: string; startDate?: string; endDate?: string },
  ) {
    const pagination = parsePagination(rawPage, rawLimit);
    const { total, incomes } = await incomesRepository.findAll(userId, pagination, filters);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);
    return { incomes, meta };
  },

  async getById(id: string, userId: string) {
    const income = await incomesRepository.findById(id, userId);
    if (!income) {
      throw { statusCode: 404, message: 'Income not found' };
    }
    return income;
  },

  async create(userId: string, data: CreateIncomeInput) {
    // Validate category belongs to user and is INCOME type
    const category = await categoriesRepository.findById(data.categoryId, userId);
    if (!category) {
      throw { statusCode: 404, message: 'Category not found' };
    }
    if (category.type !== CategoryType.INCOME) {
      throw { statusCode: 400, message: 'Category must be of type INCOME' };
    }

    return incomesRepository.create({
      userId,
      categoryId: data.categoryId,
      amount: data.amount,
      description: data.description ?? null,
      transactionDate: new Date(data.transactionDate),
    });
  },

  async update(id: string, userId: string, data: UpdateIncomeInput) {
    const income = await incomesRepository.findById(id, userId);
    if (!income) {
      throw { statusCode: 404, message: 'Income not found' };
    }

    if (data.categoryId) {
      const category = await categoriesRepository.findById(data.categoryId, userId);
      if (!category) {
        throw { statusCode: 404, message: 'Category not found' };
      }
      if (category.type !== CategoryType.INCOME) {
        throw { statusCode: 400, message: 'Category must be of type INCOME' };
      }
    }

    return incomesRepository.update(id, userId, {
      categoryId: data.categoryId,
      amount: data.amount,
      description: data.description ?? undefined,
      transactionDate: data.transactionDate ? new Date(data.transactionDate) : undefined,
    });
  },

  async delete(id: string, userId: string) {
    const income = await incomesRepository.findById(id, userId);
    if (!income) {
      throw { statusCode: 404, message: 'Income not found' };
    }
    await incomesRepository.delete(id);
  },
};
