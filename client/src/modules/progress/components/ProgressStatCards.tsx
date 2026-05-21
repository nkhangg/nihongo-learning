'use client'

import { cn } from '@shared/utils'
import type { ProgressStats } from '../types'

interface Props {
  stats: ProgressStats
}

export function ProgressStatCards({ stats }: Props) {
  const cards = [
    {
      value: stats.wordsLearned.toString(),
      label: 'Từ đã thuộc',
      change: `↑ +${stats.wordsLearnedChange} tháng này`,
      changeColor: 'text-emerald-600',
      barColor: 'bg-emerald-600',
      valueColor: 'text-emerald-600',
    },
    {
      value: `🔥 ${stats.streak}`,
      label: 'Streak ngày liên tiếp',
      change: stats.isPersonalRecord ? '⭐ Kỷ lục cá nhân!' : `↑ ${stats.streak} ngày`,
      changeColor: 'text-amber-600',
      barColor: 'bg-amber-500',
      valueColor: '',
    },
    {
      value: `${stats.retentionRate}%`,
      label: 'Tỉ lệ nhớ trung bình',
      change: `↑ +${stats.retentionChange}% so tháng trước`,
      changeColor: 'text-emerald-600',
      barColor: 'bg-foreground',
      valueColor: '',
    },
    {
      value: `${stats.studyHours}h`,
      label: 'Tổng giờ học tháng này',
      change: `↑ +${stats.studyHoursChange}h so tháng trước`,
      changeColor: 'text-emerald-600',
      barColor: 'bg-muted-foreground',
      valueColor: 'text-muted-foreground',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="relative overflow-hidden rounded-2xl border border-border bg-card px-4 pb-5 pt-4"
        >
          <div className={cn('absolute inset-x-0 bottom-0 h-0.5', card.barColor)} />
          <div className={cn('mb-1 text-2xl font-semibold leading-none tracking-tight', card.valueColor)}>
            {card.value}
          </div>
          <div className="mb-1 text-[11px] text-muted-foreground">{card.label}</div>
          <div className={cn('text-[11px] font-medium', card.changeColor)}>{card.change}</div>
        </div>
      ))}
    </div>
  )
}
