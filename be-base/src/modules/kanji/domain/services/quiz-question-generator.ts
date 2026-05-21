import type { Kanji } from '../entities/kanji.entity';
import type { KanjiQuizMode } from '../entities/kanji-quiz-session.entity';
import type { JlptLevel } from '../value-objects/jlpt-level.vo';

export const QUIZ_QUESTION_GENERATOR = Symbol('QUIZ_QUESTION_GENERATOR');

export interface QuizQuestionOption {
  id: string;
  label: string;
  subLabel?: string;
}

export interface QuizQuestion {
  id: string;
  mode: Exclude<KanjiQuizMode, 'mixed'>;
  kanjiId: string;
  kanjiChar: string;
  // Recognition / meaningToKanji
  contextSentenceHtml?: string;
  options?: QuizQuestionOption[];
  correctOptionId?: string;
  // Writing
  meaningPrompt?: string;
  readingHint?: string;
  // Common
  explanation: string;
  mnemonic?: string;
}

export interface IQuizQuestionGenerator {
  generate(params: {
    pool: Kanji[];
    mode: KanjiQuizMode;
    jlptLevel: JlptLevel;
    count: number;
  }): QuizQuestion[];
}
