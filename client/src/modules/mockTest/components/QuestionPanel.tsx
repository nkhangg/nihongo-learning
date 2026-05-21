'use client'

import { cn } from '@shared/utils'
import { Button, Badge } from '@shared/components/ui'
import { Flag, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Question, OptionId } from '../types'

const SECTION_LABELS: Record<string, string> = {
  vocabulary: 'Từ vựng',
  grammar: 'Ngữ pháp',
  reading: 'Đọc hiểu',
}

const SECTION_ICONS: Record<string, string> = {
  vocabulary: '📚',
  grammar: '✏️',
  reading: '📖',
}

interface QuestionPanelProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  selectedAnswer?: OptionId
  isFlagged: boolean
  onSelectAnswer: (optionId: OptionId) => void
  onFlag: () => void
  onPrev: () => void
  onNext: () => void
  isFirst: boolean
  isLast: boolean
}

export function QuestionPanel({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  isFlagged,
  onSelectAnswer,
  onFlag,
  onPrev,
  onNext,
  isFirst,
  isLast,
}: QuestionPanelProps) {
  const revealed = selectedAnswer !== undefined

  const getOptClass = (optId: OptionId) => {
    if (!revealed) return ''
    if (optId === question.correctId) return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
    if (optId === selectedAnswer && optId !== question.correctId)
      return 'border-red-500 bg-red-50 dark:bg-red-950/30'
    return 'opacity-60'
  }

  const getLetterClass = (optId: OptionId) => {
    if (!revealed) return 'bg-muted text-muted-foreground'
    if (optId === question.correctId) return 'bg-emerald-500 text-white'
    if (optId === selectedAnswer && optId !== question.correctId) return 'bg-red-500 text-white'
    return 'bg-muted text-muted-foreground'
  }

  const jpParts = question.underlinedWord ? question.jpText.split(question.underlinedWord) : null

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Câu {questionNumber} / {totalQuestions}
        </span>
        <Badge variant="secondary" className="gap-1.5 text-[11px]">
          <span>{SECTION_ICONS[question.section]}</span>
          {SECTION_LABELS[question.section]}
        </Badge>
      </div>

      {/* Question text */}
      <p className="mb-3 text-sm leading-relaxed text-foreground">{question.text}</p>

      {/* Japanese sentence */}
      <div className="mb-5 rounded-lg border-l-[3px] border-border bg-muted/50 px-4 py-3">
        <p className="text-lg font-light leading-relaxed tracking-wide">
          {jpParts ? (
            <>
              {jpParts[0]}
              <span className="border-b-2 border-foreground pb-px font-normal">
                {question.underlinedWord}
              </span>
              {jpParts[1]}
            </>
          ) : (
            question.jpText
          )}
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {question.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => !revealed && onSelectAnswer(opt.id)}
            disabled={revealed}
            className={cn(
              'flex items-start gap-3 rounded-xl border border-border/70 bg-background px-4 py-3 text-left transition-all',
              !revealed && 'cursor-pointer hover:border-border hover:bg-muted/40',
              selectedAnswer === opt.id && !revealed && 'border-foreground',
              revealed && 'cursor-default',
              getOptClass(opt.id),
            )}
          >
            <span
              className={cn(
                'mt-px flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors',
                selectedAnswer === opt.id && !revealed ? 'bg-foreground text-background' : '',
                revealed ? getLetterClass(opt.id) : 'bg-muted text-muted-foreground',
              )}
            >
              {opt.id}
            </span>
            <span className="text-sm leading-relaxed text-foreground">{opt.text}</span>
          </button>
        ))}
      </div>

      {/* Explanation */}
      {revealed && (
        <div className="mt-4 rounded-lg border-l-[3px] border-amber-400 bg-amber-50 px-4 py-3 dark:bg-amber-950/20">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-amber-600">
            Giải thích
          </p>
          <p className="text-sm leading-relaxed text-foreground/80">{question.explanation}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onFlag}
          className={cn(
            'gap-1.5 text-xs',
            isFlagged ? 'text-amber-600 hover:text-amber-700' : 'text-muted-foreground',
          )}
        >
          <Flag className="h-3.5 w-3.5" />
          {isFlagged ? 'Đã đánh dấu' : 'Đánh dấu'}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onPrev} disabled={isFirst} className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Trước</span>
          </Button>
          <Button size="sm" onClick={onNext} disabled={isLast} className="gap-1">
            <span className="hidden sm:inline">Tiếp theo</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
