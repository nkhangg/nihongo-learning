'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { JlptLevel, TestSection, QuestionCount, ExamViewState, OptionId, ExamResult, TestConfig } from '../types'
import {
  MOCK_QUESTIONS,
  LEVEL_META,
  MOCK_PREVIOUS_ATTEMPT,
  computeExamResult,
} from '../services/mock-test.service'

export function useMockTest() {
  const [view, setView] = useState<ExamViewState>('select')
  const [config, setConfig] = useState<TestConfig>({
    level: 'N3',
    section: 'all',
    questionCount: 'full',
  })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, OptionId>>({})
  const [flagged, setFlagged] = useState<Set<number>>(new Set())
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [result, setResult] = useState<ExamResult | null>(null)

  const levelMeta = LEVEL_META[config.level]
  const previousResult = MOCK_PREVIOUS_ATTEMPT

  const questions = useMemo(() => {
    let qs = MOCK_QUESTIONS
    if (config.section !== 'all') {
      qs = qs.filter((q) => q.section === config.section)
    }
    if (config.questionCount === '20') {
      qs = qs.slice(0, 20)
    }
    return qs
  }, [config.section, config.questionCount])

  const currentQuestion = questions[currentIndex]

  const handleSubmit = useCallback(() => {
    const examResult = computeExamResult(questions, answers, levelMeta, previousResult.score)
    setResult(examResult)
    setView('result')
  }, [questions, answers, levelMeta, previousResult.score])

  useEffect(() => {
    if (view !== 'exam') return
    if (secondsLeft <= 0) return
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id)
          handleSubmit()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [view, secondsLeft, handleSubmit])

  const startExam = useCallback(() => {
    setCurrentIndex(0)
    setAnswers({})
    setFlagged(new Set())
    setSecondsLeft(levelMeta.duration * 60)
    setResult(null)
    setView('exam')
  }, [levelMeta.duration])

  const selectAnswer = useCallback((questionId: number, optionId: OptionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }, [])

  const goToQuestion = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, questions.length - 1))
  }, [questions.length])

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0))
  }, [])

  const toggleFlag = useCallback((questionId: number) => {
    setFlagged((prev) => {
      const next = new Set(prev)
      if (next.has(questionId)) next.delete(questionId)
      else next.add(questionId)
      return next
    })
  }, [])

  const retake = useCallback(() => {
    setView('select')
    setResult(null)
  }, [])

  const answeredCount = Object.keys(answers).length
  const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0

  const sectionProgress = useMemo(() => {
    const sections = ['vocabulary', 'grammar', 'reading'] as const
    const labels = { vocabulary: 'Từ vựng', grammar: 'Ngữ pháp', reading: 'Đọc hiểu' }
    return sections.map((section) => {
      const sectionQs = questions.filter((q) => q.section === section)
      const answered = sectionQs.filter((q) => answers[q.id] !== undefined).length
      return { section, label: labels[section], answered, total: sectionQs.length }
    }).filter((s) => s.total > 0)
  }, [questions, answers])

  return {
    view,
    config,
    questions,
    currentIndex,
    currentQuestion,
    answers,
    flagged,
    secondsLeft,
    result,
    levelMeta,
    previousResult,
    answeredCount,
    progressPercent,
    sectionProgress,
    setLevel: (level: JlptLevel) => setConfig((c) => ({ ...c, level })),
    setSection: (section: TestSection) => setConfig((c) => ({ ...c, section })),
    setQuestionCount: (questionCount: QuestionCount) => setConfig((c) => ({ ...c, questionCount })),
    startExam,
    selectAnswer,
    goToQuestion,
    goNext,
    goPrev,
    toggleFlag,
    handleSubmit,
    retake,
  }
}
