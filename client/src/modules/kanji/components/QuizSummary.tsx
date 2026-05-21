'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { RotateCcw, ArrowLeft, Trophy } from 'lucide-react'
import { ROUTES } from '@shared/constants'
import type { KanjiQuizSummary } from '../types'

interface QuizSummaryProps {
  summary: KanjiQuizSummary
  onRetry: () => void
}

export function QuizSummary({ summary, onRetry }: QuizSummaryProps) {
  const { t } = useTranslation('kanji')

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-5">
        <div className="bg-white border-[1.5px] border-black/[.07] rounded-[20px] p-8 text-center shadow-[0_4px_12px_rgba(0,0,0,.08)]">
          {/* Badge */}
          <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#C47D0E] to-[#f59e0b] flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-9 w-9 text-white" />
          </div>

          <h2 className="text-[20px] font-bold text-[#0D0D0F] tracking-tight mb-1">{t('quiz.summary.title')}</h2>
          <p className="text-[13px] text-[#7A7A85] mb-6">
            {summary.totalQuestions} câu · {Math.floor(summary.durationSec / 60)}:{String(summary.durationSec % 60).padStart(2, '0')}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2.5 mb-6">
            {[
              { label: t('quiz.summary.correct'), value: summary.correct, color: '#0F8A72' },
              { label: t('quiz.summary.wrong'), value: summary.wrong, color: '#E8334A' },
              { label: t('quiz.summary.accuracy'), value: `${summary.accuracy}%`, color: '#1565C0' },
              { label: t('quiz.summary.xpEarned'), value: `+${summary.xpEarned}`, color: '#C47D0E' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#F2F2EF] rounded-[14px] p-3">
                <div className="text-[22px] font-bold font-mono" style={{ color }}>{value}</div>
                <div className="text-[10px] text-[#ADADB8] mt-0.5 font-medium uppercase tracking-wider leading-tight">{label}</div>
              </div>
            ))}
          </div>

          {/* Mistakes */}
          {summary.mistakes.length > 0 && (
            <div className="text-left mb-5">
              <p className="text-[12px] font-semibold text-[#E8334A] mb-2">
                Cần ôn lại ({summary.mistakes.length} kanji)
              </p>
              <div className="space-y-0">
                {summary.mistakes.map(({ kanji, meaningVi, wrongCount }) => (
                  <Link
                    key={kanji.id}
                    href={`/kanji/${kanji.id}`}
                    className="flex items-center gap-3 py-2 border-b border-black/[.07] hover:bg-[#FAFAF8] -mx-2 px-2 rounded transition-colors"
                  >
                    <span className="text-[26px] w-[34px] shrink-0">{kanji.char}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-[#3A3A40]">{meaningVi}</div>
                      <div className="text-[11px] text-[#ADADB8]">{kanji.jlptLevel}</div>
                    </div>
                    <span className="text-[10px] font-semibold text-[#E8334A] font-mono whitespace-nowrap">{wrongCount}x sai</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href={ROUTES.KANJI}
            className="flex-1 flex items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-black/[.13] bg-white py-3 text-[14px] font-medium text-[#3A3A40] hover:bg-[#F2F2EF] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('quiz.summary.backToBrowser')}
          </Link>
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 rounded-[14px] bg-[#0D0D0F] py-3 text-[14px] font-semibold text-white hover:bg-[#2a2a30] transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            {t('quiz.summary.nextQuiz')}
          </button>
        </div>
      </div>
    </div>
  )
}
