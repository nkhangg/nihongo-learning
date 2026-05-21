import type { ConfigScope } from '../types'
import { CLIENT_CONFIG_TEMPLATES } from './client.templates'

export interface ConfigTemplate {
  key: string
  nameI18nKey: string
  descriptionI18nKey: string
  value: unknown
  valueKeyOrder?: string[]
  scope: ConfigScope
  tags: string[]
  description: string
}

const TEMPLATES_BY_PREFIX: Record<string, ConfigTemplate[]> = {
  client: CLIENT_CONFIG_TEMPLATES,
}

export function getTemplatesForPrefix(prefix: string): ConfigTemplate[] {
  return TEMPLATES_BY_PREFIX[prefix] ?? []
}

export { CLIENT_CONFIG_TEMPLATES }
