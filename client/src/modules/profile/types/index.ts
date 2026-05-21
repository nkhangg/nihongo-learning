export type LearningGoal = 'study_abroad' | 'work' | 'jlpt' | 'culture'
export type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  username: string
  location: string
  bio: string
  learningGoal: LearningGoal
  currentLevel: JlptLevel
  avatarUrl?: string
}

export interface UserStats {
  masteredWords: number
  currentStreak: number
  retentionRate: number
}

export interface PublicStats {
  studyDays: number
  masteredWords: number
  currentStreak: number
  bestStreak: number
  isPublic: boolean
}

export interface Badge {
  id: string
  icon: string
  name: string
  description: string
  locked: boolean
  progress?: string
}

export interface UpdateProfileDto {
  firstName: string
  lastName: string
  username: string
  location: string
  bio: string
  learningGoal: LearningGoal
  currentLevel: JlptLevel
}

export interface PublicVisibilityDto {
  isPublic: boolean
}
