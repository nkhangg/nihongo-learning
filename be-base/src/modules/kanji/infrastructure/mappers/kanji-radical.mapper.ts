import { KanjiRadical } from '../../domain/entities/kanji-radical.entity';

export interface KanjiRadicalRecord {
  id: string;
  char: string;
  meaningVi: string;
  strokes: number;
  isPopular: boolean;
}

export interface KanjiRadicalPersistenceData {
  char: string;
  meaningVi: string;
  strokes: number;
  isPopular: boolean;
}

export class KanjiRadicalMapper {
  static toPrisma(radical: KanjiRadical): KanjiRadicalPersistenceData {
    return {
      char: radical.char,
      meaningVi: radical.meaningVi,
      strokes: radical.strokes,
      isPopular: radical.isPopular,
    };
  }

  static toDomain(r: KanjiRadicalRecord): KanjiRadical {
    return KanjiRadical.reconstitute(r.id, {
      char: r.char,
      meaningVi: r.meaningVi,
      strokes: r.strokes,
      isPopular: r.isPopular,
    });
  }
}
