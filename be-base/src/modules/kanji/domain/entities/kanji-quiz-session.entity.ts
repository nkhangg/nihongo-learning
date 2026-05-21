import { randomUUID } from 'crypto';
import { BaseEntity } from '../../../../shared/domain/base-entity';
import type { JlptLevel } from '../value-objects/jlpt-level.vo';

export type KanjiQuizMode =
  | 'recognition'
  | 'meaningToKanji'
  | 'writing'
  | 'mixed';

export type KanjiQuizSessionStatus = 'in_progress' | 'finished' | 'abandoned';

export interface KanjiQuizAnswerRecord {
  kanjiId: string;
  mode: Exclude<KanjiQuizMode, 'mixed'>;
  isCorrect: boolean;
  selectedOptionId: string | null;
  xpEarned: number;
  createdAt: Date;
}

export interface KanjiQuizSessionProps {
  userId: string;
  jlptLevel: JlptLevel;
  mode: KanjiQuizMode;
  questionCount: number;
  livesEnabled: boolean;
  status: KanjiQuizSessionStatus;
  startedAt: Date;
  finishedAt: Date | null;
  answers: KanjiQuizAnswerRecord[];
}

export class KanjiQuizSession extends BaseEntity<string> {
  private props: KanjiQuizSessionProps;

  private constructor(id: string, props: KanjiQuizSessionProps) {
    super(id);
    this.props = props;
  }

  static create(params: {
    userId: string;
    jlptLevel: JlptLevel;
    mode: KanjiQuizMode;
    questionCount: number;
    livesEnabled?: boolean;
  }): KanjiQuizSession {
    return new KanjiQuizSession(randomUUID(), {
      userId: params.userId,
      jlptLevel: params.jlptLevel,
      mode: params.mode,
      questionCount: params.questionCount,
      livesEnabled: params.livesEnabled ?? false,
      status: 'in_progress',
      startedAt: new Date(),
      finishedAt: null,
      answers: [],
    });
  }

  static reconstitute(
    id: string,
    props: KanjiQuizSessionProps,
  ): KanjiQuizSession {
    return new KanjiQuizSession(id, props);
  }

  recordAnswer(params: {
    kanjiId: string;
    mode: Exclude<KanjiQuizMode, 'mixed'>;
    isCorrect: boolean;
    selectedOptionId?: string | null;
    xpEarned: number;
  }): void {
    if (this.props.status !== 'in_progress') {
      throw new Error('Cannot record answer on a non-in-progress session');
    }
    this.props.answers.push({
      kanjiId: params.kanjiId,
      mode: params.mode,
      isCorrect: params.isCorrect,
      selectedOptionId: params.selectedOptionId ?? null,
      xpEarned: params.xpEarned,
      createdAt: new Date(),
    });
  }

  finish(): void {
    if (this.props.status !== 'in_progress') return;
    this.props.status = 'finished';
    this.props.finishedAt = new Date();
  }

  abandon(): void {
    if (this.props.status !== 'in_progress') return;
    this.props.status = 'abandoned';
    this.props.finishedAt = new Date();
  }

  get userId(): string {
    return this.props.userId;
  }
  get jlptLevel(): JlptLevel {
    return this.props.jlptLevel;
  }
  get mode(): KanjiQuizMode {
    return this.props.mode;
  }
  get questionCount(): number {
    return this.props.questionCount;
  }
  get livesEnabled(): boolean {
    return this.props.livesEnabled;
  }
  get status(): KanjiQuizSessionStatus {
    return this.props.status;
  }
  get startedAt(): Date {
    return this.props.startedAt;
  }
  get finishedAt(): Date | null {
    return this.props.finishedAt;
  }
  get answers(): KanjiQuizAnswerRecord[] {
    return this.props.answers;
  }

  get correctCount(): number {
    return this.props.answers.filter((a) => a.isCorrect).length;
  }
  get wrongCount(): number {
    return this.props.answers.filter((a) => !a.isCorrect).length;
  }
  get totalXp(): number {
    return this.props.answers.reduce((sum, a) => sum + a.xpEarned, 0);
  }
}
