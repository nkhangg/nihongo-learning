'use client'

import { cn } from '@shared/utils'
import { Button } from '@shared/components/ui'
import type { OptionId } from '../types'

interface SectionProgress {
  section: string
  label: string
  answered: number
  total: number
}

interface QuestionMapProps {
  questions: { id: number }[]
  currentIndex: number
  answers: Record<number, OptionId>
  flagged: Set<number>
  sectionProgress: SectionProgress[]
  onGoTo: (index: number) => void
  onSubmit: () => void
}

export function QuestionMap({
  questions,
  currentIndex,
  answers,
  flagged,
  sectionProgress,
  onGoTo,
  onSubmit,
}: QuestionMapProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        Bản đồ câu hỏi
      </p>

      {/* Dot grid */}
      <div className="mb-4 grid grid-cols-5 gap-1 sm:grid-cols-7 lg:grid-cols-5">
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIndex
          const isAnswered = answers[q.id] !== undefined
          const isFlagged = flagged.has(q.id)

          return (
            <button
              key={q.id}
              onClick={() => onGoTo(idx)}
              className={cn(
                'aspect-square rounded-md border text-[10px] font-medium transition-all',
                isCurrent && 'border-foreground bg-foreground text-background',
                !isCurrent &&
                  isAnswered &&
                  !isFlagged &&
                  'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30',
                !isCurrent &&
                  isFlagged &&
                  'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/30',
                !isCurrent &&
                  !isAnswered &&
                  !isFlagged &&
                  'border-border bg-background text-muted-foreground hover:border-foreground/30',
              )}
            >
              {idx + 1}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-col gap-1.5">
        {[
          { color: 'bg-foreground', label: 'Hiện tại' },
          { color: 'bg-emerald-100 border border-emerald-400', label: 'Đã trả lời' },
          { color: 'bg-amber-100 border border-amber-400', label: 'Đánh dấu' },
          { color: 'bg-muted border border-border', label: 'Chưa làm' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span className={cn('h-2.5 w-2.5 flex-shrink-0 rounded-sm', color)} />
            <span className="text-[11px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Section progress */}
      {sectionProgress.length > 0 && (
        <div className="border-t border-border pt-3">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Tiến độ theo phần
          </p>
          <div className="flex flex-col gap-1">
            {sectionProgress.map((sp) => (
              <div key={sp.section} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{sp.label}</span>
                <span className="font-mono text-[11px] text-foreground/70">
                  {sp.answered} / {sp.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <Button
        variant="destructive"
        size="sm"
        className="mt-4 w-full justify-center"
        onClick={onSubmit}
      >
        Nộp bài
      </Button>
    </div>
  )
}
