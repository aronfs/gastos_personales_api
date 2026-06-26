import { usersRepository } from '../repositories/users.repository';
import { hashPassword } from '../utils/bcrypt';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { prisma } from '../config/database';
import { AuditAction } from '@prisma/client';
import type { CreateUserInput, UpdateUserInput } from '../validators/users.validator';

const sanitizeUser = (user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  roles?: { role: { id: string; name: string } }[];
}) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  active: user.active,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  roles: user.roles?.map((ur) => ur.role.name) || [],
});

export const usersService = {
  async getAll(rawPage: unknown, rawLimit: unknown, search?: string, activeStr?: string) {
    const pagination = parsePagination(rawPage, rawLimit);
    const active = activeStr !== undefined ? activeStr === 'true' : undefined;

    const { total, users } = await usersRepository.findAll(pagination, search, active);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return { users: users.map(sanitizeUser), meta };
  },

  async getById(id: string) {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }
    return sanitizeUser(user);
  },

  async create(data: CreateUserInput, requesterId: string) {
    const existing = await usersRepository.findByEmail(data.email);
    if (existing) {
      throw { statusCode: 409, message: 'Email already registered' };
    }

    const passwordHash = await hashPassword(data.password);

    const roleIds: string[] = [];
    for (const roleName of data.roles || ['USER']) {
      const role = await usersRepository.findRoleByName(roleName.toUpperCase());
      if (role) roleIds.push(role.id);
    }

    const user = await usersRepository.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      roleIds,
    });

    await prisma.auditLog.create({
      data: {
        userId: requesterId,
        action: AuditAction.CREATE,
        entity: 'user',
        newValue: { email: user.email, id: user.id },
      },
    });

    return sanitizeUser(user);
  },

  async update(id: string, data: UpdateUserInput, requesterId: string) {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    const updated = await usersRepository.update(id, data);

    await prisma.auditLog.create({
      data: {
        userId: requesterId,
        action: AuditAction.UPDATE,
        entity: 'user',
        oldValue: { firstName: user.firstName, lastName: user.lastName, active: user.active },
        newValue: data,
      },
    });

    return sanitizeUser(updated);
  },

  async delete(id: string, requesterId: string) {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    if (id === requesterId) {
      throw { statusCode: 400, message: 'Cannot delete your own account' };
    }

    await usersRepository.delete(id);

    await prisma.auditLog.create({
      data: {
        userId: requesterId,
        action: AuditAction.DELETE,
        entity: 'user',
        oldValue: { email: user.email, id: user.id },
      },
    });
  },

  async deactivate(id: string, requesterId: string) {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    if (!user.active) {
      throw { statusCode: 400, message: 'User is already deactivated' };
    }

    if (id === requesterId) {
      throw {
        statusCode: 400,
        message: 'Cannot deactivate your own account. Use profile deactivation instead.',
      };
    }

    await usersRepository.update(id, { active: false });

    await prisma.auditLog.create({
      data: {
        userId: requesterId,
        action: AuditAction.UPDATE,
        entity: 'user',
        oldValue: { email: user.email, active: true },
        newValue: { email: user.email, active: false },
      },
    });
  },
};
