import { fetchHeaderAndFooterConfig, type BrandLogo } from '@modules/config'
import { ROUTES } from '@config/routes'
import { AppShell } from './AppShell'

const DEFAULT_LOGO: BrandLogo = {
  mark: '日',
  text: 'Nihongo',
  href: ROUTES.DASHBOARD,
}

export async function AppLayout({ children }: { children: React.ReactNode }) {
  const { header } = await fetchHeaderAndFooterConfig()
  const logo: BrandLogo = header?.logo
    ? { ...header.logo, href: header.logo.href ?? ROUTES.DASHBOARD }
    : DEFAULT_LOGO

  return <AppShell logo={logo}>{children}</AppShell>
}
