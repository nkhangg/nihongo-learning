'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input } from '@shared/components/ui'
import { cn } from '@shared/utils'
import type { RatingKey, ReviewCard } from '../types'
import { AnswerButtons } from './AnswerButtons'

interface TypingCardProps {
  card: ReviewCard
  onRate: (key: RatingKey) => void
  onSkip: () => void
}

type CheckResult = 'idle' | 'correct' | 'wrong'

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '')
}

export function TypingCard({ card, onRate, onSkip }: TypingCardProps) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  const [result, setResult] = useState<CheckResult>('idle')
  const [revealed, setRevealed] = useState(false)

  const { entry } = card
  const expectedHiragana = normalize(entry.hiragana)
  const expectedRomaji = normalize(entry.romaji)

  const check = () => {
    const input = normalize(value)
    if (input.length === 0) return
    if (input === expectedHiragana || input === expectedRomaji) {
      setResult('correct')
      setRevealed(true)
    } else {
      setResult('wrong')
    }
  }

  const showAnswer = () => {
    setRevealed(true)
    setResult('wrong')
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="rounded-2xl border border-border bg-background px-6 py-10 text-center shadow-sm">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          {t('dashboard.vocabulary')}
        </div>
        <div className="mt-3 space-y-1 text-lg font-medium">
          {entry.meanings.map((m, i) => (
            <div key={i}>{m}</div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (revealed) return
            check()
          }}
          className="mt-6 flex flex-col items-center gap-3"
        >
          <Input
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              if (result === 'wrong') setResult('idle')
            }}
            placeholder={t('flashcards.typing.placeholder')}
            disabled={revealed}
            autoFocus
            className={cn(
              'max-w-sm text-center text-lg',
              result === 'wrong' && 'border-red-400 animate-shake focus-visible:ring-red-200',
              result === 'correct' && 'border-emerald-400',
            )}
          />
          <p className="text-xs text-muted-foreground">{t('flashcards.typing.hint')}</p>

          {revealed && (
            <div className="mt-2 flex flex-col items-center gap-1 rounded-xl border border-border bg-muted/40 px-4 py-3">
              <div className="text-3xl font-semibold">{entry.kanji || entry.hiragana}</div>
              {entry.kanji && (
                <div className="font-mono text-sm text-muted-foreground">{entry.hiragana}</div>
              )}
              <div className="font-mono text-xs text-muted-foreground">{entry.romaji}</div>
            </div>
          )}

          {!revealed && (
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={showAnswer}>
                {t('flashcards.typing.showAnswer')}
              </Button>
              <Button type="submit" size="sm">
                {t('flashcards.typing.check')}
              </Button>
            </div>
          )}
        </form>
      </div>

      {revealed ? (
        <AnswerButtons onRate={onRate} />
      ) : (
        <div className="flex items-center justify-end">
          <Button variant="ghost" size="sm" onClick={onSkip}>
            {t('flashcards.card.skip')}
            <kbd className="ml-2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              →
            </kbd>
          </Button>
        </div>
      )}
    </div>
  )
}
