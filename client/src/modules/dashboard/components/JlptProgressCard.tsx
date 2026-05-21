'use client'

import { cn } from '@shared/utils'

const CIRCUMFERENCE = 2 * Math.PI * 32
const OVERALL_PCT = 65

interface ProgressBarProps {
  label: string
  current: number
  total: number
  barClass: string
}

function ProgressBar({ label, current, total, barClass }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-semibold text-foreground">
          {current.toLocaleString()}/{total.toLocaleString()}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded bg-muted">
        <div className={cn('h-full rounded', barClass)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function JlptProgressCard() {
  const dashOffset = CIRCUMFERENCE - (OVERALL_PCT / 100) * CIRCUMFERENCE

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Tiến độ JLPT N3</h3>
        <button className="text-xs text-muted-foreground transition hover:text-foreground">
          Chi tiết
        </button>
      </div>

      <div className="flex items-center gap-6">
        <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0" aria-label={`${OVERALL_PCT}% hoàn thành`}>
          <circle cx="40" cy="40" r="32" fill="none" stroke="hsl(var(--muted))" strokeWidth="7" />
          <circle
            cx="40" cy="40" r="32"
            fill="none"
            stroke="hsl(var(--foreground))"
            strokeWidth="7"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
          />
          <text
            x="40" y="37"
            textAnchor="middle"
            fontFamily="inherit"
            fontSize="14"
            fontWeight="600"
            fill="currentColor"
          >
            {OVERALL_PCT}%
          </text>
          <text
            x="40" y="50"
            textAnchor="middle"
            fontFamily="inherit"
            fontSize="9"
            fill="currentColor"
            opacity="0.5"
          >
            hoàn thành
          </text>
        </svg>

        <div className="flex-1">
          <ProgressBar label="Từ vựng" current={1840} total={3750} barClass="bg-foreground" />
          <ProgressBar label="Ngữ pháp" current={102}  total={240}  barClass="bg-emerald-600" />
          <ProgressBar label="Mock Test" current={78}   total={120}  barClass="bg-amber-500" />
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
        ⚡ Cần thêm ~17 điểm mock test để đậu N3. Tập trung vào{' '}
        <strong>語彙</strong> và <strong>文法</strong>.
      </div>
    </div>
  )
}
