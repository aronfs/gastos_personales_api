import { prisma } from '../config/database';
import { AuditAction } from '@prisma/client';
import { UpdateProfileInput } from '../validators/profile.validator';

export class ProfileService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        active: true,
        createdAt: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        settings: {
          select: {
            currency: true,
            language: true,
            theme: true,
            notificationsEnabled: true,
          },
        },
      },
    });

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    // Transform roles from user_roles relation
    const transformedRoles = user.roles.map((r) => r.role);

    return {
      id: user.id,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      active: user.active,
      roles: transformedRoles,
      settings: user.settings
        ? {
            currency: user.settings.currency,
            language: user.settings.language,
            theme: user.settings.theme,
            notifications_enabled: user.settings.notificationsEnabled,
          }
        : {
            currency: 'USD',
            language: 'es',
            theme: 'dark',
            notifications_enabled: true,
          },
      created_at: user.createdAt,
    };
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.first_name,
        lastName: data.last_name,
      },
    });
  }

  async deactivateProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    if (!user.active) {
      throw { statusCode: 400, message: 'Account is already deactivated' };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { active: false },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: AuditAction.UPDATE,
        entity: 'user',
        oldValue: { active: true },
        newValue: { active: false },
      },
    });
  }
}

export const profileService = new ProfileService();
