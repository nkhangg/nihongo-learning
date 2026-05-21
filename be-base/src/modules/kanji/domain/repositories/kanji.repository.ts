import type { Kanji, KanjiStatus } from '../entities/kanji.entity';
import type { JlptLevel } from '../value-objects/jlpt-level.vo';

export const KANJI_REPOSITORY = Symbol('KANJI_REPOSITORY');

export interface ListKanjiOptions {
  jlptLevel?: JlptLevel;
  status?: KanjiStatus;
  radicalId?: string;
  strokesMin?: number;
  strokesMax?: number;
  search?: string;
  publishedOnly?: boolean;
  page: number;
  pageSize: number;
}

export interface IKanjiRepository {
  findById(id: string): Promise<Kanji | null>;
  findByChar(char: string): Promise<Kanji | null>;
  findManyByIds(ids: string[]): Promise<Kanji[]>;
  list(opts: ListKanjiOptions): Promise<{ data: Kanji[]; total: number }>;
  /**
   * Pick random kanji for quiz seeding, restricted to published + level.
   */
  pickRandomPublished(params: {
    jlptLevel: JlptLevel;
    count: number;
    excludeIds?: string[];
  }): Promise<Kanji[]>;
  save(kanji: Kanji): Promise<void>;
  delete(id: string): Promise<void>;
}
