'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid,
  Layers,
  PenLine,
  BookOpen,
  Sparkles,
  Trophy,
  NotebookPen,
  BarChart2,
  User,
  Settings,
  CreditCard,
  LogOut,
  Flame,
  Bell,
  Hand,
} from 'lucide-react'
import { cn } from '@shared/utils'
import { ROUTES } from '@config/routes'
import { useLogout, useCurrentUser } from '@modules/auth'
import { ConfirmDialog } from '@shared/components/ui'
import type { BrandLogo } from '@modules/config'

type NavItem = {
  href: string | null
  label: string
  icon: React.ElementType
  badge?: string
  badgeVariant?: 'count' | 'new'
  disabled?: boolean
}

type NavSection = {
  label: string
  items: NavItem[]
}

function KanjiIcon({ className }: { className?: string }) {
  return <span className="font-mono font-bold text-[13px] w-4 text-center shrink-0">字</span>
}

const navSections: NavSection[] = [
  {
    label: 'HỌC TẬP',
    items: [
      { href: ROUTES.DASHBOARD, label: 'Tổng quan', icon: LayoutGrid },
      { href: ROUTES.FLASHCARDS, label: 'Flashcard', icon: Layers, badge: '12', badgeVariant: 'count' },
      { href: ROUTES.GRAMMAR, label: 'Ngữ pháp', icon: PenLine },
      { href: ROUTES.KANJI, label: 'Kanji', icon: KanjiIcon },
      { href: null, label: 'Đọc hiểu', icon: BookOpen, disabled: true },
      { href: null, label: 'AI Sensei', icon: Sparkles, disabled: true },
    ],
  },
  {
    label: 'KIỂM TRA',
    items: [
      { href: ROUTES.MOCK_TEST, label: 'Mock Test JLPT', icon: Trophy, badge: 'Mới', badgeVariant: 'new' },
      { href: null, label: 'Nhật ký viết', icon: NotebookPen, disabled: true },
    ],
  },
  {
    label: 'TÀI KHOẢN',
    items: [
      { href: ROUTES.PROGRESS, label: 'Tiến độ', icon: BarChart2 },
      { href: ROUTES.PROFILE, label: 'Hồ sơ', icon: User },
      { href: ROUTES.SETTINGS, label: 'Cài đặt', icon: Settings },
      { href: ROUTES.BILLING, label: 'Nâng cấp Pro', icon: CreditCard },
    ],
  },
]

const mobileNavItems: NavItem[] = [
  { href: ROUTES.DASHBOARD, label: 'Tổng quan', icon: LayoutGrid },
  { href: ROUTES.FLASHCARDS, label: 'Flashcard', icon: Layers },
  { href: ROUTES.GRAMMAR, label: 'Ngữ pháp', icon: PenLine },
  { href: ROUTES.MOCK_TEST, label: 'Mock Test', icon: Trophy },
  { href: ROUTES.PROFILE, label: 'Hồ sơ', icon: User },
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Chào buổi sáng'
  if (hour < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
}

function NavItemLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = item.href !== null && pathname === item.href

  const content = (
    <>
      <item.icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none',
            item.badgeVariant === 'new'
              ? 'bg-amber-light text-amber'
              : 'bg-vermillion text-white',
          )}
        >
          {item.badge}
        </span>
      )}
    </>
  )

  if (item.disabled) {
    return (
      <span className="flex cursor-default items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground/50">
        {content}
      </span>
    )
  }

  return (
    <Link
      href={item.href!}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-ink text-paper'
          : 'text-ink-3 hover:bg-surface hover:text-ink',
      )}
    >
      {content}
    </Link>
  )
}

function UserAvatar({ name }: { name?: string }) {
  const initials = name
    ? name
        .split(' ')
        .slice(-2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : '?'

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-vermillion text-xs font-bold text-white">
      {initials}
    </div>
  )
}

function BrandMark({ logo }: { logo: BrandLogo }) {
  return (
    <Link
      href={logo.href ?? ROUTES.DASHBOARD}
      className="flex items-center gap-2.5 no-underline"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-paper">
        <span className="font-mono text-sm font-medium">{logo.mark}</span>
      </div>
      <span className="text-base font-bold text-foreground">{logo.text}</span>
    </Link>
  )
}

export function AppShell({
  children,
  logo,
}: {
  children: React.ReactNode
  logo: BrandLogo
}) {
  const pathname = usePathname()
  const { logout, isLoggingOut } = useLogout()
  const { user } = useCurrentUser()
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Desktop full-width top header */}
      <header className="hidden h-14 shrink-0 items-center border-b border-border lg:flex">
        <div className="flex h-full w-60 shrink-0 items-center border-r border-border bg-background px-4">
          <BrandMark logo={logo} />
        </div>
        <div className="flex flex-1 items-center justify-between bg-background px-6">
          <div className="flex items-center gap-1.5 text-sm text-foreground">
            <span>
              {getGreeting()},{' '}
              <span className="font-semibold">{user?.name ?? 'bạn'}</span>
            </span>
            <Hand className="h-4 w-4 text-amber" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-vermillion/10 px-3 py-1.5 text-xs font-semibold text-vermillion">
              <Flame className="h-3.5 w-3.5" />
              <span>-- ngày</span>
            </div>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
            </button>
            <UserAvatar name={user?.name} />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop only */}
        <aside className="hidden w-60 flex-col border-r border-border bg-background lg:flex">
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {navSections.map((section) => (
              <div key={section.label} className="mb-4">
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <NavItemLink key={item.label} item={item} pathname={pathname} />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-border px-3 py-3">
            <button
              type="button"
              onClick={() => setLogoutConfirmOpen(true)}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-muted"
            >
              <UserAvatar name={user?.name} />
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium text-foreground">
                  {user?.name ?? user?.email ?? 'Người dùng'}
                </p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <LogOut className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </div>
        </aside>

        {/* Mobile top header */}
        <header className="fixed inset-x-0 top-0 z-20 flex h-14 items-center border-b border-border bg-background px-4 lg:hidden">
          <BrandMark logo={logo} />
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pt-14 pb-16 lg:pt-0 lg:pb-0">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background lg:hidden">
          <div className="flex">
            {mobileNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href!}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
                  pathname === item.href
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      <ConfirmDialog
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={() => {
          setLogoutConfirmOpen(false)
          logout()
        }}
        title="Đăng xuất"
        description="Bạn có chắc muốn đăng xuất khỏi tài khoản này?"
        confirmLabel="Đăng xuất"
        cancelLabel="Huỷ"
        variant="danger"
        loading={isLoggingOut}
      />
    </div>
  )
}
