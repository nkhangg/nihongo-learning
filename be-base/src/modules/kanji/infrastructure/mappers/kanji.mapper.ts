import {
  Kanji,
  type KanjiCompound,
  type KanjiExample,
  type KanjiMeaning,
  type KanjiMeaningPos,
  type KanjiSimilarRef,
  type KanjiStatus,
} from '../../domain/entities/kanji.entity';
import type { JlptLevel } from '../../domain/value-objects/jlpt-level.vo';

export interface KanjiMeaningRecord {
  id: string;
  kanjiId: string;
  index: number;
  pos: string;
  textVi: string;
  jpExample: string | null;
}

export interface KanjiExampleRecord {
  id: string;
  kanjiId: string;
  jpHtml: string;
  vi: string;
  source: string | null;
}

export interface KanjiCompoundRecord {
  id: string;
  kanjiId: string;
  jp: string;
  reading: string;
  meaningVi: string;
}

export interface KanjiSimilarRecord {
  id: string;
  kanjiId: string;
  similarKanjiId: string;
  reason: string;
}

export interface KanjiRecord {
  id: string;
  char: string;
  jlptLevel: string;
  strokes: number;
  radicalId: string | null;
  frequency: number | null;
  joyoOrder: number | null;
  unicode: string;
  onReadings: string[];
  kunReadings: string[];
  meaningVi: string;
  meaningEn: string;
  strokeOrderSvg: string[];
  mnemonicVi: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  meanings?: KanjiMeaningRecord[];
  examples?: KanjiExampleRecord[];
  compounds?: KanjiCompoundRecord[];
  similarFrom?: KanjiSimilarRecord[];
  radical?: { char: string; meaningVi: string; strokes: number } | null;
  components: unknown;
}

function statusToDomain(s: string): KanjiStatus {
  return s.toLowerCase() === 'published' ? 'published' : 'draft';
}

function levelToDomain(l: string): JlptLevel {
  return l as JlptLevel;
}

export interface KanjiPersistenceData {
  char: string;
  jlptLevel: string;
  strokes: number;
  radicalId: string | null;
  frequency: number | null;
  joyoOrder: number | null;
  unicode: string;
  onReadings: string[];
  kunReadings: string[];
  meaningVi: string;
  meaningEn: string;
  strokeOrderSvg: string[];
  mnemonicVi: string | null;
  status: string;
}

export class KanjiMapper {
  static toPrisma(kanji: Kanji): KanjiPersistenceData {
    return {
      char: kanji.char,
      jlptLevel: jlptLevelToPrisma(kanji.jlptLevel),
      strokes: kanji.strokes,
      radicalId: kanji.radicalId,
      frequency: kanji.frequency,
      joyoOrder: kanji.joyoOrder,
      unicode: kanji.unicode,
      onReadings: kanji.onReadings,
      kunReadings: kanji.kunReadings,
      meaningVi: kanji.meaningVi,
      meaningEn: kanji.meaningEn,
      strokeOrderSvg: kanji.strokeOrderSvg,
      mnemonicVi: kanji.mnemonicVi,
      status: kanjiStatusToPrisma(kanji.status),
    };
  }

  static meaningsToCreate(kanji: Kanji) {
    return kanji.meanings.map((m) => ({
      index: m.index,
      pos: m.pos,
      textVi: m.textVi,
      jpExample: m.jpExample,
    }));
  }

  static examplesToCreate(kanji: Kanji) {
    return kanji.examples.map((e) => ({
      jpHtml: e.jpHtml,
      vi: e.vi,
      source: e.source,
    }));
  }

  static compoundsToCreate(kanji: Kanji) {
    return kanji.compounds.map((c) => ({
      jp: c.jp,
      reading: c.reading,
      meaningVi: c.meaningVi,
    }));
  }

  static similarToCreate(kanji: Kanji) {
    return kanji.similar.map((s) => ({
      similarKanjiId: s.similarKanjiId,
      reason: s.reason,
    }));
  }

  static toDomain(r: KanjiRecord): Kanji {
    const meanings: KanjiMeaning[] = (r.meanings ?? [])
      .slice()
      .sort((a, b) => a.index - b.index)
      .map((m) => ({
        index: m.index,
        pos: m.pos as KanjiMeaningPos,
        textVi: m.textVi,
        jpExample: m.jpExample,
      }));

    const examples: KanjiExample[] = (r.examples ?? []).map((e) => ({
      jpHtml: e.jpHtml,
      vi: e.vi,
      source: e.source,
    }));

    const compounds: KanjiCompound[] = (r.compounds ?? []).map((c) => ({
      jp: c.jp,
      reading: c.reading,
      meaningVi: c.meaningVi,
    }));

    const similar: KanjiSimilarRef[] = (r.similarFrom ?? []).map((s) => ({
      similarKanjiId: s.similarKanjiId,
      reason: s.reason,
    }));

    return Kanji.reconstitute(r.id, {
      char: r.char,
      jlptLevel: levelToDomain(r.jlptLevel),
      strokes: r.strokes,
      radicalId: r.radicalId,
      radical: r.radical ?? null,
      frequency: r.frequency,
      joyoOrder: r.joyoOrder,
      unicode: r.unicode,
      onReadings: r.onReadings,
      kunReadings: r.kunReadings,
      meaningVi: r.meaningVi,
      meaningEn: r.meaningEn,
      strokeOrderSvg: r.strokeOrderSvg,
      components: Array.isArray(r.components) ? (r.components as { char: string; meaningVi: string }[]) : [],
      mnemonicVi: r.mnemonicVi,
      status: statusToDomain(r.status),
      meanings,
      examples,
      compounds,
      similar,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    });
  }
}

export function jlptLevelToPrisma(l: JlptLevel): string {
  return l;
}

export function kanjiStatusToPrisma(s: KanjiStatus): string {
  return s.toUpperCase();
}
