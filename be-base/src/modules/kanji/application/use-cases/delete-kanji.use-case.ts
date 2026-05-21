import { Inject, Injectable } from '@nestjs/common';
import type { Result } from '../../../../shared/application';
import {
  KANJI_REPOSITORY,
  type IKanjiRepository,
} from '../../domain/repositories/kanji.repository';

export type DeleteKanjiResult = Result<void, 'NOT_FOUND'>;

@Injectable()
export class DeleteKanjiUseCase {
  constructor(
    @Inject(KANJI_REPOSITORY)
    private readonly repo: IKanjiRepository,
  ) {}

  async execute(id: string): Promise<DeleteKanjiResult> {
    const found = await this.repo.findById(id);
    if (!found) return { ok: false, error: 'NOT_FOUND' };
    await this.repo.delete(id);
    return { ok: true, value: undefined };
  }
}
