import {
  KanjiQuizSession,
  type KanjiQuizAnswerRecord,
  type KanjiQuizMode,
  type KanjiQuizSessionStatus,
} from '../../domain/entities/kanji-quiz-session.entity';
import type { JlptLevel } from '../../domain/value-objects/jlpt-level.vo';

export interface KanjiQuizAnswerDbRecord {
  id: string;
  sessionId: string;
  kanjiId: string;
  mode: string;
  isCorrect: boolean;
  selectedOptionId: string | null;
  xpEarned: number;
  createdAt: Date;
}

export interface KanjiQuizSessionRecord {
  id: string;
  userId: string;
  jlptLevel: string;
  mode: string;
  questionCount: number;
  livesEnabled: boolean;
  status: string;
  startedAt: Date;
  finishedAt: Date | null;
  answers?: KanjiQuizAnswerDbRecord[];
}

function modeToDomain(m: string): KanjiQuizMode {
  const lc = m.toLowerCase();
  if (lc === 'meaning_to_kanji' || lc === 'meaningtokanji')
    return 'meaningToKanji';
  if (lc === 'writing') return 'writing';
  if (lc === 'mixed') return 'mixed';
  return 'recognition';
}

function modeAnswerToDomain(m: string): Exclude<KanjiQuizMode, 'mixed'> {
  const d = modeToDomain(m);
  if (d === 'mixed') return 'recognition';
  return d;
}

function statusToDomain(s: string): KanjiQuizSessionStatus {
  const lc = s.toLowerCase();
  if (lc === 'finished') return 'finished';
  if (lc === 'abandoned') return 'abandoned';
  return 'in_progress';
}

export interface KanjiQuizSessionPersistenceData {
  userId: string;
  jlptLevel: string;
  mode: string;
  questionCount: number;
  livesEnabled: boolean;
  status: string;
  startedAt: Date;
  finishedAt: Date | null;
}

export class KanjiQuizSessionMapper {
  static toPrisma(session: KanjiQuizSession): KanjiQuizSessionPersistenceData {
    return {
      userId: session.userId,
      jlptLevel: session.jlptLevel,
      mode: quizModeToPrisma(session.mode),
      questionCount: session.questionCount,
      livesEnabled: session.livesEnabled,
      status: quizSessionStatusToPrisma(session.status),
      startedAt: session.startedAt,
      finishedAt: session.finishedAt,
    };
  }

  static toDomain(r: KanjiQuizSessionRecord): KanjiQuizSession {
    const answers: KanjiQuizAnswerRecord[] = (r.answers ?? []).map((a) => ({
      kanjiId: a.kanjiId,
      mode: modeAnswerToDomain(a.mode),
      isCorrect: a.isCorrect,
      selectedOptionId: a.selectedOptionId,
      xpEarned: a.xpEarned,
      createdAt: a.createdAt,
    }));

    return KanjiQuizSession.reconstitute(r.id, {
      userId: r.userId,
      jlptLevel: r.jlptLevel as JlptLevel,
      mode: modeToDomain(r.mode),
      questionCount: r.questionCount,
      livesEnabled: r.livesEnabled,
      status: statusToDomain(r.status),
      startedAt: r.startedAt,
      finishedAt: r.finishedAt,
      answers,
    });
  }
}

export function quizModeToPrisma(m: KanjiQuizMode): string {
  switch (m) {
    case 'meaningToKanji':
      return 'MEANING_TO_KANJI';
    case 'writing':
      return 'WRITING';
    case 'mixed':
      return 'MIXED';
    case 'recognition':
    default:
      return 'RECOGNITION';
  }
}

export function quizSessionStatusToPrisma(s: KanjiQuizSessionStatus): string {
  return s.toUpperCase();
}
