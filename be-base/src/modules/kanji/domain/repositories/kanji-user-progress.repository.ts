import type {
  KanjiProgressStatus,
  KanjiUserProgress,
} from '../entities/kanji-user-progress.entity';
import type { JlptLevel } from '../value-objects/jlpt-level.vo';

export const KANJI_USER_PROGRESS_REPOSITORY = Symbol(
  'KANJI_USER_PROGRESS_REPOSITORY',
);

export interface KanjiProgressSummary {
  total: number;
  known: number;
  learning: number;
  unseen: number;
  byLevel: Record<
    JlptLevel,
    { total: number; known: number; learning: number }
  >;
}

export interface IKanjiUserProgressRepository {
  findByUserAndKanji(
    userId: string,
    kanjiId: string,
  ): Promise<KanjiUserProgress | null>;
  findManyByUser(
    userId: string,
    opts?: { status?: KanjiProgressStatus; kanjiIds?: string[] },
  ): Promise<KanjiUserProgress[]>;
  getSummary(userId: string): Promise<KanjiProgressSummary>;
  /**
   * Pick kanji currently in "learning" status for the writing queue.
   * Returns kanjiIds ordered by oldest lastReviewedAt first.
   */
  pickLearningKanjiIds(params: {
    userId: string;
    jlptLevel?: JlptLevel;
    limit: number;
  }): Promise<string[]>;
  save(progress: KanjiUserProgress): Promise<void>;
}
