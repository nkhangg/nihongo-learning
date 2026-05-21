import { randomUUID } from 'crypto';
import { BaseEntity } from '../../../../shared/domain/base-entity';

export interface KanjiWritingScore {
  overall: number;
  order: number;
  size: number;
  direction: number;
  position: number;
  feedback: string | null;
}

export interface KanjiWritingAttemptProps {
  userId: string;
  kanjiId: string;
  score: KanjiWritingScore;
  durationMs: number;
  createdAt: Date;
}

export class KanjiWritingAttempt extends BaseEntity<string> {
  private props: KanjiWritingAttemptProps;

  private constructor(id: string, props: KanjiWritingAttemptProps) {
    super(id);
    this.props = props;
  }

  static create(params: {
    userId: string;
    kanjiId: string;
    score: KanjiWritingScore;
    durationMs: number;
  }): KanjiWritingAttempt {
    return new KanjiWritingAttempt(randomUUID(), {
      userId: params.userId,
      kanjiId: params.kanjiId,
      score: params.score,
      durationMs: params.durationMs,
      createdAt: new Date(),
    });
  }

  static reconstitute(
    id: string,
    props: KanjiWritingAttemptProps,
  ): KanjiWritingAttempt {
    return new KanjiWritingAttempt(id, props);
  }

  get userId(): string {
    return this.props.userId;
  }
  get kanjiId(): string {
    return this.props.kanjiId;
  }
  get score(): KanjiWritingScore {
    return this.props.score;
  }
  get durationMs(): number {
    return this.props.durationMs;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
}
