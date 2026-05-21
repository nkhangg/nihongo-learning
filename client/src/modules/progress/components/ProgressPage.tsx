'use client'

import { cn } from '@shared/utils'
import { useProgress } from '../hooks/useProgress'
import { ProgressStatCards } from './ProgressStatCards'
import { ProgressDailyChart } from './ProgressDailyChart'
import { ProgressSrsDistribution } from './ProgressSrsDistribution'
import { ProgressSkillRings } from './ProgressSkillRings'
import { ProgressHeatmap } from './ProgressHeatmap'
import { ProgressWeakWords } from './ProgressWeakWords'
import type { ProgressRange } from '../types'

const RANGE_OPTIONS: { value: ProgressRange; label: string }[] = [
  { value: '7d', label: '7 ngày' },
  { value: '30d', label: '30 ngày' },
  { value: '3m', label: '3 tháng' },
  { value: 'all', label: 'Tất cả' },
]

export function ProgressPage() {
  const { data, range, setRange } = useProgress()

  return (
    <div className="space-y-4 p-4 pb-12 md:p-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-foreground">
            Tiến độ học tập
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Tháng 4, 2025 · Đang học N3</p>
        </div>
        <div className="flex gap-1">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRange(opt.value)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                range === opt.value
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-muted-foreground hover:border-muted-foreground hover:text-foreground',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <ProgressStatCards stats={data.stats} />

      <div className="grid gap-3 md:grid-cols-2">
        <ProgressDailyChart data={data.dailyCards} />
        <ProgressSrsDistribution srs={data.srs} />
      </div>

      <ProgressSkillRings skills={data.skills} />

      <ProgressHeatmap heatmap={data.heatmap} />

      <ProgressWeakWords words={data.weakWords} />
    </div>
  )
}
