'use client'

import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react'
import { ROUTES } from '@config/routes'
import { Button } from '@shared/components/ui'

export function EmptyState() {
  const { t } = useTranslation()
  const router = useRouter()
  return (
    <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500 dark:bg-amber-950 dark:text-amber-300">
        <Sparkles className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-semibold">{t('flashcards.empty.title')}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t('flashcards.empty.subtitle')}</p>
      <Button className="mt-6" onClick={() => router.push(ROUTES.DASHBOARD)}>
        {t('flashcards.empty.cta')}
      </Button>
    </div>
  )
}
