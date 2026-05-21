'use client'

import { cn } from '@shared/utils'
import { Button } from '@shared/components/ui'
import { LEVEL_META, LEVEL_LABELS } from '../services/mock-test.service'
import type { JlptLevel, TestSection, QuestionCount, LevelMeta, PreviousAttempt } from '../types'

const LEVELS: JlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']

const LEVEL_COLORS: Record<JlptLevel, string> = {
  N5: 'text-emerald-600',
  N4: 'text-blue-600',
  N3: 'text-amber-600',
  N2: 'text-red-500',
  N1: 'text-foreground',
}

const SECTIONS: { value: TestSection; label: string }[] = [
  { value: 'all', label: 'Toàn bộ' },
  { value: 'vocabulary', label: 'Từ vựng' },
  { value: 'grammar', label: 'Ngữ pháp' },
  { value: 'reading', label: 'Đọc hiểu' },
]

const QUESTION_COUNTS: { value: QuestionCount; label: string }[] = [
  { value: '20', label: '20 câu' },
  { value: 'full', label: 'Đầy đủ' },
]

interface SelectViewProps {
  selectedLevel: JlptLevel
  selectedSection: TestSection
  selectedQuestionCount: QuestionCount
  levelMeta: LevelMeta
  previousResult: PreviousAttempt
  onSelectLevel: (level: JlptLevel) => void
  onSelectSection: (section: TestSection) => void
  onSelectQuestionCount: (count: QuestionCount) => void
  onStart: () => void
}

export function SelectView({
  selectedLevel,
  selectedSection,
  selectedQuestionCount,
  levelMeta,
  previousResult,
  onSelectLevel,
  onSelectSection,
  onSelectQuestionCount,
  onStart,
}: SelectViewProps) {
  const prevPercent = Math.round((previousResult.score / previousResult.maxScore) * 100)

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      {/* Hero */}
      <div className="mb-6 text-center sm:mb-8">
        <span className="mb-3 block text-4xl">🏆</span>
        <h1 className="mb-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">Mock Test JLPT</h1>
        <p className="text-sm text-muted-foreground">
          Mô phỏng đề thi chính thức — kiểm tra trình độ thực sự
        </p>
      </div>

      {/* Level selection */}
      <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        Chọn cấp độ
      </p>
      <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
        {LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => onSelectLevel(level)}
            className={cn(
              'rounded-xl border-[1.5px] bg-card px-3 py-3 text-center transition-all',
              selectedLevel === level
                ? 'border-foreground shadow-sm'
                : 'border-border hover:border-foreground/30',
              level === 'N1' && selectedLevel === level && 'bg-foreground',
            )}
          >
            <div
              className={cn(
                'text-xl font-bold tracking-tight',
                LEVEL_COLORS[level],
                level === 'N1' && selectedLevel === level && 'text-yellow-400',
              )}
            >
              {level}
            </div>
            <div
              className={cn(
                'mt-0.5 text-[10px] text-muted-foreground',
                level === 'N1' && selectedLevel === level && 'text-muted-foreground/60',
              )}
            >
              {LEVEL_LABELS[level]}
            </div>
          </button>
        ))}
      </div>

      {/* Config cards */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-3 text-xs font-semibold">Phần thi</p>
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => onSelectSection(s.value)}
                className={cn(
                  'rounded-md border-[1.5px] px-3 py-1.5 text-xs font-medium transition-all',
                  selectedSection === s.value
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-3 text-xs font-semibold">Số câu hỏi</p>
          <div className="flex flex-wrap gap-2">
            {QUESTION_COUNTS.map((qc) => (
              <button
                key={qc.value}
                onClick={() => onSelectQuestionCount(qc.value)}
                className={cn(
                  'rounded-md border-[1.5px] px-3 py-1.5 text-xs font-medium transition-all',
                  selectedQuestionCount === qc.value
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
                )}
              >
                {qc.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Test meta */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {[
          { val: levelMeta.questionCount, label: 'Câu hỏi' },
          { val: levelMeta.duration, label: 'Phút' },
          { val: `${levelMeta.passingScore} đ`, label: `Điểm đậu ${selectedLevel}` },
        ].map(({ val, label }) => (
          <div key={label} className="rounded-xl bg-muted/60 px-3 py-3">
            <div className="text-lg font-semibold tracking-tight sm:text-xl">{val}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {/* Previous result */}
      <div className="mb-5 rounded-xl border border-border bg-card p-4">
        <p className="mb-3 text-xs font-semibold">
          Lần thi gần nhất — {previousResult.level}
        </p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Tổng điểm</span>
              <span className="font-mono font-medium text-foreground">
                {previousResult.score} / {previousResult.maxScore}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: `${prevPercent}%` }}
              />
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="text-base font-semibold text-amber-600">
              {previousResult.passed ? 'Đạt' : 'Chưa đạt'}
            </div>
            {!previousResult.passed && (
              <div className="text-[11px] text-muted-foreground">
                Cần thêm {previousResult.needMorePoints} điểm
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <Button className="h-12 w-full justify-center text-[15px] font-medium" onClick={onStart}>
        Bắt đầu thi →
      </Button>
    </div>
  )
}
