'use client'

import { cn } from '@shared/utils'

interface ChipOption {
  value: string
  label: string
}

interface ChipGroupProps {
  options: ChipOption[]
  value: string
  onChange: (value: string) => void
}

export function ChipGroup({ options, value, onChange }: ChipGroupProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-full border px-3 py-1 text-xs font-medium transition-all',
            opt.value === value
              ? 'border-ink bg-ink text-paper'
              : 'border-border bg-background text-ink-3 hover:border-ink-4 hover:text-ink',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
