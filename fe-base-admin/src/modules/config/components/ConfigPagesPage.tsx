import { useState } from 'react'
import {
  LayoutTemplate,
  Plus,
  ToggleRight,
  ToggleLeft,
  AlertTriangle,
  RefreshCw,
  MoreHorizontal,
  Pencil,
  Trash2,
  Power,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@shared/components/ui/button'
import { StatCard } from '@shared/components/ui/stat-card'
import { Card, CardContent } from '@shared/components/ui/card'
import { Badge } from '@shared/components/ui/badge'
import { Skeleton } from '@shared/components/ui/skeleton'
import { ConfirmDialog } from '@shared/components/ui/confirm-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu'
import { cn } from '@shared/utils'
import { toast } from 'sonner'
import { usePrefixConfigs } from '../hooks/usePrefixConfigs'
import { useUpdateConfig, useToggleConfig, useDeleteConfig } from '../hooks/useConfigs'
import { ConfigFormModal } from './ConfigFormModal'
import { AutoFieldEditor } from './AutoFieldEditor'
import type { AppConfig } from '../types'

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

function pageLabel(config: AppConfig): string {
  // pages.global.header → "header"; pages.home → "home"
  const parts = config.key.split('.')
  return parts.slice(2).join('.') || parts[1] || config.key
}

// ── PageConfigCard ─────────────────────────────────────────────────────────────

interface PageConfigCardProps {
  config: AppConfig
  onEditFull: (config: AppConfig) => void
}

function PageConfigCard({ config, onEditFull }: PageConfigCardProps) {
  const { t } = useTranslation()
  const rawValue = isPlainObject(config.value) ? config.value : {}
  const [editedValue, setEditedValue] = useState<Record<string, unknown>>(rawValue)
  const [isDirty, setIsDirty] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const updateConfig = useUpdateConfig()
  const toggleConfig = useToggleConfig()
  const deleteConfig = useDeleteConfig()

  const fieldEntries = Object.entries(editedValue)
  const isNonObject = !isPlainObject(config.value)

  const handleFieldChange = (key: string, val: unknown) => {
    setEditedValue((prev) => ({ ...prev, [key]: val }))
    setIsDirty(true)
  }

  const handleSave = () => {
    updateConfig.mutate(
      {
        id: config.id,
        value: editedValue,
        valueKeyOrder: Object.keys(editedValue),
      },
      {
        onSuccess: () => {
          toast.success(t('config.toast.saved'))
          setIsDirty(false)
        },
      },
    )
  }

  const handleToggle = () => {
    toggleConfig.mutate(config.id, {
      onSuccess: (res) =>
        toast.success(res.isEnabled ? t('config.toast.enabled') : t('config.toast.disabled')),
    })
  }

  const handleDelete = () => {
    deleteConfig.mutate(config.id, {
      onSuccess: () => toast.success(t('config.toast.deleted')),
    })
    setDeleteOpen(false)
  }

  return (
    <>
      <Card
        className={cn(
          'transition-all',
          isDirty && 'ring-2 ring-blue-200 shadow-sm',
          !config.isEnabled && 'opacity-60',
        )}
      >
        <CardContent className="space-y-4 p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{pageLabel(config)}</p>
              <p className="font-mono text-[10px] text-gray-400">{config.key}</p>
              {config.description && (
                <p className="mt-0.5 text-xs text-gray-500">{config.description}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {!config.isEnabled && (
                <Badge variant="outline" className="text-[10px]">
                  {t('config.status.off')}
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex size-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                    <MoreHorizontal className="size-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => onEditFull(config)}>
                    <Pencil className="mr-2 size-3.5" />
                    {t('config.actions.editDetails')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleToggle} disabled={toggleConfig.isPending}>
                    <Power className="mr-2 size-3.5" />
                    {config.isEnabled
                      ? t('config.actions.disableConfig')
                      : t('config.actions.enableConfig')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeleteOpen(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 size-3.5" />
                    {t('config.actions.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Fields */}
          {isNonObject ? (
            <button
              type="button"
              onClick={() => onEditFull(config)}
              className="flex w-full items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-100"
            >
              <span>{t('config.prefix.jsonValue')}</span>
              <Pencil className="size-3 text-gray-400" />
            </button>
          ) : fieldEntries.length === 0 ? (
            <p className="text-xs text-gray-400">
              {t('config.prefix.noFields')}{' '}
              <button
                type="button"
                onClick={() => onEditFull(config)}
                className="underline hover:no-underline"
              >
                {t('config.prefix.addViaJsonEditor')}
              </button>
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {fieldEntries.map(([key, val]) => (
                <div key={key} className="grid grid-cols-[120px_1fr] items-start gap-3 py-2 first:pt-0 last:pb-0">
                  <label className="pt-1.5 font-mono text-xs font-medium text-gray-500 truncate" title={key}>
                    {key}
                  </label>
                  <AutoFieldEditor
                    fieldKey={key}
                    value={val}
                    onChange={(v) => handleFieldChange(key, v)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Save */}
          {isDirty && (
            <Button
              size="sm"
              onClick={handleSave}
              isLoading={updateConfig.isPending}
              className="w-full"
            >
              {t('config.actions.save')}
            </Button>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={t('config.confirmDelete.title')}
        description={t('config.confirmDelete.description', { key: config.key })}
        confirmLabel={t('config.confirmDelete.confirm')}
        cancelLabel={t('config.actions.cancel')}
        variant="danger"
      />
    </>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export function ConfigPagesPage() {
  const { t } = useTranslation()
  const { configs, sections, totalEnabled, totalDisabled, meta, isLoading, isError, refetch } =
    usePrefixConfigs('pages')

  const [editingConfig, setEditingConfig] = useState<AppConfig | null>(null)
  const [showForm, setShowForm] = useState(false)

  const openCreate = () => {
    setEditingConfig(null)
    setShowForm(true)
  }

  const openEdit = (config: AppConfig) => {
    setEditingConfig(config)
    setShowForm(true)
  }

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 space-y-4 border-b border-gray-100 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-900">
                <LayoutTemplate className="size-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {t('config.prefix.pagesTitle')}
                </h2>
                <p className="text-xs text-gray-400">{t('config.prefix.pagesDescription')}</p>
              </div>
            </div>
            <Button onClick={openCreate} size="sm" className="gap-1.5 shrink-0">
              <Plus className="h-3.5 w-3.5" />
              {t('config.actions.create')}
            </Button>
          </div>

          {isError ? (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {t('config.loadErrorShort')}
              <button
                onClick={() => refetch()}
                className="ml-auto flex items-center gap-1 underline hover:no-underline"
              >
                <RefreshCw className="size-3" /> {t('config.retry')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                icon={LayoutTemplate}
                label={t('config.stats.total')}
                value={meta?.totalItems ?? configs.length}
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isLoading && (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-lg" />
              ))}
            </div>
          )}

          {!isLoading && !isError && sections.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-sm text-gray-400">
              <LayoutTemplate className="size-10 text-gray-200" />
              <p>{t('config.prefix.emptyWithPrefix', { prefix: 'pages' })}</p>
              <Button variant="outline" size="sm" onClick={openCreate} className="mt-2">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> {t('config.actions.createFirst')}
              </Button>
            </div>
          )}

          {!isLoading && !isError && sections.length > 0 && (
            <div className="space-y-8">
              {sections.map((sec) => (
                <div key={sec.section} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {sec.section}
                    </h3>
                    <div className="flex-1 border-t border-gray-100" />
                    <span className="text-[10px] text-gray-300">{sec.items.length}</span>
                  </div>
                  <div className="space-y-3">
                    {sec.items.map((config) => (
                      <PageConfigCard key={config.id} config={config} onEditFull={openEdit} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfigFormModal
        open={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingConfig(null)
        }}
        editingConfig={editingConfig}
      />
    </>
  )
}
