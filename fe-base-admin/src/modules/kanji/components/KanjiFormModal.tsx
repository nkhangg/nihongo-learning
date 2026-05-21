import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, Controller } from 'react-hook-form'
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
import { Textarea } from '@shared/components/ui/textarea'
import { FieldLabel, FieldError } from '@shared/components/ui/field'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@shared/components/ui/tabs'
import { Badge } from '@shared/components/ui/badge'
import { useCreateKanji, useUpdateKanji } from '../hooks/useKanjis'
import { useKanjiRadicals } from '../hooks/useKanjiRadicals'
import { MeaningsEditor } from './MeaningsEditor'
import { ExamplesEditor } from './ExamplesEditor'
import { CompoundsEditor } from './CompoundsEditor'
import { ComponentsEditor } from './ComponentsEditor'
import { SimilarEditor } from './SimilarEditor'
import { KanjiJsonImportTab } from './KanjiJsonImportTab'
import type { KanjiDetail, JlptLevel } from '../types'

// ── Schema ────────────────────────────────────────────────────────────────────

const meaningSchema = z.object({
  index: z.number(),
  pos: z.enum(['noun', 'verb', 'adj', 'adv', 'other']),
  textVi: z.string().min(1),
  jpExample: z.string().optional(),
})

const exampleSchema = z.object({
  jpHtml: z.string().min(1),
  vi: z.string().min(1),
  source: z.string().optional(),
})

const compoundSchema = z.object({
  jp: z.string().min(1),
  reading: z.string().min(1),
  meaningVi: z.string().min(1),
})

const componentSchema = z.object({
  char: z.string().min(1).max(3),
  meaningVi: z.string().min(1),
})

const similarSchema = z.object({
  similarKanjiId: z.string().min(1, 'Chọn kanji'),
  reason: z.string().min(1, 'Nhập lý do'),
})

const kanjiFormSchema = z.object({
  char: z.string().min(1),
  jlptLevel: z.enum(['N1', 'N2', 'N3', 'N4', 'N5']),
  strokes: z.coerce.number().int().min(1, 'Bắt buộc'),
  radicalId: z.string().optional(),
  frequency: z.coerce.number().int().optional().or(z.literal('')).transform((v) => v === '' ? undefined : v),
  joyoOrder: z.coerce.number().int().optional().or(z.literal('')).transform((v) => v === '' ? undefined : v),
  unicode: z.string().min(1),
  onReadings: z.string(),
  kunReadings: z.string(),
  meaningVi: z.string().min(1),
  meaningEn: z.string().min(1),
  strokeOrderSvg: z.string(),
  mnemonicVi: z.string().optional(),
  meanings: z.array(meaningSchema),
  examples: z.array(exampleSchema),
  compounds: z.array(compoundSchema),
  components: z.array(componentSchema),
  similar: z.array(similarSchema),
})

export type KanjiFormValues = z.infer<typeof kanjiFormSchema>

const JLPT_OPTIONS: JlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']

// ── Helpers ───────────────────────────────────────────────────────────────────

function splitLines(text: string): string[] {
  return text.split('\n').map((s) => s.trim()).filter(Boolean)
}

function splitCommas(text: string): string[] {
  return text.split(',').map((s) => s.trim()).filter(Boolean)
}

