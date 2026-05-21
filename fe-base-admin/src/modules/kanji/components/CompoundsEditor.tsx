import { useFieldArray, type Control } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'
import { FieldLabel } from '@shared/components/ui/field'
import type { KanjiFormValues } from './KanjiFormModal'

interface CompoundsEditorProps {
  control: Control<KanjiFormValues>
}

export function CompoundsEditor({ control }: CompoundsEditorProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'compounds' })

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div key={field.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-gray-500">Từ ghép #{index + 1}</span>
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <FieldLabel>Từ JP *</FieldLabel>
              <Input
                {...control.register(`compounds.${index}.jp`)}
                placeholder="家族"
                className="mt-1"
              />
            </div>
            <div>
              <FieldLabel>Cách đọc *</FieldLabel>
              <Input
                {...control.register(`compounds.${index}.reading`)}
                placeholder="かぞく"
                className="mt-1"
              />
            </div>
            <div>
              <FieldLabel>Nghĩa (VN) *</FieldLabel>
              <Input
                {...control.register(`compounds.${index}.meaningVi`)}
                placeholder="Gia đình"
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
        onClick={() => append({ jp: '', reading: '', meaningVi: '' })}
        className="w-full gap-2 border-dashed"
      >
        <Plus className="h-3.5 w-3.5" />
        Thêm từ ghép
      </Button>
    </div>
  )
}
