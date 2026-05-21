'use client'

import { useState } from 'react'
import { getProgressData } from '../services/progress.service'
import type { ProgressRange } from '../types'

export function useProgress() {
  const [range, setRange] = useState<ProgressRange>('30d')
  const data = getProgressData(range)
  return { data, range, setRange }
}
