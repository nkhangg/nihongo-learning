'use client'

import { useTranslation } from 'react-i18next'
import type { ReviewCard, SessionStats } from '../types'
import { QueueNext } from './QueueNext'

interface SessionSidebarProps {
  stats: SessionStats
  remaining: number
  elapsedMs: number
  queueAhead: ReviewCard[]
}

function formatDuration(ms: number) {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

export function SessionSidebar({ stats, remaining, elapsedMs, queueAhead }: SessionSidebarProps) {
  const { t } = useTranslation()
  const accuracy =
    stats.completed === 0 ? 0 : Math.round((stats.correct / stats.completed) * 100)

  const rows: { label: string; value: string }[] = [
    { label: t('flashcards.session.done'), value: String(stats.completed) },
    { label: t('flashcards.session.again'), value: String(stats.again) },
    { label: t('flashcards.session.remaining'), value: String(remaining) },
    { label: t('flashcards.session.accuracy'), value: `${accuracy}%` },
    { label: t('flashcards.session.elapsed'), value: formatDuration(elapsedMs) },
  ]

  return (
    <aside className="flex flex-col gap-5">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t('flashcards.session.panelTitle')}
        </div>
        <dl className="mt-3 space-y-2">
          {rows.map((r) => (
            <div
              key={r.label}
              className="flex items-baseline justify-between text-sm"
            >
              <dt className="text-muted-foreground">{r.label}</dt>
              <dd className="font-mono font-semibold">{r.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <QueueNext cards={queueAhead} />
    </aside>
  )
}
