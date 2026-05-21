'use client'

import { ChevronDown } from 'lucide-react'
import { Button } from '@shared/components/ui'
import { cn } from '@shared/utils'
import type { GrammarLesson, JLPTLevel } from '../types'

const LEVEL_BAR_COLOR: Record<JLPTLevel, string> = {
  n5: 'bg-teal-500',
  n4: 'bg-blue-500',
  n3: 'bg-amber-500',
  n2: 'bg-red-500',
  n1: 'bg-foreground',
}

const LEVEL_BADGE: Record<JLPTLevel, string> = {
  n5: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  n4: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  n3: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  n2: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
  n1: 'bg-foreground text-background',
}

interface GrammarCardProps {
  lesson: GrammarLesson
  isOpen: boolean
  onToggle: () => void
  onAddFlashcard: (id: string) => void
  isAddingFlashcard?: boolean
}

export function GrammarCard({
  lesson,
  isOpen,
  onToggle,
  onAddFlashcard,
  isAddingFlashcard,
}: GrammarCardProps) {
  return (
    <div
      className={cn(
        'relative cursor-pointer overflow-hidden rounded-xl border bg-card transition-all',
        isOpen
          ? 'border-foreground/30 shadow-sm'
          : 'border-border hover:border-border/80 hover:shadow-xs',
      )}
      onClick={onToggle}
    >
      {/* left color bar */}
      <div className={cn('absolute left-0 top-0 bottom-0 w-[3px]', LEVEL_BAR_COLOR[lesson.level])} />

      <div className="flex items-start gap-2.5 pl-4 pr-4 pt-3.5 pb-3.5">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[15px] font-medium text-foreground mb-0.5">
            {lesson.pattern}
          </p>
          <p className="text-[13px] text-foreground/70 mb-1.5">{lesson.meaning}</p>
          <div className="flex flex-wrap gap-1">
            {lesson.types.map((type) => (
              <span
                key={type}
                className="rounded-[4px] bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', LEVEL_BADGE[lesson.level])}>
            {lesson.level.toUpperCase()}
          </span>
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 text-muted-foreground transition-transform duration-200',
              isOpen && 'rotate-180',
            )}
          />
        </div>
      </div>

      {isOpen && (
        <div
          className="px-4 pb-3.5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-3 rounded-lg bg-muted px-3 py-2 font-mono text-[13px] text-foreground/70">
            {lesson.structure}
          </div>

          <div className="mb-3 flex flex-col gap-1.5">
            {lesson.examples.map((ex, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-r-lg border-l-2 bg-muted px-3 py-2',
                  ex.isWrong ? 'border-red-300' : 'border-border',
                )}
              >
                <p className={cn('text-[14px] leading-relaxed mb-0.5', ex.isWrong && 'text-red-500')}>
                  {ex.japanese}
                </p>
                <p className={cn('text-[12px]', ex.isWrong ? 'text-red-400' : 'text-muted-foreground')}>
                  {ex.vietnamese}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => onAddFlashcard(lesson.id)}
              disabled={isAddingFlashcard}
            >
              + Flashcard
            </Button>
            <Button
              size="sm"
              className="h-7 px-3 text-xs bg-teal-600 hover:bg-teal-700 text-white"
            >
              Bài tập →
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
