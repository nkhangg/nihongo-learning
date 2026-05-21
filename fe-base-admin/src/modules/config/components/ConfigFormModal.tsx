import { useEffect, useRef, useState, useMemo, KeyboardEvent } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Settings, AlertTriangle, X, LayoutGrid, Image } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@shared/components/ui/dialog'
import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'
import { Textarea } from '@shared/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select'
import { FieldLabel, FieldError } from '@shared/components/ui/field'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@shared/components/ui/tabs'
import { useCreateConfig, useUpdateConfig } from '../hooks/useConfigs'
import { MediaPicker } from '@modules/media/index'
import { useJsonObjectEditor } from '../hooks/useJsonObjectEditor'
import { ObjectEditorCards } from './ObjectEditorCards'
import type { AppConfig, ConfigScope } from '../types'

export interface ConfigPrefill {
  key?: string
  value?: unknown
  description?: string
  scope?: ConfigScope
  tags?: string[]
}

// ── Constants ─────────────────────────────────────────────────────────────────

const KEY_PATTERN = /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$/

// ── Schema ────────────────────────────────────────────────────────────────────

const formSchema = z.object({
  key: z
    .string()
    .min(1, 'config.form.keyRequired')
    .max(128, 'config.form.keyTooLong')
    .regex(KEY_PATTERN, 'config.form.keyInvalid'),
  value: z.string().min(1, 'config.form.valueRequired').refine((v) => {
    try { JSON.parse(v); return true } catch { return false }
  }, 'config.form.valueInvalid'),
  description: z.string().optional(),
  scope: z.enum(['public', 'members', 'internal']),
  tags: z.array(z.string()).default([]),
})

type FormValues = z.infer<typeof formSchema>

const SCOPE_VALUES: ConfigScope[] = ['public', 'members', 'internal']

// ── TagInput ──────────────────────────────────────────────────────────────────

function TagInput({
  value,
  onChange,
}: {
  value: string[]
  onChange: (tags: string[]) => void
}) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = (raw: string) => {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, '-')
    if (tag && !value.includes(tag)) onChange([...value, tag])
    setInput('')
  }

  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag))

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div
      className="border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 flex min-h-8 w-full flex-wrap items-center gap-1 rounded-lg border bg-transparent px-2 py-1 transition-colors cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-700"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) addTag(input) }}
        placeholder={value.length === 0 ? t('config.form.tagsPlaceholder') : ''}
        className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}

// ── FormField ─────────────────────────────────────────────────────────────────

