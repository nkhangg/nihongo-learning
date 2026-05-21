import { apiClient } from '@lib/api-client'
import type { PublicConfigsResponse } from '../types'

export const configService = {
  batch: (keys: string[]) =>
    apiClient
      .get<PublicConfigsResponse>('/configs/batch', {
        params: { keys: keys.join(',') },
      })
      .then((r) => r.data),

  getByKey: <T = unknown>(key: string) =>
    apiClient
      .get<{ key: string; value: T; scope: string; tags: string[] }>(
        `/configs/${encodeURIComponent(key)}`,
      )
      .then((r) => r.data),
}
