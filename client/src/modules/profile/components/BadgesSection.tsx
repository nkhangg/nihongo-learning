'use client'

import { Skeleton } from '@shared/components/ui'
import { cn } from '@shared/utils'
import { useProfileBadges } from '../hooks/useProfile'

export function BadgesSection() {
  const { data: badges, isLoading } = useProfileBadges()

  const unlocked = badges?.filter((b) => !b.locked).length ?? 0
  const total = badges?.length ?? 0

  return (
    <div className="bg-white border border-black/[.07] rounded-2xl overflow-hidden mb-5">
      <div className="px-5 py-4 border-b border-black/[.07]">
        <p className="text-[13px] font-semibold">Thành tích &amp; Huy hiệu</p>
        {!isLoading && (
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {unlocked} / {total} huy hiệu đã mở khoá
          </p>
        )}
      </div>
      <div className="p-5">
        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
            {badges?.map((badge) => (
              <div
                key={badge.id}
                className={cn(
                  'text-center p-3 rounded-xl border border-black/[.07] bg-white transition-colors',
                  badge.locked ? 'opacity-35' : 'hover:border-black/[.13]',
                )}
              >
                <div className="text-[28px] mb-1">{badge.icon}</div>
                <div className="text-[10px] font-medium text-zinc-900 leading-tight">{badge.name}</div>
                <div className="text-[9px] text-zinc-400 mt-0.5">{badge.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
