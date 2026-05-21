'use client'

import { Bell } from 'lucide-react'
import { SettingRow } from './SettingRow'
import { ToggleSwitch } from './ToggleSwitch'
import type { NotifSettings } from '../types'

interface NotificationsSectionProps {
  settings: NotifSettings
  onChange: (values: Partial<NotifSettings>) => void
}

export function NotificationsSection({ settings, onChange }: NotificationsSectionProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
          <Bell className="h-4 w-4 shrink-0 text-muted-foreground" />
          Thông báo
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Chọn loại thông báo bạn muốn nhận
        </p>
      </div>

      <SettingRow
        label="Nhắc nhở học hàng ngày"
        description="Thông báo khi đến giờ học đã cài đặt"
        control={
          <ToggleSwitch
            checked={settings.dailyReminder}
            onChange={(v) => onChange({ dailyReminder: v })}
          />
        }
      />
      <SettingRow
        label="Sắp mất streak"
        description="Nhắc nhở khi còn 2 giờ để duy trì streak"
        control={
          <ToggleSwitch
            checked={settings.streakAlert}
            onChange={(v) => onChange({ streakAlert: v })}
          />
        }
      />
      <SettingRow
        label="Thẻ SRS đến hạn"
        description="Thông báo khi có thẻ cần ôn tập mới"
        control={
          <ToggleSwitch
            checked={settings.srsDue}
            onChange={(v) => onChange({ srsDue: v })}
          />
        }
      />
      <SettingRow
        label="Thành tích mới"
        description="Thông báo khi mở khoá huy hiệu hoặc milestone"
        control={
          <ToggleSwitch
            checked={settings.achievements}
            onChange={(v) => onChange({ achievements: v })}
          />
        }
      />
      <SettingRow
        label="Email tóm tắt tuần"
        description="Nhận email tóm tắt tiến độ học mỗi Chủ Nhật"
        control={
          <ToggleSwitch
            checked={settings.weeklyEmail}
            onChange={(v) => onChange({ weeklyEmail: v })}
          />
        }
      />
      <SettingRow
        label="Tin tức & cập nhật"
        description="Thông báo tính năng mới và ưu đãi"
        control={
          <ToggleSwitch
            checked={settings.newsUpdates}
            onChange={(v) => onChange({ newsUpdates: v })}
          />
        }
      />
    </div>
  )
}
