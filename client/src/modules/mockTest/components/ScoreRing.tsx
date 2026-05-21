'use client'

import { cn } from '@shared/utils'

interface ScoreRingProps {
  score: number
  maxScore: number
  passed: boolean
  size?: number
  strokeWidth?: number
}

export function ScoreRing({ score, maxScore, passed, size = 120, strokeWidth = 10 }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const ratio = maxScore > 0 ? score / maxScore : 0
  const dashOffset = circumference * (1 - ratio)

  const trackColor = 'var(--color-muted)'
  const fillColor = passed ? 'var(--color-chart-2)' : '#C47D0E'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn('text-2xl font-semibold leading-none', passed ? 'text-emerald-600' : 'text-amber-600')}
        >
          {score}
        </span>
        <span className="mt-0.5 text-[11px] text-muted-foreground">/ {maxScore}</span>
      </div>
    </div>
  )
}
