'use client'

import { cn } from '@shared/utils'
import { TodayBanner } from './TodayBanner'
import { StatCards } from './StatCards'
import { ModuleProgressList } from './ModuleProgressList'
import { ActivityHeatmap } from './ActivityHeatmap'
import { DueWordsList } from './DueWordsList'
import { JlptProgressCard } from './JlptProgressCard'
import type { RecentMistake } from '../types'

const WEEKLY_DATA = [3, 7, 5, 12, 8, 4, 9, 11, 6, 14, 10, 8, 12, 15]
const WEEKLY_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const MAX_VAL = Math.max(...WEEKLY_DATA)

const RECENT_MISTAKES: RecentMistake[] = [
  { id: '1', kanji: '彼',  meaning: 'anh ấy / anh ta',         note: 'Nhầm với 彼女 (cô ấy) · Sai 2 lần' },
  { id: '2', kanji: '以上', meaning: 'hơn / trên / kể từ đó',  note: 'Nhầm nghĩa · Sai 3 lần'            },
  { id: '3', kanji: '場合', meaning: 'trường hợp / tình huống', note: 'Nhầm cách đọc · Sai 2 lần'         },
]

export function DashboardPage() {
  return (
    <div className="space-y-3.5 p-4 pb-12 md:p-6">
      <TodayBanner />

      <StatCards />

      {/* 2-column layout: left (flex-1) + right (360px fixed on lg+) */}
      <div className="flex flex-col gap-3.5 lg:grid lg:grid-cols-[1fr_360px]">

        {/* ── Left column ── */}
        <div className="flex flex-col gap-3.5">
          <ModuleProgressList />
          <ActivityHeatmap />

          {/* Activity bar chart */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Từ học được — 2 tuần gần đây
              </h3>
              <button className="text-xs text-muted-foreground transition hover:text-foreground">
                Chi tiết
              </button>
            </div>
            <div className="flex h-20 items-end gap-1.5">
              {WEEKLY_DATA.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center">
                  <div
                    className={cn(
                      'w-full rounded-t transition-all',
                      i === WEEKLY_DATA.length - 1 ? 'bg-foreground' : 'bg-muted',
                    )}
                    style={{ height: `${Math.round((v / MAX_VAL) * 100)}%`, minHeight: 3 }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[9px] text-muted-foreground">
              {WEEKLY_DAYS.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-3.5">
          <DueWordsList />
          <JlptProgressCard />

          {/* Recent mistakes */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Hay nhầm gần đây</h3>
              <button className="text-xs text-muted-foreground transition hover:text-foreground">
                Ôn lại
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {RECENT_MISTAKES.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 dark:border-red-900/30 dark:bg-red-950/20"
                >
                  <span className="w-7 shrink-0 font-mono text-[15px] font-medium text-foreground">
                    {item.kanji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-foreground/80">{item.meaning}</p>
                    <p className="text-[10px] text-red-500">{item.note}</p>
                  </div>
                  <button className="shrink-0 whitespace-nowrap rounded-lg border border-red-200 bg-white px-2 py-1 text-[10px] font-medium text-red-500 transition hover:bg-red-50 dark:bg-red-950/30 dark:border-red-800">
                    Ôn lại
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
