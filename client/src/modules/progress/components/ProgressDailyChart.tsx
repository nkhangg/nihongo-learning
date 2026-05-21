'use client'

import { cn } from '@shared/utils'

const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

interface Props {
  data: number[]
}

export function ProgressDailyChart({ data }: Props) {
  const max = Math.max(...data, 1)

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-0.5 text-sm font-semibold text-foreground">Thẻ ôn tập theo ngày</div>
      <div className="mb-4 text-[11px] text-muted-foreground">30 ngày gần nhất</div>
      <div className="flex h-28 items-end gap-0.5 overflow-hidden">
        {data.map((v, i) => {
          const heightPct = v === 0 ? 2 : Math.round((v / max) * 100)
          const barColor =
            v === 0
              ? 'bg-muted'
              : v > 20
                ? 'bg-emerald-600'
                : v > 15
                  ? 'bg-foreground'
                  : 'bg-muted-foreground'
          return (
            <div key={i} className="flex h-full flex-1 flex-col items-center gap-1">
              <div className="flex flex-1 w-full items-end">
                <div
                  className={cn('w-full rounded-t transition-all', barColor)}
                  style={{ height: `${heightPct}%`, minHeight: 2 }}
                />
              </div>
              {i % 4 === 0 && (
                <div className="font-mono text-[9px] text-muted-foreground">
                  {DAY_LABELS[i % 7]}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
