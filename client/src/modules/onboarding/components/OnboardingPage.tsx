'use client'

import { useState } from 'react'
import { OnboardingTopbar } from './OnboardingTopbar'
import { GoalStep } from './GoalStep'
import { LevelStep } from './LevelStep'
import { QuizStep } from './QuizStep'
import { TimeStep } from './TimeStep'
import { ResultStep } from './ResultStep'
import { QUIZ_DATA, TOTAL_STEPS } from '../types'

export function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<(number | undefined)[]>(
    () => Array<number | undefined>(QUIZ_DATA.length).fill(undefined),
  )
  const [quizIndex, setQuizIndex] = useState(0)

  const handleNext = () => {
    if (step === 3) {
      if (quizIndex < QUIZ_DATA.length - 1) {
        setQuizIndex((i) => i + 1)
      } else {
        setStep(4)
      }
    } else if (step < TOTAL_STEPS) {
      setStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    if (step === 3 && quizIndex > 0) {
      setQuizIndex((i) => i - 1)
    } else {
      setStep((s) => Math.max(1, s - 1))
    }
  }

  const handleAnswer = (optIndex: number) => {
    setQuizAnswers((prev) => {
      const next = [...prev]
      next[quizIndex] = optIndex
      return next
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <OnboardingTopbar step={step} totalSteps={TOTAL_STEPS} />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-[620px]">
          {step === 1 && (
            <GoalStep
              key="goal"
              selected={selectedGoal}
              onSelect={setSelectedGoal}
              onNext={handleNext}
            />
          )}
          {step === 2 && (
            <LevelStep
              key="level"
              selected={selectedLevel}
              onSelect={setSelectedLevel}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {step === 3 && (
            <QuizStep
              key={`quiz-${quizIndex}`}
              quizIndex={quizIndex}
              answers={quizAnswers}
              onAnswer={handleAnswer}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {step === 4 && (
            <TimeStep
              key="time"
              selected={selectedTime}
              onSelect={setSelectedTime}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {step === 5 && (
            <ResultStep
              key="result"
              answers={quizAnswers}
              selectedGoal={selectedGoal}
              selectedTime={selectedTime}
            />
          )}
        </div>
      </main>
    </div>
  )
}
