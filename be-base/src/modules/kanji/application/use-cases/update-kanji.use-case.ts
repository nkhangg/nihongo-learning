import { Inject, Injectable } from '@nestjs/common';
import type { Result } from '../../../../shared/application';
import type {
  KanjiCompound,
  KanjiComponent,
  KanjiExample,
  KanjiMeaning,
  KanjiSimilarRef,
} from '../../domain/entities/kanji.entity';
import {
  KANJI_REPOSITORY,
  type IKanjiRepository,
} from '../../domain/repositories/kanji.repository';
import type { JlptLevel } from '../../domain/value-objects/jlpt-level.vo';
import { sanitizeExampleHtml } from '../services/sanitize-example-html';

export interface UpdateKanjiInput {
  id: string;
  char?: string;
  jlptLevel?: JlptLevel;
  strokes?: number;
  radicalId?: string | null;
  frequency?: number | null;
  joyoOrder?: number | null;
  unicode?: string;
  onReadings?: string[];
  kunReadings?: string[];
  meaningVi?: string;
  meaningEn?: string;
  strokeOrderSvg?: string[];
  mnemonicVi?: string | null;
  meanings?: KanjiMeaning[];
  examples?: KanjiExample[];
  compounds?: KanjiCompound[];
  components?: KanjiComponent[];
  similar?: KanjiSimilarRef[];
}

export type UpdateKanjiResult = Result<void, 'NOT_FOUND' | string>;

@Injectable()
export class UpdateKanjiUseCase {
  constructor(
    @Inject(KANJI_REPOSITORY)
    private readonly repo: IKanjiRepository,
  ) {}

  async execute(input: UpdateKanjiInput): Promise<UpdateKanjiResult> {
    const kanji = await this.repo.findById(input.id);
    if (!kanji) return { ok: false, error: 'NOT_FOUND' };

    kanji.update({
      char: input.char,
      jlptLevel: input.jlptLevel,
      strokes: input.strokes,
      radicalId: input.radicalId,
      frequency: input.frequency,
      joyoOrder: input.joyoOrder,
      unicode: input.unicode,
      onReadings: input.onReadings,
      kunReadings: input.kunReadings,
      meaningVi: input.meaningVi,
      meaningEn: input.meaningEn,
      strokeOrderSvg: input.strokeOrderSvg,
      mnemonicVi: input.mnemonicVi,
    });

    if (input.meanings !== undefined) kanji.replaceMeanings(input.meanings);
    if (input.examples !== undefined) {
      kanji.replaceExamples(
        input.examples.map((e) => ({
          ...e,
          jpHtml: sanitizeExampleHtml(e.jpHtml),
        })),
      );
    }
    if (input.compounds !== undefined) kanji.replaceCompounds(input.compounds);
    if (input.components !== undefined) kanji.replaceComponents(input.components);
    if (input.similar !== undefined) kanji.replaceSimilar(input.similar);

    await this.repo.save(kanji);
    return { ok: true, value: undefined };
  }
}
