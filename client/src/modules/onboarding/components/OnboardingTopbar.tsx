'use client'

interface OnboardingTopbarProps {
  step: number
  totalSteps: number
}

export function OnboardingTopbar({ step, totalSteps }: OnboardingTopbarProps) {
  const progress = (step / totalSteps) * 100

  return (
    <>
      <header className="flex items-center justify-between px-6 sm:px-8 py-4 border-b border-border bg-paper/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[7px] bg-foreground flex items-center justify-center flex-shrink-0">
            <span className="text-background font-mono text-xs font-medium">日</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight">Nihongo</span>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          Bước {step} / {totalSteps}
        </span>
      </header>

      <div className="h-[3px] bg-surface-2">
        <div
          className="h-full bg-foreground transition-[width] duration-500 ease-[cubic-bezier(.4,0,.2,1)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </>
  )
}