function FormField({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: React.ReactNode
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <FieldLabel className="text-sm font-medium text-gray-700">{label}</FieldLabel>
        {hint && <span className="text-xs text-gray-400 flex items-center">{hint}</span>}
      </div>
      {children}
      {error && <FieldError className="text-xs">{error}</FieldError>}
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface ConfigFormModalProps {
  open: boolean
  onClose: () => void
  editingConfig?: AppConfig | null
  prefill?: ConfigPrefill | null
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ConfigFormModal({ open, onClose, editingConfig, prefill }: ConfigFormModalProps) {
  const { t } = useTranslation()
  const isEdit = !!editingConfig
  const createConfig = useCreateConfig()
  const updateConfig = useUpdateConfig()
  const isPending = createConfig.isPending || updateConfig.isPending
  const isError = createConfig.isError || updateConfig.isError

  const scopeOptions = useMemo(
    () =>
      SCOPE_VALUES.map((value) => ({
        value,
        label: t(`config.form.scope${value.charAt(0).toUpperCase()}${value.slice(1)}`),
        description: t(
          `config.form.scope${value.charAt(0).toUpperCase()}${value.slice(1)}Desc`,
        ),
      })),
    [t],
  )

  const translateError = (key: string | undefined) =>
    key && key.startsWith('config.') ? t(key) : key

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: { scope: 'public', tags: [] },
  })

  const currentValue = watch('value')
  const isPlainObject = useMemo(() => {
    try {
      const p = JSON.parse(currentValue)
      return p !== null && typeof p === 'object' && !Array.isArray(p)
    } catch {
      return false
    }
  }, [currentValue])

  const [activeTab, setActiveTab] = useState<'raw' | 'visual'>('raw')
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)
  const editor = useJsonObjectEditor()

  useEffect(() => {
    if (editingConfig) {
      reset({
        key: editingConfig.key,
        value: JSON.stringify(editingConfig.value, null, 2),
        description: editingConfig.description ?? '',
        scope: editingConfig.scope,
        tags: editingConfig.tags,
      })
    } else if (prefill) {
      reset({
        key: prefill.key ?? '',
        value:
          prefill.value !== undefined ? JSON.stringify(prefill.value, null, 2) : '',
        description: prefill.description ?? '',
        scope: prefill.scope ?? 'public',
        tags: prefill.tags ?? [],
      })
    } else {
      reset({ key: '', value: '', description: '', scope: 'public', tags: [] })
    }
    setActiveTab('raw')
  }, [editingConfig, prefill, reset, open])

  // Live sync: visual editor → form field
  // Deps: editor.entries triggers the effect; editor.serialize/hasErrors are stable
  // callbacks from useCallback — do NOT add `editor` (whole object) as it recreates every render
  const { entries: editorEntries, hasErrors: editorHasErrors, serialize: editorSerialize } = editor
  useEffect(() => {
    if (activeTab !== 'visual') return
    if (editorHasErrors) return
    const serialized = editorSerialize()
    if (serialized) setValue('value', serialized, { shouldValidate: true })
  }, [editorEntries, editorHasErrors, editorSerialize, activeTab, setValue])

  const onSubmit = (values: FormValues) => {
    // Visual tab: use editor entry order; Raw tab: extract from JSON string
    let valueKeyOrder: string[] = []
    if (activeTab === 'visual' && !editor.hasErrors) {
      valueKeyOrder = editor.entries.map((e) => e.key)
    } else {
      try {
        const parsed = JSON.parse(values.value)
        if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
          valueKeyOrder = Object.keys(parsed)
        }
      } catch { /* invalid JSON — Zod will catch this */ }
    }

    const payload = {
      value: JSON.parse(values.value),
      valueKeyOrder,
      description: values.description || undefined,
      scope: values.scope,
      tags: values.tags,
    }

    if (isEdit && editingConfig) {
      updateConfig.mutate(
        { id: editingConfig.id, ...payload },
        { onSuccess: () => { reset(); onClose() } },
      )
    } else {
      createConfig.mutate(
        { key: values.key, ...payload },
        { onSuccess: () => { reset(); onClose() } },
      )
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => { if (!o) { reset(); onClose() } }}
    >
      <DialogContent className="max-w-xl gap-0 p-0 rounded-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4 pr-12">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-900">
            <Settings className="h-4 w-4 text-white" />
          </div>
          <div>
            <DialogTitle className="text-base font-semibold text-gray-900">
              {isEdit ? t('config.form.editTitle') : t('config.form.createTitle')}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              {isEdit ? editingConfig?.key : t('config.form.createDescription')}
            </DialogDescription>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          {/* Key */}
          <FormField
            label={t('config.form.keyLabel')}
            hint={t('config.form.keyHint')}
            error={translateError(errors.key?.message)}
          >
            <Input
              placeholder={t('config.form.keyPlaceholder')}
              disabled={isEdit}
              aria-invalid={!!errors.key}
              {...register('key')}
              className={isEdit ? 'bg-gray-50 font-mono text-sm' : 'font-mono text-sm'}
            />
          </FormField>

          {/* Value (JSON) */}
          <FormField
            label={t('config.form.valueLabel')}
            hint={
              <button
                type="button"
                onClick={() => setMediaPickerOpen(true)}
                className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <Image className="size-3" />
                {t('config.form.pickMediaUrl')}
              </button>
            }
            error={translateError(errors.value?.message)}
          >
            {isPlainObject ? (
              <Tabs
                value={activeTab}
                onValueChange={(v) => {
                  const tab = v as 'raw' | 'visual'
                  if (tab === 'visual') editor.initFromJson(currentValue, editingConfig?.valueKeyOrder)
                  setActiveTab(tab)
                }}
              >
                <TabsList className="h-8 mb-2">
                  <TabsTrigger value="raw" className="h-6 px-3 text-xs gap-1.5">
                    {t('config.form.rawJson')}
                  </TabsTrigger>
                  <TabsTrigger value="visual" className="h-6 px-3 text-xs gap-1.5">
                    <LayoutGrid className="size-3" />
                    {t('config.form.visualEditor')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="raw" className="mt-0">
                  <Textarea
                    placeholder={t('config.form.valuePlaceholder')}
                    rows={6}
                    aria-invalid={!!errors.value}
                    {...register('value')}
                    className="font-mono text-xs resize-none"
                  />
                </TabsContent>

                <TabsContent value="visual" className="mt-0">
                  <ObjectEditorCards
                    entries={editor.entries}
                    onReorder={editor.reorder}
                    onUpdateKey={editor.updateKey}
                    onUpdateValue={editor.updateValue}
                    onAdd={editor.addEntry}
                    onDelete={editor.deleteEntry}
                  />
                  {editor.hasErrors && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertTriangle className="size-3 shrink-0" />
                      {t('config.form.fixVisualErrors')}
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <Textarea
                placeholder={t('config.form.valuePlaceholder')}
                rows={6}
                aria-invalid={!!errors.value}
                {...register('value')}
                className="font-mono text-xs resize-none"
              />
            )}
          </FormField>

          {/* Scope + Tags — 2 columns */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label={t('config.form.scopeLabel')} error={translateError(errors.scope?.message)}>
              <Controller
                control={control}
                name="scope"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue>
                        {field.value
                          ? scopeOptions.find((s) => s.value === field.value)?.label
                          : <span className="text-muted-foreground">{t('config.form.scopePlaceholder')}</span>}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {scopeOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value} textValue={s.label}>
                          <div>
                            <p className="text-sm font-medium">{s.label}</p>
                            <p className="text-xs text-gray-400">{s.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label={t('config.form.tagsLabel')} hint={t('config.form.tagsHint')}>
              <Controller
                control={control}
                name="tags"
                render={({ field }) => (
                  <TagInput value={field.value} onChange={field.onChange} />
                )}
              />
            </FormField>
          </div>

          {/* Description */}
          <FormField
            label={t('config.form.descriptionLabel')}
            error={translateError(errors.description?.message)}
          >
            <Textarea
              placeholder={t('config.form.descriptionPlaceholder')}
              rows={2}
              {...register('description')}
              className="resize-none text-sm"
            />
          </FormField>

          {/* Error */}
          {isError && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-600">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {isEdit ? t('config.form.errorUpdate') : t('config.form.errorCreate')}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => { reset(); onClose() }}
              disabled={isPending}
            >
              {t('config.actions.cancel')}
            </Button>
            <Button type="submit" className="flex-1" isLoading={isPending}>
              {isPending
                ? isEdit ? t('config.actions.saving') : t('config.actions.creating')
                : isEdit ? t('config.actions.save') : t('config.actions.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
      <MediaPicker
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(file) => {
          const current = watch('value')
          try {
            const parsed = JSON.parse(current || '{}')
            if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
              const updated = { ...parsed, imageUrl: file.url }
              setValue('value', JSON.stringify(updated, null, 2), { shouldValidate: true })
            } else {
              setValue('value', JSON.stringify(file.url), { shouldValidate: true })
            }
          } catch {
            setValue('value', JSON.stringify(file.url), { shouldValidate: true })
          }
          setMediaPickerOpen(false)
        }}
      />
    </Dialog>
  )
}
