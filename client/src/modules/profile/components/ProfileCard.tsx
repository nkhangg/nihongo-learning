'use client'

import Link from 'next/link'
import { Skeleton } from '@shared/components/ui'
import { ROUTES } from '@shared/constants'
import { useLogout } from '@modules/auth'
import type { UserProfile, UserStats } from '../types'

const LEVEL_LABEL: Record<string, string> = {
  N5: 'Đang học N5',
  N4: 'Đang học N4',
  N3: 'Đang học N3',
  N2: 'Đang học N2',
  N1: 'Đang học N1',
}

interface ProfileCardProps {
  profile: UserProfile | undefined
  stats: UserStats | undefined
  isLoading: boolean
}

export function ProfileCard({ profile, stats, isLoading }: ProfileCardProps) {
  const { logout } = useLogout()

  const initials = profile
    ? `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`
    : '??'

  if (isLoading) {
    return (
      <div className="bg-white border border-black/[.07] rounded-2xl overflow-hidden">
        <div className="h-20 bg-zinc-900 rounded-t-2xl" />
        <div className="px-5 pt-10 pb-5 flex flex-col items-center gap-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-3 w-full gap-2 pt-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <Skeleton className="h-5 w-10" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-black/[.07] rounded-2xl overflow-hidden">
      {/* Cover */}
      <div className="h-20 bg-gradient-to-br from-zinc-900 to-zinc-700 relative rounded-t-2xl">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <div className="size-[60px] rounded-full bg-emerald-50 border-[3px] border-white flex items-center justify-center text-xl font-semibold text-emerald-700 cursor-pointer relative overflow-hidden group">
            <span>{initials}</span>
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-base">
              📷
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pt-10 pb-5 text-center">
        <p className="text-[17px] font-semibold tracking-tight mb-0.5">
          {profile?.firstName} {profile?.lastName}
        </p>
        <p className="font-mono text-[11px] text-zinc-400 mb-3">
          @{profile?.username} · {profile?.location}
        </p>
        <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[11px] font-semibold mb-4">
          🎯 {LEVEL_LABEL[profile?.currentLevel ?? 'N3']}
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed mb-4 pb-4 border-b border-black/[.07]">
          {profile?.bio}
        </p>

        {/* Mini stats */}
        <div className="grid grid-cols-3 divide-x divide-black/[.07]">
          <div className="py-2 text-center">
            <div className="text-[17px] font-semibold tracking-tight">{stats?.masteredWords ?? '—'}</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Từ thuộc</div>
          </div>
          <div className="py-2 text-center">
            <div className="text-[17px] font-semibold tracking-tight text-amber-500">🔥{stats?.currentStreak ?? '—'}</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Streak</div>
          </div>
          <div className="py-2 text-center">
            <div className="text-[17px] font-semibold tracking-tight text-emerald-600">{stats?.retentionRate ?? '—'}%</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Tỉ lệ nhớ</div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="px-5 pb-4 border-t border-black/[.07] pt-3 flex flex-col gap-0.5">
        <Link
          href={ROUTES.PROFILE}
          className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium text-zinc-900 bg-zinc-100"
        >
          👤 Chỉnh sửa hồ sơ
        </Link>
        <Link
          href={ROUTES.SETTINGS}
          className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
        >
          ⚙️ Cài đặt tài khoản
        </Link>
        <Link
          href={ROUTES.BILLING}
          className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
        >
          💳 Gói đăng ký
        </Link>
        <Link
          href={ROUTES.PROGRESS}
          className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
        >
          📊 Xem tiến độ
        </Link>
        <button
          type="button"
          onClick={() => logout()}
          className="flex items-center gap-2 px-2 py-2 mt-1 pt-3 border-t border-black/[.07] rounded-lg text-xs text-red-500 hover:bg-red-50 transition-colors w-full text-left"
        >
          ← Đăng xuất
        </button>
      </div>
    </div>
  )
}
