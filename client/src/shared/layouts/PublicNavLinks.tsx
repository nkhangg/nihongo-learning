'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@shared/utils'
import type { NavLink } from '@modules/config'

export function PublicNavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname()
  return (
    <nav className="hidden items-center md:flex">
      {links.map((link) => (
        <a
          key={link.href + link.label}
          href={link.href}
          className={cn(
            'rounded-sm px-3.5 py-1.5 text-[13px] transition-all hover:bg-surface hover:text-ink',
            pathname === link.href ? 'font-medium text-ink' : 'font-normal text-ink-3',
          )}
        >
          {link.label}
        </a>
      ))}
    </nav>
  )
}
