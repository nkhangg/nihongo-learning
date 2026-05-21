'use client'

import { useTranslation } from 'react-i18next'
import type { KanjiExample } from '../types'

interface ExamplesListProps {
  examples: KanjiExample[]
}

export function ExamplesList({ examples }: ExamplesListProps) {
  const { t } = useTranslation('kanji')

  if (!examples.length) {
    return (
      <p className="text-[13px] text-[#ADADB8] text-center py-4">Chưa có ví dụ trong câu.</p>
    )
  }

  return (
    <div className="space-y-2.5">
      {examples.map((ex, i) => (
        <div key={i} className="bg-[#F2F2EF] rounded-[14px] px-3.5 py-2.5 border border-black/[.07]">
          <p
            className="text-[15px] text-[#0D0D0F] leading-relaxed [&_ruby]:inline-flex [&_ruby]:flex-col [&_ruby]:items-center [&_rt]:text-[9px] [&_rt]:text-[#ADADB8] [&_em]:text-[#1565C0] [&_em]:not-italic [&_em]:font-semibold [&_.highlight]:text-[#1565C0] [&_.highlight]:font-semibold"
            dangerouslySetInnerHTML={{ __html: ex.jpHtml }}
          />
          <p className="mt-1 text-[12px] text-[#7A7A85]">{ex.vi}</p>
          {ex.source && (
            <p className="mt-1 text-[10px] text-[#ADADB8] font-mono">{ex.source}</p>
          )}
        </div>
      ))}
    </div>
  )
}
