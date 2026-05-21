import type { KanjiQuizSession } from '../../domain/entities/kanji-quiz-session.entity';
import type { IKanjiQuizSessionRepository } from '../../domain/repositories/kanji-quiz-session.repository';

export class InMemoryKanjiQuizSessionRepository
  implements IKanjiQuizSessionRepository
{
  private readonly store = new Map<string, KanjiQuizSession>();

  async findById(id: string): Promise<KanjiQuizSession | null> {
    return this.store.get(id) ?? null;
  }

  async save(session: KanjiQuizSession): Promise<void> {
    this.store.set(session.id, session);
  }
}
