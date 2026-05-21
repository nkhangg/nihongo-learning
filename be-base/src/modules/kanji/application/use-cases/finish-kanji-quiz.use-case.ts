import { Inject, Injectable } from '@nestjs/common';
import type { Result } from '../../../../shared/application';
import type { Kanji } from '../../domain/entities/kanji.entity';
import {
  KANJI_REPOSITORY,
  type IKanjiRepository,
} from '../../domain/repositories/kanji.repository';
import {
  KANJI_QUIZ_SESSION_REPOSITORY,
  type IKanjiQuizSessionRepository,
} from '../../domain/repositories/kanji-quiz-session.repository';

export interface KanjiQuizMistake {
  kanjiId: string;
  kanjiChar: string;
  meaningVi: string;
  wrongCount: number;
}

export interface KanjiQuizSummary {
  totalQuestions: number;
  correct: number;
  wrong: number;
  accuracy: number;
  durationSec: number;
  xpEarned: number;
  mistakes: KanjiQuizMistake[];
}

export interface FinishKanjiQuizInput {
  userId: string;
  sessionId: string;
}

export type FinishKanjiQuizResult = Result<
  KanjiQuizSummary,
  'SESSION_NOT_FOUND' | 'NOT_OWNER'
>;

@Injectable()
export class FinishKanjiQuizUseCase {
  constructor(
    @Inject(KANJI_QUIZ_SESSION_REPOSITORY)
    private readonly sessionRepo: IKanjiQuizSessionRepository,
    @Inject(KANJI_REPOSITORY)
    private readonly kanjiRepo: IKanjiRepository,
  ) {}

  async execute(input: FinishKanjiQuizInput): Promise<FinishKanjiQuizResult> {
    const session = await this.sessionRepo.findById(input.sessionId);
    if (!session) return { ok: false, error: 'SESSION_NOT_FOUND' };
    if (session.userId !== input.userId) return { ok: false, error: 'NOT_OWNER' };

    session.finish();
    await this.sessionRepo.save(session);

    const total = session.answers.length;
    const correct = session.correctCount;
    const wrong = session.wrongCount;
    const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);
    const finished = session.finishedAt ?? new Date();
    const durationSec = Math.round(
      (finished.getTime() - session.startedAt.getTime()) / 1000,
    );

    const wrongAnswers = session.answers.filter((a) => !a.isCorrect);
    const wrongCounts = new Map<string, number>();
    for (const a of wrongAnswers) {
      wrongCounts.set(a.kanjiId, (wrongCounts.get(a.kanjiId) ?? 0) + 1);
    }
    const mistakeKanjiIds = Array.from(wrongCounts.keys());
    const mistakeKanji =
      mistakeKanjiIds.length === 0
        ? []
        : await this.kanjiRepo.findManyByIds(mistakeKanjiIds);
    const kanjiById = new Map<string, Kanji>(
      mistakeKanji.map((k) => [k.id.value, k]),
    );
    const mistakes: KanjiQuizMistake[] = mistakeKanjiIds
      .map((kanjiId) => {
        const k = kanjiById.get(kanjiId);
        if (!k) return null;
        return {
          kanjiId,
          kanjiChar: k.char,
          meaningVi: k.meaningVi,
          wrongCount: wrongCounts.get(kanjiId) ?? 0,
        };
      })
      .filter((m): m is KanjiQuizMistake => m !== null);

    return {
      ok: true,
      value: {
        totalQuestions: total,
        correct,
        wrong,
        accuracy,
        durationSec,
        xpEarned: session.totalXp,
        mistakes,
      },
    };
  }
}
