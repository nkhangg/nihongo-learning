'use client'

import { useTranslation } from 'react-i18next'
import type { Compound } from '../types'

interface CompoundsGridProps {
  compounds: Compound[]
}

export function CompoundsGrid({ compounds }: CompoundsGridProps) {
  const { t } = useTranslation('kanji')

  if (!compounds.length) {
    return (
      <p className="text-[13px] text-[#ADADB8] text-center py-4">Chưa có từ ghép.</p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
      {compounds.map((c, i) => (
        <div
          key={i}
          className="bg-[#F2F2EF] rounded-[14px] px-3 py-2.5 border-[1.5px] border-transparent hover:border-[#1565C0] hover:bg-[#E8F4FF] hover:shadow-[0_2px_6px_rgba(21,101,192,.08)] transition-all cursor-pointer"
        >
          <div className="text-[17px] font-bold text-[#0D0D0F]">{c.jp}</div>
          <div className="text-[11px] text-[#ADADB8] font-mono">{c.reading}</div>
          <div className="text-[11px] text-[#7A7A85] mt-0.5">{c.meaningVi}</div>
        </div>
      ))}
    </div>
  )
}
