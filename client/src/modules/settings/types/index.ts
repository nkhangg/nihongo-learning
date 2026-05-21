export type StudyMode = 'recognition' | 'typing' | 'mixed'
export type CardOrder = 'srs' | 'random' | 'added' | 'hard-first'
export type Theme = 'light' | 'dark' | 'system'
export type KanjiFontSize = 'sm' | 'md' | 'lg' | 'xl'
export type UILanguage = 'vi' | 'en' | 'ja'
export type DefinitionLang = 'vi' | 'en'
export type Phonetics = 'hiragana' | 'romaji' | 'both'
export type SettingsSection = 'learning' | 'notifications' | 'appearance' | 'language' | 'security'

export interface LearningSettings {
  dailyGoal: number
  reminderHour: string
  reminderMinute: string
  studyMode: StudyMode
  autoFlipSeconds: number
  showFurigana: boolean
  audioEnabled: boolean
  cardOrder: CardOrder
  keyboardShortcuts: boolean
}

export interface NotifSettings {
  dailyReminder: boolean
  streakAlert: boolean
  srsDue: boolean
  achievements: boolean
  weeklyEmail: boolean
  newsUpdates: boolean
}

export interface AppearanceSettings {
  theme: Theme
  kanjiFontSize: KanjiFontSize
  animations: boolean
  uiSounds: boolean
}

export interface LanguageSettings {
  uiLanguage: UILanguage
  definitionLanguage: DefinitionLang
  phonetics: Phonetics
}

export interface SettingsState {
  learning: LearningSettings
  notifications: NotifSettings
  appearance: AppearanceSettings
  language: LanguageSettings
}
