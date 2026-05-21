'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { KanjiDetail } from '../types'

interface StrokeOrderStepsProps {
  kanji: KanjiDetail
}

export function StrokeOrderSteps({ kanji }: StrokeOrderStepsProps) {
  const { t } = useTranslation('kanji')
  const [activeStep, setActiveStep] = useState<number | null>(null)

  const steps = kanji.strokeOrderSvg.map((svgPath, i) => ({
    index: i + 1,
    svgPath,
  }))

  if (steps.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-[#F2F2EF] px-4 py-3 text-sm text-[#7A7A85]">
        <span className="text-2xl">{kanji.char}</span>
        <span>Dữ liệu stroke order chưa có. Số nét: {kanji.strokes}</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {steps.map((step) => (
          <button
            key={step.index}
            type="button"
            onMouseEnter={() => setActiveStep(step.index)}
            onMouseLeave={() => setActiveStep(null)}
            onClick={() => setActiveStep(activeStep === step.index ? null : step.index)}
            className={[
              'relative w-14 h-14 flex flex-col items-center justify-center rounded-lg border-[1.5px] transition-all cursor-pointer',
              activeStep === step.index
                ? 'border-[#0F8A72] bg-[#E8F7F4]'
                : 'border-black/[.07] bg-[#F2F2EF] hover:border-[#1565C0] hover:bg-[#E8F4FF]',
            ].join(' ')}
          >
            <span className="absolute top-[3px] left-[5px] text-[8px] font-semibold text-[#ADADB8] font-mono leading-none">{step.index}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(step.svgPath)}`} alt={`${kanji.char} nét ${step.index}`} className="w-8 h-8 object-contain" />
            {activeStep === step.index && (
              <span className="text-[8px] text-[#0F8A72] font-semibold mt-[-2px]">+nét {step.index}</span>
            )}
          </button>
        ))}
      </div>
      {kanji.strokeOrder?.[0]?.note && (
        <div className="mt-2.5 text-[12px] text-[#3A3A40] bg-[#FEF6E4] px-3 py-2 rounded-lg border-l-[3px] border-[#C47D0E] leading-relaxed">
          {kanji.strokeOrder[0].note}
        </div>
      )}
    </div>
  )
}
