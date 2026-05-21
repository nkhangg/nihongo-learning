export interface BrandLogo {
  mark: string
  text: string
  href?: string
}

export interface NavLink {
  href: string
  label: string
}

export interface HeaderAction {
  href: string
  label: string
  variant?: 'ghost' | 'primary'
}

export interface HeaderConfig {
  logo: BrandLogo
  navLinks: NavLink[]
  actions: HeaderAction[]
}

export interface FooterConfig {
  logo: BrandLogo
  links: NavLink[]
  copyright: string
}

export const PUBLIC_CONFIG_KEYS = {
  HEADER: 'client.header',
  FOOTER: 'client.footer',
} as const

export type PublicConfigKey =
  (typeof PUBLIC_CONFIG_KEYS)[keyof typeof PUBLIC_CONFIG_KEYS]

export type PublicConfigsResponse = Record<string, unknown>
