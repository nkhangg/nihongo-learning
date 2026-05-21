'use client'

import { useCallback, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { KanjiHero } from './KanjiHero'
import { KanjiFilterBar } from './KanjiFilterBar'
import { KanjiGrid } from './KanjiGrid'
import { KanjiBrowserSidebar } from './KanjiBrowserSidebar'
import { useKanjiList, useMyKanjiProgress, useRadicals } from '../hooks/useKanji'
import type { JlptLevel, KanjiStatus, ListKanjiParams } from '../types'

function useKanjiFilterParams(): [ListKanjiParams, (next: Partial<ListKanjiParams>) => void] {
  const router = useRouter()
  const searchParams = useSearchParams()

  const params: ListKanjiParams = {
    level: (searchParams.get('level') ?? 'all') as JlptLevel | 'all',
    status: (searchParams.get('status') ?? 'all') as KanjiStatus | 'all',
    search: searchParams.get('search') ?? '',
    page: Number(searchParams.get('page') ?? 1),
    limit: 64,
  }

  const setParams = useCallback(
    (next: Partial<ListKanjiParams>) => {
      const merged = { ...params, ...next }
      const sp = new URLSearchParams()
      if (merged.level && merged.level !== 'all') sp.set('level', merged.level)
      if (merged.status && merged.status !== 'all') sp.set('status', merged.status)
      if (merged.search) sp.set('search', merged.search)
      if (merged.page && merged.page > 1) sp.set('page', String(merged.page))
      router.replace(`/kanji?${sp.toString()}`, { scroll: false })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, searchParams.toString()],
  )

  return [params, setParams]
}

export function KanjiBrowserPage() {
  const [params, setParams] = useKanjiFilterParams()
  const [selectedRadical, setSelectedRadical] = useState<string | undefined>()

  const { data, isLoading } = useKanjiList({ ...params, radical: selectedRadical })
  const { data: progress } = useMyKanjiProgress()
  const { data: radicals = [] } = useRadicals()

  const kanjis = data?.data ?? []

  const handleRadicalSelect = (char: string | undefined) => {
    setSelectedRadical(char)
    setParams({ page: 1 })
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-5">
        <KanjiHero summary={progress} isLoading={!progress} />
        <KanjiFilterBar params={params} onChange={setParams} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_268px] gap-5 items-start">
          <KanjiGrid kanjis={kanjis} isLoading={isLoading} />
          <div className="hidden lg:block">
            <KanjiBrowserSidebar
              summary={progress}
              radicals={radicals}
              selectedRadical={selectedRadical}
              onRadicalSelect={handleRadicalSelect}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
