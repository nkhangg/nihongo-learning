import type { Prisma } from '@prisma/client';
import { User } from '../../domain/entities/user.entity';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  role: string;
  isActive: boolean;
  xpTotal: number;
  streakCount: number;
  settings: unknown;
  createdAt: Date;
}

export class UserMapper {
  static toDomain(r: UserRecord): User {
    return User.reconstitute(r.id, {
      email: r.email,
      passwordHash: r.passwordHash,
      firstName: r.firstName,
      lastName: r.lastName,
      phone: r.phone,
      avatarUrl: r.avatarUrl,
      role: r.role,
      isActive: r.isActive,
      xpTotal: r.xpTotal ?? 0,
      streakCount: r.streakCount ?? 0,
      settings: (r.settings as Record<string, unknown>) ?? {},
      createdAt: r.createdAt,
    });
  }

  static toPrisma(user: User): Omit<UserRecord, 'id'> & {
    settings: Prisma.InputJsonValue;
  } {
    return {
      email: user.email,
      passwordHash: user.passwordHash,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      phone: user.phone ?? null,
      avatarUrl: user.avatarUrl ?? null,
      role: user.role,
      isActive: user.isActive,
      xpTotal: user.xpTotal,
      streakCount: user.streakCount,
      settings: user.settings as Prisma.InputJsonValue,
      createdAt: user.createdAt,
    };
  }
}
