export type ProgressRange = '7d' | '30d' | '3m' | 'all'

export interface ProgressStats {
  wordsLearned: number
  wordsLearnedChange: number
  streak: number
  isPersonalRecord: boolean
  retentionRate: number
  retentionChange: number
  studyHours: number
  studyHoursChange: number
}

export interface SrsStage {
  name: string
  count: number
  color: string
  percentage: number
}

export interface SrsDistribution {
  total: number
  stages: SrsStage[]
}

export interface SkillProgress {
  name: string
  percentage: number
  current: number
  total: number
  unit: string
  color: string
  trend: string
  trendColor: string
}

export interface HeatmapCell {
  level: 0 | 1 | 2 | 3 | 4
}

export interface HeatmapData {
  cells: HeatmapCell[][]
  months: string[]
  studyDaysThisMonth: number
}

export interface WeakWord {
  id: string
  japanese: string
  meaning: string
  level: string
  retentionRate: number
  reviewCount: number
}

export interface ProgressData {
  stats: ProgressStats
  dailyCards: number[]
  srs: SrsDistribution
  skills: SkillProgress[]
  heatmap: HeatmapData
  weakWords: WeakWord[]
}
