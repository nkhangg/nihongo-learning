'use client'

import { useMemo } from 'react'
import { cn } from '@shared/utils'

const MONTHS = ['T9', 'T10', 'T11', 'T12', 'T1', 'T2']
const COLS = 26
const TOTAL = COLS * 7

const COLORS = [
  'bg-muted',       // 0 — none
  'bg-[#B5D4F4]',   // 1 — light
  'bg-[#85B7EB]',   // 2 — medium
  'bg-[#378ADD]',   // 3 — active
  'bg-[#0C447C]',   // 4 — intense
]

function seeded(seed: number) {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

export function ActivityHeatmap() {
  const cells = useMemo(
    () =>
      Array.from({ length: TOTAL }, (_, i) => {
        const isRecent = i > TOTAL - 22
        const intensity = isRecent
          ? seeded(i) > 0.15 ? Math.min(Math.floor(seeded(i * 7) * 3) + 2, 4) : 0
          : seeded(i) > 0.55 ? Math.floor(seeded(i * 3) * 4) : 0
        return intensity
      }),
    [],
  )

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Lịch học — 6 tháng gần đây</h3>
        <span className="text-xs text-muted-foreground">🔥 21 ngày liên tiếp</span>
      </div>

      <div className="mb-1 flex justify-between font-mono text-[9px] text-muted-foreground">
        {MONTHS.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>

      <div
        className="grid gap-[2.5px]"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {cells.map((intensity, i) => (
          <div
            key={i}
            className={cn(
              'aspect-square rounded-[2px] transition-transform hover:scale-125',
              COLORS[intensity],
            )}
          />
        ))}
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <span>Ít</span>
        {COLORS.map((color, i) => (
          <div key={i} className={cn('h-2.5 w-2.5 rounded-[2px]', color)} />
        ))}
        <span>Nhiều</span>
      </div>
    </div>
  )
}
