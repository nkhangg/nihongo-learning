'use client'

import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { KanjiCard } from './KanjiCard'
import type { JlptLevel, KanjiListItem } from '../types'

const JLPT_ORDER: JlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']

const LEVEL_BADGE: Record<JlptLevel, string> = {
  N5: 'bg-[#E8F7F4] text-[#0F8A72]',
  N4: 'bg-[#E8F4FF] text-[#1565C0]',
  N3: 'bg-[#FEF6E4] text-[#C47D0E]',
  N2: 'bg-[#FFF0F2] text-[#E8334A]',
  N1: 'bg-[#0D0D0F] text-[#FFD700]',
}

interface KanjiGridProps {
  kanjis: KanjiListItem[]
  isLoading?: boolean
}

function GroupHeader({ level, kanjis }: { level: JlptLevel; kanjis: KanjiListItem[] }) {
  const known = kanjis.filter((k) => k.status === 'known').length
  const learning = kanjis.filter((k) => k.status === 'learning').length

  return (
    <div className="flex items-center gap-2 mb-2">
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${LEVEL_BADGE[level]}`}>{level}</span>
      <span className="text-[13px] font-bold text-[#0D0D0F]">{kanjis.length} kanji</span>
      {(known > 0 || learning > 0) && (
        <span className="text-[12px] text-[#ADADB8] font-mono">· {known > 0 && `${known} đã biết`}{known > 0 && learning > 0 && ' · '}{learning > 0 && `${learning} đang học`}</span>
      )}
      <div className="flex-1 h-px bg-black/[.07]" />
      <button type="button" className="px-3 py-[5px] text-[12px] font-medium rounded-lg border-[1.5px] border-black/[.13] text-[#3A3A40] bg-transparent hover:bg-[#F2F2EF] transition-all">
        Học nhóm này
      </button>
    </div>
  )
}

export function KanjiGrid({ kanjis, isLoading }: KanjiGridProps) {
  const { t } = useTranslation('kanji')

  if (isLoading) {
    return (
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-[5px]">
        {Array.from({ length: 48 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-[#F2F2EF] animate-pulse" />
        ))}
      </div>
    )
  }

  if (kanjis.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-[#ADADB8]">
        <Search className="h-10 w-10" />
        <p className="text-sm">{t('empty')}</p>
      </div>
    )
  }

  const grouped = JLPT_ORDER.reduce<Record<JlptLevel, KanjiListItem[]>>(
    (acc, level) => {
      acc[level] = kanjis.filter((k) => k.jlptLevel === level)
      return acc
    },
    { N5: [], N4: [], N3: [], N2: [], N1: [] },
  )

  return (
    <div className="space-y-6">
      {JLPT_ORDER.map((level) => {
        const group = grouped[level]
        if (group.length === 0) return null
        return (
          <div key={level}>
            <GroupHeader level={level} kanjis={group} />
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-[5px]">
              {group.map((kanji) => (
                <KanjiCard key={kanji.id} kanji={kanji} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
