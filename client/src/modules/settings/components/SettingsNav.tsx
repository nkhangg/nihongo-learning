'use client'

import { BookOpen, Bell, Palette, Globe, Lock } from 'lucide-react'
import { cn } from '@shared/utils'
import type { SettingsSection } from '../types'

const NAV_ITEMS: { id: SettingsSection; icon: React.ElementType; label: string }[] = [
  { id: 'learning', icon: BookOpen, label: 'Học tập' },
  { id: 'notifications', icon: Bell, label: 'Thông báo' },
  { id: 'appearance', icon: Palette, label: 'Giao diện' },
  { id: 'language', icon: Globe, label: 'Ngôn ngữ' },
  { id: 'security', icon: Lock, label: 'Bảo mật' },
]

interface SettingsNavProps {
  active: SettingsSection
  onSelect: (id: SettingsSection) => void
}

export function SettingsNav({ active, onSelect }: SettingsNavProps) {
  return (
    <>
      {/* Desktop: vertical sticky card */}
      <div className="hidden lg:block">
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                'flex w-full items-center gap-2.5 border-b border-border px-4 py-3 text-left text-[13px] transition-colors last:border-b-0',
                'border-l-2',
                active === item.id
                  ? 'border-l-ink bg-surface font-medium text-foreground'
                  : 'border-l-transparent text-muted-foreground hover:bg-surface hover:text-foreground',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: horizontal scroll tabs */}
      <div className="flex overflow-x-auto border-b border-border lg:hidden">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-sm transition-colors',
              active === item.id
                ? 'border-ink font-medium text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </button>
        ))}
      </div>
    </>
  )
}
