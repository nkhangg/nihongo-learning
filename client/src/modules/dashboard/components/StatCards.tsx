'use client'

import { cn } from '@shared/utils'

interface StatCardData {
  icon: string
  label: string
  value: string | number
  valueSuffix?: string
  delta: string
  deltaType: 'up' | 'down' | 'neutral'
}

function StatCard({ icon, label, value, valueSuffix, delta, deltaType }: StatCardData) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 transition hover:border-border/60">
      <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="mb-0.5 flex items-baseline gap-0.5">
        <span className="text-2xl font-semibold leading-none tracking-tight text-foreground">
          {value}
        </span>
        {valueSuffix && (
          <span className="text-base font-normal text-muted-foreground">{valueSuffix}</span>
        )}
      </div>
      <p
        className={cn('text-xs font-medium', {
          'text-emerald-600': deltaType === 'up',
          'text-red-500': deltaType === 'down',
          'text-muted-foreground': deltaType === 'neutral',
        })}
      >
        {delta}
      </p>
    </div>
  )
}

const CARDS: StatCardData[] = [
  { icon: '📚', label: 'Từ đã thuộc', value: 248, delta: '↑ +12 tuần này', deltaType: 'up' },
  { icon: '🎯', label: 'Tỉ lệ nhớ', value: 87, valueSuffix: '%', delta: '↑ +3% so tháng trước', deltaType: 'up' },
  { icon: '⏱', label: 'Thời gian học', value: 6, valueSuffix: 'h', delta: 'Tháng này', deltaType: 'neutral' },
  { icon: '🏆', label: 'Mock Test', value: 78, valueSuffix: '/120', delta: '↓ Cần 95 để đậu N3', deltaType: 'down' },
]

export function StatCards() {
  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
      {CARDS.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  )
}
