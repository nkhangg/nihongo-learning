import { Inject, Injectable } from '@nestjs/common';
import type { Result } from '../../../../shared/application';
import {
  DOMAIN_EVENT_BUS,
  type IDomainEventBus,
} from '../../../../core/events';
import type { KanjiQuizMode } from '../../domain/entities/kanji-quiz-session.entity';
import { KanjiUserProgress } from '../../domain/entities/kanji-user-progress.entity';
import { KanjiMasteryReachedEvent } from '../../domain/events/kanji-mastery-reached.event';
import {
  KANJI_REPOSITORY,
  type IKanjiRepository,
} from '../../domain/repositories/kanji.repository';
import {
  KANJI_QUIZ_SESSION_REPOSITORY,
  type IKanjiQuizSessionRepository,
} from '../../domain/repositories/kanji-quiz-session.repository';
import {
  KANJI_USER_PROGRESS_REPOSITORY,
  type IKanjiUserProgressRepository,
} from '../../domain/repositories/kanji-user-progress.repository';

const XP_CORRECT = 10;
const MASTERY_DELTA_CORRECT = 8;

export interface SubmitKanjiQuizAnswerInput {
  userId: string;
  sessionId: string;
  kanjiId: string;
  mode: Exclude<KanjiQuizMode, 'mixed'>;
  isCorrect: boolean;
  selectedOptionId?: string;
}

export interface SubmitKanjiQuizAnswerOutput {
  correct: boolean;
  xpEarned: number;
}

export type SubmitKanjiQuizAnswerResult = Result<
  SubmitKanjiQuizAnswerOutput,
  'SESSION_NOT_FOUND' | 'NOT_OWNER' | 'SESSION_NOT_IN_PROGRESS'
>;

@Injectable()
export class SubmitKanjiQuizAnswerUseCase {
  constructor(
    @Inject(KANJI_QUIZ_SESSION_REPOSITORY)
    private readonly sessionRepo: IKanjiQuizSessionRepository,
    @Inject(KANJI_REPOSITORY)
    private readonly kanjiRepo: IKanjiRepository,
    @Inject(KANJI_USER_PROGRESS_REPOSITORY)
    private readonly progressRepo: IKanjiUserProgressRepository,
    @Inject(DOMAIN_EVENT_BUS)
    private readonly events: IDomainEventBus,
  ) {}

  async execute(
    input: SubmitKanjiQuizAnswerInput,
  ): Promise<SubmitKanjiQuizAnswerResult> {
    const session = await this.sessionRepo.findById(input.sessionId);
    if (!session) return { ok: false, error: 'SESSION_NOT_FOUND' };
    if (session.userId !== input.userId) return { ok: false, error: 'NOT_OWNER' };
    if (session.status !== 'in_progress')
      return { ok: false, error: 'SESSION_NOT_IN_PROGRESS' };

    const xpEarned = input.isCorrect ? XP_CORRECT : 0;
    session.recordAnswer({
      kanjiId: input.kanjiId,
      mode: input.mode,
      isCorrect: input.isCorrect,
      selectedOptionId: input.selectedOptionId,
      xpEarned,
    });
    await this.sessionRepo.save(session);

    if (input.isCorrect) {
      const kanji = await this.kanjiRepo.findById(input.kanjiId);
      if (kanji) {
        let progress = await this.progressRepo.findByUserAndKanji(
          input.userId,
          input.kanjiId,
        );
        if (!progress) {
          progress = KanjiUserProgress.create({
            userId: input.userId,
            kanjiId: input.kanjiId,
          });
        }
        const { masteryJustReached100 } = progress.recordReview(
          MASTERY_DELTA_CORRECT,
        );
        await this.progressRepo.save(progress);
        if (masteryJustReached100) {
          this.events.publish(
            new KanjiMasteryReachedEvent(
              input.userId,
              kanji.id.value,
              kanji.char,
              kanji.jlptLevel,
            ),
          );
        }
      }
    }

    return { ok: true, value: { correct: input.isCorrect, xpEarned } };
  }
}
