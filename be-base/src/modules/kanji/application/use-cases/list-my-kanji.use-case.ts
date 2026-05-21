import { Inject, Injectable } from '@nestjs/common';
import type { Kanji } from '../../domain/entities/kanji.entity';
import type { KanjiProgressStatus } from '../../domain/entities/kanji-user-progress.entity';
import {
  KANJI_REPOSITORY,
  type IKanjiRepository,
} from '../../domain/repositories/kanji.repository';
import {
  KANJI_USER_PROGRESS_REPOSITORY,
  type IKanjiUserProgressRepository,
} from '../../domain/repositories/kanji-user-progress.repository';
import type { JlptLevel } from '../../domain/value-objects/jlpt-level.vo';

export interface ListMyKanjiInput {
  userId: string;
  jlptLevel?: JlptLevel;
  status?: KanjiProgressStatus;
  radicalId?: string;
  strokesMin?: number;
  strokesMax?: number;
  search?: string;
  page: number;
  pageSize: number;
}

export interface ListMyKanjiRow {
  kanji: Kanji;
  status: KanjiProgressStatus;
  mastery: number;
  lastReviewedAt: Date | null;
}

@Injectable()
export class ListMyKanjiUseCase {
  constructor(
    @Inject(KANJI_REPOSITORY)
    private readonly kanjiRepo: IKanjiRepository,
    @Inject(KANJI_USER_PROGRESS_REPOSITORY)
    private readonly progressRepo: IKanjiUserProgressRepository,
  ) {}

  async execute(
    input: ListMyKanjiInput,
  ): Promise<{ data: ListMyKanjiRow[]; total: number }> {
    const { data, total } = await this.kanjiRepo.list({
      jlptLevel: input.jlptLevel,
      radicalId: input.radicalId,
      strokesMin: input.strokesMin,
      strokesMax: input.strokesMax,
      search: input.search,
      publishedOnly: true,
      page: input.page,
      pageSize: input.pageSize,
    });

    if (data.length === 0) return { data: [], total };

    // Single batch fetch of progress for these kanji ids (avoid N+1).
    const progressList = await this.progressRepo.findManyByUser(input.userId, {
      kanjiIds: data.map((k) => k.id.value),
    });
    const byKanji = new Map(progressList.map((p) => [p.kanjiId, p]));

    let rows: ListMyKanjiRow[] = data.map((kanji) => {
      const p = byKanji.get(kanji.id.value);
      return {
        kanji,
        status: p?.status ?? 'unseen',
        mastery: p?.mastery ?? 0,
        lastReviewedAt: p?.lastReviewedAt ?? null,
      };
    });

    if (input.status) {
      rows = rows.filter((r) => r.status === input.status);
    }

    return { data: rows, total };
  }
}
