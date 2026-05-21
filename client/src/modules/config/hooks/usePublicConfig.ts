'use client'

import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@shared/constants'
import { configService } from '../services/config.service'

const STALE_TIME = 5 * 60 * 1000

export function usePublicConfigs(keys: string[]) {
  const sorted = [...keys].sort()
  return useQuery({
    queryKey: QUERY_KEYS.CONFIG.PUBLIC(sorted),
    queryFn: () => configService.batch(sorted),
    staleTime: STALE_TIME,
    enabled: sorted.length > 0,
  })
}
