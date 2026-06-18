import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gastos Personales API',
      version: '1.0.0',
      description:
        'REST API for Personal Expense Management - Backend built with Bun + Express + Prisma',
      contact: {
        name: 'API Support',
        email: 'admin@gastos.local',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}${env.API_PREFIX}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT access token',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation completed' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error description' },
            error: { type: 'object' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 100 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            totalPages: { type: 'integer', example: 10 },
            hasNextPage: { type: 'boolean', example: true },
            hasPrevPage: { type: 'boolean', example: false },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            active: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            icon: { type: 'string', nullable: true },
            color: { type: 'string', nullable: true },
            type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
          },
        },
        Income: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            categoryId: { type: 'string', format: 'uuid' },
            amount: { type: 'number', format: 'decimal' },
            description: { type: 'string', nullable: true },
            transactionDate: { type: 'string', format: 'date' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Expense: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            categoryId: { type: 'string', format: 'uuid' },
            amount: { type: 'number', format: 'decimal' },
            description: { type: 'string', nullable: true },
            transactionDate: { type: 'string', format: 'date' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Movement: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
          amount: { type: 'number', format: 'decimal', example: 3500.0 },
          description: { type: 'string', nullable: true },
          category: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              icon: { type: 'string', nullable: true },
              color: { type: 'string', nullable: true },
            },
          },
          transactionDate: { type: 'string', format: 'date', example: '2026-06-01' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      MovementSummary: {
        type: 'object',
        properties: {
          totalIncome: { type: 'number', example: 4300.0 },
          totalExpense: { type: 'number', example: 1765.0 },
          balance: { type: 'number', example: 2535.0 },
          movementsCount: { type: 'integer', example: 10 },
          incomeCount: { type: 'integer', example: 3 },
          expenseCount: { type: 'integer', example: 7 },
          period: {
            type: 'object',
            properties: {
              startDate: { type: 'string', format: 'date', example: '2026-06-01' },
              endDate: { type: 'string', format: 'date', example: '2026-06-30' },
            },
          },
        },
      },
      Setting: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            currency: { type: 'string', example: 'USD' },
            language: { type: 'string', example: 'es' },
            theme: { type: 'string', example: 'light' },
            notificationsEnabled: { type: 'boolean' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management' },
      { name: 'Categories', description: 'Category management' },
      { name: 'Incomes', description: 'Income management' },
      { name: 'Expenses', description: 'Expense management' },
      { name: 'Dashboard', description: 'Dashboard summary' },
      { name: 'Reports', description: 'Financial reports' },
      { name: 'Settings', description: 'User settings' },
      { name: 'Movements', description: 'Unified income + expense history' },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
