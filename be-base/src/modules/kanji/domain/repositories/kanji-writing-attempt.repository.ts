import type { KanjiWritingAttempt } from '../entities/kanji-writing-attempt.entity';

export const KANJI_WRITING_ATTEMPT_REPOSITORY = Symbol(
  'KANJI_WRITING_ATTEMPT_REPOSITORY',
);

export interface IKanjiWritingAttemptRepository {
  save(attempt: KanjiWritingAttempt): Promise<void>;
  findRecentByUserAndKanji(
    userId: string,
    kanjiId: string,
    limit: number,
  ): Promise<KanjiWritingAttempt[]>;
}
