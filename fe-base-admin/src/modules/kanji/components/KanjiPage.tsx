import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Plus,
  Pencil,
  Trash2,
  Globe,
  EyeOff,
  Settings,
  BookOpen,
  Layers,
  FileCheck,
  FilePen,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@shared/components/ui/button'
import { Badge } from '@shared/components/ui/badge'
import { DataTable, useDataTable, type ColumnDef } from '@shared/components/ui/data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu'
import { ConfirmDialog } from '@shared/components/ui/confirm-dialog'
import { cn } from '@shared/utils'
import { ROUTES } from '@config/routes'
import {
  useKanjiList,
  useDeleteKanji,
  usePublishKanji,
  useUnpublishKanji,
} from '../hooks/useKanjis'
import { KanjiFormModal } from './KanjiFormModal'
import type { KanjiDetail, KanjiListItem, KanjiStatus, JlptLevel } from '../types'

// ── Constants ──────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<KanjiStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PUBLISHED: 'bg-green-100 text-green-700',
}

const STATUS_OPTIONS = [
  { label: 'Nháp', value: 'DRAFT' },
  { label: 'Đã xuất bản', value: 'PUBLISHED' },
]

const JLPT_OPTIONS: { label: string; value: string }[] = [
  { label: 'N5', value: 'N5' },
  { label: 'N4', value: 'N4' },
  { label: 'N3', value: 'N3' },
  { label: 'N2', value: 'N2' },
  { label: 'N1', value: 'N1' },
]

const JLPT_COLORS: Record<JlptLevel, string> = {
  N5: 'bg-emerald-100 text-emerald-700',
  N4: 'bg-blue-100 text-blue-700',
  N3: 'bg-yellow-100 text-yellow-700',
  N2: 'bg-orange-100 text-orange-700',
  N1: 'bg-red-100 text-red-700',
}

type KanjiRow = KanjiListItem & Record<string, unknown>

// ── Row actions ────────────────────────────────────────────────────────────

function KanjiActions({
  kanji,
  onEdit,
}: {
  kanji: KanjiListItem
  onEdit: (k: KanjiListItem) => void
}) {
  const [showDelete, setShowDelete] = useState(false)
  const deleteKanji = useDeleteKanji()
  const publishKanji = usePublishKanji()
  const unpublishKanji = useUnpublishKanji()

  const isPublished = kanji.status === 'PUBLISHED'

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
            <DropdownMenuItem onClick={() => onEdit(kanji)} className="gap-2">
              <Pencil className="h-3.5 w-3.5" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {isPublished ? (
              <DropdownMenuItem
                onClick={() =>
                  unpublishKanji.mutate(kanji.id, {
                    onSuccess: () => toast.success(`Đã hủy xuất bản: ${kanji.char}`),
                    onError: () => toast.error('Thất bại'),
                  })
                }
                className="gap-2"
              >
                <EyeOff className="h-3.5 w-3.5" />
                Hủy xuất bản
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() =>
                  publishKanji.mutate(kanji.id, {
                    onSuccess: () => toast.success(`Đã xuất bản: ${kanji.char}`),
                    onError: () => toast.error('Thất bại'),
                  })
                }
                className="gap-2"
              >
                <Globe className="h-3.5 w-3.5" />
                Xuất bản
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowDelete(true)}
              className="gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title={`Xóa kanji "${kanji.char}"?`}
        description="Xóa kanji này sẽ xóa toàn bộ nested data (nghĩa, ví dụ, từ ghép, similar, progress của user). Hành động không thể hoàn tác."
        confirmLabel="Xóa"
        variant="danger"
        onConfirm={() =>
          deleteKanji.mutate(kanji.id, {
            onSuccess: () => {
              toast.success(`Đã xóa: ${kanji.char}`)
              setShowDelete(false)
            },
            onError: () => toast.error('Xóa thất bại'),
          })
        }
        loading={deleteKanji.isPending}
      />
    </>
  )
}

// ── Columns ────────────────────────────────────────────────────────────────

