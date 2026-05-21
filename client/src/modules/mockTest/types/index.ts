export type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
export type TestSection = 'all' | 'vocabulary' | 'grammar' | 'reading'
export type QuestionCount = '20' | 'full' | 'custom'
export type ExamViewState = 'select' | 'exam' | 'result'
export type OptionId = 'A' | 'B' | 'C' | 'D'

export interface QuestionOption {
  id: OptionId
  text: string
}

export interface Question {
  id: number
  section: Exclude<TestSection, 'all'>
  text: string
  jpText: string
  underlinedWord?: string
  options: QuestionOption[]
  correctId: OptionId
  explanation: string
}

export interface TestConfig {
  level: JlptLevel
  section: TestSection
  questionCount: QuestionCount
}

export interface LevelMeta {
  questionCount: number
  duration: number
  passingScore: number
  maxScore: number
}

export interface SectionBreakdown {
  section: Exclude<TestSection, 'all'>
  label: string
  score: number
  maxScore: number
  percentage: number
  color: string
}

export interface WeaknessItem {
  text: string
  percentage: number
  color: 'red' | 'amber' | 'teal'
}

export interface ExamResult {
  totalScore: number
  maxScore: number
  passed: boolean
  breakdown: SectionBreakdown[]
  weaknesses: WeaknessItem[]
  previousScore: number
  improvedBy: number
  needMorePoints: number
}

export interface PreviousAttempt {
  level: JlptLevel
  score: number
  maxScore: number
  passed: boolean
  needMorePoints: number
}
