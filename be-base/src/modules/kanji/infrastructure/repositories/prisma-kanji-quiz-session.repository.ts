import { Injectable } from '@nestjs/common';
import {
  JlptLevel as PrismaJlptLevel,
  KanjiQuizMode as PrismaKanjiQuizMode,
  KanjiQuizSessionStatus as PrismaKanjiQuizSessionStatus,
} from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import type { KanjiQuizSession } from '../../domain/entities/kanji-quiz-session.entity';
import type { IKanjiQuizSessionRepository } from '../../domain/repositories/kanji-quiz-session.repository';
import {
  KanjiQuizSessionMapper,
  quizModeToPrisma,
  quizSessionStatusToPrisma,
} from '../mappers/kanji-quiz-session.mapper';

@Injectable()
export class PrismaKanjiQuizSessionRepository
  implements IKanjiQuizSessionRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<KanjiQuizSession | null> {
    const r = await this.prisma.kanjiQuizSession.findUnique({
      where: { id },
      include: { answers: true },
    });
    return r ? KanjiQuizSessionMapper.toDomain(r) : null;
  }

  async save(session: KanjiQuizSession): Promise<void> {
    const baseData = {
      userId: session.userId,
      jlptLevel: session.jlptLevel as PrismaJlptLevel,
      mode: quizModeToPrisma(session.mode) as PrismaKanjiQuizMode,
      questionCount: session.questionCount,
      livesEnabled: session.livesEnabled,
      status: quizSessionStatusToPrisma(session.status) as PrismaKanjiQuizSessionStatus,
      startedAt: session.startedAt,
      finishedAt: session.finishedAt,
    };

    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.kanjiQuizSession.findUnique({
        where: { id: session.id },
        include: { answers: { select: { id: true } } },
      });
      if (!existing) {
        await tx.kanjiQuizSession.create({
          data: {
            id: session.id,
            ...baseData,
            answers: {
              create: session.answers.map((a) => ({
                kanjiId: a.kanjiId,
                mode: quizModeToPrisma(a.mode) as PrismaKanjiQuizMode,
                isCorrect: a.isCorrect,
                selectedOptionId: a.selectedOptionId,
                xpEarned: a.xpEarned,
                createdAt: a.createdAt,
              })),
            },
          },
        });
        return;
      }

      await tx.kanjiQuizSession.update({
        where: { id: session.id },
        data: baseData,
      });

      // Append only newly-recorded answers (skip the ones already persisted).
      const existingCount = existing.answers.length;
      const newAnswers = session.answers.slice(existingCount);
      if (newAnswers.length > 0) {
        await tx.kanjiQuizAnswer.createMany({
          data: newAnswers.map((a) => ({
            sessionId: session.id,
            kanjiId: a.kanjiId,
            mode: quizModeToPrisma(a.mode) as PrismaKanjiQuizMode,
            isCorrect: a.isCorrect,
            selectedOptionId: a.selectedOptionId,
            xpEarned: a.xpEarned,
            createdAt: a.createdAt,
          })),
        });
      }
    });
  }
}
