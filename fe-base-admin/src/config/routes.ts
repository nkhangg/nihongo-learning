export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  ROLES: '/admin/roles',
  USERS: '/users',
  CONFIGS: '/configs',
  AUDIT_LOGS: '/audit-logs',
  MEDIA: '/media',
  NOTIFICATIONS: '/notifications',
  BLOG: '/blog',
  BLOG_NEW: '/blog/new',
  BLOG_EDIT: '/blog/:id/edit',
  DICTIONARY: '/dictionary',
  ARTICLES: '/articles',
  ARTICLES_NEW: '/articles/new',
  ARTICLES_EDIT: '/articles/:id/edit',
  QUESTIONS: '/questions',
  PROGRESS: '/progress',
  ORGANIZATIONS: '/organizations',
  CONTACTS: '/contacts',
  KANJI: '/kanji',
  KANJI_RADICALS: '/kanji/radicals',
  AUTH_SESSIONS: '/admin/auth/sessions',
  CONFIG_PAGES: '/configs/pages',
  CONFIG_SYSTEMS: '/configs/systems',
  CONFIG_CLIENT: '/configs/client',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]

export const blogEditPath = (id: string) => `/blog/${id}/edit`
export const articleEditPath = (id: string) => `/articles/${id}/edit`
