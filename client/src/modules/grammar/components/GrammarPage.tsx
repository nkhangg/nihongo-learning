'use client'

import { useState, useCallback } from 'react'
import { Flame, SlidersHorizontal, Search } from 'lucide-react'
import { Button, Sheet, SheetContent, SheetTrigger, Skeleton, Empty } from '@shared/components/ui'
import { useDebounce } from '@shared/hooks'
import { cn } from '@shared/utils'
import { useGrammarLessons, useAddToFlashcard } from '../hooks/useGrammar'
import { GrammarCard } from './GrammarCard'
import { GrammarFilterPanel } from './GrammarFilterPanel'
import type { GrammarFilter, GrammarStatus, JLPTLevel } from '../types'

const STATUS_TABS: { value: GrammarStatus; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'unlearned', label: 'Chưa học' },
  { value: 'learned', label: 'Đã học' },
]

const JLPT_LEVELS: { value: JLPTLevel | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'n5', label: 'N5' },
  { value: 'n4', label: 'N4' },
  { value: 'n3', label: 'N3' },
  { value: 'n2', label: 'N2' },
  { value: 'n1', label: 'N1' },
]

const LEVEL_ACTIVE: Record<string, string> = {
  n5: 'border-[#0F8A72] bg-[#E8F7F4] text-[#0F8A72]',
  n4: 'border-[#1565C0] bg-[#E8F4FF] text-[#1565C0]',
  n3: 'border-[#C47D0E] bg-[#FEF6E4] text-[#C47D0E]',
  n2: 'border-[#E8334A] bg-[#FFF0F2] text-[#E8334A]',
  n1: 'border-[#0D0D0F] bg-[#0D0D0F] text-[#FFD700]',
}

const chipBase = 'px-3 py-1 rounded-full text-xs font-medium cursor-pointer border-[1.5px] transition-all'
const chipInactive = 'border-black/[.13] text-[#7A7A85] bg-transparent hover:border-[#ADADB8] hover:text-[#0D0D0F]'
const chipActiveAll = 'border-[#0D0D0F] bg-[#0D0D0F] text-white'

const DEFAULT_PROGRESS = { learned: true, studying: true, unlearned: true }

