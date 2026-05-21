'use client'

interface ProgressStripProps {
  progress: number
}

export function ProgressStrip({ progress }: ProgressStripProps) {
  const pct = Math.max(0, Math.min(100, progress * 100))
  return (
    <div className="h-[3px] w-full overflow-hidden bg-border">
      <div
        className="h-full bg-foreground transition-[width] duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
