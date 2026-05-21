'use client'

import { useMockTest } from '../hooks/useMockTest'
import { SelectView } from './SelectView'
import { ExamView } from './ExamView'
import { ResultView } from './ResultView'

export function MockTestPage() {
  const {
    view,
    config,
    questions,
    currentIndex,
    answers,
    flagged,
    secondsLeft,
    result,
    levelMeta,
    previousResult,
    progressPercent,
    sectionProgress,
    setLevel,
    setSection,
    setQuestionCount,
    startExam,
    selectAnswer,
    goToQuestion,
    goNext,
    goPrev,
    toggleFlag,
    handleSubmit,
    retake,
  } = useMockTest()

  if (view === 'exam') {
    return (
      <ExamView
        questions={questions}
        currentIndex={currentIndex}
        answers={answers}
        flagged={flagged}
        secondsLeft={secondsLeft}
        sectionProgress={sectionProgress}
        progressPercent={progressPercent}
        onExit={retake}
        onSelectAnswer={selectAnswer}
        onGoTo={goToQuestion}
        onNext={goNext}
        onPrev={goPrev}
        onToggleFlag={toggleFlag}
        onSubmit={handleSubmit}
      />
    )
  }

  if (view === 'result' && result) {
    return (
      <ResultView
        result={result}
        onRetake={retake}
        onReview={retake}
      />
    )
  }

  return (
    <SelectView
      selectedLevel={config.level}
      selectedSection={config.section}
      selectedQuestionCount={config.questionCount}
      levelMeta={levelMeta}
      previousResult={previousResult}
      onSelectLevel={setLevel}
      onSelectSection={setSection}
      onSelectQuestionCount={setQuestionCount}
      onStart={startExam}
    />
  )
}
