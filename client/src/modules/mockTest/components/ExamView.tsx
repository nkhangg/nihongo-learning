'use client'

import { cn } from '@shared/utils'
import { Button } from '@shared/components/ui'
import { ChevronLeft } from 'lucide-react'
import type { Question, OptionId } from '../types'
import { QuestionPanel } from './QuestionPanel'
import { QuestionMap } from './QuestionMap'

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const SECTION_LABELS: Record<string, string> = {
  vocabulary: 'Từ vựng',
  grammar: 'Ngữ pháp',
  reading: 'Đọc hiểu',
}

interface SectionProgress {
  section: string
  label: string
  answered: number
  total: number
}

interface ExamViewProps {
  questions: Question[]
  currentIndex: number
  answers: Record<number, OptionId>
  flagged: Set<number>
  secondsLeft: number
  sectionProgress: SectionProgress[]
  progressPercent: number
  onExit: () => void
  onSelectAnswer: (questionId: number, optionId: OptionId) => void
  onGoTo: (index: number) => void
  onNext: () => void
  onPrev: () => void
  onToggleFlag: (questionId: number) => void
  onSubmit: () => void
}

export function ExamView({
  questions,
  currentIndex,
  answers,
  flagged,
  secondsLeft,
  sectionProgress,
  progressPercent,
  onExit,
  onSelectAnswer,
  onGoTo,
  onNext,
  onPrev,
  onToggleFlag,
  onSubmit,
}: ExamViewProps) {
  const currentQuestion = questions[currentIndex]
  const isUrgent = secondsLeft > 0 && secondsLeft < 300

  if (!currentQuestion) return null

  return (
    <div className="flex flex-col">
      {/* Exam header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm">Thoát</span>
          </Button>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold leading-none">
              Mock Test — {questions.length} câu
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              Câu {currentIndex + 1} / {questions.length} ·{' '}
              {SECTION_LABELS[currentQuestion.section]}
            </p>
          </div>
          <div
            className={cn(
              'flex-shrink-0 rounded-lg px-3 py-1.5 font-mono text-base font-medium transition-colors',
              isUrgent
                ? 'bg-red-50 text-red-600 dark:bg-red-950/30'
                : 'bg-muted text-foreground',
            )}
          >
            {formatTime(secondsLeft)}
          </div>
        </div>

        {/* Progress strip */}
        <div className="h-[3px] bg-muted">
          <div
            className="h-full bg-foreground transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-6">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px] lg:items-start">
            {/* Question */}
            <QuestionPanel
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              selectedAnswer={answers[currentQuestion.id]}
              isFlagged={flagged.has(currentQuestion.id)}
              onSelectAnswer={(optId) => onSelectAnswer(currentQuestion.id, optId)}
              onFlag={() => onToggleFlag(currentQuestion.id)}
              onPrev={onPrev}
              onNext={onNext}
              isFirst={currentIndex === 0}
              isLast={currentIndex === questions.length - 1}
            />

            {/* Map — sticky on desktop, inline on mobile */}
            <div className="lg:sticky lg:top-[5.5rem]">
              <QuestionMap
                questions={questions}
                currentIndex={currentIndex}
                answers={answers}
                flagged={flagged}
                sectionProgress={sectionProgress}
                onGoTo={onGoTo}
                onSubmit={onSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
