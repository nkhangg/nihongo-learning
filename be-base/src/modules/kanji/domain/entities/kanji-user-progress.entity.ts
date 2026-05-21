import { BaseEntity } from '../../../../shared/domain/base-entity';

export type KanjiProgressStatus = 'unseen' | 'learning' | 'known';

export interface KanjiUserProgressProps {
  userId: string;
  kanjiId: string;
  status: KanjiProgressStatus;
  mastery: number; // 0..100
  lastReviewedAt: Date | null;
  updatedAt: Date;
}

export interface RecordReviewResult {
  newMastery: number;
  masteryJustReached100: boolean;
}

export class KanjiUserProgress extends BaseEntity<string> {
  private props: KanjiUserProgressProps;

  private constructor(id: string, props: KanjiUserProgressProps) {
    super(id);
    this.props = props;
  }

  static create(params: { userId: string; kanjiId: string }): KanjiUserProgress {
    const now = new Date();
    return new KanjiUserProgress(`${params.userId}:${params.kanjiId}`, {
      userId: params.userId,
      kanjiId: params.kanjiId,
      status: 'unseen',
      mastery: 0,
      lastReviewedAt: null,
      updatedAt: now,
    });
  }

  static reconstitute(
    id: string,
    props: KanjiUserProgressProps,
  ): KanjiUserProgress {
    return new KanjiUserProgress(id, props);
  }

  markLearning(): void {
    this.props.status = 'learning';
    this.props.updatedAt = new Date();
  }

  markKnown(): void {
    this.props.status = 'known';
    this.props.updatedAt = new Date();
  }

  markUnseen(): void {
    this.props.status = 'unseen';
    this.props.mastery = 0;
    this.props.lastReviewedAt = null;
    this.props.updatedAt = new Date();
  }

  setStatus(status: KanjiProgressStatus): void {
    if (status === 'unseen') return this.markUnseen();
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  /**
   * Apply a mastery delta from a review/writing/quiz event.
   * Returns whether mastery just crossed the 100% threshold so the
   * caller can emit the kanji.mastery_reached domain event exactly once.
   */
  recordReview(masteryDelta: number): RecordReviewResult {
    const oldMastery = this.props.mastery;
    const newMastery = Math.max(0, Math.min(100, oldMastery + masteryDelta));
    this.props.mastery = newMastery;
    this.props.lastReviewedAt = new Date();
    this.props.updatedAt = new Date();
    if (this.props.status === 'unseen') this.props.status = 'learning';
    if (newMastery >= 100) this.props.status = 'known';
    return {
      newMastery,
      masteryJustReached100: oldMastery < 100 && newMastery >= 100,
    };
  }

  get userId(): string {
    return this.props.userId;
  }
  get kanjiId(): string {
    return this.props.kanjiId;
  }
  get status(): KanjiProgressStatus {
    return this.props.status;
  }
  get mastery(): number {
    return this.props.mastery;
  }
  get lastReviewedAt(): Date | null {
    return this.props.lastReviewedAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
