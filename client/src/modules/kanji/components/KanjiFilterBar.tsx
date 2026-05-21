'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { cn } from '@shared/utils'
import type { JlptLevel, KanjiStatus, ListKanjiParams } from '../types'

const LEVELS: Array<JlptLevel | 'all'> = ['all', 'N5', 'N4', 'N3', 'N2', 'N1']
const STATUSES: Array<KanjiStatus | 'all'> = ['all', 'known', 'learning', 'unseen']
const STROKES = [
  { label: '1–5', min: 1, max: 5 },
  { label: '6–10', min: 6, max: 10 },
  { label: '11–15', min: 11, max: 15 },
  { label: '16+', min: 16, max: 99 },
]

const LEVEL_ACTIVE: Record<JlptLevel, string> = {
  N5: 'border-[#0F8A72] bg-[#E8F7F4] text-[#0F8A72]',
  N4: 'border-[#1565C0] bg-[#E8F4FF] text-[#1565C0]',
  N3: 'border-[#C47D0E] bg-[#FEF6E4] text-[#C47D0E]',
  N2: 'border-[#E8334A] bg-[#FFF0F2] text-[#E8334A]',
  N1: 'border-[#0D0D0F] bg-[#0D0D0F] text-[#FFD700]',
}

const STATUS_LABELS: Record<string, string> = {
  all: 'Tất cả',
  known: 'Đã biết',
  learning: 'Đang học',
  unseen: 'Chưa học',
}

interface KanjiFilterBarProps {
  params: ListKanjiParams
  onChange: (next: Partial<ListKanjiParams>) => void
}

export function KanjiFilterBar({ params, onChange }: KanjiFilterBarProps) {
  const { t } = useTranslation('kanji')
  const [strokesKey, setStrokesKey] = useState<string | null>(null)

  const chipBase = 'px-3 py-1 rounded-full text-xs font-medium cursor-pointer border-[1.5px] transition-all'
  const chipInactive = 'border-black/[.13] text-[#7A7A85] bg-transparent hover:border-[#ADADB8] hover:text-[#0D0D0F]'
  const chipActiveAll = 'border-[#0D0D0F] bg-[#0D0D0F] text-white'

  return (
    <div className="bg-white border border-black/[.07] rounded-[14px] px-5 py-4 flex flex-wrap items-center gap-4">
      {/* Level */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-[#ADADB8] uppercase tracking-wider whitespace-nowrap">{t('filter.level')}</span>
        <div className="flex gap-1 flex-wrap">
          {LEVELS.map((level) => {
            const active = (params.level ?? 'all') === level
            return (
              <button
                key={level}
                type="button"
                onClick={() => onChange({ level: level === 'all' ? undefined : level, page: 1 })}
                className={cn(chipBase, active
                  ? level === 'all' ? chipActiveAll : LEVEL_ACTIVE[level as JlptLevel]
                  : chipInactive)}
              >
                {level === 'all' ? t('status.all') : level}
              </button>
            )
          })}
        </div>
      </div>

      <div className="w-px h-5 bg-black/[.13] shrink-0" />

      {/* Status */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-[#ADADB8] uppercase tracking-wider whitespace-nowrap">{t('filter.status')}</span>
        <div className="flex gap-1 flex-wrap">
          {STATUSES.map((status) => {
            const active = (params.status ?? 'all') === status
            return (
              <button
                key={status}
                type="button"
                onClick={() => onChange({ status: status === 'all' ? undefined : status as KanjiStatus, page: 1 })}
                className={cn(chipBase, active ? chipActiveAll : chipInactive)}
              >
                {STATUS_LABELS[status]}
              </button>
            )
          })}
        </div>
      </div>

      <div className="w-px h-5 bg-black/[.13] shrink-0" />

      {/* Strokes */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-[#ADADB8] uppercase tracking-wider whitespace-nowrap">Số nét</span>
        <div className="flex gap-1">
          {STROKES.map((s) => {
            const active = strokesKey === s.label
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  const next = active ? null : s.label
                  setStrokesKey(next)
                  onChange({ strokesMin: next ? s.min : undefined, strokesMax: next ? s.max : undefined, page: 1 })
                }}
                className={cn(chipBase, active ? chipActiveAll : chipInactive)}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Search */}
      <div className="relative ml-auto">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#ADADB8]" />
        <input
          type="text"
          defaultValue={params.search}
          onChange={(e) => onChange({ search: e.target.value, page: 1 })}
          placeholder={t('filter.searchPlaceholder')}
          className="pl-8 pr-3 py-[7px] border-[1.5px] border-black/[.13] rounded-lg text-[13px] w-48 outline-none focus:border-[#0D0D0F] bg-[#FAFAF8] text-[#0D0D0F] placeholder:text-[#ADADB8] transition-colors"
        />
      </div>
    </div>
  )
}
