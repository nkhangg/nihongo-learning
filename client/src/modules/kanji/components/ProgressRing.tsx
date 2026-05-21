'use client'

interface ProgressRingProps {
  value: number
  total: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  sublabel?: string
}

export function ProgressRing({
  value,
  total,
  size = 80,
  strokeWidth = 7,
  color = '#0F8A72',
  label,
  sublabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = total > 0 ? value / total : 0
  const offset = circumference * (1 - pct)

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E8E8E4"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label && <span className="text-[20px] font-bold font-mono leading-none" style={{ color }}>{label}</span>}
        {sublabel && <span className="text-[10px] text-[#ADADB8] mt-0.5 leading-tight">{sublabel}</span>}
      </div>
    </div>
  )
}
