import type { KanjiQuizSession } from '../entities/kanji-quiz-session.entity';

export const KANJI_QUIZ_SESSION_REPOSITORY = Symbol(
  'KANJI_QUIZ_SESSION_REPOSITORY',
);

export interface IKanjiQuizSessionRepository {
  findById(id: string): Promise<KanjiQuizSession | null>;
  save(session: KanjiQuizSession): Promise<void>;
}
