'use client'

import type { SkillProgress } from '../types'

const CIRCUMFERENCE = 188.5

function SkillRing({ skill }: { skill: SkillProgress }) {
  const offset = CIRCUMFERENCE * (1 - skill.percentage / 100)

  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-4 text-center">
      <div className="relative mb-3 h-[72px] w-[72px]">
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          style={{ transform: 'rotate(-90deg)' }}
        >
          <circle
            cx="36"
            cy="36"
            r="30"
            fill="none"
            className="stroke-muted"
            strokeWidth="7"
          />
          <circle
            cx="36"
            cy="36"
            r="30"
            fill="none"
            stroke={skill.color}
            strokeWidth="7"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-[15px] font-semibold leading-none"
            style={{ color: skill.color }}
          >
            {skill.percentage}%
          </span>
        </div>
      </div>
      <div className="text-xs font-medium text-foreground">{skill.name}</div>
      <div className="mt-0.5 text-[10px] text-muted-foreground">
        {skill.current} / {skill.total} {skill.unit}
      </div>
      <div
        className="mt-1 text-[10px] font-medium"
        style={{ color: skill.trendColor }}
      >
        {skill.trend}
      </div>
    </div>
  )
}

interface Props {
  skills: SkillProgress[]
}

export function ProgressSkillRings({ skills }: Props) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-foreground">Kỹ năng theo module</h3>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {skills.map((skill) => (
          <SkillRing key={skill.name} skill={skill} />
        ))}
      </div>
    </div>
  )
}
