import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@shared/components/ui/button'
import { Badge } from '@shared/components/ui/badge'
import { DataTable, useDataTable, type ColumnDef } from '@shared/components/ui/data-table'
import { ConfirmDialog } from '@shared/components/ui/confirm-dialog'
import { useKanjiRadicals, useDeleteKanjiRadical } from '../hooks/useKanjiRadicals'
import { KanjiRadicalFormModal } from './KanjiRadicalFormModal'
import type { KanjiRadical } from '../types'

type RadicalRow = KanjiRadical & Record<string, unknown>

function buildColumns(
  onEdit: (r: KanjiRadical) => void,
  onDelete: (r: KanjiRadical) => void,
): ColumnDef<RadicalRow>[] {
  return [
    {
      key: 'char',
      header: 'Bộ thủ',
      sortable: true,
      render: (_, row) => (
        <span className="text-2xl font-bold text-gray-900">{row.char as string}</span>
      ),
      width: '80px',
    },
    {
      key: 'meaningVi',
      header: 'Nghĩa',
      sortable: true,
    },
    {
      key: 'strokes',
      header: 'Số nét',
      sortable: true,
      width: '80px',
      className: 'text-center text-sm text-gray-600',
    },
    {
      key: 'isPopular',
      header: 'Phổ biến',
      width: '100px',
      render: (value) =>
        value ? (
          <Badge className="bg-indigo-100 text-indigo-700 border-0 text-[11px]">Phổ biến</Badge>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      width: '80px',
      render: (_, row) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400"
            onClick={() => onEdit(row as unknown as KanjiRadical)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-red-400 hover:text-red-600"
            onClick={() => onDelete(row as unknown as KanjiRadical)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ]
}

export function KanjiRadicalsPage() {
  const { t } = useTranslation()
  const [showModal, setShowModal] = useState(false)
  const [editingRadical, setEditingRadical] = useState<KanjiRadical | null>(null)
  const [deletingRadical, setDeletingRadical] = useState<KanjiRadical | null>(null)

  const { data: radicals = [], isLoading, isError, refetch } = useKanjiRadicals()
  const deleteRadical = useDeleteKanjiRadical()

  const table = useDataTable<RadicalRow>({
    tableId: 'kanji-radicals',
    showSearch: true,
    searchPlaceholder: 'Tìm bộ thủ, nghĩa...',
    showRefreshButton: true,
    persistPageSize: true,
  })

  const columns = buildColumns(
    (r) => { setEditingRadical(r); setShowModal(true) },
    (r) => setDeletingRadical(r),
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('kanji.radicalsTitle')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('kanji.radicalsSubtitle', 'Quản lý danh sách bộ thủ (radicals)')}</p>
        </div>
        <Button
          onClick={() => { setEditingRadical(null); setShowModal(true) }}
          className="gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
          {t('kanji.actions.create')}
        </Button>
      </div>

      {isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          Không thể tải danh sách bộ thủ. Vui lòng thử lại.
        </div>
      ) : (
        <DataTable<RadicalRow>
          columns={columns}
          data={radicals as RadicalRow[]}
          loading={isLoading}
          rowKey="id"
          emptyText="Chưa có bộ thủ nào"
          table={table}
          onRefresh={refetch}
        />
      )}

      <KanjiRadicalFormModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditingRadical(null) }}
        editingRadical={editingRadical}
      />

      <ConfirmDialog
        open={!!deletingRadical}
        onClose={() => setDeletingRadical(null)}
        title={`Xóa bộ thủ "${deletingRadical?.char}"?`}
        description="Các kanji dùng bộ thủ này sẽ mất liên kết (radicalId = null). Hành động không thể hoàn tác."
        confirmLabel="Xóa"
        variant="danger"
        onConfirm={() => {
          if (!deletingRadical) return
          deleteRadical.mutate(deletingRadical.id, {
            onSuccess: () => {
              toast.success(`Đã xóa bộ thủ: ${deletingRadical.char}`)
              setDeletingRadical(null)
            },
            onError: () => toast.error('Xóa thất bại'),
          })
        }}
        loading={deleteRadical.isPending}
      />
    </div>
  )
}
