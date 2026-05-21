import { KanjiWritingAttempt } from '../../domain/entities/kanji-writing-attempt.entity';

export interface KanjiWritingAttemptRecord {
  id: string;
  userId: string;
  kanjiId: string;
  scoreOverall: number;
  scoreOrder: number;
  scoreSize: number;
  scoreDirection: number;
  scorePosition: number;
  durationMs: number;
  feedback: string | null;
  createdAt: Date;
}

export interface KanjiWritingAttemptPersistenceData {
  id: string;
  userId: string;
  kanjiId: string;
  scoreOverall: number;
  scoreOrder: number;
  scoreSize: number;
  scoreDirection: number;
  scorePosition: number;
  durationMs: number;
  feedback: string | null;
  createdAt: Date;
}

export class KanjiWritingAttemptMapper {
  static toPrisma(attempt: KanjiWritingAttempt): KanjiWritingAttemptPersistenceData {
    return {
      id: attempt.id,
      userId: attempt.userId,
      kanjiId: attempt.kanjiId,
      scoreOverall: attempt.score.overall,
      scoreOrder: attempt.score.order,
      scoreSize: attempt.score.size,
      scoreDirection: attempt.score.direction,
      scorePosition: attempt.score.position,
      durationMs: attempt.durationMs,
      feedback: attempt.score.feedback,
      createdAt: attempt.createdAt,
    };
  }

  static toDomain(r: KanjiWritingAttemptRecord): KanjiWritingAttempt {
    return KanjiWritingAttempt.reconstitute(r.id, {
      userId: r.userId,
      kanjiId: r.kanjiId,
      score: {
        overall: r.scoreOverall,
        order: r.scoreOrder,
        size: r.scoreSize,
        direction: r.scoreDirection,
        position: r.scorePosition,
        feedback: r.feedback,
      },
      durationMs: r.durationMs,
      createdAt: r.createdAt,
    });
  }
}
