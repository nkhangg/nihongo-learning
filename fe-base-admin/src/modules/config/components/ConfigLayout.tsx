import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@shared/utils'
import { ROUTES } from '@config/routes'

export function ConfigLayout() {
  const { t } = useTranslation()
  const tabs: { label: string; to: string; end?: boolean }[] = [
    { label: t('config.tabs.all'), to: ROUTES.CONFIGS, end: true },
    { label: t('config.tabs.pages'), to: ROUTES.CONFIG_PAGES },
    { label: t('config.tabs.systems'), to: ROUTES.CONFIG_SYSTEMS },
    { label: t('config.tabs.client'), to: ROUTES.CONFIG_CLIENT },
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-gray-200 bg-white px-6">
        <nav className="flex">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  '-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700',
                )
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}
