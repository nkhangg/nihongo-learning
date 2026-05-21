import { Inject, Injectable } from '@nestjs/common';
import type { Result } from '../../../../shared/application';
import { KanjiQuizSession } from '../../domain/entities/kanji-quiz-session.entity';
import type { KanjiQuizMode } from '../../domain/entities/kanji-quiz-session.entity';
import {
  KANJI_REPOSITORY,
  type IKanjiRepository,
} from '../../domain/repositories/kanji.repository';
import {
  KANJI_QUIZ_SESSION_REPOSITORY,
  type IKanjiQuizSessionRepository,
} from '../../domain/repositories/kanji-quiz-session.repository';
import {
  QUIZ_QUESTION_GENERATOR,
  type IQuizQuestionGenerator,
  type QuizQuestion,
} from '../../domain/services/quiz-question-generator';
import type { JlptLevel } from '../../domain/value-objects/jlpt-level.vo';

export interface StartKanjiQuizInput {
  userId: string;
  jlptLevel: JlptLevel;
  mode: KanjiQuizMode;
  questionCount: number;
  livesEnabled?: boolean;
}

export type StartKanjiQuizResult = Result<
  { sessionId: string; questions: QuizQuestion[] },
  'NO_PUBLISHED_KANJI'
>;

@Injectable()
export class StartKanjiQuizUseCase {
  constructor(
    @Inject(KANJI_REPOSITORY)
    private readonly kanjiRepo: IKanjiRepository,
    @Inject(KANJI_QUIZ_SESSION_REPOSITORY)
    private readonly sessionRepo: IKanjiQuizSessionRepository,
    @Inject(QUIZ_QUESTION_GENERATOR)
    private readonly generator: IQuizQuestionGenerator,
  ) {}

  async execute(input: StartKanjiQuizInput): Promise<StartKanjiQuizResult> {
    const pool = await this.kanjiRepo.pickRandomPublished({
      jlptLevel: input.jlptLevel,
      count: Math.max(input.questionCount * 4, 20),
    });
    if (pool.length === 0) return { ok: false, error: 'NO_PUBLISHED_KANJI' };

    const questions = this.generator.generate({
      pool,
      mode: input.mode,
      jlptLevel: input.jlptLevel,
      count: input.questionCount,
    });

    const session = KanjiQuizSession.create({
      userId: input.userId,
      jlptLevel: input.jlptLevel,
      mode: input.mode,
      questionCount: input.questionCount,
      livesEnabled: input.livesEnabled,
    });
    await this.sessionRepo.save(session);

    return { ok: true, value: { sessionId: session.id, questions } };
  }
}
