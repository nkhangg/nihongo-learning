'use client'

import { cn } from '@shared/utils'

interface SaveBarProps {
  hasChanges: boolean
  onSave: () => void
  onDiscard: () => void
}

export function SaveBar({ hasChanges, onSave, onDiscard }: SaveBarProps) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 z-50 border-t border-border bg-background px-6 py-3',
        'flex items-center justify-end gap-3',
        // Desktop: offset left by sidebar width
        'lg:left-60',
        // Mobile: sit above bottom nav
        'bottom-16 lg:bottom-0',
        'transition-transform duration-200',
        hasChanges ? 'translate-y-0' : 'translate-y-[calc(100%+1px)]',
      )}
    >
      <span className="mr-auto text-[13px] text-muted-foreground">Bạn có thay đổi chưa lưu</span>
      <button
        type="button"
        onClick={onDiscard}
        className="rounded-sm border border-border bg-background px-4 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface"
      >
        Huỷ
      </button>
      <button
        type="button"
        onClick={onSave}
        className="rounded-sm bg-ink px-4 py-1.5 text-xs font-medium text-paper transition-colors hover:bg-ink-2"
      >
        Lưu thay đổi
      </button>
    </div>
  )
}
