'use client'

import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils'
import type { KanjiQuizAnswerResult, KanjiQuizQuestion } from '../types'

interface RecognitionCardProps {
  question: KanjiQuizQuestion
  result: KanjiQuizAnswerResult | null
  onAnswer: (optionId: string) => void
  isLoading?: boolean
}

export function RecognitionCard({ question, result, onAnswer, isLoading }: RecognitionCardProps) {
  const { t } = useTranslation('kanji')

  return (
    <div className="space-y-6">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#ADADB8] text-center">Chọn đáp án đúng</p>

      <div className="text-[88px] text-center leading-none text-[#0D0D0F]">{question.kanji.char}</div>

      {question.contextSentenceHtml && (
        <p
          className="text-[15px] text-[#7A7A85] text-center leading-relaxed [&_em]:text-[#1565C0] [&_em]:font-semibold [&_em]:not-italic"
          dangerouslySetInnerHTML={{ __html: question.contextSentenceHtml }}
        />
      )}

      <div className="grid grid-cols-2 gap-2">
        {(question.options ?? []).map((opt) => {
          const isCorrect = result && opt.id === question.correctOptionId
          const isSelected = result && !result.correct && false
          return (
            <button
              key={opt.id}
              type="button"
              disabled={!!result || isLoading}
              onClick={() => onAnswer(opt.id)}
              className={cn(
                'rounded-[14px] border-2 px-4 py-3 text-center text-[15px] font-semibold font-mono transition-all',
                result
                  ? opt.id === question.correctOptionId
                    ? 'border-[#0F8A72] bg-[#E8F7F4] text-[#0F8A72]'
                    : 'border-[#E8E8E4] bg-[#F2F2EF] text-[#ADADB8]'
                  : 'border-black/[.13] bg-white text-[#0D0D0F] hover:border-[#1565C0] hover:bg-[#E8F4FF] cursor-pointer',
              )}
            >
              <span>{opt.label}</span>
              {opt.subLabel && (
                <span className={cn('block text-[11px] font-normal mt-0.5', result && opt.id === question.correctOptionId ? 'text-[#0F8A72]' : 'text-[#ADADB8]')}>
                  {opt.subLabel}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
