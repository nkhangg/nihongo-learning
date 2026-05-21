'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@config/routes'
import { Button, Spinner } from '@shared/components/ui'
import { useDueCards } from '../hooks/useFlashcards'
import { useFlashcardSession } from '../hooks/useFlashcardSession'
import type { ReviewCard } from '../types'

const EMPTY_CARDS: ReviewCard[] = []
import { EmptyState } from './EmptyState'
import { FlashCard } from './FlashCard'
import { KeyboardHints } from './KeyboardHints'
import { ModeToggle } from './ModeToggle'
import { ProgressStrip } from './ProgressStrip'
import { ResultOverlay } from './ResultOverlay'
import { SessionHeader } from './SessionHeader'
import { SessionSidebar } from './SessionSidebar'
import { TypingCard } from './TypingCard'

export function FlashcardsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { data, isLoading, isError, refetch } = useDueCards()
  const cards = data ?? EMPTY_CARDS
  const session = useFlashcardSession(cards)
  const [resultDismissed, setResultDismissed] = useState(false)

  const counts = useMemo(() => {
    let due = 0
    let neu = 0
    for (const c of cards) {
      if (c.flashcard.status === 'new') neu += 1
      else due += 1
    }
    return { due, neu, estimate: Math.max(1, Math.round(cards.length * 0.4)) }
  }, [cards])

  const remaining = Math.max(session.total - session.completedCount, 0)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-muted-foreground">{t('common.error')}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          {t('common.retry')}
        </Button>
      </div>
    )
  }

  if (cards.length === 0) {
    return <EmptyState />
  }

  const handleEnd = () => {
    session.finish()
  }

  const handleCloseResult = () => {
    setResultDismissed(true)
    router.push(ROUTES.DASHBOARD)
  }

  const showResult = session.view === 'completed' && !resultDismissed

  return (
    <div className="flex h-full flex-col">
      <SessionHeader
        dueCount={counts.due}
        newCount={counts.neu}
        estimateMinutes={counts.estimate}
        onEnd={handleEnd}
      />
      <ProgressStrip progress={session.progress} />

      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-8">
          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5">
            <div className="flex items-center justify-between gap-3">
              <ModeToggle mode={session.mode} onChange={session.setMode} />
              <KeyboardHints />
            </div>

            {session.currentCard ? (
              session.mode === 'recognition' ? (
                <FlashCard
                  card={session.currentCard}
                  flipped={session.isFlipped}
                  onFlip={session.flip}
                  onRate={session.rate}
                  onSkip={session.skip}
                />
              ) : (
                <TypingCard
                  key={session.currentCard.flashcard.id}
                  card={session.currentCard}
                  onRate={session.rate}
                  onSkip={session.skip}
                />
              )
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                {t('flashcard.completed')}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border px-4 py-5 sm:px-8 lg:w-72 lg:shrink-0 lg:border-l lg:border-t-0">
          <SessionSidebar
            stats={session.stats}
            remaining={remaining}
            elapsedMs={session.elapsedMs}
            queueAhead={session.queueAhead}
          />
        </div>
      </div>

      <ResultOverlay
        open={showResult}
        stats={session.stats}
        total={cards.length}
        elapsedMs={session.elapsedMs}
        onClose={handleCloseResult}
      />
    </div>
  )
}
