import { PaginationMeta } from './response';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export const parsePagination = (rawPage: unknown, rawLimit: unknown): PaginationParams => {
  const page = Math.max(1, parseInt(String(rawPage || '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(rawLimit || '10'), 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const buildPaginationMeta = (total: number, page: number, limit: number): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
