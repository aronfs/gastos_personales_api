import { prisma } from '../config/database';
import { Decimal } from '@prisma/client/runtime/library';

interface ExpenseProductData {
  productId: string;
  quantity: number;
  unitPrice: Decimal;
  subtotal: Decimal;
}

export const supermarketRepository = {
  async createPurchase(data: {
    userId: string;
    categoryId: string;
    amount: number;
    description?: string | null;
    transactionDate: Date;
    products: ExpenseProductData[];
  }) {
    return prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          userId: data.userId,
          categoryId: data.categoryId,
          amount: data.amount,
          description: data.description ?? null,
          transactionDate: data.transactionDate,
        },
      });

      const expenseProducts = await Promise.all(
        data.products.map((product) =>
          tx.expenseProduct.create({
            data: {
              expenseId: expense.id,
              productId: product.productId,
              quantity: product.quantity,
              unitPrice: product.unitPrice,
              subtotal: product.subtotal,
            },
            include: {
              product: true,
            },
          }),
        ),
      );

      return { expense, expenseProducts };
    });
  },

  async findPurchaseById(id: string, userId: string) {
    return prisma.expense.findFirst({
      where: { id, userId },
      include: {
        category: true,
        expenseProducts: {
          include: {
            product: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  },
};
