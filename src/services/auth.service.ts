import { authRepository } from '../repositories/auth.repository';
import { usersRepository } from '../repositories/users.repository';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/jwt';
import { prisma } from '../config/database';
import { AuditAction } from '@prisma/client';
import type { RegisterInput, LoginInput, ChangePasswordInput } from '../validators/auth.validator';

export const authService = {
  async register(data: RegisterInput) {
    const existing = await authRepository.findUserByEmail(data.email);
    if (existing) {
      throw { statusCode: 409, message: 'Email already registered' };
    }

    const userRole = await usersRepository.findRoleByName('USER');
    if (!userRole) {
      throw { statusCode: 500, message: 'Default role not found' };
    }

    const passwordHash = await hashPassword(data.password);

    const user = await usersRepository.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      roleIds: [userRole.id],
    });

    const roles = user.roles.map((ur) => ur.role.name);

    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
      roles,
    });

    const refreshToken = generateRefreshToken({
      sub: user.id,
      email: user.email,
      roles,
    });

    await authRepository.createRefreshToken(user.id, refreshToken, getRefreshTokenExpiry());

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: AuditAction.CREATE,
        entity: 'user',
        newValue: { email: user.email },
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles,
      },
    };
  },

  async login(data: LoginInput) {
    const user = await authRepository.findUserByEmail(data.email);

    if (!user) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    if (!user.active) {
      throw { statusCode: 403, message: 'Account is disabled' };
    }

    const isPasswordValid = await comparePassword(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    const roles = user.roles.map((ur) => ur.role.name);

    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
      roles,
    });

    const refreshToken = generateRefreshToken({
      sub: user.id,
      email: user.email,
      roles,
    });

    await authRepository.createRefreshToken(user.id, refreshToken, getRefreshTokenExpiry());

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: AuditAction.LOGIN,
        entity: 'auth',
        newValue: { email: user.email },
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles,
      },
    };
  },

  async refreshTokens(refreshToken: string) {
    // Verify JWT signature first
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw { statusCode: 401, message: 'Invalid refresh token' };
    }

    // Check DB
    const storedToken = await authRepository.findRefreshToken(refreshToken);
    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      throw { statusCode: 401, message: 'Refresh token expired or revoked' };
    }

    const user = storedToken.user;
    if (!user.active) {
      throw { statusCode: 403, message: 'Account is disabled' };
    }

    // Rotate token
    await authRepository.revokeRefreshToken(refreshToken);

    const roles = user.roles.map((ur) => ur.role.name);

    const newAccessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
      roles,
    });

    const newRefreshToken = generateRefreshToken({
      sub: user.id,
      email: user.email,
      roles,
    });

    await authRepository.createRefreshToken(user.id, newRefreshToken, getRefreshTokenExpiry());

    void payload; // suppress unused warning

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  async logout(userId: string, refreshToken: string) {
    await authRepository.revokeRefreshToken(refreshToken).catch(() => {
      // token might not exist, ignore
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: AuditAction.LOGOUT,
        entity: 'auth',
      },
    });
  },

  async changePassword(userId: string, data: ChangePasswordInput) {
    const user = await usersRepository.findById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    const isValid = await comparePassword(data.currentPassword, user.passwordHash);
    if (!isValid) {
      throw { statusCode: 401, message: 'Current password is incorrect' };
    }

    const newHash = await hashPassword(data.newPassword);
    await authRepository.updateUserPassword(userId, newHash);

    // Revoke all refresh tokens on password change
    await authRepository.revokeAllUserRefreshTokens(userId);

    await prisma.auditLog.create({
      data: {
        userId,
        action: AuditAction.PASSWORD_CHANGE,
        entity: 'auth',
      },
    });
  },

  async forgotPassword(email: string) {
    // In production: generate a reset token, store it, send email
    // For this implementation we return a mock token
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // TODO: implement email sending with a real token
    const resetToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    return {
      message: 'If the email exists, a reset link has been sent',
      // Only expose token in development
      ...(process.env.NODE_ENV === 'development' && { resetToken }),
    };
  },

  async resetPassword(token: string, newPassword: string) {
    // TODO: validate reset token from database
    // For now, decode the base64 token used in forgotPassword
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [userId] = decoded.split(':');

      if (!userId) {
        throw { statusCode: 400, message: 'Invalid reset token' };
      }

      const user = await usersRepository.findById(userId);
      if (!user) {
        throw { statusCode: 400, message: 'Invalid reset token' };
      }

      const newHash = await hashPassword(newPassword);
      await authRepository.updateUserPassword(userId, newHash);
      await authRepository.revokeAllUserRefreshTokens(userId);

      await prisma.auditLog.create({
        data: {
          userId,
          action: AuditAction.PASSWORD_CHANGE,
          entity: 'auth',
          newValue: { method: 'reset' },
        },
      });
    } catch (err: unknown) {
      if ((err as { statusCode?: number }).statusCode) throw err;
      throw { statusCode: 400, message: 'Invalid reset token' };
    }
  },
};
