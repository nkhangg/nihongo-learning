import { Inject, Injectable } from '@nestjs/common';
import type { Result } from '../../../../shared/application';
import {
  KANJI_RADICAL_REPOSITORY,
  type IKanjiRadicalRepository,
} from '../../domain/repositories/kanji-radical.repository';

export interface UpdateKanjiRadicalInput {
  id: string;
  char?: string;
  meaningVi?: string;
  strokes?: number;
  isPopular?: boolean;
}

export type UpdateKanjiRadicalResult = Result<void, 'NOT_FOUND'>;

@Injectable()
export class UpdateKanjiRadicalUseCase {
  constructor(
    @Inject(KANJI_RADICAL_REPOSITORY)
    private readonly repo: IKanjiRadicalRepository,
  ) {}

  async execute(
    input: UpdateKanjiRadicalInput,
  ): Promise<UpdateKanjiRadicalResult> {
    const radical = await this.repo.findById(input.id);
    if (!radical) return { ok: false, error: 'NOT_FOUND' };
    radical.update({
      char: input.char,
      meaningVi: input.meaningVi,
      strokes: input.strokes,
      isPopular: input.isPopular,
    });
    await this.repo.save(radical);
    return { ok: true, value: undefined };
  }
}
