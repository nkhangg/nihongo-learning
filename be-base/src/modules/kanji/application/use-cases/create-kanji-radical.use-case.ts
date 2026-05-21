import { Inject, Injectable } from '@nestjs/common';
import type { Result } from '../../../../shared/application';
import { KanjiRadical } from '../../domain/entities/kanji-radical.entity';
import {
  KANJI_RADICAL_REPOSITORY,
  type IKanjiRadicalRepository,
} from '../../domain/repositories/kanji-radical.repository';

export interface CreateKanjiRadicalInput {
  char: string;
  meaningVi: string;
  strokes: number;
  isPopular?: boolean;
}

export type CreateKanjiRadicalResult = Result<{ radicalId: string }, string>;

@Injectable()
export class CreateKanjiRadicalUseCase {
  constructor(
    @Inject(KANJI_RADICAL_REPOSITORY)
    private readonly repo: IKanjiRadicalRepository,
  ) {}

  async execute(
    input: CreateKanjiRadicalInput,
  ): Promise<CreateKanjiRadicalResult> {
    const existing = await this.repo.findByChar(input.char);
    if (existing) return { ok: false, error: 'CHAR_ALREADY_EXISTS' };
    const radical = KanjiRadical.create(input);
    await this.repo.save(radical);
    return { ok: true, value: { radicalId: radical.id.value } };
  }
}
