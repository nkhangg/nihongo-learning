'use client'

import { Globe } from 'lucide-react'
import { SettingRow } from './SettingRow'
import { ChipGroup } from './ChipGroup'
import { cn } from '@shared/utils'
import type { LanguageSettings, UILanguage, DefinitionLang, Phonetics } from '../types'

const PHONETICS_OPTIONS = [
  { value: 'hiragana', label: 'Hiragana' },
  { value: 'romaji', label: 'Romaji' },
  { value: 'both', label: 'Cả hai' },
]

const selectCls = cn(
  'h-9 min-w-[150px] appearance-none rounded-sm border border-border bg-background px-3 pr-7 text-[13px] text-foreground',
  'focus:border-ink focus:outline-none transition-colors',
  "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%23ADADB8' d='M5 6L0 0h10z'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_10px_center]",
)

interface LanguageSectionProps {
  settings: LanguageSettings
  onChange: (values: Partial<LanguageSettings>) => void
}

export function LanguageSection({ settings, onChange }: LanguageSectionProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
          <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
          Ngôn ngữ & Khu vực
        </p>
      </div>

      <SettingRow
        label="Ngôn ngữ giao diện"
        description="Ngôn ngữ hiển thị của ứng dụng"
        control={
          <select
            value={settings.uiLanguage}
            onChange={(e) => onChange({ uiLanguage: e.target.value as UILanguage })}
            className={selectCls}
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </select>
        }
      />
      <SettingRow
        label="Ngôn ngữ nghĩa từ"
        description="Ngôn ngữ hiển thị nghĩa của từ vựng"
        control={
          <select
            value={settings.definitionLanguage}
            onChange={(e) => onChange({ definitionLanguage: e.target.value as DefinitionLang })}
            className={selectCls}
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        }
      />
      <SettingRow
        label="Hệ thống phiên âm"
        description="Cách hiển thị phiên âm tiếng Nhật"
        control={
          <ChipGroup
            options={PHONETICS_OPTIONS}
            value={settings.phonetics}
            onChange={(v) => onChange({ phonetics: v as Phonetics })}
          />
        }
      />
    </div>
  )
}
