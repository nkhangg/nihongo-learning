'use client'

import { useReducer } from 'react'
import type {
  KanjiQuizAnswerResult,
  KanjiQuizQuestion,
  KanjiQuizSummary,
  KanjiQuizView,
} from '../types'

interface QuizSessionState {
  view: KanjiQuizView
  sessionId: string | null
  questions: KanjiQuizQuestion[]
  currentIndex: number
  lives: number
  maxLives: number
  livesEnabled: boolean
  lastResult: KanjiQuizAnswerResult | null
  summary: KanjiQuizSummary | null
}

type QuizAction =
  | { type: 'start'; sessionId: string; questions: KanjiQuizQuestion[]; livesEnabled: boolean }
  | { type: 'answer'; result: KanjiQuizAnswerResult }
  | { type: 'next' }
  | { type: 'finish'; summary: KanjiQuizSummary }
  | { type: 'reset' }

const MAX_LIVES = 3

function createInitialState(): QuizSessionState {
  return {
    view: 'config',
    sessionId: null,
    questions: [],
    currentIndex: 0,
    lives: MAX_LIVES,
    maxLives: MAX_LIVES,
    livesEnabled: false,
    lastResult: null,
    summary: null,
  }
}

function reducer(state: QuizSessionState, action: QuizAction): QuizSessionState {
  switch (action.type) {
    case 'start':
      return {
        ...createInitialState(),
        view: 'in-progress',
        sessionId: action.sessionId,
        questions: action.questions,
        livesEnabled: action.livesEnabled,
        lives: MAX_LIVES,
        maxLives: MAX_LIVES,
      }
    case 'answer':
      return {
        ...state,
        lastResult: action.result,
        lives:
          state.livesEnabled && !action.result.correct
            ? Math.max(0, state.lives - 1)
            : state.lives,
      }
    case 'next':
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
        lastResult: null,
      }
    case 'finish':
      return { ...state, view: 'summary', summary: action.summary }
    case 'reset':
      return createInitialState()
    default:
      return state
  }
}

export function useKanjiQuizSession() {
  const [state, dispatch] = useReducer(reducer, createInitialState())

  const currentQuestion = state.questions[state.currentIndex] ?? null
  const isLast = state.currentIndex >= state.questions.length - 1
  const isGameOver = state.livesEnabled && state.lives === 0

  return {
    ...state,
    currentQuestion,
    isLast,
    isGameOver,
    start: (sessionId: string, questions: KanjiQuizQuestion[], livesEnabled: boolean) =>
      dispatch({ type: 'start', sessionId, questions, livesEnabled }),
    recordAnswer: (result: KanjiQuizAnswerResult) => dispatch({ type: 'answer', result }),
    next: () => dispatch({ type: 'next' }),
    finish: (summary: KanjiQuizSummary) => dispatch({ type: 'finish', summary }),
    reset: () => dispatch({ type: 'reset' }),
  }
}
