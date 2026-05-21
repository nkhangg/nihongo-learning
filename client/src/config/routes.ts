export const ROUTES = {
  HOME: '/',
  PRICING: '/pricing',
  BLOG: '/blog',

  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
  },

  // Onboarding
  ONBOARDING: '/onboarding',

  // App (protected)
  DASHBOARD: '/dashboard',
  PROGRESS: '/progress',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  BILLING: '/billing',

  // Learning (protected, full-screen)
  FLASHCARDS: '/flashcards',
  GRAMMAR: '/grammar',
  MOCK_TEST: '/mock-test',
  KANJI: '/kanji',
  KANJI_QUIZ: '/kanji/quiz',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]

export const blogPostPath = (slug: string) => `/blog/${slug}`
export const kanjiDetailPath = (id: string) => `/kanji/${id}`
export const kanjiWritePath = (id: string) => `/kanji/${id}/write`
