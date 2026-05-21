export type JLPTLevel = 'n5' | 'n4' | 'n3' | 'n2' | 'n1'
export type GrammarStatus = 'all' | 'unlearned' | 'studying' | 'learned'
export type GrammarSortOrder = 'az' | 'level' | 'recent'

export interface GrammarExample {
  japanese: string
  vietnamese: string
  isWrong?: boolean
}

export interface GrammarLesson {
  id: string
  pattern: string
  meaning: string
  level: JLPTLevel
  types: string[]
  structure: string
  examples: GrammarExample[]
  status: 'learned' | 'studying' | 'unlearned'
}

export interface GrammarFilter {
  search: string
  level: JLPTLevel | 'all'
  types: string[]
  statusFilter: GrammarStatus
  page: number
}

export interface GrammarListResponse {
  lessons: GrammarLesson[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  learnedCount: number
}
