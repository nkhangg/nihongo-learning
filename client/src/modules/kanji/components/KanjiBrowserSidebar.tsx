'use client'

import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { BarChart2, Target, Grid2x2, PenLine, Zap } from 'lucide-react'
import { ROUTES } from '@shared/constants'
import { ProgressRing } from './ProgressRing'
import { LevelProgressList } from './LevelProgressList'
import { RadicalGrid } from './RadicalGrid'
import type { KanjiProgressSummary, Radical } from '../types'

interface KanjiBrowserSidebarProps {
  summary?: KanjiProgressSummary
  radicals: Radical[]
  selectedRadical?: string
  onRadicalSelect: (char: string | undefined) => void
}

function SidebarCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-black/[.07] rounded-[14px] p-4">
      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#0D0D0F] mb-3">
        <Icon className="h-[13px] w-[13px] text-[#7A7A85]" />
        {title}
      </div>
      {children}
    </div>
  )
}

export function KanjiBrowserSidebar({
  summary,
  radicals,
  selectedRadical,
  onRadicalSelect,
}: KanjiBrowserSidebarProps) {
  const { t } = useTranslation('kanji')

  const known = summary?.known ?? 0
  const total = summary?.total ?? 2136
  const pct = total > 0 ? Math.round((known / total) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Progress ring */}
      <SidebarCard title={t('sidebar.totalProgress')} icon={BarChart2}>
        <div className="flex items-center gap-4">
          <ProgressRing value={known} total={total} size={68} strokeWidth={7} />
          <div>
            <div className="text-[20px] font-bold font-mono text-[#0F8A72] leading-none">{known.toLocaleString()}</div>
            <div className="text-[10px] text-[#ADADB8] mt-0.5">/ {total.toLocaleString()} Jōyō</div>
            <div className="text-[12px] text-[#7A7A85] mt-1">≈ {pct}% hoàn thành</div>
          </div>
        </div>
      </SidebarCard>

      {/* Level breakdown */}
      {summary && (
        <SidebarCard title={t('sidebar.byLevel')} icon={Target}>
          <LevelProgressList summary={summary} />
        </SidebarCard>
      )}

      {/* Radical filter */}
      {radicals.length > 0 && (
        <SidebarCard title={t('sidebar.popularRadicals')} icon={Grid2x2}>
          <RadicalGrid
            radicals={radicals}
            selectedRadical={selectedRadical}
            onSelect={onRadicalSelect}
          />
        </SidebarCard>
      )}

      {/* Quick actions */}
      <div className="space-y-2">
        <Link
          href={ROUTES.KANJI_QUIZ}
          className="flex items-center gap-2.5 rounded-[14px] border border-black/[.07] bg-white px-4 py-2.5 text-[13px] font-medium text-[#3A3A40] hover:bg-[#F2F2EF] transition-colors"
        >
          <Zap className="h-4 w-4 text-[#7A7A85]" />
          {t('actions.quizNow')}
        </Link>
        <Link
          href={`${ROUTES.KANJI}?status=learning`}
          className="flex items-center gap-2.5 rounded-[14px] border border-black/[.07] bg-[#0D0D0F] px-4 py-2.5 text-[13px] font-medium text-white hover:bg-[#2a2a30] transition-colors"
        >
          <PenLine className="h-4 w-4" />
          {t('actions.practiceWrite')}
        </Link>
      </div>
    </div>
  )
}
