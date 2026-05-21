'use client'

import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@config/routes'
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@shared/components/ui'
import type { SessionStats } from '../types'

interface ResultOverlayProps {
  open: boolean
  stats: SessionStats
  total: number
  elapsedMs: number
  streakDays?: number
  onClose: () => void
}

function formatDurationLong(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}m ${sec}s`
}

export function ResultOverlay({
  open,
  stats,
  total,
  elapsedMs,
  streakDays,
  onClose,
}: ResultOverlayProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const accuracy = stats.completed === 0 ? 0 : Math.round((stats.correct / stats.completed) * 100)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto text-4xl">🎉</div>
          <DialogTitle className="mt-2">{t('flashcards.result.title')}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t('flashcards.result.subtitle', {
              deck: t('flashcards.title'),
              count: total,
              duration: formatDurationLong(elapsedMs),
            })}
          </p>
        </DialogHeader>

        <div className="mt-2 grid grid-cols-3 gap-2">
          <StatBox label={t('flashcards.result.accuracy')} value={`${accuracy}%`} />
          <StatBox label={t('flashcards.result.completed')} value={String(stats.completed)} />
          <StatBox label={t('flashcards.result.again')} value={String(stats.again)} />
        </div>

        {typeof streakDays === 'number' && streakDays > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950">
            <div className="font-semibold text-amber-700 dark:text-amber-300">
              {t('flashcards.result.streakBanner', { n: streakDays })}
            </div>
            <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
              {t('flashcards.result.streakSub')}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.push(ROUTES.PROGRESS)}>
            {t('flashcards.result.viewDetail')}
          </Button>
          <Button onClick={onClose}>{t('flashcards.result.continue')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-3 text-center">
      <div className="font-mono text-lg font-semibold">{value}</div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
    </div>
  )
}
