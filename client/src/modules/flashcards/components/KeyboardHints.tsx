'use client'

import { useTranslation } from 'react-i18next'

const HINTS: { keys: string; key: string }[] = [
  { keys: 'Space', key: 'flashcards.shortcuts.flip' },
  { keys: '1-4', key: 'flashcards.shortcuts.rate' },
  { keys: '→', key: 'flashcards.shortcuts.skip' },
]

export function KeyboardHints() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
      {HINTS.map((h) => (
        <span key={h.keys} className="inline-flex items-center gap-1.5">
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            {h.keys}
          </kbd>
          <span>{t(h.key)}</span>
        </span>
      ))}
    </div>
  )
}
