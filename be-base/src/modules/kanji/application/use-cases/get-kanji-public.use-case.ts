import { Inject, Injectable } from '@nestjs/common';
import type { Result } from '../../../../shared/application';
import type { Kanji } from '../../domain/entities/kanji.entity';
import {
  KANJI_REPOSITORY,
  type IKanjiRepository,
} from '../../domain/repositories/kanji.repository';

export type GetKanjiPublicResult = Result<Kanji, 'NOT_FOUND'>;

@Injectable()
export class GetKanjiPublicUseCase {
  constructor(
    @Inject(KANJI_REPOSITORY)
    private readonly repo: IKanjiRepository,
  ) {}

  async execute(id: string): Promise<GetKanjiPublicResult> {
    const kanji = await this.repo.findById(id);
    if (!kanji || !kanji.isPublished) return { ok: false, error: 'NOT_FOUND' };
    return { ok: true, value: kanji };
  }
}
