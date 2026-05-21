'use client'

import { useState } from 'react'
import { Button, ConfirmDialog } from '@shared/components/ui'
import { useDeleteLearningHistory, useDeleteAccount } from '../hooks/useProfile'

export function DangerZoneSection() {
  const [historyOpen, setHistoryOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  const { mutate: deleteHistory, isPending: deletingHistory } = useDeleteLearningHistory()
  const { mutate: deleteAccount, isPending: deletingAccount } = useDeleteAccount()

  return (
    <>
      <div className="border border-red-200/70 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 bg-red-50 border-b border-red-100">
          <p className="text-xs font-semibold text-red-500">⚠ Vùng nguy hiểm</p>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-red-50">
          <div>
            <p className="text-[13px] font-medium">Xoá lịch sử học tập</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Xoá toàn bộ dữ liệu SRS và tiến độ. Không thể hoàn tác.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 border-red-200 hover:bg-red-50 shrink-0 ml-4"
            onClick={() => setHistoryOpen(true)}
          >
            Xoá lịch sử
          </Button>
        </div>

        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-[13px] font-medium">Xoá tài khoản</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Xoá vĩnh viễn tài khoản và toàn bộ dữ liệu.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 border-red-200 hover:bg-red-50 shrink-0 ml-4"
            onClick={() => setAccountOpen(true)}
          >
            Xoá tài khoản
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onConfirm={() => {
          deleteHistory(undefined, { onSettled: () => setHistoryOpen(false) })
        }}
        variant="danger"
        title="Xoá lịch sử học tập?"
        description="Toàn bộ dữ liệu SRS và tiến độ sẽ bị xoá vĩnh viễn. Hành động này không thể hoàn tác."
        confirmLabel="Xoá lịch sử"
        loading={deletingHistory}
      />

      <ConfirmDialog
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        onConfirm={() => {
          deleteAccount(undefined, { onSettled: () => setAccountOpen(false) })
        }}
        variant="danger"
        title="Xoá tài khoản?"
        description="Tài khoản và toàn bộ dữ liệu sẽ bị xoá vĩnh viễn. Hành động này không thể hoàn tác."
        confirmLabel="Xoá tài khoản"
        loading={deletingAccount}
      />
    </>
  )
}
