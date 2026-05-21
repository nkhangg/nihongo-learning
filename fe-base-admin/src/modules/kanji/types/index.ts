import type { AdminListMeta } from '@modules/admin/types'

export type JlptLevel = 'N1' | 'N2' | 'N3' | 'N4' | 'N5'
export type KanjiStatus = 'DRAFT' | 'PUBLISHED'

export type KanjiPos = 'noun' | 'verb' | 'adj' | 'adv' | 'other'

export interface KanjiMeaning {
  id: string
  index: number
  pos: KanjiPos
  textVi: string
  jpExample?: string | null
}

export interface KanjiExample {
  id: string
  jpHtml: string
  vi: string
  source?: string | null
}

export interface KanjiCompound {
  id: string
  jp: string
  reading: string
  meaningVi: string
}

export interface KanjiSimilarRef {
  id: string
  similarKanjiId: string
  reason: string
  similarKanji?: KanjiListItem
}

export interface KanjiComponent {
  char: string
  meaningVi: string
}

export interface KanjiRadical {
  id: string
  char: string
  meaningVi: string
  strokes: number
  isPopular: boolean
}

export interface KanjiListItem {
  id: string
  char: string
  jlptLevel: JlptLevel
  strokes: number
  radicalId?: string | null
  frequency?: number | null
  joyoOrder?: number | null
  unicode: string
  meaningVi: string
  meaningEn: string
  status: KanjiStatus
  createdAt: string
  updatedAt: string
  radical?: Pick<KanjiRadical, 'id' | 'char' | 'meaningVi'> | null
}

export interface KanjiDetail extends KanjiListItem {
  onReadings: string[]
  kunReadings: string[]
  strokeOrderSvg: string[]
  mnemonicVi?: string | null
  meanings: KanjiMeaning[]
  examples: KanjiExample[]
  compounds: KanjiCompound[]
  components: KanjiComponent[]
  similar: KanjiSimilarRef[]
}

export interface KanjiListResponse {
  data: KanjiListItem[]
  meta: AdminListMeta
}

export interface CreateKanjiMeaningDto {
  index: number
  pos: string
  textVi: string
  jpExample?: string
}

export interface CreateKanjiExampleDto {
  jpHtml: string
  vi: string
  source?: string
}

export interface CreateKanjiCompoundDto {
  jp: string
  reading: string
  meaningVi: string
}

export interface CreateKanjiSimilarDto {
  similarKanjiId: string
  reason: string
}

export interface CreateKanjiComponentDto {
  char: string
  meaningVi: string
}

export interface CreateKanjiDto {
  char: string
  jlptLevel: JlptLevel
  strokes: number
  radicalId?: string
  frequency?: number
  joyoOrder?: number
  unicode: string
  onReadings: string[]
  kunReadings: string[]
  meaningVi: string
  meaningEn: string
  strokeOrderSvg?: string[]
  mnemonicVi?: string
  meanings?: CreateKanjiMeaningDto[]
  examples?: CreateKanjiExampleDto[]
  compounds?: CreateKanjiCompoundDto[]
  components?: CreateKanjiComponentDto[]
  similar?: CreateKanjiSimilarDto[]
}

export interface UpdateKanjiDto {
  jlptLevel?: JlptLevel
  strokes?: number
  radicalId?: string | null
  frequency?: number | null
  joyoOrder?: number | null
  unicode?: string
  onReadings?: string[]
  kunReadings?: string[]
  meaningVi?: string
  meaningEn?: string
  strokeOrderSvg?: string[]
  mnemonicVi?: string | null
  meanings?: CreateKanjiMeaningDto[]
  examples?: CreateKanjiExampleDto[]
  compounds?: CreateKanjiCompoundDto[]
  components?: CreateKanjiComponentDto[]
  similar?: CreateKanjiSimilarDto[]
}

export interface CreateKanjiRadicalDto {
  char: string
  meaningVi: string
  strokes: number
  isPopular?: boolean
}

export interface UpdateKanjiRadicalDto {
  meaningVi?: string
  strokes?: number
  isPopular?: boolean
}
