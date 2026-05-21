import { Inject, Injectable } from '@nestjs/common';
import type { Result } from '../../../../shared/application';
import { Kanji } from '../../domain/entities/kanji.entity';
import type {
  KanjiCompound,
  KanjiComponent,
  KanjiExample,
  KanjiMeaning,
  KanjiSimilarRef,
  KanjiStatus,
} from '../../domain/entities/kanji.entity';
import {
  KANJI_REPOSITORY,
  type IKanjiRepository,
} from '../../domain/repositories/kanji.repository';
import type { JlptLevel } from '../../domain/value-objects/jlpt-level.vo';
import { sanitizeExampleHtml } from '../services/sanitize-example-html';

export interface CreateKanjiInput {
  char: string;
  jlptLevel: JlptLevel;
  strokes: number;
  radicalId?: string;
  frequency?: number;
  joyoOrder?: number;
  unicode: string;
  onReadings?: string[];
  kunReadings?: string[];
  meaningVi: string;
  meaningEn: string;
  strokeOrderSvg?: string[];
  mnemonicVi?: string;
  status?: KanjiStatus;
  meanings?: KanjiMeaning[];
  examples?: KanjiExample[];
  compounds?: KanjiCompound[];
  components?: KanjiComponent[];
  similar?: KanjiSimilarRef[];
}

export type CreateKanjiResult = Result<{ kanjiId: string }, string>;

@Injectable()
export class CreateKanjiUseCase {
  constructor(
    @Inject(KANJI_REPOSITORY)
    private readonly repo: IKanjiRepository,
  ) {}

  async execute(input: CreateKanjiInput): Promise<CreateKanjiResult> {
    const existing = await this.repo.findByChar(input.char);
    if (existing) return { ok: false, error: 'CHAR_ALREADY_EXISTS' };

    const examples = (input.examples ?? []).map((e) => ({
      ...e,
      jpHtml: sanitizeExampleHtml(e.jpHtml),
    }));

    const kanji = Kanji.create({ ...input, examples });
    await this.repo.save(kanji);
    return { ok: true, value: { kanjiId: kanji.id.value } };
  }
}
