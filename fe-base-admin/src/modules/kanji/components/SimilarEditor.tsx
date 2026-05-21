'use client'

import { useState, useRef, useEffect } from 'react'
import { useFieldArray, type Control } from 'react-hook-form'
import { Plus, Trash2, Search } from 'lucide-react'
import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'
import { FieldLabel } from '@shared/components/ui/field'
import { useKanjiSearch } from '../hooks/useKanjis'
import type { KanjiFormValues } from './KanjiFormModal'

interface SimilarEditorProps {
  control: Control<KanjiFormValues>
  excludeId?: string
}

interface KanjiPickerProps {
  value: string
  display: string
  onChange: (id: string, display: string) => void
  excludeId?: string
}

function KanjiPicker({ value, display, onChange, excludeId }: KanjiPickerProps) {
  const [query, setQuery] = useState(display)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { data, isFetching } = useKanjiSearch(query)

  const results = (data?.data ?? []).filter((k) => k.id !== excludeId)

  useEffect(() => {
    setQuery(display)
  }, [display])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <div className="relative mt-1">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            if (!e.target.value) onChange('', '')
          }}
          onFocus={() => setOpen(true)}
          placeholder="Tìm kanji..."
          className="pl-8"
        />
      </div>
      {open && query.length >= 1 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto">
          {isFetching && (
            <div className="px-3 py-2 text-xs text-gray-400">Đang tìm...</div>
          )}
          {!isFetching && results.length === 0 && (
            <div className="px-3 py-2 text-xs text-gray-400">Không tìm thấy</div>
          )}
          {results.map((k) => (
            <button
              key={k.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                onChange(k.id, `${k.char} — ${k.meaningVi}`)
                setQuery(`${k.char} — ${k.meaningVi}`)
                setOpen(false)
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${value === k.id ? 'bg-indigo-50' : ''}`}
            >
              <span className="text-lg font-bold w-7 text-center shrink-0">{k.char}</span>
              <span className="text-gray-600 truncate">{k.meaningVi}</span>
              <span className="ml-auto text-xs text-gray-400 shrink-0">{k.jlptLevel}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function SimilarEditor({ control, excludeId }: SimilarEditorProps) {
  const { fields, append, remove, update } = useFieldArray({ control, name: 'similar' })
  const [displays, setDisplays] = useState<Record<number, string>>({})

  return (
    <div className="space-y-3">
      {fields.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-4">
          Chưa có kanji tương tự — nhấn nút bên dưới để thêm.
        </p>
      )}
      {fields.map((field, index) => (
        <div key={field.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-gray-500">Kanji tương tự #{index + 1}</span>
            <button
              type="button"
              onClick={() => {
                remove(index)
                setDisplays((prev) => {
                  const next = { ...prev }
                  delete next[index]
                  return next
                })
              }}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <FieldLabel>Kanji *</FieldLabel>
              <KanjiPicker
                value={field.similarKanjiId}
                display={displays[index] ?? ''}
                excludeId={excludeId}
                onChange={(id, display) => {
                  update(index, { ...field, similarKanjiId: id })
                  setDisplays((prev) => ({ ...prev, [index]: display }))
                }}
              />
            </div>
            <div>
              <FieldLabel>Lý do tương đồng *</FieldLabel>
              <Input
                {...control.register(`similar.${index}.reason`)}
                placeholder="Hình dạng tương tự..."
                className="mt-1"
              />
            </div>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ similarKanjiId: '', reason: '' })}
        className="w-full gap-2 border-dashed"
      >
        <Plus className="h-3.5 w-3.5" />
        Thêm kanji tương tự
      </Button>
    </div>
  )
}
