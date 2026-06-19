import { supermarketRepository } from '../repositories/supermarket.repository';
import { productsRepository } from '../repositories/products.repository';
import { categoriesRepository } from '../repositories/categories.repository';
import { incomesRepository } from '../repositories/incomes.repository';
import { expensesRepository } from '../repositories/expenses.repository';
import { CategoryType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import type { CreateSupermarketPurchaseInput } from '../validators/supermarket.validator';

export const supermarketService = {
  async createPurchase(userId: string, data: CreateSupermarketPurchaseInput) {
    // Verify category exists and belongs to user
    const category = await categoriesRepository.findById(data.categoryId, userId);
    if (!category) {
      throw { statusCode: 404, message: 'Category not found' };
    }
    if (category.type !== CategoryType.EXPENSE) {
      throw { statusCode: 400, message: 'Category must be of type EXPENSE' };
    }

    // Get all product IDs from request
    const productIds = data.products.map((p) => p.productId);

    // Fetch all products at once
    const products = await productsRepository.findByIds(productIds);

    // Verify all products exist and are active
    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((p) => p.id));
      const missingIds = productIds.filter((id) => !foundIds.has(id));
      throw {
        statusCode: 404,
        message: `Products not found or inactive: ${missingIds.join(', ')}`,
      };
    }

    // Build a map for quick lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Calculate subtotals and total
    const expenseProducts = data.products.map((item) => {
      const product = productMap.get(item.productId)!;
      const unitPrice = product.unitPrice;
      const subtotal = new Decimal(item.quantity).mul(unitPrice).toDecimalPlaces(2);

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      };
    });

    const totalAmount = expenseProducts
      .reduce((sum, ep) => sum.add(ep.subtotal), new Decimal(0))
      .toDecimalPlaces(2);

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

    if (totalAmount.toNumber() > currentBalance) {
      throw { statusCode: 400, message: 'supera el saldo restante' };
    }

    // Create expense + expense_products in a single transaction
    const result = await supermarketRepository.createPurchase({
      userId,
      categoryId: data.categoryId,
      amount: totalAmount.toNumber(),
      description: data.description ?? null,
      transactionDate: new Date(data.transactionDate),
      products: expenseProducts,
    });

    // Format response
    return {
      expense_id: result.expense.id,
      total: totalAmount.toNumber(),
      products: result.expenseProducts.map((ep) => ({
        name: ep.product.name,
        quantity: ep.quantity,
        unit_price: Number(ep.unitPrice),
        subtotal: Number(ep.subtotal),
      })),
    };
  },

  async getPurchaseById(id: string, userId: string) {
    const expense = await supermarketRepository.findPurchaseById(id, userId);
    if (!expense) {
      throw { statusCode: 404, message: 'Supermarket purchase not found' };
    }

    return {
      expense_id: expense.id,
      category: expense.category,
      description: expense.description,
      total: Number(expense.amount),
      transaction_date: expense.transactionDate,
      products: expense.expenseProducts.map((ep) => ({
        name: ep.product.name,
        quantity: ep.quantity,
        unit_price: Number(ep.unitPrice),
        subtotal: Number(ep.subtotal),
      })),
      created_at: expense.createdAt,
    };
  },
};
