'use client'

import type { WeakWord } from '../types'

interface Props {
  words: WeakWord[]
}

function RetentionBar({ rate }: { rate: number }) {
  const color = rate < 40 ? '#E8334A' : rate < 55 ? '#C47D0E' : '#0F8A72'
  return (
    <div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{ width: `${rate}%`, backgroundColor: color }}
        />
      </div>
      <div className="mt-0.5 font-mono text-[10px]" style={{ color }}>
        {rate}%
      </div>
    </div>
  )
}

export function ProgressWeakWords({ words }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <div className="text-sm font-semibold text-foreground">Từ cần ôn lại nhiều nhất</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            Tỉ lệ nhớ thấp — ưu tiên luyện tập
          </div>
        </div>
        <button className="rounded-lg bg-red-500 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-red-600">
          Ôn tập ngay
        </button>
      </div>

      {/* Table — scroll on mobile */}
      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_90px_80px_72px] gap-2 bg-muted px-5 py-2.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <div>Từ vựng</div>
            <div>Tỉ lệ nhớ</div>
            <div>Đã ôn</div>
            <div>Hành động</div>
          </div>

          {/* Rows */}
          {words.map((word) => (
            <div
              key={word.id}
              className="grid grid-cols-[1fr_90px_80px_72px] items-center gap-2 border-t border-border px-5 py-3.5 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[15px] font-medium text-foreground">
                  {word.japanese}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {word.meaning} · {word.level}
                </span>
              </div>
              <RetentionBar rate={word.retentionRate} />
              <div className="font-mono text-xs text-foreground/70">{word.reviewCount} lần</div>
              <div>
                <button className="rounded-md bg-red-500 px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-red-600">
                  Ôn
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
