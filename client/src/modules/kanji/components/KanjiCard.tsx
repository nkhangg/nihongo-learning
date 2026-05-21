'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@shared/utils'
import type { JlptLevel, KanjiListItem, KanjiStatus } from '../types'

const STATUS_COLORS: Record<KanjiStatus, string> = {
  known: 'border-[#0F8A72] bg-[#E8F7F4]',
  learning: 'border-[#C47D0E] bg-[#FEF6E4]',
  unseen: 'border-black/[.07] bg-white',
}

const STATUS_DOT: Record<KanjiStatus, string> = {
  known: 'bg-[#0F8A72]',
  learning: 'bg-[#C47D0E]',
  unseen: 'hidden',
}

interface KanjiCardProps {
  kanji: KanjiListItem
  interactive?: 'navigate' | 'select'
  selected?: boolean
  onSelect?: (kanji: KanjiListItem) => void
  size?: 'sm' | 'md'
}

export function KanjiCard({
  kanji,
  interactive = 'navigate',
  selected = false,
  onSelect,
  size = 'md',
}: KanjiCardProps) {
  const router = useRouter()

  const handleClick = () => {
    if (interactive === 'navigate') {
      router.push(`/kanji/${kanji.id}`)
    } else {
      onSelect?.(kanji)
    }
  }

  if (size === 'sm') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'relative flex aspect-square w-full flex-col items-center justify-center rounded-lg border-[1.5px] transition-all cursor-pointer',
          STATUS_COLORS[kanji.status],
          selected && 'ring-2 ring-[#1565C0] ring-offset-1',
          'hover:border-[#1565C0] hover:shadow-[0_0_0_3px_#E8F4FF]',
        )}
      >
        <span className={cn(STATUS_DOT[kanji.status], 'absolute top-1 right-1 h-1 w-1 rounded-full')} />
        <span className="text-[18px] font-bold leading-none">{kanji.char}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'relative flex aspect-square w-full flex-col items-center justify-center rounded-lg border-[1.5px] transition-all cursor-pointer gap-0.5',
        STATUS_COLORS[kanji.status],
        selected && 'ring-2 ring-[#1565C0] ring-offset-1',
        'hover:border-[#1565C0] hover:shadow-[0_0_0_3px_#E8F4FF] hover:-translate-y-px',
      )}
    >
      <span className={cn(STATUS_DOT[kanji.status], 'absolute top-1 right-1 h-[5px] w-[5px] rounded-full')} />
      <span className="text-[22px] leading-none">{kanji.char}</span>
      <span className="text-[9px] text-[#ADADB8] font-mono leading-none">
        {kanji.primaryKun ?? kanji.primaryOn ?? ''}
      </span>
    </button>
  )
}
