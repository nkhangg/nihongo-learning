export interface DashboardStats {
  streak: number
  totalCards: number
  masteredWords: number
  todayGoal: number
  completedToday: number
  xpTotal: number
}

export interface LearningModule {
  id: string
  title: string
  description: string
  progress: number
  icon: string
  route: string
}

export interface TodayStats {
  reviewCount: number
  newWords: number
  estimatedMinutes: number
  dayOfWeek: string
}

export type ModuleStatus = 'review' | 'next' | 'failed' | 'new' | 'optional'

export interface ModuleItem {
  id: string
  icon: string
  bg: string
  name: string
  meta: string
  status: ModuleStatus
  progress: number
  href: string
}

export interface DueWord {
  id: string
  kanji: string
  reading: string
  meaning: string
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  urgent: boolean
}

export interface RecentMistake {
  id: string
  kanji: string
  meaning: string
  note: string
}
