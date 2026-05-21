'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, PenLine, Zap, Check, BookOpen, RotateCcw, ClipboardList, Info, Link2, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'
import { ROUTES } from '@shared/constants'
import { cn } from '@shared/utils'
import { useKanji, useUpdateKanjiStatus } from '../hooks/useKanji'
import { MeaningsList } from './MeaningsList'
import { ExamplesList } from './ExamplesList'
import { CompoundsGrid } from './CompoundsGrid'
import { StrokeOrderSteps } from './StrokeOrderSteps'
import { KanjiCard } from './KanjiCard'
import type { JlptLevel, KanjiStatus } from '../types'

const JLPT_BADGE: Record<JlptLevel, string> = {
  N5: 'bg-[#E8F7F4] text-[#0F8A72]',
  N4: 'bg-[#E8F4FF] text-[#1565C0]',
  N3: 'bg-[#FEF6E4] text-[#C47D0E]',
  N2: 'bg-[#FFF0F2] text-[#E8334A]',
  N1: 'bg-[#0D0D0F] text-[#FFD700]',
}

interface KanjiDetailPageProps {
  id: string
}

export function KanjiDetailPage({ id }: KanjiDetailPageProps) {
  const { t } = useTranslation('kanji')
  const router = useRouter()
  const { data: kanji, isLoading, isError } = useKanji(id)
  const updateStatus = useUpdateKanjiStatus()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-[#E8E8E4] border-t-[#0F8A72]" />
      </div>
    )
  }

  if (isError || !kanji) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center gap-4">
        <p className="text-[#7A7A85]">Không tìm thấy kanji.</p>
        <Link href={ROUTES.KANJI} className="inline-flex items-center gap-1.5 text-[#1565C0] hover:underline text-sm">
          <ArrowLeft className="h-4 w-4" />Quay lại
        </Link>
      </div>
    )
  }

  const handleStatus = (status: KanjiStatus) => {
    updateStatus.mutate({ id: kanji.id, status }, { onError: () => toast.error('Cập nhật thất bại') })
  }

  const mastery = kanji.mastery

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-screen-lg mx-auto px-4 py-6 space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] text-[#ADADB8]">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-black/[.08] bg-white hover:bg-[#F2F2EF] transition-colors mr-1 shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#3A3A40]" />
          </button>
          <Link href={ROUTES.KANJI} className="text-[#1565C0] hover:underline">字 Kanji</Link>
          <span>›</span>
          <Link href={`${ROUTES.KANJI}?level=${kanji.jlptLevel}`} className="text-[#1565C0] hover:underline">{kanji.jlptLevel}</Link>
          <span>›</span>
          <strong className="text-[#0D0D0F]">{kanji.char}</strong>
        </div>

        {/* Hero */}
        <div className="bg-white border-[1.5px] border-black/[.07] rounded-[20px] p-6 sm:p-7 grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-6 items-center shadow-[0_1px_3px_rgba(0,0,0,.06),0_2px_8px_rgba(0,0,0,.04)]">
          {/* Big kanji */}
          <div className="w-[108px] h-[108px] flex items-center justify-center bg-gradient-to-br from-[#0D0D0F] to-[#14141a] rounded-[14px] text-white text-[64px] leading-none shrink-0 mx-auto sm:mx-0">
            {kanji.char}
          </div>

          {/* Meta */}
          <div className="space-y-3">
            <h1 className="text-[26px] font-bold tracking-tight text-[#0D0D0F] leading-tight">
              {kanji.char} — {kanji.meaningEn ?? kanji.meaningVi}
            </h1>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium', JLPT_BADGE[kanji.jlptLevel])}>{kanji.jlptLevel}</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[11px] bg-[#F2F2EF] text-[#7A7A85] border border-black/[.07]">{kanji.strokes} nét</span>
              {kanji.radical && <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[11px] bg-[#F2F2EF] text-[#7A7A85] border border-black/[.07]">{kanji.radical.char} bộ: {kanji.radical.meaningVi}</span>}
              {kanji.joyoOrder && <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[11px] bg-[#F2F2EF] text-[#7A7A85] border border-black/[.07]">Jōyō #{kanji.joyoOrder}</span>}
              {kanji.frequency && <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[11px] bg-[#F2F2EF] text-[#7A7A85] border border-black/[.07]">Frequency: #{kanji.frequency}</span>}
            </div>
            {/* Readings */}
            <div className="flex gap-5 flex-wrap">
              {kanji.onReadings.length > 0 && (
                <div>
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-[#ADADB8] mb-1">Âm (On&apos;yomi)</div>
                  <div className="flex gap-1 flex-wrap">
                    {kanji.onReadings.map((r) => (
                      <span key={r} className="px-2.5 py-1 rounded-[6px] text-[13px] font-medium font-mono bg-[#FEF6E4] text-[#C47D0E] border border-[rgba(196,125,14,.2)]">{r}</span>
                    ))}
                  </div>
                </div>
              )}
              {kanji.kunReadings.length > 0 && (
                <div>
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-[#ADADB8] mb-1">Huấn (Kun&apos;yomi)</div>
                  <div className="flex gap-1 flex-wrap">
                    {kanji.kunReadings.map((r) => (
                      <span key={r} className="px-2.5 py-1 rounded-[6px] text-[13px] font-medium font-mono bg-[#E8F4FF] text-[#1565C0] border border-[rgba(21,101,192,.2)]">{r}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mastery + Actions */}
          <div className="flex flex-col gap-2 items-end shrink-0">
            <div className="text-center">
              <div className="text-[10px] font-medium text-[#ADADB8] uppercase tracking-wider mb-1">Mastery</div>
              <div className="w-24 h-1.5 bg-[#E8E8E4] rounded-full overflow-hidden mx-auto mb-1">
                <div className="h-full rounded-full bg-gradient-to-r from-[#0F8A72] to-[#34d399] transition-all" style={{ width: `${mastery}%` }} />
              </div>
              <div className="text-[13px] font-bold text-[#0F8A72] font-mono">{mastery}%</div>
            </div>
            <Link
              href={`/kanji/${id}/write`}
              className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-lg bg-[#0D0D0F] text-white text-[12px] font-medium hover:bg-[#2a2a30] transition-colors"
            >
              <PenLine className="h-3 w-3" />
              Luyện viết
            </Link>
            <button
              type="button"
              onClick={() => handleStatus(kanji.status === 'known' ? 'learning' : 'known')}
              disabled={updateStatus.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-lg border-[1.5px] border-black/[.13] text-[#3A3A40] text-[12px] font-medium hover:bg-[#F2F2EF] transition-colors"
            >
              <BookOpen className="h-3 w-3" />
              Thêm vào deck
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
          {/* Main content */}
          <div className="space-y-4">
            {/* Stroke order */}
            <div className="bg-white border-[1.5px] border-black/[.07] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
              <div className="flex items-center gap-2 text-[13px] font-bold text-[#0D0D0F] mb-4">
                <div className="w-[26px] h-[26px] rounded-lg flex items-center justify-center bg-[#FEF6E4] shrink-0">
                  <PenLine className="h-[13px] w-[13px] text-[#C47D0E]" />
                </div>
                Thứ tự nét — {kanji.strokes} nét
              </div>
              <StrokeOrderSteps kanji={kanji} />
            </div>

            {/* Meanings */}
            <div className="bg-white border-[1.5px] border-black/[.07] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
              <div className="flex items-center gap-2 text-[13px] font-bold text-[#0D0D0F] mb-4">
                <div className="w-[26px] h-[26px] rounded-lg flex items-center justify-center bg-[#EDE8FE] shrink-0">
                  <BookOpen className="h-[13px] w-[13px] text-[#5B45C7]" />
                </div>
                Nghĩa &amp; Cách dùng
              </div>
              <MeaningsList meanings={kanji.meanings} />
            </div>

            {/* Examples */}
            <div className="bg-white border-[1.5px] border-black/[.07] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
              <div className="flex items-center gap-2 text-[13px] font-bold text-[#0D0D0F] mb-4">
                <div className="w-[26px] h-[26px] rounded-lg flex items-center justify-center bg-[#E8F7F4] shrink-0">
                  <Zap className="h-[13px] w-[13px] text-[#0F8A72]" />
                </div>
                Ví dụ trong câu
              </div>
              <ExamplesList examples={kanji.examples} />
            </div>

            {/* Compounds */}
            <div className="bg-white border-[1.5px] border-black/[.07] rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
              <div className="flex items-center gap-2 text-[13px] font-bold text-[#0D0D0F] mb-4">
                <div className="w-[26px] h-[26px] rounded-lg flex items-center justify-center bg-[#FEF6E4] shrink-0">
                  <ClipboardList className="h-[13px] w-[13px] text-[#C47D0E]" />
                </div>
                Từ ghép — Jukugo
              </div>
              <CompoundsGrid compounds={kanji.compounds} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Info grid */}
            <div className="bg-white border-[1.5px] border-black/[.07] rounded-[20px] p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#0D0D0F] mb-3">
                <Info className="h-[13px] w-[13px] text-[#7A7A85]" />
                Thông tin
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'Số nét', value: kanji.strokes },
                  { label: 'Cấp JLPT', value: kanji.jlptLevel, colored: true },
                  { label: 'Bộ thủ', value: kanji.radical?.char ?? '—' },
                  { label: 'Tần suất', value: kanji.frequency ? `#${kanji.frequency}` : '—' },
                ].map(({ label, value, colored }) => (
                  <div key={label} className="bg-[#F2F2EF] rounded-lg px-3 py-2.5">
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-[#ADADB8] mb-1">{label}</div>
                    <div className={cn('text-[17px] font-bold', colored ? (JLPT_BADGE[kanji.jlptLevel]?.split(' ')[1] ?? 'text-[#0D0D0F]') : 'text-[#0D0D0F]')}>{String(value)}</div>
                  </div>
                ))}
                <div className="bg-[#F2F2EF] rounded-lg px-3 py-2.5 col-span-2">
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-[#ADADB8] mb-1">Unicode</div>
                  <div className="text-[12px] font-bold text-[#0D0D0F] font-mono">{kanji.unicode} · {kanji.char}</div>
                </div>
                {kanji.components && kanji.components.length > 0 && (
                  <div className="bg-[#F2F2EF] rounded-lg px-3 py-2.5 col-span-2">
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-[#ADADB8] mb-2">Thành phần</div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {kanji.components.map((c, i) => (
                        <span key={c.char} className="flex items-center gap-1">
                          {i > 0 && <span className="text-[11px] text-[#ADADB8]">+</span>}
                          <span className="inline-flex flex-col items-center bg-white border border-black/[.08] rounded-[6px] px-2 py-1 min-w-[36px]">
                            <span className="text-[18px] leading-none font-bold text-[#0D0D0F]">{c.char}</span>
                            <span className="text-[8px] text-[#7A7A85] leading-tight mt-0.5 text-center">{c.meaningVi}</span>
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Similar kanji */}
            {kanji.similar && kanji.similar.length > 0 && (
              <div className="bg-white border-[1.5px] border-black/[.07] rounded-[20px] p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#0D0D0F] mb-3">
                  <Link2 className="h-[13px] w-[13px] text-[#7A7A85]" />
                  Kanji tương tự
                </div>
                <div className="space-y-1">
                  {kanji.similar.map((s) => (
                    <Link
                      key={s.id}
                      href={`/kanji/${s.id}`}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[#F2F2EF] transition-colors group"
                    >
                      <div className="w-[38px] h-[38px] flex items-center justify-center bg-[#F2F2EF] rounded-lg text-[20px] border border-black/[.07] shrink-0 group-hover:border-[#1565C0]">
                        {s.char}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-[#0D0D0F] leading-tight">{s.meaningVi}</div>
                        <div className="text-[11px] text-[#ADADB8] font-mono">{s.reason}</div>
                      </div>
                      <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium shrink-0', JLPT_BADGE[s.jlptLevel])}>{s.jlptLevel}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Mnemonic */}
            {kanji.mnemonicVi && (
              <div className="bg-white border-[1.5px] border-black/[.07] rounded-[20px] p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#0D0D0F] mb-3">
                  <Lightbulb className="h-[13px] w-[13px] text-[#C47D0E]" />
                  Mnemonic gợi nhớ
                </div>
                <div className="text-[12px] text-[#3A3A40] leading-relaxed bg-[#FEF6E4] rounded-lg p-3 border-l-[3px] border-[#C47D0E]">
                  {kanji.mnemonicVi}
                </div>
              </div>
            )}

            {/* Study actions */}
            <div className="bg-white border-[1.5px] border-black/[.07] rounded-[20px] p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#0D0D0F] mb-3">
                <Zap className="h-[13px] w-[13px] text-[#1565C0]" />
                Hành động
              </div>
              <div className="space-y-1.5">
                <Link
                  href={`/kanji/${id}/write`}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[14px] bg-[#0D0D0F] text-white text-[13px] font-medium hover:bg-[#2a2a30] transition-colors"
                >
                  <PenLine className="h-4 w-4" />
                  Luyện viết
                </Link>
                <button
                  type="button"
                  onClick={() => handleStatus('learning')}
                  disabled={updateStatus.isPending}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-[14px] border-[1.5px] border-black/[.07] bg-white text-[#3A3A40] text-[13px] font-medium hover:bg-[#F2F2EF] transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  Ôn SRS
                </button>
                <button
                  type="button"
                  onClick={() => handleStatus(kanji.status === 'known' ? 'learning' : 'known')}
                  disabled={updateStatus.isPending}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-[14px] border-[1.5px] border-black/[.07] bg-white text-[#3A3A40] text-[13px] font-medium hover:bg-[#F2F2EF] transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  Thêm vào deck
                </button>
                <Link
                  href={`${ROUTES.KANJI_QUIZ}?kanji=${id}`}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[14px] border-[1.5px] border-black/[.07] bg-white text-[#3A3A40] text-[13px] font-medium hover:bg-[#F2F2EF] transition-colors"
                >
                  <ClipboardList className="h-4 w-4" />
                  Quiz nhanh
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
