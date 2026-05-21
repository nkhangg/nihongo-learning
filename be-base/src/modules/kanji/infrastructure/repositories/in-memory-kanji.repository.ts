import type { Kanji } from '../../domain/entities/kanji.entity';
import type {
  IKanjiRepository,
  ListKanjiOptions,
} from '../../domain/repositories/kanji.repository';
import type { JlptLevel } from '../../domain/value-objects/jlpt-level.vo';

export class InMemoryKanjiRepository implements IKanjiRepository {
  private readonly store = new Map<string, Kanji>();

  async findById(id: string): Promise<Kanji | null> {
    return this.store.get(id) ?? null;
  }

  async findByChar(char: string): Promise<Kanji | null> {
    for (const k of this.store.values()) {
      if (k.char === char) return k;
    }
    return null;
  }

  async findManyByIds(ids: string[]): Promise<Kanji[]> {
    return ids
      .map((id) => this.store.get(id))
      .filter((k): k is Kanji => k !== undefined);
  }

  async list(
    opts: ListKanjiOptions,
  ): Promise<{ data: Kanji[]; total: number }> {
    let results = Array.from(this.store.values());
    if (opts.publishedOnly) {
      results = results.filter((k) => k.isPublished);
    } else if (opts.status) {
      results = results.filter((k) => k.status === opts.status);
    }
    if (opts.jlptLevel)
      results = results.filter((k) => k.jlptLevel === opts.jlptLevel);
    if (opts.radicalId)
      results = results.filter((k) => k.radicalId === opts.radicalId);
    if (opts.strokesMin !== undefined)
      results = results.filter((k) => k.strokes >= opts.strokesMin!);
    if (opts.strokesMax !== undefined)
      results = results.filter((k) => k.strokes <= opts.strokesMax!);
    if (opts.search) {
      const q = opts.search.toLowerCase();
      results = results.filter(
        (k) =>
          k.char.includes(opts.search!) ||
          k.meaningVi.toLowerCase().includes(q) ||
          k.meaningEn.toLowerCase().includes(q),
      );
    }

    results.sort((a, b) => {
      if (a.jlptLevel !== b.jlptLevel)
        return a.jlptLevel.localeCompare(b.jlptLevel);
      if (a.strokes !== b.strokes) return a.strokes - b.strokes;
      return a.char.localeCompare(b.char);
    });

    const total = results.length;
    const skip = (opts.page - 1) * opts.pageSize;
    return { data: results.slice(skip, skip + opts.pageSize), total };
  }

  async pickRandomPublished(params: {
    jlptLevel: JlptLevel;
    count: number;
    excludeIds?: string[];
  }): Promise<Kanji[]> {
    const exclude = new Set(params.excludeIds ?? []);
    const pool = Array.from(this.store.values()).filter(
      (k) =>
        k.isPublished &&
        k.jlptLevel === params.jlptLevel &&
        !exclude.has(k.id.value),
    );
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, params.count);
  }

  async save(kanji: Kanji): Promise<void> {
    this.store.set(kanji.id.value, kanji);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
