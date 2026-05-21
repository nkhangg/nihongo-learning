'use client'

import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils'
import type { ReviewMode } from '../types'

interface ModeToggleProps {
  mode: ReviewMode
  onChange: (mode: ReviewMode) => void
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  const { t } = useTranslation()
  const options: { value: ReviewMode; label: string }[] = [
    { value: 'recognition', label: t('flashcards.mode.recognition') },
    { value: 'typing', label: t('flashcards.mode.typing') },
  ]
  return (
    <div className="inline-flex gap-1 rounded-full border border-border bg-background p-1 text-xs">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-full px-3 py-1 font-medium transition-colors',
            mode === opt.value
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
