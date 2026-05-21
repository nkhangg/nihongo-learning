'use client'

import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils'
import type { RatingKey } from '../types'

interface AnswerButtonsProps {
  onRate: (key: RatingKey) => void
  disabled?: boolean
}

const RATING_BUTTONS: { key: RatingKey; shortcut: string; tone: string; intervalKey: string }[] = [
  {
    key: 'again',
    shortcut: '1',
    tone: 'border-red-300 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950',
    intervalKey: 'flashcards.rating.intervalAgain',
  },
  {
    key: 'hard',
    shortcut: '2',
    tone: 'border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-900 dark:text-orange-300 dark:hover:bg-orange-950',
    intervalKey: 'flashcards.rating.intervalHard',
  },
  {
    key: 'good',
    shortcut: '3',
    tone: 'border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950',
    intervalKey: 'flashcards.rating.intervalGood',
  },
  {
    key: 'easy',
    shortcut: '4',
    tone: 'border-sky-300 text-sky-700 hover:bg-sky-50 dark:border-sky-900 dark:text-sky-300 dark:hover:bg-sky-950',
    intervalKey: 'flashcards.rating.intervalEasy',
  },
]

export function AnswerButtons({ onRate, disabled = false }: AnswerButtonsProps) {
  const { t } = useTranslation()
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {RATING_BUTTONS.map((b) => (
        <button
          key={b.key}
          type="button"
          disabled={disabled}
          onClick={() => onRate(b.key)}
          className={cn(
            'flex flex-col items-center gap-0.5 rounded-xl border-[1.5px] bg-background px-3 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            b.tone,
          )}
        >
          <span>{t(`flashcards.rating.${b.key}`)}</span>
          <span className="font-mono text-[10px] opacity-60">
            {b.shortcut}
            {' · '}
            {t(b.intervalKey, { n: b.key === 'hard' ? 5 : b.key === 'good' ? 1 : 3 })}
          </span>
        </button>
      ))}
    </div>
  )
}
