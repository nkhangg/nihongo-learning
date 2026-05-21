'use client'

import { cn } from '@shared/utils'
import type { HeatmapData } from '../types'

const LEVEL_CLASSES: Record<number, string> = {
  0: 'bg-muted',
  1: 'bg-emerald-100 dark:bg-emerald-900/40',
  2: 'bg-emerald-300 dark:bg-emerald-700/60',
  3: 'bg-emerald-500',
  4: 'bg-emerald-700',
}

interface Props {
  heatmap: HeatmapData
}

export function ProgressHeatmap({ heatmap }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-foreground">Heatmap học tập</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            12 tháng · {heatmap.studyDaysThisMonth} ngày học trong tháng này
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>Ít</span>
          {([0, 1, 2, 3, 4] as const).map((lvl) => (
            <div key={lvl} className={cn('h-3 w-3 rounded-sm', LEVEL_CLASSES[lvl])} />
          ))}
          <span>Nhiều</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div style={{ width: 'max-content' }}>
          <div className="flex gap-[3px]">
            {heatmap.cells.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-[3px]">
                {col.map((cell, ri) => (
                  <div
                    key={ri}
                    className={cn('h-[13px] w-[13px] rounded-sm', LEVEL_CLASSES[cell.level])}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="mt-1.5 flex">
            {heatmap.months.map((m) => (
              <div
                key={m}
                className="min-w-[52px] shrink-0 font-mono text-[9px] text-muted-foreground"
              >
                {m}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
