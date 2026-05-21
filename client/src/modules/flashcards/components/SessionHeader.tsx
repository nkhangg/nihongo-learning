'use client'

import { useTranslation } from 'react-i18next'
import { Button } from '@shared/components/ui'

interface SessionHeaderProps {
  dueCount: number
  newCount: number
  estimateMinutes: number
  onEnd: () => void
}

export function SessionHeader({ dueCount, newCount, estimateMinutes, onEnd }: SessionHeaderProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <div className="min-w-0">
        <h1 className="text-base font-semibold leading-tight">{t('flashcards.title')}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{t('flashcards.header.dueCount', { count: dueCount })}</span>
          <span className="text-border">·</span>
          <span>{t('flashcards.header.newCount', { count: newCount })}</span>
          <span className="text-border">·</span>
          <span>{t('flashcards.header.estimate', { minutes: estimateMinutes })}</span>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onEnd}>
        {t('flashcards.header.end')}
      </Button>
    </div>
  )
}