export function GrammarPage() {
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState<JLPTLevel | 'all'>('all')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<GrammarStatus>('all')
  const [progressChecked, setProgressChecked] = useState(DEFAULT_PROGRESS)
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)

  const debouncedSearch = useDebounce(search, 300)

  const filter: GrammarFilter = {
    search: debouncedSearch,
    level,
    types: selectedTypes,
    statusFilter,
    page,
  }

  const { data, isLoading, isError, refetch } = useGrammarLessons(filter)
  const { mutate: addToFlashcard, isPending: isAddingFlashcard } = useAddToFlashcard()

  const handleLevelChange = useCallback((val: JLPTLevel | 'all') => {
    setLevel(val)
    setPage(1)
  }, [])

  const handleTypeToggle = useCallback((type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    )
    setPage(1)
  }, [])

  const handleProgressToggle = useCallback((val: 'learned' | 'studying' | 'unlearned') => {
    setProgressChecked((prev) => ({ ...prev, [val]: !prev[val] }))
    setPage(1)
  }, [])

  const handleReset = useCallback(() => {
    setLevel('all')
    setSelectedTypes([])
    setProgressChecked(DEFAULT_PROGRESS)
    setPage(1)
  }, [])

  const handleCardToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }, [])

  const handleStatusChange = useCallback((val: GrammarStatus) => {
    setStatusFilter(val)
    setPage(1)
  }, [])

  const filterProps = {
    filter: { ...filter, types: selectedTypes },
    onLevelChange: handleLevelChange,
    onTypeToggle: handleTypeToggle,
    onProgressToggle: handleProgressToggle,
    progressChecked,
    onReset: handleReset,
  }

  const lessons = data?.lessons ?? []
  const total = data?.total ?? 0
  const learnedCount = data?.learnedCount ?? 0
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="min-h-full bg-[#FAFAF8]">
      <div className="mx-auto max-w-screen-xl space-y-5 px-4 py-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-[20px] border border-white/[.06] bg-gradient-to-br from-[#0D0D0F] via-[#14141a] to-[#0a0f1e] px-8 py-7">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <h2 className="mb-1 text-[22px] font-bold tracking-tight text-white">文法 Ngữ pháp</h2>
              <p className="max-w-sm text-[13px] leading-relaxed text-white/55">
                Luyện tập các mẫu câu JLPT theo từng cấp độ
              </p>
            </div>
            <div className="flex shrink-0 gap-8">
              <div className="text-center">
                <div className="font-mono text-[26px] font-bold tracking-tight text-[#4ade80]">
                  {learnedCount.toLocaleString()}
                </div>
                <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/45">Đã học</div>
              </div>
              <div className="text-center">
                <div className="font-mono text-[26px] font-bold tracking-tight text-white/25">
                  {(total - learnedCount).toLocaleString()}
                </div>
                <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/45">Chưa học</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Flame className="h-4 w-4 text-amber-400" />
                  <span className="font-mono text-[26px] font-bold tracking-tight text-amber-400">21</span>
                </div>
                <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/45">Ngày streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-4 rounded-[14px] border border-black/[.07] bg-white px-5 py-4">
          {/* Level */}
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-wider text-[#ADADB8]">
              Cấp độ
            </span>
            <div className="flex flex-wrap gap-1">
              {JLPT_LEVELS.map(({ value, label }) => {
                const active = level === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleLevelChange(value)}
                    className={cn(
                      chipBase,
                      active
                        ? value === 'all'
                          ? chipActiveAll
                          : LEVEL_ACTIVE[value]
                        : chipInactive,
                    )}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="h-5 w-px shrink-0 bg-black/[.13]" />

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-wider text-[#ADADB8]">
              Trạng thái
            </span>
            <div className="flex flex-wrap gap-1">
              {STATUS_TABS.map((tab) => {
                const active = statusFilter === tab.value
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => handleStatusChange(tab.value)}
                    className={cn(chipBase, active ? chipActiveAll : chipInactive)}
                  >
                    {tab.label}
                    {data && (
                      <span className="ml-1 font-mono text-[10px] opacity-60">
                        {tab.value === 'all'
                          ? total
                          : tab.value === 'learned'
                            ? learnedCount
                            : total - learnedCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="h-5 w-px shrink-0 bg-black/[.13]" />

          {/* More filters (types + progress) */}
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className={cn(
                  chipBase,
                  selectedTypes.length > 0 ? chipActiveAll : chipInactive,
                )}
              >
                <SlidersHorizontal className="mr-1 inline h-3 w-3" />
                Bộ lọc{selectedTypes.length > 0 && ` (${selectedTypes.length})`}
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 pt-8">
              <GrammarFilterPanel {...filterProps} />
            </SheetContent>
          </Sheet>

          {/* Search */}
          <div className="relative ml-auto">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#ADADB8]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Tìm mẫu câu, ví dụ..."
              className="w-48 rounded-lg border-[1.5px] border-black/[.13] bg-[#FAFAF8] py-[7px] pl-8 pr-3 text-[13px] text-[#0D0D0F] outline-none transition-colors placeholder:text-[#ADADB8] focus:border-[#0D0D0F]"
            />
          </div>
        </div>

        {/* Card list */}
        <div>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <p className="text-sm text-muted-foreground">Đã có lỗi xảy ra</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Thử lại
              </Button>
            </div>
          ) : lessons.length === 0 ? (
            <Empty className="py-16" />
          ) : (
            <div className="flex flex-col gap-1.5">
              {lessons.map((lesson) => (
                <GrammarCard
                  key={lesson.id}
                  lesson={lesson}
                  isOpen={expandedId === lesson.id}
                  onToggle={() => handleCardToggle(lesson.id)}
                  onAddFlashcard={addToFlashcard}
                  isAddingFlashcard={isAddingFlashcard}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="mt-5 flex items-center justify-center gap-1">
              <PaginationButton
                label="←"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              />
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                const p = i + 1
                return (
                  <PaginationButton
                    key={p}
                    label={String(p)}
                    active={page === p}
                    onClick={() => setPage(p)}
                  />
                )
              })}
              {totalPages > 7 && (
                <>
                  <PaginationButton label="…" disabled onClick={() => {}} />
                  <PaginationButton
                    label={String(totalPages)}
                    active={page === totalPages}
                    onClick={() => setPage(totalPages)}
                  />
                </>
              )}
              <PaginationButton
                label="→"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PaginationButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-8 min-w-[2rem] items-center justify-center rounded-lg border-[1.5px] px-2 font-mono text-[12px] font-medium transition-colors',
        active
          ? 'border-foreground bg-foreground text-background'
          : 'border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed',
      )}
    >
      {label}
    </button>
  )
}
