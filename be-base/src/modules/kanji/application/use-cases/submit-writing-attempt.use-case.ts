import { Inject, Injectable } from '@nestjs/common';
import type { Result } from '../../../../shared/application';
import {
  DOMAIN_EVENT_BUS,
  type IDomainEventBus,
} from '../../../../core/events';
import { KanjiUserProgress } from '../../domain/entities/kanji-user-progress.entity';
import { KanjiWritingAttempt } from '../../domain/entities/kanji-writing-attempt.entity';
import type { KanjiWritingScore } from '../../domain/entities/kanji-writing-attempt.entity';
import { KanjiMasteryReachedEvent } from '../../domain/events/kanji-mastery-reached.event';
import {
  KANJI_REPOSITORY,
  type IKanjiRepository,
} from '../../domain/repositories/kanji.repository';
import {
  KANJI_USER_PROGRESS_REPOSITORY,
  type IKanjiUserProgressRepository,
} from '../../domain/repositories/kanji-user-progress.repository';
import {
  KANJI_WRITING_ATTEMPT_REPOSITORY,
  type IKanjiWritingAttemptRepository,
} from '../../domain/repositories/kanji-writing-attempt.repository';
import {
  WRITING_SCORER,
  type IWritingScorer,
  type WritingStrokeInput,
} from '../../domain/services/writing-scorer';

export interface SubmitWritingAttemptInput {
  userId: string;
  kanjiId: string;
  strokes: WritingStrokeInput[];
  durationMs: number;
}

export type SubmitWritingAttemptResult = Result<
  { score: KanjiWritingScore; newMastery: number },
  'KANJI_NOT_FOUND'
>;

/**
 * Mastery delta from a writing attempt:
 *   overall >= 80 → +20, >= 60 → +10, >= 40 → +5, else 0.
 * Tuned so that a learner consistently hitting 80+ reaches mastery=100
 * within ~5 sessions.
 */
function masteryDeltaFromScore(overall: number): number {
  if (overall >= 80) return 20;
  if (overall >= 60) return 10;
  if (overall >= 40) return 5;
  return 0;
}

@Injectable()
export class SubmitWritingAttemptUseCase {
  constructor(
    @Inject(KANJI_REPOSITORY)
    private readonly kanjiRepo: IKanjiRepository,
    @Inject(KANJI_USER_PROGRESS_REPOSITORY)
    private readonly progressRepo: IKanjiUserProgressRepository,
    @Inject(KANJI_WRITING_ATTEMPT_REPOSITORY)
    private readonly attemptRepo: IKanjiWritingAttemptRepository,
    @Inject(WRITING_SCORER)
    private readonly scorer: IWritingScorer,
    @Inject(DOMAIN_EVENT_BUS)
    private readonly events: IDomainEventBus,
  ) {}

  async execute(
    input: SubmitWritingAttemptInput,
  ): Promise<SubmitWritingAttemptResult> {
    const kanji = await this.kanjiRepo.findById(input.kanjiId);
    if (!kanji) return { ok: false, error: 'KANJI_NOT_FOUND' };

    const score = this.scorer.score({
      kanji,
      strokes: input.strokes,
      durationMs: input.durationMs,
    });

    const attempt = KanjiWritingAttempt.create({
      userId: input.userId,
      kanjiId: input.kanjiId,
      score,
      durationMs: input.durationMs,
    });
    await this.attemptRepo.save(attempt);

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
    const { newMastery, masteryJustReached100 } = progress.recordReview(
      masteryDeltaFromScore(score.overall),
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

    return { ok: true, value: { score, newMastery } };
  }
}
