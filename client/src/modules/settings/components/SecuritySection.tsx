'use client'

import { Lock } from 'lucide-react'
import { toast } from 'sonner'
import { SettingRow } from './SettingRow'
import { ToggleSwitch } from './ToggleSwitch'

interface SecuritySectionProps {
  twoFAEnabled: boolean
  onToggle2FA: (enabled: boolean) => void
}

export function SecuritySection({ twoFAEnabled, onToggle2FA }: SecuritySectionProps) {
  const btnCls =
    'rounded-sm border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface'

  const handleExport = () => {
    toast.info('📦 Đang chuẩn bị file xuất...')
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
          <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
          Bảo mật tài khoản
        </p>
      </div>

      <SettingRow
        label="Email"
        description="an.nguyen@gmail.com · Đã xác nhận ✓"
        control={<button type="button" className={btnCls}>Thay đổi</button>}
      />
      <SettingRow
        label="Mật khẩu"
        description="Lần đổi cuối: 3 tháng trước"
        control={<button type="button" className={btnCls}>Đổi mật khẩu</button>}
      />
      <SettingRow
        label="Đăng nhập với Google"
        description="Tài khoản Google đã được liên kết"
        control={
          <button
            type="button"
            className="rounded-sm border border-border bg-background px-3 py-1.5 text-xs font-medium text-vermillion transition-colors hover:bg-surface"
          >
            Huỷ liên kết
          </button>
        }
      />
      <SettingRow
        label="Xác thực 2 bước"
        description="Tăng cường bảo mật với OTP qua email"
        control={<ToggleSwitch checked={twoFAEnabled} onChange={onToggle2FA} />}
      />
      <SettingRow
        label="Các phiên đăng nhập"
        description="2 thiết bị đang đăng nhập"
        control={<button type="button" className={btnCls}>Quản lý</button>}
      />
      <SettingRow
        label="Xuất dữ liệu"
        description="Tải về toàn bộ dữ liệu học tập dạng CSV"
        control={
          <button type="button" onClick={handleExport} className={btnCls}>
            Xuất dữ liệu
          </button>
        }
      />
    </div>
  )
}
