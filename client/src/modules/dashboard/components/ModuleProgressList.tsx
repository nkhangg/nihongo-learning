'use client'

import Link from 'next/link'
import { cn } from '@shared/utils'
import { ROUTES } from '@config/routes'
import type { ModuleItem, ModuleStatus } from '../types'

const STATUS_MAP: Record<ModuleStatus, { badge: string; bar: string; label: string }> = {
  review:   { badge: 'bg-red-50 text-red-500',        bar: 'bg-red-500',     label: 'Cần ôn'   },
  next:     { badge: 'bg-emerald-50 text-emerald-600', bar: 'bg-emerald-600', label: 'Tiếp theo' },
  failed:   { badge: 'bg-amber-50 text-amber-600',     bar: 'bg-amber-500',   label: 'Chưa đạt' },
  new:      { badge: 'bg-purple-50 text-purple-600',   bar: 'bg-purple-500',  label: 'Mới'       },
  optional: { badge: 'bg-muted text-muted-foreground', bar: 'bg-foreground',  label: 'Tùy chọn' },
}

const MODULES: ModuleItem[] = [
  { id: '1', icon: '🃏', bg: 'bg-red-50',     name: 'Flashcard từ vựng N3',           meta: '12 thẻ ôn · 5 từ mới · ~8 phút',         status: 'review',   progress: 68, href: ROUTES.FLASHCARDS },
  { id: '2', icon: '📝', bg: 'bg-emerald-50', name: 'Ngữ pháp N3 — Bài 8',            meta: '〜にもかかわらず · 〜に対して',             status: 'next',     progress: 42, href: ROUTES.GRAMMAR   },
  { id: '3', icon: '🏆', bg: 'bg-amber-50',   name: 'Mock Test N3 — Lần 3',           meta: 'Thi thử lần cuối 5 ngày trước · 78/120',  status: 'failed',   progress: 65, href: ROUTES.MOCK_TEST  },
  { id: '4', icon: '📖', bg: 'bg-purple-50',  name: 'Đọc hiểu — Bài báo NHK Easy',   meta: 'Chủ đề: Công nghệ · Trung bình',          status: 'new',      progress: 0,  href: '#'              },
  { id: '5', icon: '🤖', bg: 'bg-red-50',     name: 'AI Sensei — Hội thoại tình huống', meta: 'Kịch bản: Phỏng vấn xin việc',          status: 'optional', progress: 0,  href: '#'              },
]

export function ModuleProgressList() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Các module học tập</h3>
        <button className="text-xs text-muted-foreground transition hover:text-foreground">
          Xem tất cả
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {MODULES.map((mod) => {
          const style = STATUS_MAP[mod.status]
          const Inner = (
            <>
              <div
                className={cn(
                  'flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg text-lg',
                  mod.bg,
                )}
              >
                {mod.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{mod.name}</p>
                <p className="truncate text-xs text-muted-foreground">{mod.meta}</p>
              </div>
              <div className="shrink-0 text-right">
                <span
                  className={cn(
                    'mb-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium',
                    style.badge,
                  )}
                >
                  {style.label}
                </span>
                <div className="h-[3px] w-[60px] overflow-hidden rounded bg-muted">
                  <div
                    className={cn('h-full rounded', style.bar)}
                    style={{ width: `${mod.progress}%` }}
                  />
                </div>
              </div>
            </>
          )

          const cls =
            'flex items-center gap-3 rounded-xl border border-transparent bg-muted/50 p-3 transition hover:border-border hover:bg-card'

          return mod.href === '#' ? (
            <div key={mod.id} className={cn(cls, 'cursor-not-allowed opacity-50')}>
              {Inner}
            </div>
          ) : (
            <Link key={mod.id} href={mod.href} className={cls}>
              {Inner}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
