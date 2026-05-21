import { Inject, Injectable } from '@nestjs/common';
import type { Result } from '../../../../shared/application';
import type { Kanji } from '../../domain/entities/kanji.entity';
import type { KanjiUserProgress } from '../../domain/entities/kanji-user-progress.entity';
import {
  KANJI_REPOSITORY,
  type IKanjiRepository,
} from '../../domain/repositories/kanji.repository';
import {
  KANJI_USER_PROGRESS_REPOSITORY,
  type IKanjiUserProgressRepository,
} from '../../domain/repositories/kanji-user-progress.repository';

export interface GetMyKanjiDetailValue {
  kanji: Kanji;
  progress: KanjiUserProgress | null;
}

export type GetMyKanjiDetailResult = Result<GetMyKanjiDetailValue, 'NOT_FOUND'>;

@Injectable()
export class GetMyKanjiDetailUseCase {
  constructor(
    @Inject(KANJI_REPOSITORY)
    private readonly kanjiRepo: IKanjiRepository,
    @Inject(KANJI_USER_PROGRESS_REPOSITORY)
    private readonly progressRepo: IKanjiUserProgressRepository,
  ) {}

  async execute(
    userId: string,
    kanjiId: string,
  ): Promise<GetMyKanjiDetailResult> {
    const [kanji, progress] = await Promise.all([
      this.kanjiRepo.findById(kanjiId),
      this.progressRepo.findByUserAndKanji(userId, kanjiId),
    ]);
    if (!kanji || !kanji.isPublished) return { ok: false, error: 'NOT_FOUND' };
    return { ok: true, value: { kanji, progress } };
  }
}
