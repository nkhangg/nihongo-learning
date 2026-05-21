'use client'

import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils'
import type { ReviewCard } from '../types'

interface QueueNextProps {
  cards: ReviewCard[]
}

const STATUS_DOT: Record<string, string> = {
  new: 'bg-sky-400',
  learning: 'bg-amber-400',
  mastered: 'bg-emerald-400',
}

export function QueueNext({ cards }: QueueNextProps) {
  const { t } = useTranslation()
  if (cards.length === 0) return null
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t('flashcards.session.queueNext')}
      </div>
      <ul className="space-y-1.5">
        {cards.map((c) => (
          <li
            key={c.flashcard.id}
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2"
          >
            <span
              className={cn('h-1.5 w-1.5 shrink-0 rounded-full', STATUS_DOT[c.flashcard.status] ?? 'bg-muted-foreground')}
            />
            <span className="truncate text-sm font-medium">
              {c.entry.kanji || c.entry.hiragana}
            </span>
            <span className="ml-auto truncate text-xs text-muted-foreground">
              {c.entry.meanings[0]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
