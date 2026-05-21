import { useState } from 'react'
import { Settings, ToggleLeft, ToggleRight, Pencil, Trash2, Copy, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { TFunction } from 'i18next'
import { Button } from '@shared/components/ui/button'
import { Badge } from '@shared/components/ui/badge'
import { ConfirmDialog } from '@shared/components/ui/confirm-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu'
import { cn } from '@shared/utils'
import type { ColumnDef } from '@shared/components/ui/data-table'
import { useToggleConfig, useDeleteConfig } from '../hooks/useConfigs'
import type { AppConfig } from '../types'

export type ConfigRow = AppConfig & Record<string, unknown>

export const SCOPE_OPTIONS = [
  { label: 'Public', value: 'public' },
  { label: 'Members', value: 'members' },
  { label: 'Internal', value: 'internal' },
]

export const SCOPE_COLORS: Record<string, string> = {
  public: 'bg-green-100 text-green-700',
  members: 'bg-blue-100 text-blue-700',
  internal: 'bg-orange-100 text-orange-700',
}

export function CopyKeyButton({ value }: { value: string }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const copy = () => {
    void navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={copy}
      title={t('config.actions.copyKey')}
      className="rounded p-0.5 text-gray-300 transition-colors hover:text-gray-500"
    >
      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
    </button>
  )
}

export function ActionDropdown({
  config,
  onEdit,
}: {
  config: AppConfig
  onEdit: (c: AppConfig) => void
}) {
  const { t } = useTranslation()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const toggleConfig = useToggleConfig()
  const deleteConfig = useDeleteConfig()

  const handleDelete = () => {
    deleteConfig.mutate(config.id, {
      onSuccess: () => {
        toast.success(t('config.toast.deleted'))
        setDeleteOpen(false)
      },
      onError: () => toast.error(t('config.toast.deleteFailed')),
    })
  }

  return (
    <>
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 data-[state=open]:bg-gray-100"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onEdit(config)} className="gap-2">
              <Pencil className="h-3.5 w-3.5" />
              {t('config.actions.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toggleConfig.mutate(config.id)}
              disabled={toggleConfig.isPending}
              className="gap-2"
            >
              {config.isEnabled ? (
                <>
                  <ToggleRight className="h-3.5 w-3.5 text-gray-500" />
                  {t('config.actions.disable')}
                </>
              ) : (
                <>
                  <ToggleLeft className="h-3.5 w-3.5 text-green-500" />
                  {t('config.actions.enable')}
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeleteOpen(true)}
              className="gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t('config.actions.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={t('config.confirmDelete.title')}
        description={t('config.confirmDelete.description', { key: config.key })}
        confirmLabel={t('config.confirmDelete.confirm')}
        cancelLabel={t('config.actions.cancel')}
        variant="danger"
        loading={deleteConfig.isPending}
      />
    </>
  )
}

export function buildColumns(
  t: TFunction,
  onEdit: (c: AppConfig) => void,
): ColumnDef<ConfigRow>[] {
  return [
    {
      key: 'key',
      header: t('config.columns.key'),
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-sm font-medium text-gray-900">{row.key as string}</span>
          <CopyKeyButton value={row.key as string} />
        </div>
      ),
    },
    {
      key: 'scope',
      header: t('config.columns.scope'),
      filterable: true,
      filterType: 'select',
      filterOptions: SCOPE_OPTIONS,
      width: '130px',
      render: (value) => (
        <span
          className={cn(
            'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
            SCOPE_COLORS[value as string] ?? 'bg-gray-100 text-gray-600',
          )}
        >
          {value as string}
        </span>
      ),
    },
    {
      key: 'isEnabled',
      header: t('config.columns.status'),
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: t('config.status.enabled'), value: 'true' },
        { label: t('config.status.disabled'), value: 'false' },
      ],
      width: '110px',
      render: (value) => {
        const enabled = value === true
        return (
          <Badge
            className={cn(
              'border-0 text-[11px] font-medium',
              enabled ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500',
            )}
          >
            <span
              className={cn(
                'mr-1.5 inline-block h-1.5 w-1.5 rounded-full',
                enabled ? 'bg-white/70' : 'bg-gray-400',
              )}
            />
            {enabled ? t('config.status.enabled') : t('config.status.disabled')}
          </Badge>
        )
      },
    },
    {
      key: 'tags',
      header: t('config.columns.tags'),
      width: '160px',
      render: (value) => {
        const tags = value as string[]
        if (!tags?.length) return <span className="text-xs text-gray-400">—</span>
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-[10px] text-gray-400">+{tags.length - 3}</span>
            )}
          </div>
        )
      },
    },
    {
      key: 'value',
      header: t('config.columns.valuePreview'),
      render: (value) => (
        <span className="block max-w-[200px] truncate font-mono text-xs text-gray-500">
          {JSON.stringify(value).slice(0, 60)}
          {JSON.stringify(value).length > 60 ? '…' : ''}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: t('config.columns.updatedAt'),
      sortable: true,
      width: '120px',
      className: 'text-gray-500 text-xs',
      render: (value) =>
        new Date(value as string).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
    },
    {
      key: 'actions',
      header: '',
      width: '56px',
      render: (_, row) => (
        <ActionDropdown config={row as unknown as AppConfig} onEdit={onEdit} />
      ),
    },
  ]
}
