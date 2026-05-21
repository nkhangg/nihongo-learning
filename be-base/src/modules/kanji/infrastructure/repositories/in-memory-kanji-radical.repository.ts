import type { KanjiRadical } from '../../domain/entities/kanji-radical.entity';
import type { IKanjiRadicalRepository } from '../../domain/repositories/kanji-radical.repository';

export class InMemoryKanjiRadicalRepository implements IKanjiRadicalRepository {
  private readonly store = new Map<string, KanjiRadical>();

  async findById(id: string): Promise<KanjiRadical | null> {
    return this.store.get(id) ?? null;
  }

  async findByChar(char: string): Promise<KanjiRadical | null> {
    for (const r of this.store.values()) {
      if (r.char === char) return r;
    }
    return null;
  }

  async listAll(): Promise<KanjiRadical[]> {
    return Array.from(this.store.values()).sort((a, b) => {
      if (a.isPopular !== b.isPopular) return a.isPopular ? -1 : 1;
      if (a.strokes !== b.strokes) return a.strokes - b.strokes;
      return a.char.localeCompare(b.char);
    });
  }

  async save(radical: KanjiRadical): Promise<void> {
    this.store.set(radical.id.value, radical);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
