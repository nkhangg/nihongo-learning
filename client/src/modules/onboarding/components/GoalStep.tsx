'use client'

import { cn } from '@shared/utils'
import { GOALS, type OnboardingGoal } from '../types'

const CheckIcon = () => (
  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

interface GoalStepProps {
  selected: string | null
  onSelect: (id: string) => void
  onNext: () => void
}

export function GoalStep({ selected, onSelect, onNext }: GoalStepProps) {
  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-1.5 mb-3">
        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
        <span className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground">
          Mục tiêu học
        </span>
      </div>

      <h1 className="text-[32px] font-light tracking-tight leading-[1.15] mb-2.5">
        Bạn học tiếng Nhật<br />
        <strong className="font-semibold">để làm gì?</strong>
      </h1>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
        Chọn mục tiêu chính — hệ thống sẽ cá nhân hóa nội dung phù hợp nhất.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
        {GOALS.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            selected={selected === goal.id}
            onSelect={() => onSelect(goal.id)}
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

function GoalCard({
  goal,
  selected,
  onSelect,
}: {
  goal: OnboardingGoal
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'border-[1.5px] rounded-xl p-5 cursor-pointer transition-all duration-[180ms] bg-card flex gap-3.5 items-start text-left w-full',
        selected
          ? 'border-foreground shadow-[0_0_0_3px_rgba(13,13,15,0.06)]'
          : 'border-border hover:border-muted-foreground hover:bg-surface',
      )}
    >
      <span className="text-[22px] flex-shrink-0 mt-0.5">{goal.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-foreground mb-0.5 tracking-tight">{goal.title}</div>
        <div className="text-xs text-muted-foreground leading-relaxed">{goal.desc}</div>
      </div>
      <div
        className={cn(
          'w-[18px] h-[18px] rounded-full border-[1.5px] flex-shrink-0 flex items-center justify-center transition-all duration-[180ms] mt-0.5 ml-1',
          selected ? 'bg-foreground border-foreground' : 'border-border',
        )}
      >
        {selected && <CheckIcon />}
      </div>
    </button>
  )
}
