import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@shared/components/ui/dialog'
import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'
import { FieldLabel, FieldError } from '@shared/components/ui/field'
import { Checkbox } from '@shared/components/ui/checkbox'
import { useCreateKanjiRadical, useUpdateKanjiRadical } from '../hooks/useKanjiRadicals'
import type { KanjiRadical } from '../types'

const schema = z.object({
  char: z.string().min(1, 'Bắt buộc'),
  meaningVi: z.string().min(1, 'Bắt buộc'),
  strokes: z.coerce.number().int().min(1, 'Bắt buộc'),
  isPopular: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface KanjiRadicalFormModalProps {
  open: boolean
  onClose: () => void
  editingRadical: KanjiRadical | null
}

export function KanjiRadicalFormModal({ open, onClose, editingRadical }: KanjiRadicalFormModalProps) {
  const { t } = useTranslation()
  const isEdit = !!editingRadical
  const createRadical = useCreateKanjiRadical()
  const updateRadical = useUpdateKanjiRadical()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { char: '', meaningVi: '', strokes: 1, isPopular: false },
  })

  const isPopular = watch('isPopular')

  useEffect(() => {
    if (editingRadical) {
      reset({
        char: editingRadical.char,
        meaningVi: editingRadical.meaningVi,
        strokes: editingRadical.strokes,
        isPopular: editingRadical.isPopular,
      })
    } else {
      reset({ char: '', meaningVi: '', strokes: 1, isPopular: false })
    }
  }, [editingRadical, reset, open])

  const onSubmit = handleSubmit(async (values) => {
    if (isEdit && editingRadical) {
      updateRadical.mutate(
        { id: editingRadical.id, dto: { meaningVi: values.meaningVi, strokes: values.strokes, isPopular: values.isPopular } },
        {
          onSuccess: () => { toast.success('Đã cập nhật bộ thủ'); onClose() },
          onError: () => toast.error('Cập nhật thất bại'),
        },
      )
    } else {
      createRadical.mutate(values, {
        onSuccess: () => { toast.success('Đã thêm bộ thủ mới'); onClose() },
        onError: () => toast.error('Thêm bộ thủ thất bại'),
      })
    }
  })

  const isPending = createRadical.isPending || updateRadical.isPending || isSubmitting

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogTitle>{isEdit ? `Sửa bộ thủ: ${editingRadical?.char}` : 'Thêm bộ thủ mới'}</DialogTitle>
        <DialogDescription className="sr-only">Form bộ thủ Kanji</DialogDescription>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <FieldLabel>Ký tự bộ thủ</FieldLabel>
            <Input
              {...register('char')}
              disabled={isEdit}
              placeholder="宀"
              className="mt-1 text-2xl text-center"
            />
            <FieldError>{errors.char?.message}</FieldError>
          </div>
          <div>
            <FieldLabel>Nghĩa (VN)</FieldLabel>
            <Input {...register('meaningVi')} placeholder="Mái nhà" className="mt-1" />
            <FieldError>{errors.meaningVi?.message}</FieldError>
          </div>
          <div>
            <FieldLabel>Số nét</FieldLabel>
            <Input {...register('strokes')} type="number" min={1} max={20} className="mt-1" />
            <FieldError>{errors.strokes?.message}</FieldError>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isPopular"
              checked={isPopular}
              onCheckedChange={(v) => setValue('isPopular', !!v)}
            />
            <label htmlFor="isPopular" className="text-sm text-gray-700 cursor-pointer">
              Bộ thủ phổ biến
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('common.saving') : isEdit ? t('common.save') : t('kanji.actions.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