function makeDefaultValues(): KanjiFormValues {
  return {
    char: '',
    jlptLevel: 'N5',
    strokes: 1,
    radicalId: '',
    frequency: '' as unknown as undefined,
    joyoOrder: '' as unknown as undefined,
    unicode: '',
    onReadings: '',
    kunReadings: '',
    meaningVi: '',
    meaningEn: '',
    strokeOrderSvg: '',
    mnemonicVi: '',
    meanings: [],
    examples: [],
    compounds: [],
    components: [],
    similar: [],
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface KanjiFormModalProps {
  open: boolean
  onClose: () => void
  editingKanji: KanjiDetail | null
}

export function KanjiFormModal({ open, onClose, editingKanji }: KanjiFormModalProps) {
  const { t } = useTranslation()
  const isEdit = !!editingKanji
  const [activeTab, setActiveTab] = useState('meta')
  const createKanji = useCreateKanji()
  const updateKanji = useUpdateKanji()
  const { data: radicals = [] } = useKanjiRadicals()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<KanjiFormValues>({
    resolver: zodResolver(kanjiFormSchema),
    defaultValues: makeDefaultValues(),
  })

  useEffect(() => {
    setActiveTab('meta')
    if (editingKanji) {
      reset({
        char: editingKanji.char,
        jlptLevel: editingKanji.jlptLevel,
        strokes: editingKanji.strokes,
        radicalId: editingKanji.radicalId ?? '',
        frequency: editingKanji.frequency ?? ('' as unknown as undefined),
        joyoOrder: editingKanji.joyoOrder ?? ('' as unknown as undefined),
        unicode: editingKanji.unicode,
        onReadings: editingKanji.onReadings.join(', '),
        kunReadings: editingKanji.kunReadings.join(', '),
        meaningVi: editingKanji.meaningVi,
        meaningEn: editingKanji.meaningEn,
        strokeOrderSvg: editingKanji.strokeOrderSvg.join('\n'),
        mnemonicVi: editingKanji.mnemonicVi ?? '',
        meanings: editingKanji.meanings.map((m) => ({
          index: m.index,
          pos: m.pos,
          textVi: m.textVi,
          jpExample: m.jpExample ?? '',
        })),
        examples: editingKanji.examples.map((e) => ({
          jpHtml: e.jpHtml,
          vi: e.vi,
          source: e.source ?? '',
        })),
        compounds: editingKanji.compounds.map((c) => ({
          jp: c.jp,
          reading: c.reading,
          meaningVi: c.meaningVi,
        })),
        components: (editingKanji.components ?? []).map((c) => ({
          char: c.char,
          meaningVi: c.meaningVi,
        })),
        similar: (editingKanji.similar ?? []).map((s) => ({
          similarKanjiId: s.similarKanjiId,
          reason: s.reason,
        })),
      })
    } else {
      reset(makeDefaultValues())
    }
  }, [editingKanji, reset, open])

  const onSubmit = handleSubmit(async (values) => {
    const onReadings = splitCommas(values.onReadings)
    const kunReadings = splitCommas(values.kunReadings)
    const strokeOrderSvg = splitLines(values.strokeOrderSvg)

    if (isEdit && editingKanji) {
      updateKanji.mutate(
        {
          id: editingKanji.id,
          dto: {
            jlptLevel: values.jlptLevel,
            strokes: values.strokes,
            radicalId: values.radicalId || undefined,
            frequency: values.frequency as number | undefined,
            joyoOrder: values.joyoOrder as number | undefined,
            unicode: values.unicode,
            onReadings,
            kunReadings,
            meaningVi: values.meaningVi,
            meaningEn: values.meaningEn,
            strokeOrderSvg,
            mnemonicVi: values.mnemonicVi || undefined,
            meanings: values.meanings.map((m, i) => ({ ...m, index: i })),
            examples: values.examples,
            compounds: values.compounds,
            components: values.components,
            similar: values.similar,
          },
        },
        {
          onSuccess: () => {
            toast.success('Đã cập nhật kanji')
            onClose()
          },
          onError: () => toast.error('Cập nhật thất bại'),
        },
      )
    } else {
      createKanji.mutate(
        {
          char: values.char,
          jlptLevel: values.jlptLevel,
          strokes: values.strokes,
          radicalId: values.radicalId || undefined,
          frequency: values.frequency as number | undefined,
          joyoOrder: values.joyoOrder as number | undefined,
          unicode: values.unicode,
          onReadings,
          kunReadings,
          meaningVi: values.meaningVi,
          meaningEn: values.meaningEn,
          strokeOrderSvg,
          mnemonicVi: values.mnemonicVi || undefined,
          meanings: values.meanings.map((m, i) => ({ ...m, index: i })),
          examples: values.examples,
          compounds: values.compounds,
          components: values.components,
          similar: values.similar,
        },
        {
          onSuccess: () => {
            toast.success('Đã thêm kanji mới')
            onClose()
          },
          onError: () => toast.error('Thêm kanji thất bại'),
        },
      )
    }
  })

  const isPending = createKanji.isPending || updateKanji.isPending || isSubmitting

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogTitle>{isEdit ? `${t('kanji.actions.edit')}: ${editingKanji?.char}` : t('kanji.actions.create')}</DialogTitle>
        <DialogDescription className="sr-only">
          {isEdit ? 'Cập nhật thông tin kanji' : 'Điền thông tin để thêm kanji mới vào hệ thống'}
        </DialogDescription>

        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4 flex-wrap h-auto gap-1">
                <TabsTrigger value="meta">Meta</TabsTrigger>
                <TabsTrigger value="meanings">
                  Nghĩa
                  {errors.meanings && <span className="ml-1 text-red-500">!</span>}
                </TabsTrigger>
                <TabsTrigger value="examples">
                  Ví dụ
                  {errors.examples && <span className="ml-1 text-red-500">!</span>}
                </TabsTrigger>
                <TabsTrigger value="compounds">Từ ghép</TabsTrigger>
                <TabsTrigger value="components">
                  Thành phần
                  {errors.components && <span className="ml-1 text-red-500">!</span>}
                </TabsTrigger>
                <TabsTrigger value="similar">
                  Tương tự
                  {errors.similar && <span className="ml-1 text-red-500">!</span>}
                </TabsTrigger>
                <TabsTrigger value="advanced">Nâng cao</TabsTrigger>
                {!isEdit && (
                  <TabsTrigger value="json" className="ml-auto text-indigo-600">
                    {t('kanji.import.tabLabel')}
                  </TabsTrigger>
                )}
              </TabsList>

              {/* ── Meta tab (incl. readings) ── */}
              <TabsContent value="meta" className="space-y-4 px-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Ký tự Kanji</FieldLabel>
                    <Input
                      {...register('char')}
                      disabled={isEdit}
                      placeholder="家"
                      className="mt-1 text-2xl font-bold text-center"
                    />
                    <FieldError>{errors.char?.message}</FieldError>
                  </div>
                  <div>
                    <FieldLabel>Unicode</FieldLabel>
                    <Input
                      {...register('unicode')}
                      placeholder="U+5BB6"
                      className="mt-1"
                    />
                    <FieldError>{errors.unicode?.message}</FieldError>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <FieldLabel>Cấp JLPT</FieldLabel>
                    <Controller
                      control={control}
                      name="jlptLevel"
                      render={({ field }) => (
                        <div className="mt-1 flex gap-1.5 flex-wrap">
                          {JLPT_OPTIONS.map((level) => (
                            <button
                              key={level}
                              type="button"
                              onClick={() => field.onChange(level)}
                              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                field.value === level
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      )}
                    />
                  </div>
                  <div>
                    <FieldLabel>Số nét</FieldLabel>
                    <Input
                      {...register('strokes')}
                      type="number"
                      min={1}
                      max={30}
                      className="mt-1"
                    />
                    <FieldError>{errors.strokes?.message}</FieldError>
                  </div>
                  <div>
                    <FieldLabel>Bộ thủ</FieldLabel>
                    <select
                      {...register('radicalId')}
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">— Không có —</option>
                      {radicals.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.char} ({r.meaningVi})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Nghĩa (VN)</FieldLabel>
                    <Input {...register('meaningVi')} placeholder="Nhà, gia đình" className="mt-1" />
                    <FieldError>{errors.meaningVi?.message}</FieldError>
                  </div>
                  <div>
                    <FieldLabel>Nghĩa (EN)</FieldLabel>
                    <Input {...register('meaningEn')} placeholder="house, home, family" className="mt-1" />
                    <FieldError>{errors.meaningEn?.message}</FieldError>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Tần suất</FieldLabel>
                    <Input {...register('frequency')} type="number" min={1} placeholder="Thứ hạng trong 2500 Jōyō" className="mt-1" />
                  </div>
                  <div>
                    <FieldLabel>Thứ tự Jōyō</FieldLabel>
                    <Input {...register('joyoOrder')} type="number" min={1} placeholder="Thứ tự dạy Jōyō" className="mt-1" />
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div>
                    <FieldLabel>Âm On (phân cách bằng dấu phẩy)</FieldLabel>
                    <Input
                      {...register('onReadings')}
                      placeholder="カ, ケ"
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-gray-400">Ví dụ: カ, ケ</p>
                  </div>
                  <div>
                    <FieldLabel>Âm Kun (phân cách bằng dấu phẩy)</FieldLabel>
                    <Input
                      {...register('kunReadings')}
                      placeholder="いえ, や, うち"
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-gray-400">Ví dụ: いえ, や, うち</p>
                  </div>
                </div>
              </TabsContent>

              {/* ── Meanings tab ── */}
              <TabsContent value="meanings" className="px-1">
                <MeaningsEditor control={control} errors={errors as Record<string, unknown>} />
              </TabsContent>

              {/* ── Examples tab ── */}
              <TabsContent value="examples" className="px-1">
                <ExamplesEditor control={control} />
              </TabsContent>

              {/* ── Compounds tab ── */}
              <TabsContent value="compounds" className="px-1">
                <CompoundsEditor control={control} />
              </TabsContent>

              {/* ── Components tab ── */}
              <TabsContent value="components" className="px-1">
                <ComponentsEditor control={control} />
              </TabsContent>

              {/* ── Similar tab ── */}
              <TabsContent value="similar" className="px-1">
                <SimilarEditor control={control} excludeId={editingKanji?.id} />
              </TabsContent>

              {/* ── Advanced tab (stroke + mnemonic) ── */}
              <TabsContent value="advanced" className="space-y-4 px-1">
                <div>
                  <FieldLabel>SVG Paths (mỗi nét 1 dòng)</FieldLabel>
                  <Textarea
                    {...register('strokeOrderSvg')}
                    placeholder={'M 10 20 L 30 40\nM 50 60 Q 70 80 90 100'}
                    rows={6}
                    className="mt-1 font-mono text-xs"
                  />
                  <p className="mt-1 text-xs text-gray-400">{t('kanji.hints.svgPath')}</p>
                </div>
                <div>
                  <FieldLabel>Mnemonic (VN)</FieldLabel>
                  <Textarea
                    {...register('mnemonicVi')}
                    placeholder="Kanji 家 trông như một mái nhà với người đứng bên trong..."
                    rows={5}
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-gray-400">Gợi nhớ bằng hình ảnh giúp học viên dễ nhớ hơn</p>
                </div>
              </TabsContent>

              {/* ── JSON import tab (create mode only) ── */}
              {!isEdit && (
                <TabsContent value="json" className="py-1">
                  <KanjiJsonImportTab
                    reset={reset}
                    setActiveTab={setActiveTab}
                    onClose={onClose}
                    onCreateKanji={createKanji.mutateAsync}
                  />
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between gap-3 border-t pt-4 mt-4">
            {isEdit && (
              <Badge className={editingKanji?.status === 'PUBLISHED' ? 'bg-green-100 text-green-700 border-0' : 'bg-gray-100 text-gray-600 border-0'}>
                {editingKanji?.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Nháp'}
              </Badge>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                {t('common.cancel')}
              </Button>
              {activeTab !== 'json' && (
                <Button type="submit" disabled={isPending}>
                  {isPending ? t('common.saving') : isEdit ? t('common.save') : t('kanji.actions.create')}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
