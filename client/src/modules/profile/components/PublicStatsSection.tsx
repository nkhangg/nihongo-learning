'use client'

import { useState } from 'react'
import { Switch, Skeleton } from '@shared/components/ui'
import { usePublicStats, useUpdatePublicVisibility } from '../hooks/useProfile'

export function PublicStatsSection() {
  const { data, isLoading } = usePublicStats()
  const { mutate: updateVisibility } = useUpdatePublicVisibility()
  const [isPublic, setIsPublic] = useState<boolean | undefined>(undefined)

  const visible = isPublic ?? data?.isPublic ?? true

  const handleToggle = (checked: boolean) => {
    setIsPublic(checked)
    updateVisibility({ isPublic: checked })
  }

  const stats = [
    { value: data?.studyDays ?? '—', label: 'Ngày học' },
    { value: data?.masteredWords ?? '—', label: 'Từ đã thuộc', color: 'text-emerald-600' },
    { value: data?.currentStreak !== undefined ? `🔥 ${data.currentStreak}` : '—', label: 'Streak hiện tại', color: 'text-amber-500' },
    { value: data?.bestStreak ?? '—', label: 'Streak kỷ lục' },
  ]

  return (
    <div className="bg-white border border-black/[.07] rounded-2xl overflow-hidden mb-5">
      <div className="px-5 py-4 border-b border-black/[.07]">
        <p className="text-[13px] font-semibold">Thống kê công khai</p>
      </div>
      <div className="p-5">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {stats.map((s) => (
              <div key={s.label} className="bg-zinc-50 rounded-xl p-3.5 text-center">
                <div className={`text-xl font-semibold tracking-tight mb-0.5 ${s.color ?? ''}`}>
                  {s.value}
                </div>
                <div className="text-[10px] text-zinc-500">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/[.07]">
          <p className="text-xs text-zinc-500">Cho phép mọi người xem thống kê của bạn</p>
          <div className="flex items-center gap-2">
            <Switch checked={visible} onCheckedChange={handleToggle} />
            <span className="text-xs font-medium">{visible ? 'Bật' : 'Tắt'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
