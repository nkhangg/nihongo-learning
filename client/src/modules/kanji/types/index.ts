export type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
export type KanjiStatus = 'known' | 'learning' | 'unseen'

export interface Radical {
  id?: string
  char: string
  meaningVi: string
  strokes: number
}

export interface KanjiListItem {
  id: string
  char: string
  jlptLevel: JlptLevel
  strokes: number
  primaryKun?: string
  primaryOn?: string
  meaningVi: string
  meaningEn?: string
  status: KanjiStatus
}

export interface KanjiMeaning {
  index: number
  pos: 'noun' | 'verb' | 'adj' | 'adv' | 'other'
  textVi: string
  jpExample?: string
}

export interface KanjiExample {
  jpHtml: string
  vi: string
  source?: string
}

export interface Compound {
  jp: string
  reading: string
  meaningVi: string
}

export interface SimilarKanji {
  id: string
  char: string
  meaningVi: string
  reason: string
  jlptLevel: JlptLevel
}

export interface StrokeOrderStep {
  index: number
  svgPath?: string
  note?: string
}

export interface KanjiComponent {
  char: string
  meaningVi: string
}

export interface KanjiDetail extends KanjiListItem {
  onReadings: string[]
  kunReadings: string[]
  radical?: Radical | null
  frequency?: number
  unicode: string
  joyoOrder?: number
  strokeOrderSvg: string[]
  strokeOrder: StrokeOrderStep[]
  components: KanjiComponent[]
  meanings: KanjiMeaning[]
  examples: KanjiExample[]
  compounds: Compound[]
  similar: SimilarKanji[]
  mnemonicVi?: string
  mastery: number
}

export interface KanjiUserProgress {
  kanjiId: string
  status: KanjiStatus
  mastery: number
  lastReviewedAt?: string
}

export interface KanjiProgressSummary {
  total: number
  known: number
  learning: number
  unseen: number
  byLevel: Record<JlptLevel, { total: number; known: number; learning: number }>
}

export interface ListKanjiParams {
  level?: JlptLevel | 'all'
  status?: KanjiStatus | 'all'
  strokesMin?: number
  strokesMax?: number
  radical?: string
  search?: string
  page?: number
  limit?: number
}

export interface WritingStroke {
  points: Array<{ x: number; y: number; t: number }>
}

export interface WritingAttemptDto {
  strokes: WritingStroke[]
  durationMs: number
}

export interface WritingScore {
  overall: number
  order: number
  size: number
  direction: number
  position: number
  feedback: string
  starsLabel: '⭐' | '⭐⭐' | '⭐⭐⭐' | '⭐⭐⭐⭐' | '⭐⭐⭐⭐⭐'
}

export type KanjiQuizMode = 'recognition' | 'meaningToKanji' | 'writing'
export type KanjiQuizView = 'config' | 'in-progress' | 'summary'

export interface KanjiQuizConfig {
  level: JlptLevel
  mode: KanjiQuizMode | 'mixed'
  questionCount: 10 | 20 | 30
  livesEnabled: boolean
}

export interface KanjiQuizQuestion {
  id: string
  mode: KanjiQuizMode
  kanji: KanjiListItem
  contextSentenceHtml?: string
  options?: Array<{ id: string; label: string; subLabel?: string }>
  correctOptionId?: string
  meaningPrompt?: string
  explanation?: string
  mnemonic?: string
}

export interface KanjiQuizAnswerDto {
  questionId: string
  selectedOptionId?: string
  writingAttempt?: WritingAttemptDto
}

export interface KanjiQuizAnswerResult {
  correct: boolean
  xpEarned: number
  explanation: string
  writingScore?: WritingScore
}

export interface KanjiQuizSummary {
  totalQuestions: number
  correct: number
  wrong: number
  accuracy: number
  durationSec: number
  xpEarned: number
  mistakes: Array<{
    kanji: KanjiListItem
    meaningVi: string
    userAnswerLabel?: string
    wrongCount: number
    reason: string
  }>
}

export interface KanjiListMeta {
  totalItems: number
  itemsPerPage: number
  currentPage: number
  totalPages: number
}

export interface KanjiListResult {
  data: KanjiListItem[]
  meta: KanjiListMeta
}
