'use client'

import { useTranslation } from 'react-i18next'
import type { KanjiMeaning } from '../types'

const POS_LABELS: Record<string, string> = {
  noun: 'Danh từ',
  verb: 'Động từ',
  adj: 'Tính từ',
  adv: 'Trạng từ',
  other: 'Khác',
}

interface MeaningsListProps {
  meanings: KanjiMeaning[]
}

export function MeaningsList({ meanings }: MeaningsListProps) {
  const { t } = useTranslation('kanji')

  if (!meanings.length) return null

  return (
    <div className="space-y-2.5">
      {meanings.map((m, i) => (
        <div key={i} className="flex gap-3 items-start">
          <div className="w-5 h-5 rounded-full bg-[#0D0D0F] text-white text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
            {i + 1}
          </div>
          <div className="min-w-0">
            <div className="text-[14px] leading-snug text-[#3A3A40]">
              <span className="inline-flex items-center px-[7px] py-[1px] rounded-full text-[10px] font-medium bg-[#EDE8FE] text-[#5B45C7] mr-1.5">
                {POS_LABELS[m.pos] ?? m.pos}
              </span>
              <strong>{m.textVi}</strong>
            </div>
            {m.jpExample && (
              <p className="mt-0.5 text-[12px] text-[#7A7A85] italic font-mono">{m.jpExample}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