function buildColumns(onEdit: (k: KanjiListItem) => void): ColumnDef<KanjiRow>[] {
  return [
    {
      key: 'char',
      header: 'Kanji',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-gray-900 leading-none w-10 text-center">
            {row.char as string}
          </span>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 text-sm truncate max-w-[180px]">
              {row.meaningVi as string}
            </p>
            <p className="text-xs text-gray-400 truncate max-w-[180px]">
              {row.meaningEn as string}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'jlptLevel',
      header: 'JLPT',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: JLPT_OPTIONS,
      width: '80px',
      render: (value) => (
        <Badge className={cn('text-[11px] font-medium border-0', JLPT_COLORS[value as JlptLevel])}>
          {value as string}
        </Badge>
      ),
    },
    {
      key: 'strokes',
      header: 'Nét',
      sortable: true,
      width: '60px',
      className: 'text-center text-sm text-gray-600',
    },
    {
      key: 'status',
      header: 'Trạng thái',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: STATUS_OPTIONS,
      width: '120px',
      render: (value) => {
        const status = value as KanjiStatus
        return (
          <Badge className={cn('text-[11px] font-medium border-0', STATUS_COLORS[status])}>
            {status === 'PUBLISHED' ? 'Đã xuất bản' : 'Nháp'}
          </Badge>
        )
      },
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      sortable: true,
      width: '110px',
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
        <KanjiActions kanji={row as unknown as KanjiListItem} onEdit={onEdit} />
      ),
    },
  ]
}

// ── Main page ──────────────────────────────────────────────────────────────

export function KanjiPage() {
  const { t } = useTranslation()
  const [showModal, setShowModal] = useState(false)
  const [editingKanji, setEditingKanji] = useState<KanjiDetail | null>(null)

  const table = useDataTable<KanjiRow>({
    tableId: 'kanji-list',
    showSearch: true,
    searchPlaceholder: t('kanji.filter.searchPlaceholder'),
    showFilters: true,
    showColumnVisibility: true,
    showRefreshButton: true,
    syncToUrl: true,
    persistPageSize: true,
    persistFilters: true,
    persistSort: true,
  })

  const { data, isLoading, isError, refetch } = useKanjiList(
    table.buildQueryParams(['char', 'meaningVi', 'meaningEn']),
  )

  const kanjis = data?.data ?? []
  const meta = data?.meta

  const columns = buildColumns((k) => {
    setEditingKanji(k as unknown as KanjiDetail)
    setShowModal(true)
  })

  const totalPublished = kanjis.filter((k) => k.status === 'PUBLISHED').length
  const totalDraft = kanjis.filter((k) => k.status === 'DRAFT').length

  return (
    <div className="space-y-6 p-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {t('kanji.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{t('kanji.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={ROUTES.KANJI_RADICALS}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <Layers className="h-4 w-4" />
            {t('kanji.actions.manageRadicals')}
          </Link>
          <Button
            onClick={() => {
              setEditingKanji(null)
              setShowModal(true)
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('kanji.actions.create')}
          </Button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      {!isError && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: 'Tổng kanji',
              value: isLoading ? '—' : (meta?.totalItems ?? kanjis.length),
              icon: BookOpen,
            },
            {
              label: 'Đã xuất bản',
              value: isLoading ? '—' : totalPublished,
              icon: FileCheck,
            },
            {
              label: 'Nháp',
              value: isLoading ? '—' : totalDraft,
              icon: FilePen,
            },
            {
              label: 'Bộ thủ',
              value: '→',
              icon: Layers,
              href: ROUTES.KANJI_RADICALS,
            },
          ].map(({ label, value, icon: Icon, href }) => {
            const card = (
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm transition-colors hover:bg-gray-50/50">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  <Icon className="h-4 w-4 text-gray-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-xl font-semibold text-gray-900 leading-none mt-0.5">{value}</p>
                </div>
              </div>
            )
            return href ? (
              <Link key={label} to={href} className="block">
                {card}
              </Link>
            ) : (
              <div key={label}>{card}</div>
            )
          })}
        </div>
      )}

      {/* ── JLPT breakdown ── */}
      {!isError && (
        <div className="grid grid-cols-5 gap-2">
          {(['N5', 'N4', 'N3', 'N2', 'N1'] as JlptLevel[]).map((level) => {
            const count = isLoading ? null : kanjis.filter((k) => k.jlptLevel === level).length
            return (
              <div
                key={level}
                className="flex items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-sm"
              >
                <Badge className={cn('shrink-0 text-xs font-bold border-0 px-2', JLPT_COLORS[level])}>
                  {level}
                </Badge>
                <span className="text-lg font-semibold text-gray-900 leading-none">
                  {count ?? '—'}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Table ── */}
      {isError ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          Không thể tải danh sách kanji. Vui lòng thử lại.
        </div>
      ) : (
        <DataTable<KanjiRow>
          columns={columns}
          data={kanjis as KanjiRow[]}
          loading={isLoading}
          rowKey="id"
          emptyText="Chưa có kanji nào — bấm Thêm Kanji để bắt đầu"
          table={table}
          total={meta?.totalItems}
          onRefresh={refetch}
        />
      )}

      <KanjiFormModal
        open={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingKanji(null)
        }}
        editingKanji={editingKanji}
      />
    </div>
  )
}
