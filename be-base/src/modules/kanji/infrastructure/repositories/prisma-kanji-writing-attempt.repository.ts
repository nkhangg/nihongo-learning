import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import type { KanjiWritingAttempt } from '../../domain/entities/kanji-writing-attempt.entity';
import type { IKanjiWritingAttemptRepository } from '../../domain/repositories/kanji-writing-attempt.repository';
import { KanjiWritingAttemptMapper } from '../mappers/kanji-writing-attempt.mapper';

@Injectable()
export class PrismaKanjiWritingAttemptRepository
  implements IKanjiWritingAttemptRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async save(attempt: KanjiWritingAttempt): Promise<void> {
    await this.prisma.kanjiWritingAttempt.create({
      data: KanjiWritingAttemptMapper.toPrisma(attempt),
    });
  }

  async findRecentByUserAndKanji(
    userId: string,
    kanjiId: string,
    limit: number,
  ): Promise<KanjiWritingAttempt[]> {
    const rows = await this.prisma.kanjiWritingAttempt.findMany({
      where: { userId, kanjiId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map(KanjiWritingAttemptMapper.toDomain);
  }
}
