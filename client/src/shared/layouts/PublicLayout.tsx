import Link from 'next/link'
import { cookies } from 'next/headers'
import { cn } from '@shared/utils'
import {
  fetchHeaderAndFooterConfig,
  type FooterConfig,
  type HeaderAction,
  type HeaderConfig,
} from '@modules/config'
import { PublicNavLinks } from './PublicNavLinks'

const AUTHED_ACTIONS: HeaderAction[] = [
  { href: '/dashboard', label: 'Vào học', variant: 'primary' },
]

const DEFAULT_HEADER: HeaderConfig = {
  logo: { mark: '日', text: 'Nihongo', href: '/' },
  navLinks: [
    { href: '/#features', label: 'Tính năng' },
    { href: '/#levels', label: 'Cấp độ' },
    { href: '/#how', label: 'Cách học' },
    { href: '/pricing', label: 'Bảng giá' },
  ],
  actions: [
    { href: '/login', label: 'Đăng nhập', variant: 'ghost' },
    { href: '/register', label: 'Bắt đầu miễn phí', variant: 'primary' },
  ],
}

const DEFAULT_FOOTER: FooterConfig = {
  logo: { mark: '日', text: 'Nihongo', href: '/' },
  links: [
    { href: '/#features', label: 'Tính năng' },
    { href: '/pricing', label: 'Bảng giá' },
    { href: '/blog', label: 'Blog' },
    { href: '#', label: 'Về chúng tôi' },
    { href: '#', label: 'Liên hệ' },
  ],
  copyright: '© {year} Nihongo · Học tiếng Nhật thông minh',
}

function renderCopyright(template: string): string {
  return template.replace('{year}', String(new Date().getFullYear()))
}

export async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [{ header: headerCfg, footer: footerCfg }, cookieStore] = await Promise.all([
    fetchHeaderAndFooterConfig(),
    cookies(),
  ])
  const isAuthed = Boolean(
    cookieStore.get('session') ?? cookieStore.get('access_token'),
  )

  const header = headerCfg ?? DEFAULT_HEADER
  const footer = footerCfg ?? DEFAULT_FOOTER
  const headerLogoHref = header.logo.href ?? '/'
  const footerLogoHref = footer.logo.href ?? '/'
  const headerActions = isAuthed ? AUTHED_ACTIONS : header.actions

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="sticky top-0 z-50 bg-paper border-b border-border">
        <div className="mx-auto flex h-14 max-w-[1100px] items-center gap-0 px-8">
          <Link href={headerLogoHref} className="mr-auto flex items-center gap-2 no-underline">
            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-sm bg-ink">
              <span className="font-mono text-[13px] font-medium text-white">{header.logo.mark}</span>
            </div>
            <span className="text-base font-semibold tracking-[-0.3px] text-ink">{header.logo.text}</span>
          </Link>

          <PublicNavLinks links={header.navLinks} />

          <div className="ml-3 flex items-center gap-0">
            {headerActions.map((action, idx) => {
              const isPrimary = action.variant === 'primary'
              return (
                <Link
                  key={action.href + action.label}
                  href={action.href}
                  className={cn(
                    isPrimary
                      ? 'ml-3 rounded-lg bg-ink px-4 py-[7px] text-[13px] font-medium text-white transition-colors hover:bg-ink-2'
                      : 'rounded-sm px-3.5 py-1.5 text-[13px] text-ink-3 transition-all hover:bg-surface hover:text-ink',
                    !isPrimary && idx > 0 && 'ml-0',
                  )}
                >
                  {action.label}
                </Link>
              )
            })}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-paper py-10">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4 px-8">
          <Link href={footerLogoHref} className="flex items-center gap-2 no-underline">
            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-sm bg-ink">
              <span className="font-mono text-[13px] font-medium text-white">{footer.logo.mark}</span>
            </div>
            <span className="text-sm font-semibold text-ink">{footer.logo.text}</span>
          </Link>

          <div className="flex flex-wrap gap-0">
            {footer.links.map((link) => (
              <a
                key={link.href + link.label}
                href={link.href}
                className="rounded-sm px-2.5 py-1 text-xs text-ink-4 transition-colors hover:text-ink-3"
              >
                {link.label}
              </a>
            ))}
          </div>

          <span className="text-xs text-ink-4">{renderCopyright(footer.copyright)}</span>
        </div>
      </footer>
    </div>
  )
}
