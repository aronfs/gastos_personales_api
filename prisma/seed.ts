import { PrismaClient, CategoryType, AuditAction } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ─── Permissions ────────────────────────────────────────────────────────────
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { code: 'users:read' },
      update: {},
      create: { code: 'users:read', description: 'Read users' },
    }),
    prisma.permission.upsert({
      where: { code: 'users:write' },
      update: {},
      create: { code: 'users:write', description: 'Create and update users' },
    }),
    prisma.permission.upsert({
      where: { code: 'users:delete' },
      update: {},
      create: { code: 'users:delete', description: 'Delete users' },
    }),
    prisma.permission.upsert({
      where: { code: 'categories:read' },
      update: {},
      create: { code: 'categories:read', description: 'Read categories' },
    }),
    prisma.permission.upsert({
      where: { code: 'categories:write' },
      update: {},
      create: { code: 'categories:write', description: 'Create and update categories' },
    }),
    prisma.permission.upsert({
      where: { code: 'categories:delete' },
      update: {},
      create: { code: 'categories:delete', description: 'Delete categories' },
    }),
    prisma.permission.upsert({
      where: { code: 'incomes:read' },
      update: {},
      create: { code: 'incomes:read', description: 'Read incomes' },
    }),
    prisma.permission.upsert({
      where: { code: 'incomes:write' },
      update: {},
      create: { code: 'incomes:write', description: 'Create and update incomes' },
    }),
    prisma.permission.upsert({
      where: { code: 'incomes:delete' },
      update: {},
      create: { code: 'incomes:delete', description: 'Delete incomes' },
    }),
    prisma.permission.upsert({
      where: { code: 'expenses:read' },
      update: {},
      create: { code: 'expenses:read', description: 'Read expenses' },
    }),
    prisma.permission.upsert({
      where: { code: 'expenses:write' },
      update: {},
      create: { code: 'expenses:write', description: 'Create and update expenses' },
    }),
    prisma.permission.upsert({
      where: { code: 'expenses:delete' },
      update: {},
      create: { code: 'expenses:delete', description: 'Delete expenses' },
    }),
    prisma.permission.upsert({
      where: { code: 'reports:read' },
      update: {},
      create: { code: 'reports:read', description: 'Read reports' },
    }),
    prisma.permission.upsert({
      where: { code: 'settings:read' },
      update: {},
      create: { code: 'settings:read', description: 'Read settings' },
    }),
    prisma.permission.upsert({
      where: { code: 'settings:write' },
      update: {},
      create: { code: 'settings:write', description: 'Update settings' },
    }),
  ]);

  console.log(`✅ ${permissions.length} permissions created`);

  // ─── Roles ───────────────────────────────────────────────────────────────────
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: { name: 'USER' },
  });

  console.log('✅ Roles created');

  // ─── Role Permissions ────────────────────────────────────────────────────────
  // Admin gets all permissions
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // User gets limited permissions (own data only - enforced in service layer)
  const userPermissionCodes = [
    'categories:read',
    'categories:write',
    'categories:delete',
    'incomes:read',
    'incomes:write',
    'incomes:delete',
    'expenses:read',
    'expenses:write',
    'expenses:delete',
    'reports:read',
    'settings:read',
    'settings:write',
  ];

  for (const permission of permissions) {
    if (userPermissionCodes.includes(permission.code)) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: userRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: userRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log('✅ Role permissions assigned');

  // ─── Admin User ──────────────────────────────────────────────────────────────
  const adminPasswordHash = await bcrypt.hash('Admin123*', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@gastos.local' },
    update: {},
    create: {
      email: 'admin@gastos.local',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'Sistema',
      active: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  await prisma.setting.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      currency: 'USD',
      language: 'es',
      theme: 'light',
      notificationsEnabled: true,
    },
  });

  console.log('✅ Admin user created: admin@gastos.local / Admin123*');

  // ─── Demo User ───────────────────────────────────────────────────────────────
  const userPasswordHash = await bcrypt.hash('User123*', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'user@gastos.local' },
    update: {},
    create: {
      email: 'user@gastos.local',
      passwordHash: userPasswordHash,
      firstName: 'Usuario',
      lastName: 'Demo',
      active: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: demoUser.id,
        roleId: userRole.id,
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      roleId: userRole.id,
    },
  });

  await prisma.setting.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      currency: 'USD',
      language: 'es',
      theme: 'light',
      notificationsEnabled: true,
    },
  });

  console.log('✅ Demo user created: user@gastos.local / User123*');

  // ─── Demo Categories ─────────────────────────────────────────────────────────
  const incomeCategories = [
    { name: 'Salario', icon: 'briefcase', color: '#22c55e' },
    { name: 'Freelance', icon: 'laptop', color: '#3b82f6' },
    { name: 'Inversiones', icon: 'trending-up', color: '#a855f7' },
    { name: 'Alquiler', icon: 'home', color: '#f59e0b' },
    { name: 'Otros ingresos', icon: 'plus-circle', color: '#6b7280' },
  ];

  const expenseCategories = [
    { name: 'Alimentación', icon: 'shopping-cart', color: '#ef4444' },
    { name: 'Transporte', icon: 'car', color: '#f97316' },
    { name: 'Vivienda', icon: 'home', color: '#8b5cf6' },
    { name: 'Salud', icon: 'heart', color: '#ec4899' },
    { name: 'Entretenimiento', icon: 'film', color: '#14b8a6' },
    { name: 'Educación', icon: 'book', color: '#0ea5e9' },
    { name: 'Ropa', icon: 'tag', color: '#f43f5e' },
    { name: 'Servicios', icon: 'zap', color: '#eab308' },
    { name: 'Otros gastos', icon: 'minus-circle', color: '#6b7280' },
  ];

  const createdIncomeCategories = [];
  for (const cat of incomeCategories) {
    const category = await prisma.category.upsert({
      where: {
        userId_name_type: {
          userId: demoUser.id,
          name: cat.name,
          type: CategoryType.INCOME,
        },
      },
      update: {},
      create: {
        userId: demoUser.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: CategoryType.INCOME,
      },
    });
    createdIncomeCategories.push(category);
  }

  const createdExpenseCategories = [];
  for (const cat of expenseCategories) {
    const category = await prisma.category.upsert({
      where: {
        userId_name_type: {
          userId: demoUser.id,
          name: cat.name,
          type: CategoryType.EXPENSE,
        },
      },
      update: {},
      create: {
        userId: demoUser.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: CategoryType.EXPENSE,
      },
    });
    createdExpenseCategories.push(category);
  }

  console.log('✅ Demo categories created');

  // ─── Demo Incomes ────────────────────────────────────────────────────────────
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const salaryCat = createdIncomeCategories[0];
  const freelanceCat = createdIncomeCategories[1];

  const demoIncomes = [
    {
      userId: demoUser.id,
      categoryId: salaryCat.id,
      amount: 3500.0,
      description: 'Salario mensual',
      transactionDate: new Date(currentYear, currentMonth, 1),
    },
    {
      userId: demoUser.id,
      categoryId: freelanceCat.id,
      amount: 800.0,
      description: 'Proyecto web freelance',
      transactionDate: new Date(currentYear, currentMonth, 10),
    },
    {
      userId: demoUser.id,
      categoryId: salaryCat.id,
      amount: 3500.0,
      description: 'Salario mensual',
      transactionDate: new Date(currentYear, currentMonth - 1, 1),
    },
    {
      userId: demoUser.id,
      categoryId: freelanceCat.id,
      amount: 500.0,
      description: 'Consultoría técnica',
      transactionDate: new Date(currentYear, currentMonth - 1, 15),
    },
  ];

  for (const income of demoIncomes) {
    await prisma.income.create({ data: income });
  }

  console.log('✅ Demo incomes created');

  // ─── Demo Expenses ───────────────────────────────────────────────────────────
  const foodCat = createdExpenseCategories[0];
  const transportCat = createdExpenseCategories[1];
  const housingCat = createdExpenseCategories[2];
  const healthCat = createdExpenseCategories[3];
  const entertainmentCat = createdExpenseCategories[4];

  const demoExpenses = [
    {
      userId: demoUser.id,
      categoryId: housingCat.id,
      amount: 1200.0,
      description: 'Alquiler del mes',
      transactionDate: new Date(currentYear, currentMonth, 1),
    },
    {
      userId: demoUser.id,
      categoryId: foodCat.id,
      amount: 350.0,
      description: 'Supermercado semanal',
      transactionDate: new Date(currentYear, currentMonth, 5),
    },
    {
      userId: demoUser.id,
      categoryId: transportCat.id,
      amount: 120.0,
      description: 'Transporte público mensual',
      transactionDate: new Date(currentYear, currentMonth, 3),
    },
    {
      userId: demoUser.id,
      categoryId: entertainmentCat.id,
      amount: 50.0,
      description: 'Streaming servicios',
      transactionDate: new Date(currentYear, currentMonth, 7),
    },
    {
      userId: demoUser.id,
      categoryId: healthCat.id,
      amount: 80.0,
      description: 'Consulta médica',
      transactionDate: new Date(currentYear, currentMonth, 12),
    },
    {
      userId: demoUser.id,
      categoryId: foodCat.id,
      amount: 420.0,
      description: 'Supermercado',
      transactionDate: new Date(currentYear, currentMonth - 1, 8),
    },
    {
      userId: demoUser.id,
      categoryId: housingCat.id,
      amount: 1200.0,
      description: 'Alquiler del mes',
      transactionDate: new Date(currentYear, currentMonth - 1, 1),
    },
    {
      userId: demoUser.id,
      categoryId: transportCat.id,
      amount: 115.0,
      description: 'Gasolina',
      transactionDate: new Date(currentYear, currentMonth - 1, 20),
    },
  ];

  for (const expense of demoExpenses) {
    await prisma.expense.create({ data: expense });
  }

  console.log('✅ Demo expenses created');

  // ─── Audit Log for seed ──────────────────────────────────────────────────────
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: AuditAction.CREATE,
      entity: 'seed',
      newValue: { message: 'Database seeded successfully' },
    },
  });

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📧 Admin:     admin@gastos.local  / Admin123*');
  console.log('📧 Demo user: user@gastos.local   / User123*');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
