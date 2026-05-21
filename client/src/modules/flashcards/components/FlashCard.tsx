'use client'

import { useTranslation } from 'react-i18next'
import { Badge, Button } from '@shared/components/ui'
import { cn } from '@shared/utils'
import type { RatingKey, ReviewCard } from '../types'
import { AnswerButtons } from './AnswerButtons'

interface FlashCardProps {
  card: ReviewCard
  flipped: boolean
  onFlip: () => void
  onRate: (key: RatingKey) => void
  onSkip: () => void
}

export function FlashCard({ card, flipped, onFlip, onRate, onSkip }: FlashCardProps) {
  const { t } = useTranslation()
  const { entry } = card
  const display = entry.kanji || entry.hiragana

  return (
    <div className="flex w-full flex-col gap-4">
      <button
        type="button"
        onClick={() => !flipped && onFlip()}
        className={cn(
          'group relative w-full overflow-hidden rounded-2xl border border-border bg-background px-6 py-12 text-center shadow-sm transition-all duration-300',
          !flipped && 'cursor-pointer hover:border-foreground/30 hover:shadow-md',
          flipped && 'cursor-default',
        )}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            {entry.jlptLevel != null && (
              <Badge variant="outline" className="text-[10px]">
                N{entry.jlptLevel}
              </Badge>
            )}
          </div>
          <div className="text-5xl font-semibold leading-tight sm:text-6xl">{display}</div>
          {flipped && entry.kanji && (
            <div className="font-mono text-base text-muted-foreground">{entry.hiragana}</div>
          )}
          <div className="font-mono text-xs text-muted-foreground">{entry.romaji}</div>

          {!flipped ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <span>{t('flashcards.card.flip')}</span>
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                Space
              </kbd>
            </div>
          ) : (
            <div className="mt-6 flex max-w-md flex-col items-center gap-2">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {t('dashboard.vocabulary')}
              </div>
              <ul className="space-y-1 text-sm">
                {entry.meanings.map((m, i) => (
                  <li key={i} className="text-foreground">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </button>

      {flipped ? (
        <AnswerButtons onRate={onRate} />
      ) : (
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={onSkip}>
            {t('flashcards.card.skip')}
            <kbd className="ml-2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              →
            </kbd>
          </Button>
          <Button onClick={onFlip}>{t('flashcards.card.flip')}</Button>
        </div>
      )}
    </div>
  )
}
