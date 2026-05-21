'use client'

import type { SrsDistribution } from '../types'

interface Props {
  srs: SrsDistribution
}

export function ProgressSrsDistribution({ srs }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-0.5 text-sm font-semibold text-foreground">Phân bổ thẻ SRS</div>
      <div className="mb-4 text-[11px] text-muted-foreground">
        Phân bổ {srs.total} thẻ hiện tại
      </div>
      <div className="flex flex-col gap-2">
        {srs.stages.map((stage) => (
          <div key={stage.name} className="flex items-center gap-2.5">
            <div className="w-[68px] shrink-0 text-right text-[11px] text-muted-foreground">
              {stage.name}
            </div>
            <div className="h-5 flex-1 overflow-hidden rounded bg-muted">
              <div
                className="h-full rounded transition-all duration-500"
                style={{ width: `${stage.percentage}%`, backgroundColor: stage.color }}
              />
            </div>
            <div className="w-7 shrink-0 font-mono text-[11px] text-muted-foreground">
              {stage.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
