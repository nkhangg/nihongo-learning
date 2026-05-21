'use client'

import Link from 'next/link'
import { ROUTES } from '@config/routes'

const TODAY_STATS = { reviewCount: 12, newWords: 5, estimatedMinutes: 8 }
const WEEK_DAYS = ['CN', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

export function TodayBanner() {
  const dayOfWeek = WEEK_DAYS[new Date().getDay()]

  return (
    <div className="relative overflow-hidden rounded-2xl bg-foreground px-6 py-5">
      <div
        className="pointer-events-none absolute right-48 top-1/2 hidden -translate-y-1/2 select-none font-mono text-7xl font-light leading-none text-white/[0.04] md:block"
        aria-hidden
      >
        今日
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-white/35">
            Bài học hôm nay · {dayOfWeek}
          </p>
          <h2 className="mb-0.5 text-xl font-semibold tracking-tight text-white sm:text-[22px]">
            Bạn có {TODAY_STATS.reviewCount} từ cần ôn tập
          </h2>
          <p className="text-sm text-white/45">
            Ước tính hoàn thành trong ~{TODAY_STATS.estimatedMinutes} phút
          </p>
        </div>

        <div className="flex gap-6 sm:mx-8">
          <div className="text-center">
            <p className="text-2xl font-semibold leading-none tracking-tight text-white">
              {TODAY_STATS.reviewCount}
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.06em] text-white/35">Từ ôn tập</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold leading-none tracking-tight text-white">
              {TODAY_STATS.newWords}
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.06em] text-white/35">Từ mới</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold leading-none tracking-tight text-white">
              {TODAY_STATS.estimatedMinutes}&apos;
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.06em] text-white/35">Ước tính</p>
          </div>
        </div>

        <Link
          href={ROUTES.FLASHCARDS}
          className="self-start whitespace-nowrap rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-neutral-100 sm:self-center"
        >
          Bắt đầu ôn tập →
        </Link>
      </div>
    </div>
  )
}
