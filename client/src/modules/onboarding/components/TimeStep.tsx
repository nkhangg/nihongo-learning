'use client'

import { cn } from '@shared/utils'
import { TIME_OPTIONS, type TimeOption } from '../types'

interface TimeStepProps {
  selected: string | null
  onSelect: (id: string) => void
  onNext: () => void
  onBack: () => void
}

export function TimeStep({ selected, onSelect, onNext, onBack }: TimeStepProps) {
  return (
    <div className="animate-fade-up">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-[13px] text-muted-foreground mb-5 hover:text-foreground transition-colors cursor-pointer"
      >
        ← Quay lại
      </button>

      <div className="flex items-center gap-1.5 mb-3">
        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
        <span className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground">
          Thời gian học
        </span>
      </div>

      <h1 className="text-[32px] font-light tracking-tight leading-[1.15] mb-2.5">
        Mỗi ngày bạn có<br />
        <strong className="font-semibold">bao nhiêu thời gian?</strong>
      </h1>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
        Hệ thống sẽ giao đúng lượng bài tập phù hợp — không quá nhiều, không quá ít.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
        {TIME_OPTIONS.map((opt) => (
          <TimeCard
            key={opt.id}
            option={opt}
            selected={selected === opt.id}
            onSelect={() => onSelect(opt.id)}
          />
        ))}
      </div>

      <button
        type="button"
        disabled={!selected}
        onClick={onNext}
        className="w-full py-3.5 bg-foreground text-background rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 hover:opacity-90 hover:-translate-y-px disabled:opacity-35 disabled:cursor-not-allowed disabled:translate-y-0"
      >
        Xây dựng lộ trình →
      </button>
    </div>
  )
}

function TimeCard({
  option,
  selected,
  onSelect,
}: {
  option: TimeOption
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'border-[1.5px] rounded-lg p-4 cursor-pointer transition-all duration-[180ms] bg-card text-center w-full',
        selected
          ? 'border-foreground shadow-[0_0_0_3px_rgba(13,13,15,0.06)]'
          : 'border-border hover:border-muted-foreground hover:bg-surface',
      )}
    >
      <div className="text-[22px] font-semibold text-foreground tracking-tight mb-0.5">{option.time}</div>
      <div className="text-[11px] text-muted-foreground">{option.unit}</div>
      <div className="text-[11px] text-muted-foreground/70 mt-0.5">{option.desc}</div>
    </button>
  )
}
