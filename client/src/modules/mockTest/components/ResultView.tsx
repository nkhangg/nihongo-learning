'use client'

import { cn } from '@shared/utils'
import { Button } from '@shared/components/ui'
import type { ExamResult } from '../types'
import { ScoreRing } from './ScoreRing'

const COLOR_CLASSES: Record<string, { text: string; bar: string; dot: string }> = {
  teal: { text: 'text-emerald-600', bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
  amber: { text: 'text-amber-600', bar: 'bg-amber-500', dot: 'bg-amber-500' },
  red: { text: 'text-red-500', bar: 'bg-red-500', dot: 'bg-red-500' },
}

interface ResultViewProps {
  result: ExamResult
  onRetake: () => void
  onReview: () => void
}

export function ResultView({ result, onRetake, onReview }: ResultViewProps) {
  const { totalScore, maxScore, passed, breakdown, weaknesses, improvedBy, needMorePoints } = result

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      {/* Score */}
      <div className="mb-6 text-center sm:mb-8">
        <div className="mb-4 flex justify-center">
          <ScoreRing score={totalScore} maxScore={maxScore} passed={passed} size={120} />
        </div>
        <h2 className="mb-1 text-xl font-semibold tracking-tight sm:text-2xl">
          {passed ? 'Đạt ✓' : 'Chưa đạt'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {passed
            ? 'Chúc mừng! Bạn đã vượt qua ngưỡng điểm đậu.'
            : needMorePoints > 0
              ? `Cần thêm ${needMorePoints} điểm để đậu${improvedBy > 0 ? ` · Cải thiện ${improvedBy} điểm so với lần trước 🎉` : ''}`
              : 'Tiếp tục luyện tập để cải thiện điểm số.'}
        </p>
      </div>

      {/* Section breakdown */}
      {breakdown.length > 0 && (
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {breakdown.map((bd) => {
            const colors = COLOR_CLASSES[bd.color] ?? COLOR_CLASSES.teal
            return (
              <div
                key={bd.section}
                className="rounded-xl border border-border bg-card p-4 text-center"
              >
                <div className={cn('text-xl font-semibold tracking-tight', colors.text)}>
                  {bd.score}/{bd.maxScore}
                </div>
                <div className="mb-2 mt-0.5 text-[11px] text-muted-foreground">{bd.label}</div>
                <div className="h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn('h-full rounded-full transition-all', colors.bar)}
                    style={{ width: `${bd.percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Weakness analysis */}
      {weaknesses.length > 0 && (
        <div className="mb-5 rounded-xl border border-border bg-card p-4 sm:p-5">
          <p className="mb-4 text-sm font-semibold">Phân tích điểm yếu cần cải thiện</p>
          <div className="flex flex-col gap-2">
            {weaknesses.map((item) => {
              const colors = COLOR_CLASSES[item.color] ?? COLOR_CLASSES.teal
              return (
                <div key={item.text} className="flex items-center gap-3 py-1">
                  <span className={cn('h-2 w-2 flex-shrink-0 rounded-full', colors.dot)} />
                  <span className="flex-1 text-sm text-foreground/80">{item.text}</span>
                  <span className={cn('font-mono text-xs font-medium', colors.text)}>
                    {item.percentage}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" className="flex-1 justify-center" onClick={onReview}>
          Xem lại đáp án
        </Button>
        <Button className="flex-1 justify-center" onClick={onRetake}>
          Ôn luyện điểm yếu →
        </Button>
      </div>
    </div>
  )
}
