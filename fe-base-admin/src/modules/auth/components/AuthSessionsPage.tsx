import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Shield, Trash2 } from 'lucide-react'
import { Button } from '@shared/components/ui/button'
import { Badge } from '@shared/components/ui/badge'
import { ConfirmDialog } from '@shared/components/ui/confirm-dialog'
import { useAdminSessions, useRevokeAdminSession } from '../hooks/useAuth'
import type { AdminSession } from '../types'

export function AuthSessionsPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [onlyActive, setOnlyActive] = useState(true)
  const [revokeTarget, setRevokeTarget] = useState<AdminSession | null>(null)

  const { data, isLoading } = useAdminSessions({ page, pageSize: 20, onlyActive })
  const revoke = useRevokeAdminSession()

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-zinc-400" />
          <h1 className="text-xl font-semibold">{t('auth.sessions.title', 'Session Management')}</h1>
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyActive}
            onChange={(e) => { setOnlyActive(e.target.checked); setPage(1) }}
            className="rounded"
          />
          {t('auth.sessions.onlyActive', 'Only active')}
        </label>
      </div>

      {isLoading ? (
        <div className="text-sm text-zinc-400">{t('common.loading', 'Loading...')}</div>
      ) : (
        <>
          <div className="rounded-md border border-zinc-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900 text-zinc-400">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">User</th>
                  <th className="px-4 py-3 text-left font-medium">Device</th>
                  <th className="px-4 py-3 text-left font-medium">IP</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Last active</th>
                  <th className="px-4 py-3 text-left font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {data?.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                      {t('common.noData', 'No data')}
                    </td>
                  </tr>
                )}
                {data?.data.map((session) => (
                  <tr key={session.id} className="hover:bg-zinc-900/50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{session.userEmail}</div>
                      <div className="text-xs text-zinc-500">{session.userType}{session.isAdmin ? ' · admin' : ''}</div>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{session.deviceName}</td>
                    <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{session.ipAddress}</td>
                    <td className="px-4 py-3">
                      <Badge variant={session.isActive ? 'default' : 'secondary'}>
                        {session.isActive ? t('auth.sessions.active', 'Active') : t('auth.sessions.revoked', 'Revoked')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">
                      {new Date(session.lastActiveAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {session.isActive && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => setRevokeTarget(session)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-zinc-400">
              <span>
                {t('common.total', 'Total')}: {data?.total}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  {t('common.prev', 'Prev')}
                </Button>
                <span className="px-3 py-1">{page} / {totalPages}</span>
                <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  {t('common.next', 'Next')}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        title={t('auth.sessions.revokeTitle', 'Revoke session?')}
        description={t('auth.sessions.revokeDesc', 'This will force logout the user from this device.')}
        confirmLabel={t('common.revoke', 'Revoke')}
        variant="danger"
        onConfirm={() => {
          if (revokeTarget) {
            revoke.mutate(revokeTarget.id, { onSettled: () => setRevokeTarget(null) })
          }
        }}
      />
    </div>
  )
}
