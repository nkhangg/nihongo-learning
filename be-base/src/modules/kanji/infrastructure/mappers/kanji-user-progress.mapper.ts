import {
  KanjiUserProgress,
  type KanjiProgressStatus,
} from '../../domain/entities/kanji-user-progress.entity';

export interface KanjiUserProgressRecord {
  id: string;
  userId: string;
  kanjiId: string;
  status: string;
  mastery: number;
  lastReviewedAt: Date | null;
  updatedAt: Date;
}

function statusToDomain(s: string): KanjiProgressStatus {
  const lc = s.toLowerCase();
  if (lc === 'known') return 'known';
  if (lc === 'learning') return 'learning';
  return 'unseen';
}

export interface KanjiUserProgressPersistenceData {
  userId: string;
  kanjiId: string;
  status: string;
  mastery: number;
  lastReviewedAt: Date | null;
}

export class KanjiUserProgressMapper {
  static toPrisma(progress: KanjiUserProgress): KanjiUserProgressPersistenceData {
    return {
      userId: progress.userId,
      kanjiId: progress.kanjiId,
      status: progressStatusToPrisma(progress.status),
      mastery: progress.mastery,
      lastReviewedAt: progress.lastReviewedAt,
    };
  }

  static toDomain(r: KanjiUserProgressRecord): KanjiUserProgress {
    return KanjiUserProgress.reconstitute(r.id, {
      userId: r.userId,
      kanjiId: r.kanjiId,
      status: statusToDomain(r.status),
      mastery: r.mastery,
      lastReviewedAt: r.lastReviewedAt,
      updatedAt: r.updatedAt,
    });
  }
}

export function progressStatusToPrisma(s: KanjiProgressStatus): string {
  return s.toUpperCase();
}
