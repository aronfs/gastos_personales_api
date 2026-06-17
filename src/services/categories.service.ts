import { CategoryType } from '@prisma/client';
import { categoriesRepository } from '../repositories/categories.repository';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import type { CreateCategoryInput, UpdateCategoryInput } from '../validators/categories.validator';

export const categoriesService = {
  async getAll(userId: string, rawPage: unknown, rawLimit: unknown, typeStr?: string) {
    const pagination = parsePagination(rawPage, rawLimit);
    const type = typeStr ? (typeStr as CategoryType) : undefined;

    const { total, categories } = await categoriesRepository.findAll(userId, pagination, type);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return { categories, meta };
  },

  async getById(id: string, userId: string) {
    const category = await categoriesRepository.findById(id, userId);
    if (!category) {
      throw { statusCode: 404, message: 'Category not found' };
    }
    return category;
  },

  async create(userId: string, data: CreateCategoryInput) {
    const existing = await categoriesRepository.findByNameAndType(
      userId,
      data.name,
      data.type as CategoryType,
    );
    if (existing) {
      throw { statusCode: 409, message: 'Category with this name and type already exists' };
    }

    return categoriesRepository.create({
      userId,
      name: data.name,
      icon: data.icon ?? null,
      color: data.color ?? null,
      type: data.type as CategoryType,
    });
  },

  async update(id: string, userId: string, data: UpdateCategoryInput) {
    const category = await categoriesRepository.findById(id, userId);
    if (!category) {
      throw { statusCode: 404, message: 'Category not found' };
    }

    if (data.name && data.name !== category.name) {
      const existing = await categoriesRepository.findByNameAndType(
        userId,
        data.name,
        category.type,
      );
      if (existing) {
        throw { statusCode: 409, message: 'Category with this name already exists' };
      }
    }

    return categoriesRepository.update(id, userId, {
      name: data.name,
      icon: data.icon ?? undefined,
      color: data.color ?? undefined,
    });
  },

  async delete(id: string, userId: string) {
    const category = await categoriesRepository.findById(id, userId);
    if (!category) {
      throw { statusCode: 404, message: 'Category not found' };
    }

    const hasTransactions = await categoriesRepository.hasTransactions(id);
    if (hasTransactions) {
      throw {
        statusCode: 400,
        message: 'Cannot delete category with existing transactions',
      };
    }

    await categoriesRepository.delete(id);
  },
};
