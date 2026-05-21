'use client'

import { useTranslation } from 'react-i18next'
import type { KanjiProgressSummary } from '../types'

interface KanjiHeroProps {
  summary?: KanjiProgressSummary
  isLoading?: boolean
}

export function KanjiHero({ summary, isLoading }: KanjiHeroProps) {
  const { t } = useTranslation('kanji')

  const known = summary?.known ?? 0
  const learning = summary?.learning ?? 0
  const total = summary?.total ?? 2136
  const locked = total - known - learning

  return (
    <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#0D0D0F] via-[#14141a] to-[#0a0f1e] px-8 py-7 border border-white/[.06]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-[22px] font-bold text-white tracking-tight mb-1">字 {t('title')}</h2>
          <p className="text-[13px] text-white/55 max-w-sm leading-relaxed">{t('subtitle')}</p>
        </div>
        <div className="flex gap-8 shrink-0">
          <div className="text-center">
            <div className={`text-[26px] font-bold font-mono tracking-tight text-[#4ade80] ${isLoading ? 'opacity-0' : ''}`}>{known.toLocaleString()}</div>
            <div className="text-[10px] text-white/45 mt-0.5 font-medium uppercase tracking-wider">{t('hero.known')}</div>
          </div>
          <div className="text-center">
            <div className={`text-[26px] font-bold font-mono tracking-tight text-[#fbbf24] ${isLoading ? 'opacity-0' : ''}`}>{learning.toLocaleString()}</div>
            <div className="text-[10px] text-white/45 mt-0.5 font-medium uppercase tracking-wider">{t('hero.learning')}</div>
          </div>
          <div className="text-center">
            <div className={`text-[26px] font-bold font-mono tracking-tight text-white/25 ${isLoading ? 'opacity-0' : ''}`}>{locked.toLocaleString()}</div>
            <div className="text-[10px] text-white/45 mt-0.5 font-medium uppercase tracking-wider">{t('hero.locked')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
