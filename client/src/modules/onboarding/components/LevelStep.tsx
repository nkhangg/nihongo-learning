'use client'

import { cn } from '@shared/utils'
import { LEVELS, type OnboardingLevel } from '../types'

const CheckIcon = () => (
  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

interface LevelStepProps {
  selected: string | null
  onSelect: (id: string) => void
  onNext: () => void
  onBack: () => void
}

export function LevelStep({ selected, onSelect, onNext, onBack }: LevelStepProps) {
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
          Trình độ hiện tại
        </span>
      </div>

      <h1 className="text-[32px] font-light tracking-tight leading-[1.15] mb-2.5">
        Bạn đang ở<br />
        <strong className="font-semibold">cấp độ nào?</strong>
      </h1>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
        Đừng lo nếu chưa chắc — bước tiếp theo sẽ có quiz kiểm tra để xác nhận chính xác hơn.
      </p>

      <div className="flex flex-col gap-2 mb-8">
        {LEVELS.map((level) => (
          <LevelRow
            key={level.id}
            level={level}
            selected={selected === level.id}
            onSelect={() => onSelect(level.id)}
          />
        ))}
      </div>

      <button
        type="button"
        disabled={!selected}
        onClick={onNext}
        className="w-full py-3.5 bg-foreground text-background rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 hover:opacity-90 hover:-translate-y-px disabled:opacity-35 disabled:cursor-not-allowed disabled:translate-y-0"
      >
        Tiếp theo →
      </button>
    </div>
  )
}

function LevelRow({
  level,
  selected,
  onSelect,
}: {
  level: OnboardingLevel
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'border-[1.5px] rounded-lg p-4 cursor-pointer transition-all duration-[180ms] bg-card flex items-center gap-3.5 w-full text-left',
        selected
          ? 'border-foreground shadow-[0_0_0_3px_rgba(13,13,15,0.06)]'
          : 'border-border hover:border-muted-foreground hover:bg-surface',
      )}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-mono text-xs font-medium"
        style={{ background: level.bgColor, color: level.fgColor }}
      >
        {level.badge}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-foreground mb-0.5">{level.title}</div>
        <div className="text-xs text-muted-foreground">{level.desc}</div>
      </div>
      <div
        className={cn(
          'w-[18px] h-[18px] rounded-full border-[1.5px] flex-shrink-0 flex items-center justify-center transition-all duration-[180ms]',
          selected ? 'bg-foreground border-foreground' : 'border-border',
        )}
      >
        {selected && <CheckIcon />}
      </div>
    </button>
  )
}
