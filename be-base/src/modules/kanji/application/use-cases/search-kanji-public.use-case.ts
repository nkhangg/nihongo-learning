import { Inject, Injectable } from '@nestjs/common';
import type { Kanji } from '../../domain/entities/kanji.entity';
import {
  KANJI_REPOSITORY,
  type IKanjiRepository,
} from '../../domain/repositories/kanji.repository';
import type { JlptLevel } from '../../domain/value-objects/jlpt-level.vo';

export interface SearchKanjiPublicInput {
  jlptLevel?: JlptLevel;
  radicalId?: string;
  strokesMin?: number;
  strokesMax?: number;
  search?: string;
  page: number;
  pageSize: number;
}

@Injectable()
export class SearchKanjiPublicUseCase {
  constructor(
    @Inject(KANJI_REPOSITORY)
    private readonly repo: IKanjiRepository,
  ) {}

  async execute(
    input: SearchKanjiPublicInput,
  ): Promise<{ data: Kanji[]; total: number }> {
    return this.repo.list({
      jlptLevel: input.jlptLevel,
      radicalId: input.radicalId,
      strokesMin: input.strokesMin,
      strokesMax: input.strokesMax,
      search: input.search,
      publishedOnly: true,
      page: input.page,
      pageSize: input.pageSize,
    });
  }
}
