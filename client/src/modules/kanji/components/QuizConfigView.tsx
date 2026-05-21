'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Zap, Heart } from 'lucide-react'
import { cn } from '@shared/utils'
import type { JlptLevel, KanjiQuizConfig, KanjiQuizMode } from '../types'

const LEVELS: JlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']
const MODES: Array<KanjiQuizMode | 'mixed'> = ['recognition', 'meaningToKanji', 'writing', 'mixed']
const COUNTS = [10, 20, 30] as const

const LEVEL_ACTIVE: Record<JlptLevel, string> = {
  N5: 'border-[#0F8A72] bg-[#E8F7F4] text-[#0F8A72]',
  N4: 'border-[#1565C0] bg-[#E8F4FF] text-[#1565C0]',
  N3: 'border-[#C47D0E] bg-[#FEF6E4] text-[#C47D0E]',
  N2: 'border-[#E8334A] bg-[#FFF0F2] text-[#E8334A]',
  N1: 'border-[#0D0D0F] bg-[#0D0D0F] text-[#FFD700]',
}

interface QuizConfigViewProps {
  onStart: (config: KanjiQuizConfig) => void
  isLoading?: boolean
}

export function QuizConfigView({ onStart, isLoading }: QuizConfigViewProps) {
  const { t } = useTranslation('kanji')
  const [config, setConfig] = useState<KanjiQuizConfig>({
    level: 'N5',
    mode: 'recognition',
    questionCount: 10,
    livesEnabled: false,
  })

  const modeLabels: Record<string, string> = {
    recognition: t('quiz.modes.recognition'),
    meaningToKanji: t('quiz.modes.meaningToKanji'),
    writing: t('quiz.modes.writing'),
    mixed: 'Hỗn hợp',
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border-[1.5px] border-black/[.07] rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,.08)] p-6 space-y-5">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#F2F2EF] mb-3">
            <Zap className="h-6 w-6 text-[#0D0D0F]" />
          </div>
          <h1 className="text-[20px] font-bold text-[#0D0D0F] tracking-tight">{t('quiz.title')}</h1>
        </div>

        {/* Level */}
        <div>
          <p className="text-[13px] font-semibold text-[#3A3A40] mb-2">{t('filter.level')}</p>
          <div className="flex gap-1.5 flex-wrap">
            {LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setConfig((c) => ({ ...c, level }))}
                className={cn(
                  'px-3 py-1 rounded-full text-[12px] font-medium border-[1.5px] transition-all',
                  config.level === level
                    ? LEVEL_ACTIVE[level]
                    : 'border-black/[.13] text-[#7A7A85] hover:border-[#ADADB8] hover:text-[#0D0D0F]',
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Mode */}
        <div>
          <p className="text-[13px] font-semibold text-[#3A3A40] mb-2">Chế độ</p>
          <div className="grid grid-cols-2 gap-1.5">
            {MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setConfig((c) => ({ ...c, mode }))}
                className={cn(
                  'rounded-[14px] border-[1.5px] px-3 py-2.5 text-[12px] font-medium text-left transition-all',
                  config.mode === mode
                    ? 'border-[#0D0D0F] bg-[#0D0D0F] text-white'
                    : 'border-black/[.07] text-[#3A3A40] bg-[#F2F2EF] hover:border-black/[.13]',
                )}
              >
                {modeLabels[mode]}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div>
          <p className="text-[13px] font-semibold text-[#3A3A40] mb-2">Số câu</p>
          <div className="flex gap-1.5">
            {COUNTS.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setConfig((c) => ({ ...c, questionCount: count }))}
                className={cn(
                  'flex-1 py-2 rounded-[14px] border-[1.5px] text-[13px] font-medium transition-all',
                  config.questionCount === count
                    ? 'bg-[#0D0D0F] text-white border-[#0D0D0F]'
                    : 'bg-[#F2F2EF] text-[#3A3A40] border-black/[.07] hover:border-black/[.13]',
                )}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* Lives toggle */}
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-[13px] font-semibold text-[#3A3A40] flex items-center gap-1">
              Chế độ lives (3 <Heart className="h-3.5 w-3.5 fill-[#E8334A] text-[#E8334A]" />)
            </p>
            <p className="text-[11px] text-[#ADADB8]">Tự động kết thúc khi hết mạng</p>
          </div>
          <button
            type="button"
            onClick={() => setConfig((c) => ({ ...c, livesEnabled: !c.livesEnabled }))}
            className={cn(
              'relative h-6 w-11 rounded-full transition-colors shrink-0',
              config.livesEnabled ? 'bg-[#0D0D0F]' : 'bg-[#E8E8E4]',
            )}
          >
            <span className={cn(
              'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
              config.livesEnabled && 'translate-x-5',
            )} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onStart(config)}
          disabled={isLoading}
          className="w-full rounded-[14px] bg-[#0D0D0F] py-3 text-[14px] font-semibold text-white hover:bg-[#2a2a30] disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Đang tải...' : 'Bắt đầu Quiz'}
        </button>
      </div>
    </div>
  )
}
