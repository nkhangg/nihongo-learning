import { Inject, Injectable } from '@nestjs/common';
import {
  KANJI_USER_PROGRESS_REPOSITORY,
  type IKanjiUserProgressRepository,
  type KanjiProgressSummary,
} from '../../domain/repositories/kanji-user-progress.repository';

@Injectable()
export class GetMyKanjiProgressSummaryUseCase {
  constructor(
    @Inject(KANJI_USER_PROGRESS_REPOSITORY)
    private readonly progressRepo: IKanjiUserProgressRepository,
  ) {}

  async execute(userId: string): Promise<KanjiProgressSummary> {
    return this.progressRepo.getSummary(userId);
  }
}
