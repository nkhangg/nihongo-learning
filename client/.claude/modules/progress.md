# Module: progress

Learning progress dashboard — stats, charts, skill rings, activity heatmap, weak words table.

## Structure
```
src/modules/progress/
├── components/
│   ├── ProgressPage.tsx          # Main page, manages range state
│   ├── ProgressStatCards.tsx     # 4 stat cards (words, streak, retention, hours)
│   ├── ProgressDailyChart.tsx    # CSS bar chart — daily review cards (30d)
│   ├── ProgressSrsDistribution.tsx # Horizontal bars for 5 SRS stages
│   ├── ProgressSkillRings.tsx    # SVG circular progress — 4 skills
│   ├── ProgressHeatmap.tsx       # 52×7 activity heatmap grid
│   └── ProgressWeakWords.tsx     # Low-retention words table
├── hooks/
│   └── useProgress.ts            # range state + getProgressData()
├── services/
│   └── progress.service.ts       # Mock data (no API yet)
├── types/
│   └── index.ts                  # ProgressData, ProgressStats, SrsDistribution, etc.
└── index.ts
```

## Public API
```ts
export { ProgressPage }
export type { ProgressData, ProgressStats, SkillProgress, WeakWord, ProgressRange }
```

## Route
`/progress` → `src/app/(app)/progress/page.tsx` → `(app)` group (AppLayout, sidebar)

## API Endpoints (not yet connected)
| Method | Path | Usage |
|---|---|---|
| GET | /api/progress/stats?range=30d | useProgress |
| GET | /api/progress/weak-words | useProgress |
| GET | /api/progress/heatmap | useProgress |

When connecting BE: replace `getProgressData()` in `progress.service.ts` with `apiClient` calls.

## Query Keys
```ts
QUERY_KEYS.PROGRESS.MY    // ['progress', 'my']
QUERY_KEYS.PROGRESS.STATS // ['progress', 'stats']
```
