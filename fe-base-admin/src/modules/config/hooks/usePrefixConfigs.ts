import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@shared/constants'
import { configService } from '../services/config.service'
import type { AppConfig } from '../types'

export interface PrefixSection {
  section: string
  items: AppConfig[]
}

export function usePrefixConfigs(prefix: string) {
  const query = useQuery({
    queryKey: [...QUERY_KEYS.CONFIGS, prefix],
    queryFn: () =>
      configService.listConfigs({
        'filter.key': `$sw:${prefix}.`,
        limit: 200,
        page: 1,
      }),
  })

  const configs = query.data?.data ?? []
  const sections: PrefixSection[] = []

  if (configs.length > 0) {
    const map = new Map<string, PrefixSection>()
    for (const config of configs) {
      const parts = config.key.split('.')
      // system.email.host → section "email"; system.debug → section "general"
      const section = parts.length > 2 ? parts[1] : 'general'
      if (!map.has(section)) map.set(section, { section, items: [] })
      map.get(section)!.items.push(config)
    }
    sections.push(...map.values())
  }

  const totalEnabled = configs.filter((c) => c.isEnabled).length
  const totalDisabled = configs.filter((c) => !c.isEnabled).length

  return {
    ...query,
    configs,
    sections,
    totalEnabled,
    totalDisabled,
    meta: query.data?.meta,
  }
}
