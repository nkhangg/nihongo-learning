'use client'

import { BookOpen } from 'lucide-react'
import { SettingRow } from './SettingRow'
import { ToggleSwitch } from './ToggleSwitch'
import { cn } from '@shared/utils'
import type { LearningSettings, StudyMode, CardOrder } from '../types'

const HOUR_OPTIONS = ['07', '08', '09', '10', '12', '19', '20', '21']
const MINUTE_OPTIONS = ['00', '15', '30', '45']

interface LearningSectionProps {
  settings: LearningSettings
  onChange: (values: Partial<LearningSettings>) => void
}

const selectCls = cn(
  'h-9 appearance-none rounded-sm border border-border bg-background px-3 pr-7 text-[13px] text-foreground',
  'focus:border-ink focus:outline-none transition-colors',
  "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%23ADADB8' d='M5 6L0 0h10z'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_10px_center]",
)

const numberCls =
  'w-[70px] h-9 border border-border rounded-sm px-3 text-center font-mono text-sm text-foreground bg-background focus:border-ink focus:outline-none transition-colors'

export function LearningSection({ settings, onChange }: LearningSectionProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
          <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
          Học tập & Lộ trình
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Cài đặt mục tiêu và phương thức học hàng ngày
        </p>
      </div>

      <SettingRow
        label="Mục tiêu học mỗi ngày"
        description="Số thẻ flashcard tối thiểu cần hoàn thành để tính streak"
        control={
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={5}
              max={200}
              value={settings.dailyGoal}
              onChange={(e) => onChange({ dailyGoal: Number(e.target.value) })}
              className={numberCls}
            />
            <span className="text-[12px] text-muted-foreground">thẻ / ngày</span>
          </div>
        }
      />

      <SettingRow
        label="Giờ nhắc nhở học"
        description="Thời điểm gửi thông báo nhắc nhở học hàng ngày"
        control={
          <div className="flex items-center gap-1.5">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] font-medium uppercase tracking-widest text-ink-4">
                Giờ
              </span>
              <select
                value={settings.reminderHour}
                onChange={(e) => onChange({ reminderHour: e.target.value })}
                className={cn(selectCls, 'min-w-[70px]')}
              >
                {HOUR_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
            <span className="mt-4 text-base text-muted-foreground">:</span>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] font-medium uppercase tracking-widest text-ink-4">
                Phút
              </span>
              <select
                value={settings.reminderMinute}
                onChange={(e) => onChange({ reminderMinute: e.target.value })}
                className={cn(selectCls, 'min-w-[70px]')}
              >
                {MINUTE_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        }
      />

      <SettingRow
        label="Chế độ học mặc định"
        description="Chọn cách hiển thị thẻ khi bắt đầu phiên học"
        control={
          <select
            value={settings.studyMode}
            onChange={(e) => onChange({ studyMode: e.target.value as StudyMode })}
            className={cn(selectCls, 'min-w-[180px]')}
          >
            <option value="recognition">Recognition (Nhận diện)</option>
            <option value="typing">Typing (Gõ tiếng Nhật)</option>
            <option value="mixed">Xen kẽ cả hai</option>
          </select>
        }
      />

      <SettingRow
        label="Tự động lật thẻ sau"
        description="Thời gian chờ trước khi thẻ tự lật (0 = tắt)"
        control={
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={30}
              value={settings.autoFlipSeconds}
              onChange={(e) => onChange({ autoFlipSeconds: Number(e.target.value) })}
              className={numberCls}
            />
            <span className="text-[12px] text-muted-foreground">giây</span>
          </div>
        }
      />

      <SettingRow
        label="Hiển thị furigana"
        description="Hiện phiên âm hiragana trên chữ kanji khi học"
        control={
          <ToggleSwitch
            checked={settings.showFurigana}
            onChange={(v) => onChange({ showFurigana: v })}
          />
        }
      />

      <SettingRow
        label="Âm thanh phát âm"
        description="Phát âm tiếng Nhật khi lật thẻ"
        control={
          <ToggleSwitch
            checked={settings.audioEnabled}
            onChange={(v) => onChange({ audioEnabled: v })}
          />
        }
      />

      <SettingRow
        label="Thứ tự thẻ"
        description="Cách sắp xếp thứ tự các thẻ trong phiên học"
        control={
          <select
            value={settings.cardOrder}
            onChange={(e) => onChange({ cardOrder: e.target.value as CardOrder })}
            className={cn(selectCls, 'min-w-[180px]')}
          >
            <option value="srs">Theo SRS (khuyến nghị)</option>
            <option value="random">Ngẫu nhiên</option>
            <option value="added">Theo thứ tự thêm vào</option>
            <option value="hard-first">Khó trước</option>
          </select>
        }
      />

      <SettingRow
        label="Phím tắt bàn phím"
        description="Dùng Space lật thẻ, 1–4 đánh giá, → bỏ qua"
        control={
          <ToggleSwitch
            checked={settings.keyboardShortcuts}
            onChange={(v) => onChange({ keyboardShortcuts: v })}
          />
        }
      />
    </div>
  )
}
