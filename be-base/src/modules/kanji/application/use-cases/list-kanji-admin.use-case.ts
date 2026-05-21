import { Inject, Injectable } from '@nestjs/common';
import type {
  Kanji,
  KanjiStatus,
} from '../../domain/entities/kanji.entity';
import {
  KANJI_REPOSITORY,
  type IKanjiRepository,
} from '../../domain/repositories/kanji.repository';
import type { JlptLevel } from '../../domain/value-objects/jlpt-level.vo';

export interface ListKanjiAdminInput {
  jlptLevel?: JlptLevel;
  status?: KanjiStatus;
  radicalId?: string;
  strokesMin?: number;
  strokesMax?: number;
  search?: string;
  page: number;
  pageSize: number;
}

@Injectable()
export class ListKanjiAdminUseCase {
  constructor(
    @Inject(KANJI_REPOSITORY)
    private readonly repo: IKanjiRepository,
  ) {}

  async execute(
    input: ListKanjiAdminInput,
  ): Promise<{ data: Kanji[]; total: number }> {
    return this.repo.list({
      jlptLevel: input.jlptLevel,
      status: input.status,
      radicalId: input.radicalId,
      strokesMin: input.strokesMin,
      strokesMax: input.strokesMax,
      search: input.search,
      publishedOnly: false,
      page: input.page,
      pageSize: input.pageSize,
    });
  }
}
