'use client'

import { cn } from '@shared/utils'
import { QUIZ_DATA } from '../types'

interface QuizStepProps {
  quizIndex: number
  answers: (number | undefined)[]
  onAnswer: (optIndex: number) => void
  onNext: () => void
  onBack: () => void
}

export function QuizStep({ quizIndex, answers, onAnswer, onNext, onBack }: QuizStepProps) {
  const question = QUIZ_DATA[quizIndex]
  const userAnswer = answers[quizIndex]
  const isAnswered = userAnswer !== undefined
  const isCorrect = userAnswer === question.ans
  const isLast = quizIndex === QUIZ_DATA.length - 1

  return (
    <div className="animate-fade-up">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-[13px] text-muted-foreground mb-5 hover:text-foreground transition-colors cursor-pointer"
      >
        ← Quay lại
      </button>

      <div className="flex items-center gap-1.5 mb-3">
        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
        <span className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground">
          Kiểm tra nhanh
        </span>
      </div>

      <h1 className="text-[32px] font-light tracking-tight leading-[1.15] mb-2.5">
        Làm vài câu để<br />
        <strong className="font-semibold">xác nhận trình độ</strong>
      </h1>

      <div className="font-mono text-[11px] text-muted-foreground text-right mb-3">
        {quizIndex + 1} / {QUIZ_DATA.length} câu
      </div>

      <div className="bg-card border border-border rounded-xl p-6 sm:p-8 mb-5">
        <div className="text-[10px] font-medium tracking-[0.1em] uppercase text-muted-foreground mb-5">
          Cấp độ {question.level}
        </div>

        {question.jp && (
          <div className="text-[36px] font-light tracking-[2px] text-center pb-4 text-foreground leading-tight">
            {question.jp}
          </div>
        )}
        {question.jp && question.reading && (
          <div className="font-mono text-[13px] text-muted-foreground text-center mb-5">
            {question.reading}
          </div>
        )}

        <div
          className={cn(
            'mb-4 leading-snug',
            question.jp
              ? 'text-[14px] text-muted-foreground'
              : 'text-[20px] font-normal text-foreground',
          )}
        >
          {question.q}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
          {question.opts.map((opt, i) => {
            const isThisCorrect = i === question.ans
            const isThisWrong = isAnswered && i === userAnswer && userAnswer !== question.ans

            return (
              <button
                key={i}
                type="button"
                onClick={() => !isAnswered && onAnswer(i)}
                className={cn(
                  'border-[1.5px] rounded-lg py-3.5 px-4 transition-all duration-150 font-sans text-[14px] text-left font-normal',
                  !isAnswered &&
                    'border-border bg-card text-foreground hover:border-muted-foreground hover:bg-surface cursor-pointer',
                  isAnswered && !isThisCorrect && !isThisWrong &&
                    'border-border bg-card text-muted-foreground cursor-default',
                  isAnswered && isThisCorrect &&
                    'border-pine bg-pine-light text-pine cursor-default',
                  isAnswered && isThisWrong &&
                    'border-vermillion bg-vermillion-light text-vermillion cursor-default',
                )}
              >
                {opt}
              </button>
            )
          })}
        </div>

        {isAnswered && (
          <div
            className={cn(
              'text-[13px] px-4 py-3 rounded-lg mt-4',
              isCorrect ? 'bg-pine-light text-pine' : 'bg-vermillion-light text-vermillion',
            )}
          >
            {isCorrect
              ? `✓ Chính xác! ${question.opts[question.ans]}`
              : `✗ Đáp án đúng: ${question.opts[question.ans]}`}
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={!isAnswered}
        onClick={onNext}
        className="w-full py-3.5 bg-foreground text-background rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 hover:opacity-90 hover:-translate-y-px disabled:opacity-35 disabled:cursor-not-allowed disabled:translate-y-0"
      >
        {isLast ? 'Xem kết quả →' : 'Câu tiếp theo →'}
      </button>
    </div>
  )
}
