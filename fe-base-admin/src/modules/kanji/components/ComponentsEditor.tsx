'use client'

import { useFieldArray, type Control } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'
import { FieldLabel } from '@shared/components/ui/field'
import type { KanjiFormValues } from './KanjiFormModal'

interface ComponentsEditorProps {
  control: Control<KanjiFormValues>
}

export function ComponentsEditor({ control }: ComponentsEditorProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'components' })

  return (
    <div className="space-y-3">
      {fields.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-4">
          Chưa có thành phần — nhấn nút bên dưới để thêm.
        </p>
      )}
      {fields.map((field, index) => (
        <div key={field.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-gray-500">Thành phần #{index + 1}</span>
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
              <FieldLabel>Ký tự *</FieldLabel>
              <Input
                {...control.register(`components.${index}.char`)}
                placeholder="宀"
                maxLength={3}
                className="mt-1 text-center text-xl font-bold"
              />
            </div>
            <div>
              <FieldLabel>Nghĩa (VN) *</FieldLabel>
              <Input
                {...control.register(`components.${index}.meaningVi`)}
                placeholder="Mái nhà"
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
        onClick={() => append({ char: '', meaningVi: '' })}
        className="w-full gap-2 border-dashed"
      >
        <Plus className="h-3.5 w-3.5" />
        Thêm thành phần
      </Button>
    </div>
  )
}
