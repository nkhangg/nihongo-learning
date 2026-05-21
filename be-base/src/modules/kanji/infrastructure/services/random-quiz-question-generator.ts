import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import type { Kanji } from '../../domain/entities/kanji.entity';
import type { KanjiQuizMode } from '../../domain/entities/kanji-quiz-session.entity';
import type {
  IQuizQuestionGenerator,
  QuizQuestion,
  QuizQuestionOption,
} from '../../domain/services/quiz-question-generator';
import type { JlptLevel } from '../../domain/value-objects/jlpt-level.vo';

@Injectable()
export class RandomQuizQuestionGenerator implements IQuizQuestionGenerator {
  generate(params: {
    pool: Kanji[];
    mode: KanjiQuizMode;
    jlptLevel: JlptLevel;
    count: number;
  }): QuizQuestion[] {
    const { pool, mode, count } = params;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, count);

    return picked.map((kanji) => {
      const concreteMode: Exclude<KanjiQuizMode, 'mixed'> =
        mode === 'mixed' ? this.pickRandomMode() : mode;

      if (concreteMode === 'recognition') {
        return this.buildRecognitionQuestion(kanji, pool);
      }
      if (concreteMode === 'meaningToKanji') {
        return this.buildMeaningToKanjiQuestion(kanji, pool);
      }
      return this.buildWritingQuestion(kanji);
    });
  }

  private pickRandomMode(): Exclude<KanjiQuizMode, 'mixed'> {
    const modes: Array<Exclude<KanjiQuizMode, 'mixed'>> = [
      'recognition',
      'meaningToKanji',
      'writing',
    ];
    return modes[Math.floor(Math.random() * modes.length)];
  }

  private pickDistractors<T>(pool: T[], correct: T, n: number): T[] {
    const candidates = pool.filter((p) => p !== correct);
    const shuffled = candidates.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
  }

  private buildRecognitionQuestion(kanji: Kanji, pool: Kanji[]): QuizQuestion {
    const correctReading =
      kanji.onReadings[0] ?? kanji.kunReadings[0] ?? kanji.char;
    const distractors = this.pickDistractors(pool, kanji, 3).map(
      (k) => k.onReadings[0] ?? k.kunReadings[0] ?? k.char,
    );
    const correctId = randomUUID();
    const options: QuizQuestionOption[] = this.shuffle([
      { id: correctId, label: correctReading },
      ...distractors.map((label) => ({ id: randomUUID(), label })),
    ]);
    return {
      id: randomUUID(),
      mode: 'recognition',
      kanjiId: kanji.id.value,
      kanjiChar: kanji.char,
      options,
      correctOptionId: correctId,
      explanation: `${kanji.char} — ${kanji.meaningVi}. Cách đọc chính: ${correctReading}.`,
      mnemonic: kanji.mnemonicVi ?? undefined,
    };
  }

  private buildMeaningToKanjiQuestion(
    kanji: Kanji,
    pool: Kanji[],
  ): QuizQuestion {
    const distractors = this.pickDistractors(pool, kanji, 3);
    const correctId = randomUUID();
    const options: QuizQuestionOption[] = this.shuffle([
      { id: correctId, label: kanji.char, subLabel: kanji.meaningVi },
      ...distractors.map((k) => ({
        id: randomUUID(),
        label: k.char,
        subLabel: k.meaningVi,
      })),
    ]);
    return {
      id: randomUUID(),
      mode: 'meaningToKanji',
      kanjiId: kanji.id.value,
      kanjiChar: kanji.char,
      meaningPrompt: kanji.meaningVi,
      options,
      correctOptionId: correctId,
      explanation: `${kanji.char} = ${kanji.meaningVi}.`,
      mnemonic: kanji.mnemonicVi ?? undefined,
    };
  }

  private buildWritingQuestion(kanji: Kanji): QuizQuestion {
    return {
      id: randomUUID(),
      mode: 'writing',
      kanjiId: kanji.id.value,
      kanjiChar: kanji.char,
      meaningPrompt: kanji.meaningVi,
      readingHint:
        kanji.onReadings[0] ??
        kanji.kunReadings[0] ??
        '—',
      explanation: `${kanji.char} (${kanji.strokes} nét) — ${kanji.meaningVi}.`,
      mnemonic: kanji.mnemonicVi ?? undefined,
    };
  }

  private shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
  }
}
