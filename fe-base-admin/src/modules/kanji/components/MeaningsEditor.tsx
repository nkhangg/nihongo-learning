import { useFieldArray, type Control } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'
import { FieldLabel, FieldError } from '@shared/components/ui/field'
import type { KanjiFormValues } from './KanjiFormModal'

const POS_OPTIONS = [
  { label: 'Danh từ', value: 'noun' },
  { label: 'Động từ', value: 'verb' },
  { label: 'Tính từ', value: 'adj' },
  { label: 'Trạng từ', value: 'adv' },
  { label: 'Khác', value: 'other' },
]

interface MeaningsEditorProps {
  control: Control<KanjiFormValues>
  errors?: Record<string, unknown>
}

export function MeaningsEditor({ control, errors }: MeaningsEditorProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'meanings' })

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div key={field.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-gray-500">Nghĩa #{index + 1}</span>
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <FieldLabel>Loại từ</FieldLabel>
              <select
                {...control.register(`meanings.${index}.pos`)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {POS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Nghĩa (VN) *</FieldLabel>
              <Input
                {...control.register(`meanings.${index}.textVi`)}
                placeholder="Ví dụ: Nhà, gia đình"
                className="mt-1"
              />
              {errors && (
                <FieldError>{(errors as Record<string, Record<string, Record<string, { message: string }>>>)
                  ?.meanings?.[index]?.textVi?.message}</FieldError>
              )}
            </div>
          </div>
          <div className="mt-2">
            <FieldLabel>Ví dụ JP</FieldLabel>
            <Input
              {...control.register(`meanings.${index}.jpExample`)}
              placeholder="家に帰る (tùy chọn)"
              className="mt-1"
            />
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ index: fields.length, pos: 'noun', textVi: '', jpExample: '' })}
        className="w-full gap-2 border-dashed"
      >
        <Plus className="h-3.5 w-3.5" />
        Thêm nghĩa
      </Button>
    </div>
  )
}
