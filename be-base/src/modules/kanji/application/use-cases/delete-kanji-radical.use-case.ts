import { Inject, Injectable } from '@nestjs/common';
import type { Result } from '../../../../shared/application';
import {
  KANJI_RADICAL_REPOSITORY,
  type IKanjiRadicalRepository,
} from '../../domain/repositories/kanji-radical.repository';

export type DeleteKanjiRadicalResult = Result<void, 'NOT_FOUND'>;

@Injectable()
export class DeleteKanjiRadicalUseCase {
  constructor(
    @Inject(KANJI_RADICAL_REPOSITORY)
    private readonly repo: IKanjiRadicalRepository,
  ) {}

  async execute(id: string): Promise<DeleteKanjiRadicalResult> {
    const found = await this.repo.findById(id);
    if (!found) return { ok: false, error: 'NOT_FOUND' };
    await this.repo.delete(id);
    return { ok: true, value: undefined };
  }
}
