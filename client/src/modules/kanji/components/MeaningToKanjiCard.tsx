'use client'

import { cn } from '@shared/utils'
import type { KanjiQuizAnswerResult, KanjiQuizQuestion } from '../types'

interface MeaningToKanjiCardProps {
  question: KanjiQuizQuestion
  result: KanjiQuizAnswerResult | null
  onAnswer: (optionId: string) => void
  isLoading?: boolean
}

export function MeaningToKanjiCard({ question, result, onAnswer, isLoading }: MeaningToKanjiCardProps) {
  return (
    <div className="space-y-6">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#ADADB8] text-center">Nghĩa</p>
      <p className="text-[26px] font-bold text-[#0D0D0F] text-center tracking-tight">
        {question.meaningPrompt ?? question.kanji.meaningVi}
      </p>

      <div className="grid grid-cols-4 gap-2 justify-items-center">
        {(question.options ?? []).map((opt) => {
          const isCorrect = result && opt.id === question.correctOptionId
          return (
            <button
              key={opt.id}
              type="button"
              disabled={!!result || isLoading}
              onClick={() => onAnswer(opt.id)}
              className={cn(
                'rounded-[14px] border-2 p-3 text-center transition-all w-20 h-20 flex items-center justify-center',
                result
                  ? isCorrect
                    ? 'border-[#0F8A72] bg-[#E8F7F4]'
                    : 'border-[#E8E8E4] bg-[#F2F2EF] opacity-50'
                  : 'border-black/[.13] bg-white hover:border-[#1565C0] hover:bg-[#E8F4FF] cursor-pointer',
              )}
            >
              <span className="text-[30px] leading-none font-bold text-[#0D0D0F]">{opt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
