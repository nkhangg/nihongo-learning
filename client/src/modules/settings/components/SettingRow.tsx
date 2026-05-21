'use client'

import type { ReactNode } from 'react'

interface SettingRowProps {
  label: string
  description?: string
  control: ReactNode
}

export function SettingRow({ label, description, control }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-border px-5 py-4 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  )
}
