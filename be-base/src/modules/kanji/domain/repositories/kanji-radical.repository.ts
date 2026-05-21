import type { KanjiRadical } from '../entities/kanji-radical.entity';

export const KANJI_RADICAL_REPOSITORY = Symbol('KANJI_RADICAL_REPOSITORY');

export interface IKanjiRadicalRepository {
  findById(id: string): Promise<KanjiRadical | null>;
  findByChar(char: string): Promise<KanjiRadical | null>;
  listAll(): Promise<KanjiRadical[]>;
  save(radical: KanjiRadical): Promise<void>;
  delete(id: string): Promise<void>;
}
