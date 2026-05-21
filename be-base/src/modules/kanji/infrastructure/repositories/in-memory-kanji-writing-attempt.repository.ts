import type { KanjiWritingAttempt } from '../../domain/entities/kanji-writing-attempt.entity';
import type { IKanjiWritingAttemptRepository } from '../../domain/repositories/kanji-writing-attempt.repository';

export class InMemoryKanjiWritingAttemptRepository
  implements IKanjiWritingAttemptRepository
{
  private readonly store: KanjiWritingAttempt[] = [];

  async save(attempt: KanjiWritingAttempt): Promise<void> {
    this.store.push(attempt);
  }

  async findRecentByUserAndKanji(
    userId: string,
    kanjiId: string,
    limit: number,
  ): Promise<KanjiWritingAttempt[]> {
    return this.store
      .filter((a) => a.userId === userId && a.kanjiId === kanjiId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}
