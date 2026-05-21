'use client'

import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils'
import type { Radical } from '../types'

interface RadicalGridProps {
  radicals: Radical[]
  selectedRadical?: string
  onSelect: (char: string | undefined) => void
}

export function RadicalGrid({ radicals, selectedRadical, onSelect }: RadicalGridProps) {
  const { t } = useTranslation('kanji')
  const popular = radicals.slice(0, 40)

  return (
    <div>
      <p className="text-[10px] font-semibold text-[#ADADB8] uppercase tracking-wider mb-2">
        {t('sidebar.popularRadicals')}
      </p>
      <div className="grid grid-cols-5 gap-1">
        {popular.map((r) => (
          <button
            key={r.char}
            type="button"
            title={r.meaningVi}
            onClick={() => onSelect(selectedRadical === r.char ? undefined : r.char)}
            className={cn(
              'flex flex-col items-center rounded-lg p-1.5 text-center transition-all border-[1.5px] cursor-pointer',
              selectedRadical === r.char
                ? 'border-[#1565C0] bg-[#E8F4FF]'
                : 'bg-[#F2F2EF] border-transparent hover:border-[#1565C0] hover:bg-[#E8F4FF]',
            )}
          >
            <span className="text-[15px] leading-none">{r.char}</span>
            <span className="text-[9px] text-[#ADADB8] mt-0.5 font-mono truncate w-full text-center">{r.meaningVi}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
