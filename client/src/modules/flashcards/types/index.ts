export type FlashcardStatus = 'new' | 'learning' | 'mastered'
export type ReviewMode = 'recognition' | 'typing'
export type SessionView = 'idle' | 'reviewing' | 'completed'

export type SrsRating = 1 | 2 | 3 | 4 | 5

export interface Flashcard {
  id: string
  dictionaryEntryId: string
  interval: number
  easeFactor: number
  nextReview: string
  status: FlashcardStatus
  lastReviewedAt: string | null
  createdAt: string
}

export interface DictionaryEntry {
  id: string
  kanji: string | null
  hiragana: string
  romaji: string
  meanings: string[]
  jlptLevel: number | null
  createdAt: string
}

export interface ReviewCard {
  flashcard: Flashcard
  entry: DictionaryEntry
}

export interface AddFlashcardDto {
  dictionaryEntryId: string
}

export interface SubmitReviewDto {
  rating: SrsRating
}

export interface SubmitReviewResponse {
  nextReview: string
}

export interface SessionStats {
  completed: number
  again: number
  correct: number
  startedAt: number
}

export type ListFlashcardsParams = {
  status?: FlashcardStatus
  page?: number
  limit?: number
}

export interface ListFlashcardsResult {
  data: Flashcard[]
  total: number
}

export type RatingKey = 'again' | 'hard' | 'good' | 'easy'

export const SR_RATING_MAP: Record<RatingKey, SrsRating> = {
  again: 1,
  hard: 2,
  good: 4,
  easy: 5,
}
