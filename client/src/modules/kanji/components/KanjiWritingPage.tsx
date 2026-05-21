'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Pencil, Eraser, Undo2, Redo2, Trash2, CheckCircle2, SkipForward, Lightbulb, Eye } from 'lucide-react'
import { ROUTES } from '@shared/constants'
import { useKanji, useSubmitWritingAttempt, useWritingQueue } from '../hooks/useKanji'
import { useWritingCanvas } from '../hooks/useWritingCanvas'
import { StrokeCanvas } from './StrokeCanvas'
import { FeedbackPanel } from './FeedbackPanel'
import type { WritingScore } from '../types'

interface KanjiWritingPageProps {
  id: string
}

export function KanjiWritingPage({ id }: KanjiWritingPageProps) {
  const { t } = useTranslation('kanji')
  const { data: kanji, isLoading } = useKanji(id)
  const { data: queue = [] } = useWritingQueue()
  const submitAttempt = useSubmitWritingAttempt()
  const canvas = useWritingCanvas()
  const [lastScore, setLastScore] = useState<WritingScore | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  const ghostChar = showAnswer || canvas.mode !== 'free' ? kanji?.char : undefined

  if (isLoading || !kanji) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-[#E8E8E4] border-t-[#0F8A72]" />
      </div>
    )
  }

  const handleCheck = async () => {
    if (canvas.strokeCount === 0) return
    submitAttempt.mutate(
      {
        id: kanji.id,
        dto: { strokes: canvas.strokes, durationMs: canvas.getDurationMs() },
      },
      {
        onSuccess: (score) => {
          setLastScore(score)
          canvas.clear()
        },
      },
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-screen-lg mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Link href={`/kanji/${id}`} className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-black/[.08] bg-white hover:bg-[#F2F2EF] transition-colors shrink-0">
            <ArrowLeft className="h-3.5 w-3.5 text-[#3A3A40]" />
          </Link>
          <h1 className="text-[18px] font-bold text-[#0D0D0F] tracking-tight">{t('writing.title')}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
          {/* Main writing area */}
          <div className="space-y-4">

            {/* Writing target */}
            <div className="bg-white border-[1.5px] border-black/[.07] rounded-[14px] px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
              <div className="w-[88px] h-[88px] flex items-center justify-center bg-gradient-to-br from-[#0D0D0F] to-[#14141a] text-white rounded-[14px] text-[56px] leading-none shrink-0">
                {kanji.char}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[18px] font-bold text-[#0D0D0F] tracking-tight mb-1">
                  {kanji.char} — {kanji.meaningVi}
                </h3>
                <p className="text-[12px] text-[#7A7A85] mb-2.5 font-mono">
                  {kanji.strokes} nét · {kanji.jlptLevel} · {kanji.radical ? `Bộ thủ ${kanji.radical.char}` : ''} · Frequency #{kanji.frequency ?? '—'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {kanji.onReadings.slice(0, 3).map((r) => (
                    <span key={r} className="px-2.5 py-0.5 bg-[#F2F2EF] rounded-full text-[11px] text-[#7A7A85] border border-black/[.07] font-mono">{r} (on)</span>
                  ))}
                  {kanji.kunReadings.slice(0, 2).map((r) => (
                    <span key={r} className="px-2.5 py-0.5 bg-[#F2F2EF] rounded-full text-[11px] text-[#7A7A85] border border-black/[.07] font-mono">{r} (kun)</span>
                  ))}
                  {kanji.radical && (
                    <span className="px-2.5 py-0.5 bg-[#F2F2EF] rounded-full text-[11px] text-[#7A7A85] border border-black/[.07] font-mono">{kanji.radical.char} bộ</span>
                  )}
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowHint((v) => !v)}
                  className={[
                    'inline-flex items-center gap-1 px-3 py-[5px] rounded-lg border-[1.5px] text-[12px] font-medium transition-colors',
                    showHint
                      ? 'border-[#C47D0E] bg-[#FEF6E4] text-[#C47D0E]'
                      : 'border-black/[.13] text-[#3A3A40] hover:bg-[#F2F2EF]',
                  ].join(' ')}
                >
                  <Lightbulb className="h-3 w-3" />
                  Gợi ý
                </button>
                <button
                  type="button"
                  onClick={() => setShowAnswer((v) => !v)}
                  className={[
                    'inline-flex items-center gap-1 px-3 py-[5px] rounded-lg border-[1.5px] text-[12px] font-medium transition-colors',
                    showAnswer
                      ? 'border-[#1565C0] bg-[#E8F4FF] text-[#1565C0]'
                      : 'border-black/[.13] text-[#3A3A40] hover:bg-[#F2F2EF]',
                  ].join(' ')}
                >
                  <Eye className="h-3 w-3" />
                  Đáp án
                </button>
              </div>
            </div>

            {/* Canvas wrap */}
            <div className="bg-white border-[1.5px] border-black/[.07] rounded-[14px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,.06)]">
              {/* Toolbar */}
              <div className="px-3.5 py-2.5 border-b border-black/[.07] flex items-center gap-1.5">
                {([
                  { icon: Pencil, label: 'Bút', tool: 'pen' as const },
                  { icon: Eraser, label: 'Tẩy', tool: 'eraser' as const },
                ] as const).map(({ icon: Icon, label, tool }) => (
                  <button
                    key={label}
                    type="button"
                    title={label}
                    onClick={() => canvas.setTool(tool)}
                    className={[
                      'w-8 h-8 rounded-lg flex items-center justify-center border-[1.5px] transition-all',
                      canvas.tool === tool ? 'border-[#1565C0] bg-[#E8F4FF]' : 'border-black/[.07] bg-[#F2F2EF] hover:bg-[#E8E8E4]',
                    ].join(' ')}
                  >
                    <Icon className="h-4 w-4 text-[#3A3A40]" />
                  </button>
                ))}

                <div className="w-px h-5 bg-black/[.13] mx-0.5" />

                <button type="button" title="Undo" onClick={canvas.undo} disabled={canvas.strokeCount === 0}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border-[1.5px] border-black/[.07] bg-[#F2F2EF] hover:bg-[#E8E8E4] disabled:opacity-40 transition-all">
                  <Undo2 className="h-4 w-4 text-[#3A3A40]" />
                </button>
                <button type="button" title="Xóa hết" onClick={canvas.clear} disabled={canvas.strokeCount === 0}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border-[1.5px] border-black/[.07] bg-[#F2F2EF] hover:bg-[#E8E8E4] disabled:opacity-40 transition-all">
                  <Trash2 className="h-4 w-4 text-[#3A3A40]" />
                </button>

                <div className="w-px h-5 bg-black/[.13] mx-0.5" />

                {/* Stroke mode */}
                <div className="flex gap-1 ml-auto bg-[#F2F2EF] p-[3px] rounded-lg border border-black/[.07]">
                  {(['free', 'step', 'guided'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => canvas.setMode(mode)}
                      className={[
                        'px-3 py-1 rounded-[6px] text-[12px] font-medium transition-all',
                        canvas.mode === mode
                          ? 'bg-white text-[#0D0D0F] shadow-sm'
                          : 'text-[#7A7A85] hover:text-[#3A3A40]',
                      ].join(' ')}
                    >
                      {mode === 'free' ? 'Tự do' : mode === 'step' ? 'Từng nét' : 'Hướng dẫn'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hint panel */}
              {showHint && (
                <div className="px-4 py-2.5 border-b border-[#C47D0E]/20 bg-[#FEF6E4] flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[#C47D0E]">
                  <span className="font-semibold">{kanji.strokes} nét</span>
                  {kanji.onReadings.length > 0 && <span>On: <span className="font-mono">{kanji.onReadings.join(' · ')}</span></span>}
                  {kanji.kunReadings.length > 0 && <span>Kun: <span className="font-mono">{kanji.kunReadings.join(' · ')}</span></span>}
                  {kanji.radical && <span>Bộ thủ: {kanji.radical.char} ({kanji.radical.meaningVi})</span>}
                </div>
              )}

              {/* Canvas area */}
              <div className="bg-[#fffef7] flex items-center justify-center p-4">
                <div className="relative">
                  <StrokeCanvas controller={canvas} ghostChar={ghostChar} showAnswer={showAnswer || canvas.mode === 'guided'} size={340} />
                  {canvas.strokeCount > 0 && (
                    <div className="absolute bottom-2 right-2 bg-[#0D0D0F] text-white px-3 py-1 rounded-lg text-[12px] font-medium font-mono pointer-events-none">
                      Nét {canvas.strokeCount} / {kanji.strokes}
                    </div>
                  )}
                </div>
              </div>

              {/* Action bar */}
              <div className="px-3.5 py-2.5 border-t border-black/[.07] bg-[#F2F2EF] flex items-center gap-2">
                <span className="text-[12px] text-[#7A7A85] mr-auto font-mono">
                  Đã vẽ: <strong className="text-[#0D0D0F]">{canvas.strokeCount}</strong> / {kanji.strokes} nét
                </span>
                <button
                  type="button"
                  onClick={handleCheck}
                  disabled={canvas.strokeCount === 0 || submitAttempt.isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F8A72] text-white text-[12px] font-medium hover:bg-[#0d7a64] disabled:opacity-50 transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {submitAttempt.isPending ? 'Đang chấm...' : 'Kiểm tra ✓'}
                </button>
                <Link
                  href={ROUTES.KANJI}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-[1.5px] border-black/[.13] text-[#3A3A40] text-[12px] font-medium hover:bg-[#E8E8E4] transition-colors"
                >
                  <SkipForward className="h-4 w-4" />
                  Bỏ qua →
                </Link>
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Feedback */}
            {lastScore && <FeedbackPanel score={lastScore} />}

            {/* Writing queue */}
            {queue.length > 0 && (
              <div className="bg-white border-[1.5px] border-black/[.07] rounded-[14px] p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
                <p className="text-[12px] font-semibold text-[#ADADB8] uppercase tracking-wider mb-3">
                  {t('writing.feedback.queue')}
                </p>
                <div className="space-y-1">
                  {queue.slice(0, 10).map((k) => (
                    <Link
                      key={k.id}
                      href={`/kanji/${k.id}/write`}
                      className={[
                        'flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors',
                        k.id === id ? 'bg-[#E8F4FF]' : 'hover:bg-[#F2F2EF]',
                      ].join(' ')}
                    >
                      <div className={[
                        'w-[34px] h-[34px] flex items-center justify-center text-[18px] rounded-lg border shrink-0',
                        k.id === id
                          ? 'bg-[#E8F4FF] border-[#1565C0]'
                          : 'bg-[#F2F2EF] border-black/[.07]',
                      ].join(' ')}>
                        {k.char}
                      </div>
                      <div>
                        <div className={`text-[12px] font-semibold leading-tight ${k.id === id ? 'text-[#1565C0]' : 'text-[#0D0D0F]'}`}>{k.char}</div>
                        <div className="text-[10px] text-[#ADADB8] font-mono">{k.jlptLevel}</div>
                      </div>
                      {k.id === id && <span className="ml-auto text-[#0F8A72] text-[14px]">✓</span>}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
