'use client'

import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import type {
  RatingKey,
  ReviewCard,
  ReviewMode,
  SessionStats,
  SessionView,
  SrsRating,
} from '../types'
import { SR_RATING_MAP } from '../types'
import { useInvalidateFlashcards, useSubmitReview } from './useFlashcards'

interface SessionState {
  view: SessionView
  mode: ReviewMode
  currentIndex: number
  flippedIds: Set<string>
  stats: SessionStats
}

type SessionAction =
  | { type: 'init'; cards: ReviewCard[] }
  | { type: 'setMode'; mode: ReviewMode }
  | { type: 'flip'; cardId: string }
  | { type: 'rate'; rating: SrsRating; cardId: string }
  | { type: 'skip' }
  | { type: 'finish' }
  | { type: 'restart' }

function createInitialState(): SessionState {
  return {
    view: 'idle',
    mode: 'recognition',
    currentIndex: 0,
    flippedIds: new Set(),
    stats: { completed: 0, again: 0, correct: 0, startedAt: Date.now() },
  }
}

function reducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'init':
      return {
        ...createInitialState(),
        view: action.cards.length > 0 ? 'reviewing' : 'idle',
      }
    case 'setMode':
      return { ...state, mode: action.mode }
    case 'flip': {
      const next = new Set(state.flippedIds)
      next.add(action.cardId)
      return { ...state, flippedIds: next }
    }
    case 'rate': {
      const isAgain = action.rating === 1
      const isCorrect = action.rating >= 3
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
        stats: {
          ...state.stats,
          completed: state.stats.completed + 1,
          again: state.stats.again + (isAgain ? 1 : 0),
          correct: state.stats.correct + (isCorrect ? 1 : 0),
        },
      }
    }
    case 'skip':
      return { ...state, currentIndex: state.currentIndex + 1 }
    case 'finish':
      return { ...state, view: 'completed' }
    case 'restart':
      return { ...createInitialState(), view: 'reviewing' }
    default:
      return state
  }
}

export interface FlashcardSessionApi {
  view: SessionView
  mode: ReviewMode
  currentCard: ReviewCard | null
  queueAhead: ReviewCard[]
  progress: number
  total: number
  completedCount: number
  stats: SessionStats
  elapsedMs: number
  isFlipped: boolean
  setMode: (mode: ReviewMode) => void
  flip: () => void
  rate: (key: RatingKey) => void
  rateRaw: (rating: SrsRating) => void
  skip: () => void
  finish: () => void
  restart: () => void
}

export function useFlashcardSession(cards: ReviewCard[]): FlashcardSessionApi {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)
  const { mutate: submitReview } = useSubmitReview()
  const invalidate = useInvalidateFlashcards()

  useEffect(() => {
    dispatch({ type: 'init', cards })
  }, [cards])

  const total = cards.length
  const currentCard = state.currentIndex < total ? cards[state.currentIndex] : null
  const isFlipped = currentCard ? state.flippedIds.has(currentCard.flashcard.id) : false
  const progress = total === 0 ? 0 : Math.min(state.currentIndex / total, 1)

  const queueAhead = useMemo(
    () => cards.slice(state.currentIndex + 1, state.currentIndex + 5),
    [cards, state.currentIndex],
  )

  const setMode = useCallback((mode: ReviewMode) => dispatch({ type: 'setMode', mode }), [])

  const flip = useCallback(() => {
    if (!currentCard) return
    dispatch({ type: 'flip', cardId: currentCard.flashcard.id })
  }, [currentCard])

  const rateRaw = useCallback(
    (rating: SrsRating) => {
      if (!currentCard) return
      const cardId = currentCard.flashcard.id
      submitReview({ flashcardId: cardId, rating })
      dispatch({ type: 'rate', rating, cardId })
    },
    [currentCard, submitReview],
  )

  const rate = useCallback((key: RatingKey) => rateRaw(SR_RATING_MAP[key]), [rateRaw])

  const skip = useCallback(() => dispatch({ type: 'skip' }), [])

  const finish = useCallback(() => {
    dispatch({ type: 'finish' })
    invalidate()
  }, [invalidate])

  const restart = useCallback(() => dispatch({ type: 'restart' }), [])

  useEffect(() => {
    if (state.view !== 'reviewing') return
    if (state.currentIndex >= total && total > 0) {
      dispatch({ type: 'finish' })
      invalidate()
    }
  }, [state.view, state.currentIndex, total, invalidate])

  useEffect(() => {
    if (state.view !== 'reviewing') return
    if (state.mode !== 'recognition') return

    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }
      if (event.key === ' ') {
        event.preventDefault()
        if (currentCard && !state.flippedIds.has(currentCard.flashcard.id)) {
          dispatch({ type: 'flip', cardId: currentCard.flashcard.id })
        }
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        dispatch({ type: 'skip' })
        return
      }
      if (currentCard && state.flippedIds.has(currentCard.flashcard.id)) {
        const map: Record<string, RatingKey> = { '1': 'again', '2': 'hard', '3': 'good', '4': 'easy' }
        const key = map[event.key]
        if (key) {
          event.preventDefault()
          rateRaw(SR_RATING_MAP[key])
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state.view, state.mode, state.flippedIds, currentCard, rateRaw])

  const elapsedSinceStart = useElapsedMs(state.stats.startedAt, state.view === 'reviewing')

  return {
    view: state.view,
    mode: state.mode,
    currentCard,
    queueAhead,
    progress,
    total,
    completedCount: state.stats.completed,
    stats: state.stats,
    elapsedMs: elapsedSinceStart,
    isFlipped,
    setMode,
    flip,
    rate,
    rateRaw,
    skip,
    finish,
    restart,
  }
}

function useElapsedMs(startedAt: number, running: boolean): number {
  const [now, setNow] = useState(startedAt)
  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [running])
  return Math.max(0, now - startedAt)
}
