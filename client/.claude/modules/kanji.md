# Module: kanji

Kanji browser + detail + writing practice + quiz — 4 trải nghiệm học Jōyō Kanji theo JLPT. Module thuộc route group `(learning)` (full-screen, không sidebar).

## Structure

```
src/modules/kanji/
├── types/index.ts                  — KanjiListItem, KanjiDetail, KanjiProgressSummary, DTOs quiz/writing
├── services/kanji.service.ts       — 10 endpoint wrappers via apiClient
├── hooks/
│   ├── useKanji.ts                 — data hooks (list, detail, progress, radicals, mutations)
│   ├── useKanjiQuizSession.ts      — quiz state machine (useReducer)
│   └── useWritingCanvas.ts         — canvas pointer events + stroke state
├── components/
│   ├── KanjiBrowserPage.tsx        — Browser orchestrator (URL filter state)
│   ├── KanjiHero.tsx               — hero gradient + stats
│   ├── KanjiFilterBar.tsx          — level/status chips + search (URL sync)
│   ├── KanjiGrid.tsx               — grouped by JLPT level grid
│   ├── KanjiCard.tsx               — reusable card ('navigate'|'select' mode)
│   ├── KanjiBrowserSidebar.tsx     — progress ring + level bars + radical grid
│   ├── ProgressRing.tsx            — SVG ring component
│   ├── LevelProgressList.tsx       — N5→N1 progress bars
│   ├── RadicalGrid.tsx             — radical filter chips
│   ├── KanjiDetailPage.tsx         — detail orchestrator (status update + writing link)
│   ├── MeaningsList.tsx            — numbered meanings with pos tag
│   ├── ExamplesList.tsx            — jpHtml rendered via dangerouslySetInnerHTML
│   ├── CompoundsGrid.tsx           — 2-col compounds grid
│   ├── StrokeOrderSteps.tsx        — stroke step thumbnails
│   ├── KanjiWritingPage.tsx        — writing practice orchestrator
│   ├── StrokeCanvas.tsx            — pointer canvas with ghost + grid
│   ├── FeedbackPanel.tsx           — writing score bars
│   ├── KanjiQuizPage.tsx           — quiz orchestrator (3 views)
│   ├── QuizConfigView.tsx          — level/mode/count/lives picker
│   ├── RecognitionCard.tsx         — quiz mode A (kanji → reading)
│   ├── MeaningToKanjiCard.tsx      — quiz mode B (meaning → kanji)
│   └── QuizSummary.tsx             — accuracy stats + mistake list
└── index.ts
```

## Public API

```typescript
import {
  KanjiBrowserPage, KanjiDetailPage, KanjiWritingPage, KanjiQuizPage,
  KanjiCard,
  useKanjiList, useKanji, useMyKanjiProgress, useRadicals,
  useUpdateKanjiStatus, useSubmitWritingAttempt, useWritingQueue,
} from '@modules/kanji'
import type { JlptLevel, KanjiStatus, KanjiListItem, KanjiDetail, ... } from '@modules/kanji'
```

## Routes

| Route | Page | Group |
|---|---|---|
| `/kanji` | `(learning)/kanji/page.tsx` | (learning) — full-screen |
| `/kanji/[id]` | `(learning)/kanji/[id]/page.tsx` | (learning) |
| `/kanji/[id]/write` | `(learning)/kanji/[id]/write/page.tsx` | (learning) |
| `/kanji/quiz` | `(learning)/kanji/quiz/page.tsx` | (learning) |

## API Endpoints

| Hook | Method | Endpoint |
|---|---|---|
| `useKanjiList` | GET | `/kanji` |
| `useKanji` | GET | `/kanji/:id` |
| `useRadicals` | GET | `/kanji/radicals` |
| `useMyKanjiProgress` | GET | `/me/kanji/progress` |
| `useWritingQueue` | GET | `/me/kanji/writing-queue` |
| `useUpdateKanjiStatus` | PATCH | `/me/kanji/:id/status` |
| `useSubmitWritingAttempt` | POST | `/me/kanji/:id/writing-attempt` |
| `useStartKanjiQuiz` | POST | `/me/kanji/quiz/start` |
| `useSubmitKanjiQuizAnswer` | POST | `/me/kanji/quiz/:sessionId/answer` |
| `useFinishKanjiQuiz` | POST | `/me/kanji/quiz/:sessionId/finish` |

## Query Keys

```typescript
QUERY_KEYS.KANJI.LIST(params)          // ['kanji', 'list', params]
QUERY_KEYS.KANJI.DETAIL(id)            // ['kanji', 'detail', id]
QUERY_KEYS.KANJI.PROGRESS              // ['kanji', 'progress']
QUERY_KEYS.KANJI.RADICALS              // ['kanji', 'radicals']
QUERY_KEYS.KANJI.WRITING_QUEUE(level)  // ['kanji', 'writing-queue', level]
```

## Visual Design System

Redesign hoàn toàn theo `planning/client/deigns/kanji.html`. Color palette (Tailwind arbitrary values):

| Token | Value | Dùng cho |
|---|---|---|
| Ink | `#0D0D0F` | Text chính, dark bg |
| Teal | `#0F8A72` / `#E8F7F4` | Known status, progress fill |
| Amber | `#C47D0E` / `#FEF6E4` | Learning, on'yomi reading |
| Blue | `#1565C0` / `#E8F4FF` | Hover, kun'yomi, N4, interactive |
| Red | `#E8334A` / `#FFF0F2` | Wrong answer, N2 |
| Purple | `#5B45C7` / `#EDE8FE` | Part-of-speech tags |
| Surface | `#F2F2EF` | Card bg tonal |
| Border | `border-black/[.07]` | Default card borders |

Responsive breakpoints:
- Mobile: filter stacked, grid 5 col, browser 1-col, detail hero 1-col
- Tablet: filter semi-row, grid 6 col
- Desktop (lg:): grid 8 col, browser sidebar `268px`, detail sidebar `300px`

## Gotchas

- `KanjiListResult` dùng `{ data: KanjiListItem[], meta: KanjiListMeta }` — khớp với `nestjs-paginate` response. KHÔNG dùng `PaginatedResult<T>` từ shared types (shape khác).
- `ExamplesList` render `jpHtml` qua `dangerouslySetInnerHTML` — BE BẮT BUỘC sanitize trước (whitelist: `<ruby>`, `<rt>`, `<em>`, `<span class="highlight">`). XSS risk nếu BE không sanitize.
- Filter state đồng bộ với URL search params (`?level=N4&status=learning`) — dùng `router.replace` không scroll lại đầu.
- `KanjiCard` có 2 mode: `interactive='navigate'` (default, route push) và `interactive='select'` (dùng cho quiz option). Không dùng nhầm.
- `useWritingCanvas` cần canvas size để normalize tọa độ 0..1 — phải render `<StrokeCanvas>` với fixed `size` prop.
- `StrokeCanvas` đặt `touchAction: 'none'` trên canvas để tránh conflict với scroll mobile.
- Quiz session state KHÔNG persist khi reload (Phase 1 chấp nhận).
- KHÔNG thêm vào `AppLayout.tsx` sidebar — module thuộc `(learning)` group.
