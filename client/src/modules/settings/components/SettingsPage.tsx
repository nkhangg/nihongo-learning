'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useSettings } from '../hooks/useSettings'
import { SettingsNav } from './SettingsNav'
import { LearningSection } from './LearningSection'
import { NotificationsSection } from './NotificationsSection'
import { AppearanceSection } from './AppearanceSection'
import { LanguageSection } from './LanguageSection'
import { SecuritySection } from './SecuritySection'
import { SaveBar } from './SaveBar'
import type { SettingsSection } from '../types'

export function SettingsPage() {
  const { settings, hasChanges, update, save, discard } = useSettings()
  const [activeSection, setActiveSection] = useState<SettingsSection>('learning')
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)

  const learningRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const appearanceRef = useRef<HTMLDivElement>(null)
  const languageRef = useRef<HTMLDivElement>(null)
  const securityRef = useRef<HTMLDivElement>(null)

  const sectionRefs: Record<SettingsSection, React.RefObject<HTMLDivElement | null>> = {
    learning: learningRef,
    notifications: notificationsRef,
    appearance: appearanceRef,
    language: languageRef,
    security: securityRef,
  }

  function handleNavSelect(id: SettingsSection) {
    setActiveSection(id)
    sectionRefs[id].current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleSave() {
    save()
    toast.success('✓ Đã lưu cài đặt')
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Page header */}
      <div className="hidden border-b border-border px-6 py-4 lg:block">
        <h1 className="text-sm font-semibold text-foreground">Cài đặt</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">Tuỳ chỉnh trải nghiệm học tập</p>
      </div>

      {/* Mobile section nav */}
      <div className="sticky top-14 z-10 bg-background lg:hidden">
        <SettingsNav active={activeSection} onSelect={handleNavSelect} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 gap-6 p-4 pb-20 md:p-6 lg:pb-6">
        {/* Desktop sticky nav */}
        <div className="hidden w-48 shrink-0 lg:block">
          <div className="sticky top-6">
            <SettingsNav active={activeSection} onSelect={handleNavSelect} />
          </div>
        </div>

        {/* Sections */}
        <div className="min-w-0 flex-1 space-y-4">
          <div ref={learningRef} className="scroll-mt-24">
            <LearningSection
              settings={settings.learning}
              onChange={(v) => update('learning', v)}
            />
          </div>

          <div ref={notificationsRef} className="scroll-mt-24">
            <NotificationsSection
              settings={settings.notifications}
              onChange={(v) => update('notifications', v)}
            />
          </div>

          <div ref={appearanceRef} className="scroll-mt-24">
            <AppearanceSection
              settings={settings.appearance}
              onChange={(v) => update('appearance', v)}
            />
          </div>

          <div ref={languageRef} className="scroll-mt-24">
            <LanguageSection
              settings={settings.language}
              onChange={(v) => update('language', v)}
            />
          </div>

          <div ref={securityRef} className="scroll-mt-24">
            <SecuritySection
              twoFAEnabled={twoFAEnabled}
              onToggle2FA={(v) => {
                setTwoFAEnabled(v)
                // security settings don't go through the unsaved-changes flow
              }}
            />
          </div>
        </div>
      </div>

      <SaveBar hasChanges={hasChanges} onSave={handleSave} onDiscard={discard} />
    </div>
  )
}
