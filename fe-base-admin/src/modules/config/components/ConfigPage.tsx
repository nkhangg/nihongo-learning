import { useState } from 'react'
import { Settings, Plus, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@shared/components/ui/button'
import { StatCard } from '@shared/components/ui/stat-card'
import { DataTable, useDataTable } from '@shared/components/ui/data-table'
import { useConfigs } from '../hooks/useConfigs'
import { ConfigFormModal } from './ConfigFormModal'
import { buildColumns } from './_config-columns'
import type { AppConfig } from '../types'
import type { ConfigRow } from './_config-columns'

export function ConfigPage() {
  const { t } = useTranslation()
  const table = useDataTable<ConfigRow>({
    tableId: 'config-list',
    showSearch: true,
    searchPlaceholder: t('config.searchPlaceholder'),
    showFilters: true,
    showColumnVisibility: true,
    showRefreshButton: true,
    persistPageSize: true,
    persistFilters: true,
    persistSort: true,
    syncToUrl: true,
  })

  const { data, isLoading, isError, refetch } = useConfigs(table.buildQueryParams(['key']))
  const [showForm, setShowForm] = useState(false)
  const [editingConfig, setEditingConfig] = useState<AppConfig | null>(null)

  const configs = data?.data ?? []
  const meta = data?.meta
  const columns = buildColumns(t, (c) => {
    setEditingConfig(c)
    setShowForm(true)
  })

  const totalEnabled = configs.filter((c) => c.isEnabled).length
  const totalDisabled = configs.filter((c) => !c.isEnabled).length

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('config.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('config.subtitle')}</p>
        </div>
        <Button
          onClick={() => {
            setEditingConfig(null)
            setShowForm(true)
          }}
          className="gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
          {t('config.actions.create')}
        </Button>
      </div>

      {/* Stat cards */}
      {!isError && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            icon={Settings}
            label={t('config.stats.total')}
            value={meta?.totalItems ?? 0}
            isLoading={isLoading}
          />
          <StatCard
            icon={ToggleRight}
            label={t('config.stats.enabled')}
            value={totalEnabled}
            isLoading={isLoading}
          />
          <StatCard
            icon={ToggleLeft}
            label={t('config.stats.disabled')}
            value={totalDisabled}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {t('config.loadError')}
        </div>
      )}

      {/* DataTable */}
      {!isError && (
        <DataTable<ConfigRow>
          columns={columns}
          data={configs as ConfigRow[]}
          loading={isLoading}
          rowKey="id"
          emptyText={t('config.empty')}
          table={table}
          total={meta?.totalItems}
          onRefresh={refetch}
        />
      )}

      <ConfigFormModal
        open={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingConfig(null)
        }}
        editingConfig={editingConfig}
      />
    </div>
  )
}
