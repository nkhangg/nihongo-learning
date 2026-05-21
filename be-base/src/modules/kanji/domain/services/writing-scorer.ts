import type { Kanji } from '../entities/kanji.entity';
import type { KanjiWritingScore } from '../entities/kanji-writing-attempt.entity';

export const WRITING_SCORER = Symbol('WRITING_SCORER');

export interface WritingStrokePoint {
  x: number; // normalized 0..1
  y: number; // normalized 0..1
  t: number; // ms since stroke start
}

export interface WritingStrokeInput {
  points: WritingStrokePoint[];
}

export interface IWritingScorer {
  score(params: {
    kanji: Kanji;
    strokes: WritingStrokeInput[];
    durationMs: number;
  }): KanjiWritingScore;
}
