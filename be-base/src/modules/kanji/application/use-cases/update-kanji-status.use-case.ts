import { Inject, Injectable } from '@nestjs/common';
import type { Result } from '../../../../shared/application';
import type { KanjiProgressStatus } from '../../domain/entities/kanji-user-progress.entity';
import { KanjiUserProgress } from '../../domain/entities/kanji-user-progress.entity';
import {
  KANJI_REPOSITORY,
  type IKanjiRepository,
} from '../../domain/repositories/kanji.repository';
import {
  KANJI_USER_PROGRESS_REPOSITORY,
  type IKanjiUserProgressRepository,
} from '../../domain/repositories/kanji-user-progress.repository';

export interface UpdateKanjiStatusInput {
  userId: string;
  kanjiId: string;
  status: KanjiProgressStatus;
}

export type UpdateKanjiStatusResult = Result<void, 'KANJI_NOT_FOUND'>;

@Injectable()
export class UpdateKanjiStatusUseCase {
  constructor(
    @Inject(KANJI_REPOSITORY)
    private readonly kanjiRepo: IKanjiRepository,
    @Inject(KANJI_USER_PROGRESS_REPOSITORY)
    private readonly progressRepo: IKanjiUserProgressRepository,
  ) {}

  async execute(
    input: UpdateKanjiStatusInput,
  ): Promise<UpdateKanjiStatusResult> {
    const kanji = await this.kanjiRepo.findById(input.kanjiId);
    if (!kanji) return { ok: false, error: 'KANJI_NOT_FOUND' };

    let progress = await this.progressRepo.findByUserAndKanji(
      input.userId,
      input.kanjiId,
    );
    if (!progress) {
      progress = KanjiUserProgress.create({
        userId: input.userId,
        kanjiId: input.kanjiId,
      });
    }
    progress.setStatus(input.status);
    await this.progressRepo.save(progress);
    return { ok: true, value: undefined };
  }
}
