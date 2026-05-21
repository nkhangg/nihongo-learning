import { Inject, Injectable } from '@nestjs/common';
import type { Result } from '../../../../shared/application';
import {
  KANJI_REPOSITORY,
  type IKanjiRepository,
} from '../../domain/repositories/kanji.repository';

export type UnpublishKanjiResult = Result<void, 'NOT_FOUND'>;

@Injectable()
export class UnpublishKanjiUseCase {
  constructor(
    @Inject(KANJI_REPOSITORY)
    private readonly repo: IKanjiRepository,
  ) {}

  async execute(id: string): Promise<UnpublishKanjiResult> {
    const kanji = await this.repo.findById(id);
    if (!kanji) return { ok: false, error: 'NOT_FOUND' };
    kanji.unpublish();
    await this.repo.save(kanji);
    return { ok: true, value: undefined };
  }
}
