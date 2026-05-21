'use client'

import { useTranslation } from 'react-i18next'
import { ArrowLeft, Heart } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@shared/constants'
import { useKanjiQuizSession } from '../hooks/useKanjiQuizSession'
import {
  useStartKanjiQuiz,
  useSubmitKanjiQuizAnswer,
  useFinishKanjiQuiz,
} from '../hooks/useKanji'
import { QuizConfigView } from './QuizConfigView'
import { RecognitionCard } from './RecognitionCard'
import { MeaningToKanjiCard } from './MeaningToKanjiCard'
import { QuizSummary } from './QuizSummary'
import type { KanjiQuizAnswerResult, KanjiQuizConfig } from '../types'

export function KanjiQuizPage() {
  const { t } = useTranslation('kanji')
  const session = useKanjiQuizSession()
  const startQuiz = useStartKanjiQuiz()
  const submitAnswer = useSubmitKanjiQuizAnswer()
  const finishQuiz = useFinishKanjiQuiz()

  const handleStart = (config: KanjiQuizConfig) => {
    startQuiz.mutate(config, {
      onSuccess: ({ sessionId, questions }) => {
        session.start(sessionId, questions, config.livesEnabled)
      },
    })
  }

  const handleAnswer = (optionId: string) => {
    if (!session.sessionId || !session.currentQuestion) return
    submitAnswer.mutate(
      {
        sessionId: session.sessionId,
        dto: { questionId: session.currentQuestion.id, selectedOptionId: optionId },
      },
      {
        onSuccess: (result: KanjiQuizAnswerResult) => {
          session.recordAnswer(result)
        },
      },
    )
  }

  const handleNext = () => {
    if (session.isLast || session.isGameOver) {
      finishQuiz.mutate(session.sessionId!, {
        onSuccess: (summary) => session.finish(summary),
      })
    } else {
      session.next()
    }
  }

  if (session.view === 'summary' && session.summary) {
    return <QuizSummary summary={session.summary} onRetry={session.reset} />
  }

  if (session.view === 'config') {
    return <QuizConfigView onStart={handleStart} isLoading={startQuiz.isPending} />
  }

  const q = session.currentQuestion
  if (!q) return null

  const progress = (session.currentIndex / session.questions.length) * 100

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Topbar */}
      <div className="sticky top-0 z-10 border-b border-black/[.07] bg-[#FAFAF8]/90 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto flex max-w-[680px] items-center gap-3">
          <button
            type="button"
            onClick={session.reset}
            className="text-[#ADADB8] hover:text-[#0D0D0F] transition-colors shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Progress bar */}
          <div className="flex-1 h-1.5 rounded-full bg-[#E8E8E4] overflow-hidden">
            <div
              className="h-full rounded-full transition-all bg-gradient-to-r from-[#1565C0] to-[#0F8A72]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="text-[12px] font-semibold text-[#7A7A85] font-mono whitespace-nowrap">
            {session.currentIndex + 1} / {session.questions.length}
          </span>

          {session.livesEnabled && (
            <div className="flex gap-1 shrink-0">
              {Array.from({ length: session.maxLives }).map((_, i) => (
                <Heart
                  key={i}
                  className={`h-[18px] w-[18px] ${i < session.lives ? 'fill-[#E8334A] text-[#E8334A]' : 'fill-[#ADADB8] text-[#ADADB8]'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Question */}
      <div className="mx-auto max-w-[680px] px-4 py-8">
        <div className="bg-white border-[1.5px] border-black/[.07] rounded-[20px] p-8 shadow-[0_4px_12px_rgba(0,0,0,.08),0_12px_32px_rgba(0,0,0,.06)]">
          {q.mode === 'recognition' && (
            <RecognitionCard
              question={q}
              result={session.lastResult}
              onAnswer={handleAnswer}
              isLoading={submitAnswer.isPending}
            />
          )}
          {q.mode === 'meaningToKanji' && (
            <MeaningToKanjiCard
              question={q}
              result={session.lastResult}
              onAnswer={handleAnswer}
              isLoading={submitAnswer.isPending}
            />
          )}
        </div>

        {/* Result bar */}
        {session.lastResult && (
          <div className={[
            'mt-4 rounded-[14px] p-3.5 flex items-start gap-2.5 border-[1.5px]',
            session.lastResult.correct
              ? 'bg-[#E8F7F4] border-[rgba(15,138,114,.3)]'
              : 'bg-[#FFF0F2] border-[#F5A0AB]',
          ].join(' ')}>
            <span className="text-[18px] shrink-0">{session.lastResult.correct ? '✓' : '✗'}</span>
            <div className="flex-1 min-w-0">
              <h4 className={`text-[13px] font-bold mb-1 ${session.lastResult.correct ? 'text-[#0F8A72]' : 'text-[#E8334A]'}`}>
                {session.lastResult.correct ? t('quiz.correctXp', { xp: session.lastResult.xpEarned }) : t('quiz.wrong')}
              </h4>
              {session.lastResult.explanation && (
                <p className="text-[12px] text-[#7A7A85] leading-relaxed">{session.lastResult.explanation}</p>
              )}
            </div>
          </div>
        )}

        {session.lastResult && (
          <button
            type="button"
            onClick={handleNext}
            disabled={finishQuiz.isPending}
            className="mt-3 w-full rounded-[14px] bg-[#0D0D0F] py-3 text-[14px] font-semibold text-white hover:bg-[#2a2a30] disabled:opacity-50 transition-colors"
          >
            {session.isLast || session.isGameOver ? 'Xem kết quả' : t('quiz.nextQuestion')}
          </button>
        )}
      </div>
    </div>
  )
}
