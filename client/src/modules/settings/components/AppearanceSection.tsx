'use client'

import { Palette } from 'lucide-react'
import { SettingRow } from './SettingRow'
import { ToggleSwitch } from './ToggleSwitch'
import { ChipGroup } from './ChipGroup'
import type { AppearanceSettings, Theme, KanjiFontSize } from '../types'

const THEME_OPTIONS = [
  { value: 'light', label: '☀️ Sáng' },
  { value: 'dark', label: '🌙 Tối' },
  { value: 'system', label: '🖥 Hệ thống' },
]

const FONT_SIZE_OPTIONS = [
  { value: 'sm', label: 'Nhỏ' },
  { value: 'md', label: 'Vừa' },
  { value: 'lg', label: 'Lớn' },
  { value: 'xl', label: 'Rất lớn' },
]

interface AppearanceSectionProps {
  settings: AppearanceSettings
  onChange: (values: Partial<AppearanceSettings>) => void
}

export function AppearanceSection({ settings, onChange }: AppearanceSectionProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
          <Palette className="h-4 w-4 shrink-0 text-muted-foreground" />
          Giao diện
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">Tuỳ chỉnh màu sắc và hiển thị</p>
      </div>

      <SettingRow
        label="Chủ đề"
        description="Chọn giao diện sáng hoặc tối"
        control={
          <ChipGroup
            options={THEME_OPTIONS}
            value={settings.theme}
            onChange={(v) => onChange({ theme: v as Theme })}
          />
        }
      />
      <SettingRow
        label="Cỡ chữ kanji"
        description="Kích thước chữ Nhật trên thẻ flashcard"
        control={
          <ChipGroup
            options={FONT_SIZE_OPTIONS}
            value={settings.kanjiFontSize}
            onChange={(v) => onChange({ kanjiFontSize: v as KanjiFontSize })}
          />
        }
      />
      <SettingRow
        label="Hiệu ứng chuyển động"
        description="Animation khi lật thẻ và chuyển màn hình"
        control={
          <ToggleSwitch
            checked={settings.animations}
            onChange={(v) => onChange({ animations: v })}
          />
        }
      />
      <SettingRow
        label="Âm thanh giao diện"
        description="Âm thanh khi đúng/sai và thành tích"
        control={
          <ToggleSwitch
            checked={settings.uiSounds}
            onChange={(v) => onChange({ uiSounds: v })}
          />
        }
      />
    </div>
  )
}
