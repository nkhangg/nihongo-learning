'use client'

import { useTranslation } from 'react-i18next'
import type { JlptLevel, KanjiProgressSummary } from '../types'

const LEVELS: JlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']

const LEVEL_COLOR: Record<JlptLevel, string> = {
  N5: '#0F8A72',
  N4: '#1565C0',
  N3: '#C47D0E',
  N2: '#E8334A',
  N1: '#0D0D0F',
}

interface LevelProgressListProps {
  summary?: KanjiProgressSummary
}

export function LevelProgressList({ summary }: LevelProgressListProps) {
  const { t } = useTranslation('kanji')

  if (!summary) return null

  return (
    <div className="space-y-[7px]">
      {LEVELS.map((level) => {
        const data = summary.byLevel[level]
        if (!data) return null
        const pct = data.total > 0 ? Math.round((data.known / data.total) * 100) : 0
        return (
          <div key={level} className="flex items-center gap-2 text-xs">
            <span className="w-[22px] font-bold font-mono text-[11px]" style={{ color: LEVEL_COLOR[level] }}>{level}</span>
            <div className="flex-1 h-[5px] bg-[#E8E8E4] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: LEVEL_COLOR[level] }}
              />
            </div>
            <span className="w-8 text-right text-[11px] font-mono text-[#ADADB8]">{pct}%</span>
          </div>
        )
      })}
    </div>
  )
}
