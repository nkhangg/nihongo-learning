import { Inject, Injectable } from '@nestjs/common';
import type { Kanji } from '../../domain/entities/kanji.entity';
import {
  KANJI_REPOSITORY,
  type IKanjiRepository,
} from '../../domain/repositories/kanji.repository';
import {
  KANJI_USER_PROGRESS_REPOSITORY,
  type IKanjiUserProgressRepository,
} from '../../domain/repositories/kanji-user-progress.repository';
import type { JlptLevel } from '../../domain/value-objects/jlpt-level.vo';

export interface GetMyWritingQueueInput {
  userId: string;
  jlptLevel?: JlptLevel;
  limit?: number;
}

@Injectable()
export class GetMyWritingQueueUseCase {
  constructor(
    @Inject(KANJI_REPOSITORY)
    private readonly kanjiRepo: IKanjiRepository,
    @Inject(KANJI_USER_PROGRESS_REPOSITORY)
    private readonly progressRepo: IKanjiUserProgressRepository,
  ) {}

  async execute(input: GetMyWritingQueueInput): Promise<Kanji[]> {
    const kanjiIds = await this.progressRepo.pickLearningKanjiIds({
      userId: input.userId,
      jlptLevel: input.jlptLevel,
      limit: input.limit ?? 10,
    });
    if (kanjiIds.length === 0) return [];
    return this.kanjiRepo.findManyByIds(kanjiIds);
  }
}
