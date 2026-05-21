import { useFieldArray, type Control } from 'react-hook-form'
import { Plus, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'
import { Textarea } from '@shared/components/ui/textarea'
import { FieldLabel } from '@shared/components/ui/field'
import type { KanjiFormValues } from './KanjiFormModal'

interface ExamplesEditorProps {
  control: Control<KanjiFormValues>
}

export function ExamplesEditor({ control }: ExamplesEditorProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'examples' })

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
        <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <span>
          Trường jpHtml chỉ cho phép thẻ <code>&lt;ruby&gt;</code>, <code>&lt;rt&gt;</code>,{' '}
          <code>&lt;em&gt;</code>, <code>&lt;span class="highlight"&gt;</code>. Mọi HTML khác sẽ bị strip khi lưu.
        </span>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-gray-500">Ví dụ #{index + 1}</span>
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            <div>
              <FieldLabel>Câu JP (HTML) *</FieldLabel>
              <Textarea
                {...control.register(`examples.${index}.jpHtml`)}
                placeholder="<ruby>家<rt>いえ</rt></ruby>に帰る"
                rows={2}
                className="mt-1 font-mono text-xs"
              />
            </div>
            <div>
              <FieldLabel>Nghĩa (VN) *</FieldLabel>
              <Input
                {...control.register(`examples.${index}.vi`)}
                placeholder="Trở về nhà"
                className="mt-1"
              />
            </div>
            <div>
              <FieldLabel>Nguồn</FieldLabel>
              <Input
                {...control.register(`examples.${index}.source`)}
                placeholder="JLPT N4 (tùy chọn)"
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
        onClick={() => append({ jpHtml: '', vi: '', source: '' })}
        className="w-full gap-2 border-dashed"
      >
        <Plus className="h-3.5 w-3.5" />
        Thêm ví dụ
      </Button>
    </div>
  )
}
