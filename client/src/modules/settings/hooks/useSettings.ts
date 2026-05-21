'use client'

import { useState, useCallback } from 'react'
import type { SettingsState } from '../types'

const DEFAULT_SETTINGS: SettingsState = {
  learning: {
    dailyGoal: 20,
    reminderHour: '09',
    reminderMinute: '00',
    studyMode: 'recognition',
    autoFlipSeconds: 0,
    showFurigana: true,
    audioEnabled: true,
    cardOrder: 'srs',
    keyboardShortcuts: true,
  },
  notifications: {
    dailyReminder: true,
    streakAlert: true,
    srsDue: true,
    achievements: false,
    weeklyEmail: true,
    newsUpdates: false,
  },
  appearance: {
    theme: 'light',
    kanjiFontSize: 'md',
    animations: true,
    uiSounds: true,
  },
  language: {
    uiLanguage: 'vi',
    definitionLanguage: 'vi',
    phonetics: 'hiragana',
  },
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState<SettingsState>(DEFAULT_SETTINGS)
  const [hasChanges, setHasChanges] = useState(false)

  const update = useCallback(
    <K extends keyof SettingsState>(section: K, values: Partial<SettingsState[K]>) => {
      setSettings((prev) => ({
        ...prev,
        [section]: { ...prev[section], ...values },
      }))
      setHasChanges(true)
    },
    [],
  )

  const save = useCallback(() => {
    setSaved(settings)
    setHasChanges(false)
  }, [settings])

  const discard = useCallback(() => {
    setSettings(saved)
    setHasChanges(false)
  }, [saved])

  return { settings, hasChanges, update, save, discard }
}
