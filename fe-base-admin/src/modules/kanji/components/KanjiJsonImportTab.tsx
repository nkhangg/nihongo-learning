import { useState } from 'react'
import type { UseFormReset } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { ChevronDown, ChevronRight, FileJson, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@shared/components/ui/button'
import { Textarea } from '@shared/components/ui/textarea'
import type { CreateKanjiDto } from '../types'
import type { KanjiFormValues } from './KanjiFormModal'

// ── Validation schema ──────────────────────────────────────────────────────

const importItemSchema = z.object({
  char: z.string().min(1),
  jlptLevel: z.enum(['N1', 'N2', 'N3', 'N4', 'N5']),
  strokes: z.number().int().min(1),
  unicode: z.string().min(1),
  onReadings: z.array(z.string()),
  kunReadings: z.array(z.string()),
  meaningVi: z.string().min(1),
  meaningEn: z.string().min(1),
  strokeOrderSvg: z.array(z.string()).optional().default([]),
  radicalId: z.string().optional().nullable(),
  frequency: z.number().optional().nullable(),
  joyoOrder: z.number().optional().nullable(),
  mnemonicVi: z.string().optional().nullable(),
  meanings: z
    .array(z.object({ index: z.number(), pos: z.enum(['noun', 'verb', 'adj', 'adv', 'other']), textVi: z.string(), jpExample: z.string().optional().nullable() }))
    .optional()
    .default([]),
  examples: z
    .array(z.object({ jpHtml: z.string(), vi: z.string(), source: z.string().optional().nullable() }))
    .optional()
    .default([]),
  compounds: z
    .array(z.object({ jp: z.string(), reading: z.string(), meaningVi: z.string() }))
    .optional()
    .default([]),
  components: z
    .array(z.object({ char: z.string().min(1), meaningVi: z.string() }))
    .optional()
    .default([]),
  similar: z
    .array(z.object({ similarKanjiId: z.string(), reason: z.string() }))
    .optional()
    .default([]),
})

type ImportItem = z.infer<typeof importItemSchema>

// ── Helpers ────────────────────────────────────────────────────────────────

function dtoToFormValues(dto: ImportItem): KanjiFormValues {
  return {
    char: dto.char,
    jlptLevel: dto.jlptLevel,
    strokes: dto.strokes,
    radicalId: dto.radicalId ?? '',
    frequency: (dto.frequency ?? '') as unknown as undefined,
    joyoOrder: (dto.joyoOrder ?? '') as unknown as undefined,
    unicode: dto.unicode,
    onReadings: dto.onReadings.join(', '),
    kunReadings: dto.kunReadings.join(', '),
    meaningVi: dto.meaningVi,
    meaningEn: dto.meaningEn,
    strokeOrderSvg: (dto.strokeOrderSvg ?? []).join('\n'),
    mnemonicVi: dto.mnemonicVi ?? '',
    meanings: (dto.meanings ?? []).map((m) => ({ index: m.index, pos: m.pos, textVi: m.textVi, jpExample: m.jpExample ?? '' })),
    examples: (dto.examples ?? []).map((e) => ({ jpHtml: e.jpHtml, vi: e.vi, source: e.source ?? '' })),
    compounds: (dto.compounds ?? []).map((c) => ({ jp: c.jp, reading: c.reading, meaningVi: c.meaningVi })),
    components: (dto.components ?? []).map((c) => ({ char: c.char, meaningVi: c.meaningVi })),
    similar: (dto.similar ?? []).map((s) => ({ similarKanjiId: s.similarKanjiId, reason: s.reason })),
  }
}

function itemToCreateDto(item: ImportItem): CreateKanjiDto {
  return {
    char: item.char,
    jlptLevel: item.jlptLevel,
    strokes: item.strokes,
    unicode: item.unicode,
    onReadings: item.onReadings,
    kunReadings: item.kunReadings,
    meaningVi: item.meaningVi,
    meaningEn: item.meaningEn,
    strokeOrderSvg: item.strokeOrderSvg ?? [],
    radicalId: item.radicalId ?? undefined,
    frequency: item.frequency ?? undefined,
    joyoOrder: item.joyoOrder ?? undefined,
    mnemonicVi: item.mnemonicVi ?? undefined,
    meanings: (item.meanings ?? []).map((m) => ({ index: m.index, pos: m.pos, textVi: m.textVi, jpExample: m.jpExample ?? undefined })),
    examples: (item.examples ?? []).map((e) => ({ jpHtml: e.jpHtml, vi: e.vi, source: e.source ?? undefined })),
    compounds: (item.compounds ?? []).map((c) => ({ jp: c.jp, reading: c.reading, meaningVi: c.meaningVi })),
    components: (item.components ?? []).map((c) => ({ char: c.char, meaningVi: c.meaningVi })),
    similar: (item.similar ?? []).map((s) => ({ similarKanjiId: s.similarKanjiId, reason: s.reason })),
  }
}

const SCHEMA_EXAMPLE = `{
  "char": "家",
  "jlptLevel": "N5",
  "strokes": 10,
  "unicode": "U+5BB6",
  "onReadings": ["カ", "ケ"],
  "kunReadings": ["いえ", "や", "うち"],
  "meaningVi": "Nhà, gia đình",
  "meaningEn": "house, home, family",
  "strokeOrderSvg": [],
  "radicalId": null,
  "frequency": 4,
  "joyoOrder": 42,
  "mnemonicVi": "Gợi nhớ...",
  "meanings": [{ "index": 0, "pos": "noun", "textVi": "Nhà", "jpExample": null }],
  "examples": [{ "jpHtml": "家族", "vi": "Gia đình", "source": null }],
  "compounds": [{ "jp": "家族", "reading": "かぞく", "meaningVi": "Gia đình" }]
}`

// ── Component ──────────────────────────────────────────────────────────────

interface KanjiJsonImportTabProps {
  reset: UseFormReset<KanjiFormValues>
  setActiveTab: (tab: string) => void
  onClose: () => void
  onCreateKanji: (dto: CreateKanjiDto) => Promise<unknown>
}

export function KanjiJsonImportTab({ reset, setActiveTab, onClose, onCreateKanji }: KanjiJsonImportTabProps) {
  const [jsonText, setJsonText] = useState('')
  const [parsed, setParsed] = useState<ImportItem | ImportItem[] | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [schemaOpen, setSchemaOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleParse = () => {
    setParseError(null)
    setParsed(null)
    setProgress(0)
    try {
      const raw = JSON.parse(jsonText) as unknown
      if (Array.isArray(raw)) {
        const result = z.array(importItemSchema).safeParse(raw)
        if (!result.success) {
          const first = result.error.errors[0]
          setParseError(`[${first.path.join('.')}] ${first.message}`)
          return
        }
        setParsed(result.data)
      } else {
        const result = importItemSchema.safeParse(raw)
        if (!result.success) {
          const first = result.error.errors[0]
          setParseError(`[${first.path.join('.')}] ${first.message}`)
          return
        }
        setParsed(result.data)
      }
    } catch {
      setParseError('JSON không hợp lệ — kiểm tra cú pháp')
    }
  }

  const handleFillForm = () => {
    if (!parsed || Array.isArray(parsed)) return
    reset(dtoToFormValues(parsed))
    setActiveTab('meta')
    toast.success('Đã điền dữ liệu vào form — review rồi bấm Thêm Kanji')
  }

  const handleBulkImport = async () => {
    if (!parsed || !Array.isArray(parsed)) return
    setIsImporting(true)
    setProgress(0)
    let successCount = 0
    let errorCount = 0
    for (const item of parsed) {
      try {
        await onCreateKanji(itemToCreateDto(item))
        successCount++
      } catch {
        errorCount++
      }
      setProgress((prev) => prev + 1)
    }
    setIsImporting(false)
    if (errorCount === 0) {
      toast.success(`Đã nhập ${successCount} kanji thành công`)
      onClose()
    } else {
      toast.warning(`Nhập ${successCount} thành công, ${errorCount} thất bại`)
    }
  }

  const isSingle = parsed !== null && !Array.isArray(parsed)
  const isArray = parsed !== null && Array.isArray(parsed)
  const arrayItems = isArray ? (parsed as ImportItem[]) : []
  const total = arrayItems.length

  return (
    <div className="space-y-4 px-1">
      <p className="text-sm text-gray-500">
        Dán JSON của một kanji (object đơn) hoặc nhiều kanji (mảng) để nhập nhanh không qua từng tab.
      </p>

      <Textarea
        value={jsonText}
        onChange={(e) => {
          setJsonText(e.target.value)
          setParsed(null)
          setParseError(null)
        }}
        placeholder={'{ "char": "家", "jlptLevel": "N5", "strokes": 10, ... }'}
        rows={10}
        className="font-mono text-xs"
      />

      {parseError && (
        <div className="flex items-start gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{parseError}</span>
        </div>
      )}

      {parsed && (
        <div className="flex items-start gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {isSingle
              ? `Hợp lệ — 1 kanji: ${(parsed as ImportItem).char}`
              : `Hợp lệ — ${total} kanji: ${arrayItems.map((k) => k.char).join(' ')}`}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Button type="button" variant="outline" onClick={handleParse} disabled={!jsonText.trim()}>
          Phân tích JSON
        </Button>
        {isSingle && (
          <Button type="button" onClick={handleFillForm}>
            Điền vào form
          </Button>
        )}
        {isArray && (
          <Button type="button" onClick={() => void handleBulkImport()} disabled={isImporting}>
            {isImporting ? `Đang nhập ${progress}/${total}...` : `Nhập hàng loạt (${total} kanji)`}
          </Button>
        )}
      </div>

      <div className="border rounded-md">
        <button
          type="button"
          onClick={() => setSchemaOpen((v) => !v)}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <FileJson className="h-4 w-4" />
          <span>Cấu trúc JSON tham khảo</span>
          {schemaOpen ? <ChevronDown className="ml-auto h-4 w-4" /> : <ChevronRight className="ml-auto h-4 w-4" />}
        </button>
        {schemaOpen && (
          <div className="border-t">
            <pre className="overflow-x-auto bg-gray-50 px-3 py-3 text-xs text-gray-700 leading-relaxed">
              {SCHEMA_EXAMPLE}
            </pre>
            <div className="border-t bg-gray-50 px-3 py-2 space-y-0.5 text-xs text-gray-500">
              <p><span className="font-medium text-gray-700">pos</span> hợp lệ: <code className="bg-gray-100 px-1 rounded">noun</code> · <code className="bg-gray-100 px-1 rounded">verb</code> · <code className="bg-gray-100 px-1 rounded">adj</code> · <code className="bg-gray-100 px-1 rounded">adv</code> · <code className="bg-gray-100 px-1 rounded">other</code></p>
              <p>Nhập hàng loạt: bọc nhiều object trong mảng <code className="bg-gray-100 px-1 rounded">[ {'{'}...{'}'}, {'{'}...{'}'} ]</code></p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
