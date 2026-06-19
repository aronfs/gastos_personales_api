import { productsRepository } from '../repositories/products.repository';
import { categoriesRepository } from '../repositories/categories.repository';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import type { CreateProductInput, UpdateProductInput } from '../validators/products.validator';

export const productsService = {
  async getAll(
    rawPage: unknown,
    rawLimit: unknown,
    filters: { categoryId?: string; active?: string },
  ) {
    const pagination = parsePagination(rawPage, rawLimit);
    const activeFilter = filters.active !== undefined ? filters.active === 'true' : undefined;
    const { total, products } = await productsRepository.findAll(pagination, {
      categoryId: filters.categoryId,
      active: activeFilter,
    });
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);
    return { products, meta };
  },

  async getById(id: string) {
    const product = await productsRepository.findById(id);
    if (!product) {
      throw { statusCode: 404, message: 'Product not found' };
    }
    return product;
  },

  async create(userId: string, data: CreateProductInput) {
    const category = await categoriesRepository.findById(data.categoryId, userId);
    if (!category) {
      throw { statusCode: 404, message: 'Category not found' };
    }

    return productsRepository.create({
      categoryId: data.categoryId,
      name: data.name,
      description: data.description ?? null,
      unitPrice: data.unitPrice,
    });
  },

  async update(id: string, userId: string, data: UpdateProductInput) {
    const product = await productsRepository.findById(id);
    if (!product) {
      throw { statusCode: 404, message: 'Product not found' };
    }

    if (data.categoryId) {
      const category = await categoriesRepository.findById(data.categoryId, userId);
      if (!category) {
        throw { statusCode: 404, message: 'Category not found' };
      }
    }

    return productsRepository.update(id, {
      categoryId: data.categoryId,
      name: data.name,
      description: data.description ?? undefined,
      unitPrice: data.unitPrice,
      active: data.active,
    });
  },

  async delete(id: string) {
    const product = await productsRepository.findById(id);
    if (!product) {
      throw { statusCode: 404, message: 'Product not found' };
    }
    await productsRepository.delete(id);
  },
};
