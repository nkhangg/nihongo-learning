'use client'

import { useTranslation } from 'react-i18next'
import type { WritingScore } from '../types'

interface FeedbackPanelProps {
  score: WritingScore
}

const CRITERIA = [
  { key: 'order' as const, label: 'writing.feedback.order' },
  { key: 'size' as const, label: 'writing.feedback.size' },
  { key: 'direction' as const, label: 'writing.feedback.direction' },
  { key: 'position' as const, label: 'writing.feedback.position' },
]

const SCORE_COLOR = (v: number) => v >= 80 ? '#0F8A72' : v >= 50 ? '#1565C0' : '#E8334A'

export function FeedbackPanel({ score }: FeedbackPanelProps) {
  const { t } = useTranslation('kanji')

  const color = SCORE_COLOR(score.overall)

  return (
    <div className="bg-white border-[1.5px] border-black/[.07] rounded-[14px] px-5 py-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
      <p className="text-[10px] font-semibold text-[#ADADB8] uppercase tracking-wider mb-3">Kết quả lần viết trước</p>
      <div className="flex items-center gap-3 mb-4">
        <div className="text-[36px] font-bold font-mono tracking-tight leading-none" style={{ color }}>{score.overall}</div>
        <div>
          <div className="text-[10px] text-[#ADADB8] font-medium uppercase tracking-wider">Điểm tổng</div>
          <div className="text-[18px] mt-0.5">{score.starsLabel}</div>
        </div>
        {score.feedback && (
          <div className="ml-auto text-[12px] font-semibold" style={{ color }}>{score.feedback}</div>
        )}
      </div>
      <div className="space-y-1.5">
        {CRITERIA.map(({ key, label }) => {
          const val = score[key]
          const c = SCORE_COLOR(val)
          return (
            <div key={key} className="flex items-center gap-2 text-[12px]">
              <span className="w-[100px] text-[#7A7A85] shrink-0">{t(label)}</span>
              <div className="flex-1 h-[5px] bg-[#E8E8E4] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${val}%`, background: c }} />
              </div>
              <span className="w-8 text-right font-semibold font-mono text-[12px]" style={{ color: c }}>{val}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
