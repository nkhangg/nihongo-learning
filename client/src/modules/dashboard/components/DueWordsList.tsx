'use client'

import Link from 'next/link'
import { cn } from '@shared/utils'
import { ROUTES } from '@config/routes'
import type { DueWord } from '../types'

const LEVEL_STYLES: Record<DueWord['level'], string> = {
  N5: 'bg-emerald-50 text-emerald-700',
  N4: 'bg-blue-50 text-blue-700',
  N3: 'bg-amber-50 text-amber-700',
  N2: 'bg-purple-50 text-purple-700',
  N1: 'bg-red-50 text-red-700',
}

const DUE_WORDS: DueWord[] = [
  { id: '1', kanji: '雨',    reading: 'あめ / ame',      meaning: 'mưa',           level: 'N5', urgent: true  },
  { id: '2', kanji: '桜',    reading: 'さくら / sakura',  meaning: 'hoa anh đào',   level: 'N5', urgent: true  },
  { id: '3', kanji: '電車',  reading: 'でんしゃ',         meaning: 'tàu điện',      level: 'N4', urgent: false },
  { id: '4', kanji: '難しい', reading: 'むずかしい',      meaning: 'khó',           level: 'N4', urgent: false },
  { id: '5', kanji: '経験',  reading: 'けいけん',         meaning: 'kinh nghiệm',   level: 'N3', urgent: false },
]
const REMAINING = 7

export function DueWordsList() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Từ cần ôn hôm nay</h3>
        <Link
          href={ROUTES.FLASHCARDS}
          className="text-xs text-muted-foreground transition hover:text-foreground"
        >
          Ôn tất cả →
        </Link>
      </div>

      <div className="flex flex-col gap-1.5">
        {DUE_WORDS.map((word) => (
          <div
            key={word.id}
            className={cn(
              'flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 transition hover:bg-muted/30',
              word.urgent && 'border-l-2 border-l-red-500',
            )}
          >
            <span className="w-9 shrink-0 font-mono text-base font-medium text-foreground">
              {word.kanji}
            </span>
            <span className="flex-1 truncate text-xs text-muted-foreground">{word.reading}</span>
            <span className="flex-1 truncate text-xs text-foreground/70">{word.meaning}</span>
            <span
              className={cn(
                'shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                LEVEL_STYLES[word.level],
              )}
            >
              {word.level}
            </span>
          </div>
        ))}

        <p className="py-2 text-center text-xs text-muted-foreground">+ {REMAINING} từ nữa</p>
      </div>
    </div>
  )
}
