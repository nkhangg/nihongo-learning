import { Injectable } from '@nestjs/common';
import { Prisma, KanjiProgressStatus as PrismaKanjiProgressStatus } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import type {
  KanjiProgressStatus,
  KanjiUserProgress,
} from '../../domain/entities/kanji-user-progress.entity';
import type {
  IKanjiUserProgressRepository,
  KanjiProgressSummary,
} from '../../domain/repositories/kanji-user-progress.repository';
import type { JlptLevel } from '../../domain/value-objects/jlpt-level.vo';
import { JLPT_LEVELS } from '../../domain/value-objects/jlpt-level.vo';
import {
  KanjiUserProgressMapper,
  progressStatusToPrisma,
} from '../mappers/kanji-user-progress.mapper';

@Injectable()
export class PrismaKanjiUserProgressRepository
  implements IKanjiUserProgressRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findByUserAndKanji(
    userId: string,
    kanjiId: string,
  ): Promise<KanjiUserProgress | null> {
    const r = await this.prisma.kanjiUserProgress.findUnique({
      where: { userId_kanjiId: { userId, kanjiId } },
    });
    return r ? KanjiUserProgressMapper.toDomain(r) : null;
  }

  async findManyByUser(
    userId: string,
    opts?: { status?: KanjiProgressStatus; kanjiIds?: string[] },
  ): Promise<KanjiUserProgress[]> {
    const where: Record<string, unknown> = { userId };
    if (opts?.status) where['status'] = progressStatusToPrisma(opts.status);
    if (opts?.kanjiIds && opts.kanjiIds.length > 0)
      where['kanjiId'] = { in: opts.kanjiIds };
    const rows = await this.prisma.kanjiUserProgress.findMany({ where });
    return rows.map(KanjiUserProgressMapper.toDomain);
  }

  async getSummary(userId: string): Promise<KanjiProgressSummary> {
    // Total published kanji per level (catalog-wide)
    const catalogPerLevel = await this.prisma.kanji.groupBy({
      by: ['jlptLevel'],
      where: { status: 'PUBLISHED' },
      _count: { _all: true },
    });

    // User progress counts grouped by kanji level + status
    const userRows = await this.prisma.$queryRaw<
      Array<{ jlptLevel: string; status: string; count: bigint }>
    >(Prisma.sql`
      SELECT k."jlptLevel" as "jlptLevel", p."status" as "status", COUNT(*)::bigint as "count"
      FROM "kanji_user_progress" p
      JOIN "kanjis" k ON k.id = p."kanjiId"
      WHERE p."userId" = ${userId} AND k."status" = 'PUBLISHED'
      GROUP BY k."jlptLevel", p."status"
    `);

    const byLevel = {} as KanjiProgressSummary['byLevel'];
    let totalKnown = 0;
    let totalLearning = 0;
    let total = 0;

    for (const level of JLPT_LEVELS) {
      const catalogCount =
        catalogPerLevel.find((c) => c.jlptLevel === level)?._count._all ?? 0;
      const knownCount = Number(
        userRows.find((r) => r.jlptLevel === level && r.status === 'KNOWN')
          ?.count ?? 0n,
      );
      const learningCount = Number(
        userRows.find((r) => r.jlptLevel === level && r.status === 'LEARNING')
          ?.count ?? 0n,
      );
      byLevel[level] = {
        total: catalogCount,
        known: knownCount,
        learning: learningCount,
      };
      total += catalogCount;
      totalKnown += knownCount;
      totalLearning += learningCount;
    }

    return {
      total,
      known: totalKnown,
      learning: totalLearning,
      unseen: total - totalKnown - totalLearning,
      byLevel,
    };
  }

  async pickLearningKanjiIds(params: {
    userId: string;
    jlptLevel?: JlptLevel;
    limit: number;
  }): Promise<string[]> {
    const where: Record<string, unknown> = {
      userId: params.userId,
      status: 'LEARNING',
    };
    if (params.jlptLevel) {
      where['kanji'] = { jlptLevel: params.jlptLevel };
    }
    const rows = await this.prisma.kanjiUserProgress.findMany({
      where,
      orderBy: [{ lastReviewedAt: 'asc' }],
      take: params.limit,
      select: { kanjiId: true },
    });
    return rows.map((r) => r.kanjiId);
  }

  async save(progress: KanjiUserProgress): Promise<void> {
    const data = {
      status: progressStatusToPrisma(progress.status) as PrismaKanjiProgressStatus,
      mastery: progress.mastery,
      lastReviewedAt: progress.lastReviewedAt,
    };
    await this.prisma.kanjiUserProgress.upsert({
      where: {
        userId_kanjiId: {
          userId: progress.userId,
          kanjiId: progress.kanjiId,
        },
      },
      create: {
        userId: progress.userId,
        kanjiId: progress.kanjiId,
        ...data,
      },
      update: data,
    });
  }
}
