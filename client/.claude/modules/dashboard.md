# Module: dashboard

Trang tổng quan học tiếng Nhật — today banner, stat cards, module list, heatmap, bar chart, due words, JLPT progress, recent mistakes.

## Structure

```
src/modules/dashboard/
├── components/
│   ├── DashboardPage.tsx        # Orchestrator — full dashboard layout
│   ├── TodayBanner.tsx          # Dark hero banner, today stats, CTA
│   ├── StatCards.tsx            # 4-col stat cards (mastered, retention, time, mock test)
│   ├── ModuleProgressList.tsx   # 5 learning module cards with progress bars
│   ├── ActivityHeatmap.tsx      # 26×7 calendar heatmap (6 months)
│   ├── DueWordsList.tsx         # Due today list with urgent indicators
│   └── JlptProgressCard.tsx    # SVG ring + 3 progress bars + tip
├── hooks/
│   └── useDashboard.ts          # useDashboardStats, useDashboardModules
├── services/
│   └── dashboard.service.ts     # getStats, getModules
├── types/
│   └── index.ts                 # DashboardStats, LearningModule, DueWord, RecentMistake, ModuleStatus
└── index.ts
```

## Public API

```typescript
import { DashboardPage } from '@modules/dashboard'
import type { DashboardStats, LearningModule, DueWord, RecentMistake } from '@modules/dashboard'
```

## Route

| Route | Page | Group |
|---|---|---|
| `/dashboard` | `(app)/dashboard/page.tsx` | (app) — AppLayout sidebar |

## Responsive Layout

- Mobile: all sections stacked (flex-col)
- md: stat cards 2-col → 4-col grid
- lg: main content `grid-cols-[1fr_360px]` — left (modules + heatmap + chart) + right (due words + jlpt + mistakes)

## API Endpoints

| Hook | Method | Endpoint | Status |
|---|---|---|---|
| `useDashboardStats` | GET | `/dashboard/stats` | mock data (no BE) |
| `useDashboardModules` | GET | `/dashboard/modules` | mock data (no BE) |

## Query Keys

```typescript
QUERY_KEYS.DASHBOARD.STATS    // ['dashboard', 'stats']
QUERY_KEYS.DASHBOARD.MODULES  // ['dashboard', 'modules']
```

## Notes

- All data is currently **static mock data** — no BE connection yet
- ActivityHeatmap uses `useMemo` with seeded random for stable SSR
- ModuleProgressList: modules with `href: '#'` are rendered as `div` (disabled, opacity-50)
