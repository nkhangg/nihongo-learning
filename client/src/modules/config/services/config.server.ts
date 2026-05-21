import 'server-only'
import { ENV } from '@config/env'
import {
  PUBLIC_CONFIG_KEYS,
  type FooterConfig,
  type HeaderConfig,
  type PublicConfigsResponse,
} from '../types'

const REVALIDATE_SECONDS = 5 * 60

async function fetchPublicConfigs(keys: string[]): Promise<PublicConfigsResponse> {
  const base = ENV.API_BASE_URL.replace(/\/+$/, '')
  const qs = new URLSearchParams({ keys: keys.join(',') }).toString()
  const url = `${base}/configs/batch?${qs}`

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: REVALIDATE_SECONDS, tags: ['public-config'] },
  })

  if (!res.ok) return {}
  return (await res.json()) as PublicConfigsResponse
}

export async function fetchHeaderAndFooterConfig(): Promise<{
  header: HeaderConfig | null
  footer: FooterConfig | null
}> {
  try {
    const data = await fetchPublicConfigs([
      PUBLIC_CONFIG_KEYS.HEADER,
      PUBLIC_CONFIG_KEYS.FOOTER,
    ])
    return {
      header: (data[PUBLIC_CONFIG_KEYS.HEADER] as HeaderConfig | undefined) ?? null,
      footer: (data[PUBLIC_CONFIG_KEYS.FOOTER] as FooterConfig | undefined) ?? null,
    }
  } catch {
    return { header: null, footer: null }
  }
}
