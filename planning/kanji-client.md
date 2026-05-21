# NEW CLIENT MODULE PLAN — kanji

> **Ngày:** 18/05/2026

```
NEW CLIENT MODULE PLAN
Module      : kanji
Domain      : Duyệt, tra cứu, luyện viết và quiz Kanji (Jōyō ~2.136 ký tự) theo JLPT
Route group : (learning) — full-screen, không sidebar AppLayout
BE module   : cần tạo trước — be-base/src/modules/kanji (chưa có)
```

## Tóm tắt

Module `kanji` cung cấp 4 trải nghiệm chính: **Browser** (duyệt grid theo JLPT/bộ thủ/nét + tiến độ), **Detail** (thông tin đầy đủ 1 kanji: stroke order, nghĩa, ví dụ, từ ghép, kanji tương tự, mnemonic), **Writing Practice** (canvas vẽ tay + chấm điểm 4 tiêu chí), và **Quiz** (3 mode: nhận dạng âm, nghĩa→kanji, viết kanji + summary). Module là P0 và sẽ được link đến từ Flashcards (chi tiết kanji của từ), Mock Test (kanji section) — nên types/components cần thiết kế reuse-friendly.

Vì BE module chưa có, plan này định nghĩa rõ contract endpoint để `/plan-new-module kanji` chạy song song được. Trong giai đoạn đầu có thể dùng MOCK data (giống pattern `mockTest`) rồi swap sang `apiClient` sau.

---

## Types
File: `client/src/modules/kanji/types/index.ts`

```typescript
import type { PaginatedResult } from '@shared/types'

export type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
export type KanjiStatus = 'known' | 'learning' | 'unseen'

export interface Radical {
  char: string             // 言
  meaningVi: string        // ngôn
  strokes: number
}

// Light version dùng cho Browser grid + Quiz options
export interface KanjiListItem {
  id: string               // ULID/slug, e.g. "kanji_8a9e"
  char: string             // 語
  jlptLevel: JlptLevel
  strokes: number
  primaryKun?: string      // かた (cho hiển thị nhỏ dưới chữ)
  primaryOn?: string       // ゴ
  meaningVi: string        // "Ngôn ngữ"
  status: KanjiStatus      // computed từ user progress
}

// Full version cho Detail page
export interface KanjiDetail extends KanjiListItem {
  meaningEn: string
  onReadings: string[]     // ['ゴ']
  kunReadings: string[]    // ['かた.る', 'かた.らう']
  radical: Radical
  frequency: number        // #156
  unicode: string          // 'U+8A9E'
  joyoOrder?: number       // #392
  strokeOrder: StrokeOrderStep[]
  meanings: KanjiMeaning[]
  examples: KanjiExample[]
  compounds: Compound[]
  similar: SimilarKanji[]
  mnemonicVi?: string
}

export interface StrokeOrderStep {
  index: number            // 1..N
  svgPath?: string         // SVG path cho animation; nếu chưa có thì FE render placeholder
  note?: string            // "Bộ 言 viết trước…"
}

export interface KanjiMeaning {
  index: number
  pos: 'noun' | 'verb' | 'adj' | 'adv' | 'other'
  textVi: string
  jpExample?: string
}

export interface KanjiExample {
  jpHtml: string           // BE trả về HTML với <ruby><rt>furigana</rt></ruby> + <em> để highlight
  vi: string
  source?: string          // "N4 — 文法 例文"
}

export interface Compound {
  jp: string               // 日本語
  reading: string          // にほんご
  meaningVi: string
}

export interface SimilarKanji {
  id: string
  char: string
  meaningVi: string
  reason: string           // "Cùng bộ thủ 言"
  jlptLevel: JlptLevel
}

// User-scoped
export interface KanjiUserProgress {
  kanjiId: string
  status: KanjiStatus
  mastery: number          // 0..100
  lastReviewedAt?: string
}

export interface KanjiProgressSummary {
  total: number            // 2136
  known: number
  learning: number
  unseen: number
  byLevel: Record<JlptLevel, { total: number; known: number; learning: number }>
}

// Filter params
export interface ListKanjiParams {
  level?: JlptLevel | 'all'
  status?: KanjiStatus | 'all'
  strokesMin?: number
  strokesMax?: number
  radical?: string         // radical char
  search?: string
  page?: number
  limit?: number           // default 64 (8x8 grid)
}

// Writing
export interface WritingAttemptDto {
  strokes: WritingStroke[] // user input
  durationMs: number
}

export interface WritingStroke {
  points: Array<{ x: number; y: number; t: number }>   // normalized 0..1
}

export interface WritingScore {
  overall: number          // 0..100
  order: number
  size: number
  direction: number
  position: number
  feedback: string         // text gợi ý cải thiện
  starsLabel: '⭐' | '⭐⭐' | '⭐⭐⭐' | '⭐⭐⭐⭐' | '⭐⭐⭐⭐⭐'
}

// Quiz
export type KanjiQuizMode = 'recognition' | 'meaningToKanji' | 'writing'
export type KanjiQuizView = 'config' | 'in-progress' | 'summary'

export interface KanjiQuizConfig {
  level: JlptLevel
  mode: KanjiQuizMode | 'mixed'
  questionCount: 10 | 20 | 30
  livesEnabled: boolean
}

export interface KanjiQuizQuestion {
  id: string
  mode: KanjiQuizMode
  kanji: KanjiListItem
  // mode-specific:
  contextSentenceHtml?: string                 // recognition: câu chứa kanji
  options?: Array<{ id: string; label: string; subLabel?: string }>  // recognition + meaningToKanji
  correctOptionId?: string
  meaningPrompt?: string                       // writing/meaningToKanji
  explanation?: string
  mnemonic?: string
}

export interface KanjiQuizAnswerDto {
  questionId: string
  selectedOptionId?: string                    // recognition/meaningToKanji
  writingAttempt?: WritingAttemptDto           // writing
}

export interface KanjiQuizAnswerResult {
  correct: boolean
  xpEarned: number
  explanation: string
  writingScore?: WritingScore
}

export interface KanjiQuizSummary {
  totalQuestions: number
  correct: number
  wrong: number
  accuracy: number
  durationSec: number
  xpEarned: number
  mistakes: Array<{
    kanji: KanjiListItem
    meaningVi: string
    userAnswerLabel?: string
    wrongCount: number
    reason: string
  }>
}

export type KanjiListResult = PaginatedResult<KanjiListItem>
```

---

## Service
File: `client/src/modules/kanji/services/kanji.service.ts`

Dùng `apiClient` từ `@lib/api-client`. Trong giai đoạn 1 nếu BE chưa sẵn sàng, có thể đặt thêm `mock-kanji.service.ts` chứa `MOCK_KANJI`, `MOCK_PROGRESS`, `computeFakeScore()` (pattern giống `mock-test.service.ts`) và service public re-export dùng mock — sau thay bằng `apiClient` call mà không đổi signature.

| Function | Method | Endpoint | Mô tả |
|---|---|---|---|
| `listKanji(params)` | GET | `/kanji` | Browser grid; trả pagination |
| `getKanji(id)` | GET | `/kanji/:id` | Detail (full) |
| `listRadicals()` | GET | `/kanji/radicals` | Radical filter chips |
| `getMyKanjiProgress()` | GET | `/me/kanji/progress` | Tổng & breakdown theo level (hero + sidebar) |
| `updateKanjiStatus(id, status)` | PATCH | `/me/kanji/:id/status` | Đánh dấu known/learning |
| `submitWritingAttempt(id, dto)` | POST | `/me/kanji/:id/writing-attempt` | Chấm điểm 1 lần vẽ |
| `getWritingQueue(level?)` | GET | `/me/kanji/writing-queue` | Sidebar Writing Practice |
| `startKanjiQuiz(config)` | POST | `/me/kanji/quiz/start` | Trả `{ sessionId, questions[] }` |
| `submitKanjiQuizAnswer(sessionId, dto)` | POST | `/me/kanji/quiz/:sessionId/answer` | Result từng câu |
| `finishKanjiQuiz(sessionId)` | POST | `/me/kanji/quiz/:sessionId/finish` | `KanjiQuizSummary` |

---

## Hooks
File: `client/src/modules/kanji/hooks/useKanji.ts` (data hooks)
File: `client/src/modules/kanji/hooks/useKanjiQuizSession.ts` (state machine — giống `useMockTest`/`useFlashcardSession`)
File: `client/src/modules/kanji/hooks/useWritingCanvas.ts` (canvas state: strokes, undo/redo, tool, mode)

| Hook | Loại | QueryKey / Mutation |
|---|---|---|
| `useKanjiList(params)` | useQuery | `QUERY_KEYS.KANJI.LIST(params)` — placeholderData: keepPreviousData |
| `useKanji(id)` | useQuery | `QUERY_KEYS.KANJI.DETAIL(id)` — enabled khi `!!id` |
| `useRadicals()` | useQuery | `QUERY_KEYS.KANJI.RADICALS` — staleTime: Infinity |
| `useMyKanjiProgress()` | useQuery | `QUERY_KEYS.KANJI.PROGRESS` |
| `useWritingQueue(level?)` | useQuery | `QUERY_KEYS.KANJI.WRITING_QUEUE(level)` |
| `useUpdateKanjiStatus()` | useMutation | invalidate LIST + DETAIL + PROGRESS; toast |
| `useSubmitWritingAttempt()` | useMutation | invalidate DETAIL + PROGRESS; trả `WritingScore` |
| `useStartKanjiQuiz()` | useMutation | trả `{ sessionId, questions }` |
| `useSubmitKanjiQuizAnswer()` | useMutation | không invalidate (chạy trong session) |
| `useFinishKanjiQuiz()` | useMutation | invalidate PROGRESS + `DASHBOARD.STATS` |
| `useKanjiQuizSession(config)` | local state | useReducer: view, currentIndex, lives, answers, summary |
| `useWritingCanvas()` | local state | strokes[], pointer events, undo/redo, currentStrokeIndex |

---

## Components
Files trong `client/src/modules/kanji/components/`:

### Browser
| File | Mô tả |
|---|---|
| `KanjiBrowserPage.tsx` | Orchestrator: dùng `useKanjiList`, `useMyKanjiProgress`, `useRadicals`. State filter trong URL search params. |
| `KanjiHero.tsx` | Hero gradient + 3 hero-stats (known/learning/locked). Props: `summary` |
| `KanjiFilterBar.tsx` | 4 nhóm chip: level, status, strokes range, search input (debounce 250ms) |
| `KanjiGrid.tsx` | Group theo `jlptLevel`; render `<KanjiCard>`; nhóm có header `<GroupHeader>` |
| `KanjiCard.tsx` | Ô card 1 kanji; `status` quyết định màu border + dot. Click → `router.push(/kanji/:id)`. Reuse cho Quiz option |
| `KanjiBrowserSidebar.tsx` | 3 card: ProgressRing, LevelProgressList, RadicalGrid |
| `ProgressRing.tsx` | SVG ring (giống `ScoreRing` của mockTest — cân nhắc nâng lên `@shared/components/ui`) |
| `LevelProgressList.tsx` | Bar progress N5→N1 |
| `RadicalGrid.tsx` | Grid 5 cột, click → set filter `radical` |

### Detail
| File | Mô tả |
|---|---|
| `KanjiDetailPage.tsx` | Orchestrator: nhận `id` prop từ `params`; gọi `useKanji(id)` |
| `KanjiDetailHero.tsx` | Hero card với big kanji, meta, readings, mastery bar, action buttons |
| `StrokeOrderSteps.tsx` | Hiển thị `strokeOrder[]` dạng grid; hover/click step để highlight (reuse Writing Practice ref) |
| `MeaningsList.tsx` | Numbered list với pos-tag |
| `ExamplesList.tsx` | Render `jpHtml` (đã sanitize từ BE) qua `dangerouslySetInnerHTML` — **bắt buộc check BE trả HTML đã escape an toàn** |
| `CompoundsGrid.tsx` | Grid 2 cột compound items |
| `KanjiDetailSidebar.tsx` | InfoGrid + SimilarKanjiList + MnemonicCard + StudyActions |

### Writing Practice
| File | Mô tả |
|---|---|
| `KanjiWritingPage.tsx` | Orchestrator: load kanji từ `id`, init `useWritingCanvas`, gọi `useSubmitWritingAttempt` |
| `WritingTarget.tsx` | Header card với kanji + meta + hint chips |
| `StrokeCanvas.tsx` | `<canvas>` với pointer events (mouse + touch). Hiển thị ghost kanji mờ phía sau, grid + diagonal lines. Hỗ trợ 3 mode: tự do / từng nét / có hướng dẫn |
| `CanvasToolbar.tsx` | Pen, eraser, undo, redo, clear, stroke width, mode toggle |
| `CanvasActionBar.tsx` | Stroke counter + nét trước + kiểm tra + bỏ qua |
| `FeedbackPanel.tsx` | Hiển thị `WritingScore`: điểm tổng + 4 bar criteria |
| `WritingSidebar.tsx` | WritingQueueList + StrokeOrderReference + DailyWritingStats |
| `WritingQueueList.tsx` | List kanji đang trong hàng chờ, tick done, highlight current |

### Quiz
| File | Mô tả |
|---|---|
| `KanjiQuizPage.tsx` | Orchestrator: 3 view (config/in-progress/summary). State qua `useKanjiQuizSession` |
| `QuizConfigView.tsx` | Chọn level + mode + count + lives → `useStartKanjiQuiz` |
| `QuizTopbar.tsx` | Exit, progress bar, counter, lives |
| `QuizModeIndicator.tsx` | Label dạng câu hỏi hiện tại |
| `RecognitionCard.tsx` | Mode A: kanji + context sentence + 4 options reading |
| `MeaningToKanjiCard.tsx` | Mode B: meaning + 4 kanji options (reuse `KanjiCard`) |
| `WritingQuizCard.tsx` | Mode C: meaning + reading hint + mini canvas (reuse `StrokeCanvas` size nhỏ) |
| `QuizResultBar.tsx` | Bar correct/wrong + explanation + mnemonic |
| `QuizSummary.tsx` | Stats grid + danh sách `mistakes` + actions |

Mọi file trong `components/` và `hooks/` đều có `'use client'` ở đầu.

---

## Routes
Files trong `client/src/app/(learning)/kanji/`:

| File | Loại | Render |
|---|---|---|
| `(learning)/kanji/page.tsx` | Server component | `<KanjiBrowserPage />` |
| `(learning)/kanji/[id]/page.tsx` | Server component | `<KanjiDetailPage id={params.id} />` |
| `(learning)/kanji/[id]/write/page.tsx` | Server component | `<KanjiWritingPage id={params.id} />` |
| `(learning)/kanji/quiz/page.tsx` | Server component | `<KanjiQuizPage />` |

Note: Next.js 16 — `params` là `Promise`, dùng `const { id } = await params` trong server component.

---

## Module barrel
File: `client/src/modules/kanji/index.ts`

```typescript
export { KanjiBrowserPage } from './components/KanjiBrowserPage'
export { KanjiDetailPage } from './components/KanjiDetailPage'
export { KanjiWritingPage } from './components/KanjiWritingPage'
export { KanjiQuizPage } from './components/KanjiQuizPage'

// Light components reusable bên ngoài (vd: Flashcards link tới kanji)
export { KanjiCard } from './components/KanjiCard'

export {
  useKanjiList,
  useKanji,
  useMyKanjiProgress,
  useRadicals,
  useUpdateKanjiStatus,
  useSubmitWritingAttempt,
  useWritingQueue,
} from './hooks/useKanji'

export type {
  JlptLevel,
  KanjiStatus,
  KanjiListItem,
  KanjiDetail,
  KanjiProgressSummary,
  KanjiQuizMode,
  ListKanjiParams,
  WritingScore,
} from './types'
```

---

## Modify shared files

| File | Thay đổi |
|---|---|
| `client/src/config/routes.ts` | Thêm `KANJI: '/kanji'`, helper `kanjiDetailPath(id)`, `kanjiWritePath(id)`, `KANJI_QUIZ: '/kanji/quiz'` |
| `client/src/shared/constants/index.ts` | Thêm `QUERY_KEYS.KANJI: { LIST(params), DETAIL(id), PROGRESS, RADICALS, WRITING_QUEUE(level) }` |
| `client/src/shared/i18n/locales/vi.json` | Thêm namespace `"kanji"` (xem mục i18n) |
| `client/src/shared/i18n/locales/en.json` | Mirror keys |
| `client/src/shared/layouts/LearningLayout.tsx` | KHÔNG cần đổi (Learning layout full-screen, không có sidebar nav cố định). Nhưng nên thêm nav item Kanji vào nơi liệt kê module trong Dashboard `<DashboardPage>` (nếu có grid module) |

⚠️ KHÔNG thêm vào `AppLayout.tsx` — module thuộc `(learning)`, không phải `(app)`.

---

## API endpoints cần BE cung cấp

| Method | Path | Use-case BE | Dùng trong client hook |
|---|---|---|---|
| GET | `/kanji` | ListKanjiUseCase (filter + pagination) | `useKanjiList` |
| GET | `/kanji/:id` | GetKanjiUseCase | `useKanji` |
| GET | `/kanji/radicals` | ListRadicalsUseCase | `useRadicals` |
| GET | `/me/kanji/progress` | GetMyKanjiProgressUseCase | `useMyKanjiProgress` |
| PATCH | `/me/kanji/:id/status` | UpdateKanjiStatusUseCase | `useUpdateKanjiStatus` |
| POST | `/me/kanji/:id/writing-attempt` | ScoreWritingAttemptUseCase (chấm điểm 4 tiêu chí) | `useSubmitWritingAttempt` |
| GET | `/me/kanji/writing-queue` | GetWritingQueueUseCase | `useWritingQueue` |
| POST | `/me/kanji/quiz/start` | StartKanjiQuizUseCase | `useStartKanjiQuiz` |
| POST | `/me/kanji/quiz/:sessionId/answer` | SubmitKanjiQuizAnswerUseCase | `useSubmitKanjiQuizAnswer` |
| POST | `/me/kanji/quiz/:sessionId/finish` | FinishKanjiQuizUseCase | `useFinishKanjiQuiz` |

⚠️ **Yêu cầu BE tạo module trước**: chạy `/plan-new-module kanji` với scope trên. Trước khi BE xong, dùng MOCK data trong `services/mock-kanji.service.ts` để FE chạy được standalone.

---

## i18n keys

```json
"kanji": {
  "title": "Kanji",
  "subtitle": "Khám phá 2.136 Jōyō kanji theo cấp độ JLPT",
  "actions": {
    "study": "Học",
    "practiceWrite": "Luyện viết",
    "quizNow": "Quiz ngay",
    "addToDeck": "Thêm vào deck",
    "studyGroup": "Học nhóm này",
    "importList": "Import list"
  },
  "filter": {
    "level": "Cấp độ",
    "status": "Trạng thái",
    "strokes": "Số nét",
    "radical": "Bộ thủ",
    "searchPlaceholder": "Tìm kanji, nghĩa..."
  },
  "status": {
    "known": "Đã biết",
    "learning": "Đang học",
    "unseen": "Chưa học",
    "all": "Tất cả"
  },
  "hero": {
    "known": "Đã biết",
    "learning": "Đang học",
    "locked": "Chưa học"
  },
  "sidebar": {
    "totalProgress": "Tiến độ tổng",
    "byLevel": "Theo cấp độ",
    "byRadical": "Lọc theo bộ thủ",
    "popularRadicals": "Bộ thủ phổ biến"
  },
  "detail": {
    "strokeOrder": "Thứ tự nét",
    "meanings": "Nghĩa & Cách dùng",
    "examples": "Ví dụ trong câu",
    "compounds": "Từ ghép — Jukugo",
    "similar": "Kanji tương tự",
    "info": "Thông tin",
    "mnemonic": "Mnemonic gợi nhớ",
    "readings": { "on": "Âm (On'yomi)", "kun": "Huấn (Kun'yomi)" },
    "info_labels": { "strokes": "Số nét", "jlpt": "Cấp JLPT", "radical": "Bộ thủ", "freq": "Tần suất", "unicode": "Unicode" }
  },
  "writing": {
    "title": "Luyện viết",
    "stroke": "Nét",
    "drawnOf": "Đã vẽ: {{drawn}} / {{total}} nét",
    "modes": { "free": "Tự do", "step": "Từng nét", "guided": "Có hướng dẫn" },
    "check": "Kiểm tra",
    "skip": "Bỏ qua",
    "previousStroke": "Nét trước",
    "feedback": {
      "title": "Kết quả lần viết trước",
      "order": "Thứ tự nét",
      "size": "Tỷ lệ kích thước",
      "direction": "Hướng nét",
      "position": "Vị trí tương đối",
      "queue": "Hàng chờ luyện tập",
      "reference": "Thứ tự nét tham khảo",
      "todayStats": "Thống kê hôm nay"
    }
  },
  "quiz": {
    "title": "Kanji Quiz",
    "modes": { "recognition": "Nhận dạng", "meaningToKanji": "Nghĩa → Kanji", "writing": "Kanji → Viết" },
    "questionOfTotal": "{{current}} / {{total}}",
    "exit": "Thoát",
    "nextQuestion": "Câu tiếp theo",
    "correctXp": "Chính xác! +{{xp}} XP",
    "wrong": "Chưa đúng",
    "summary": {
      "title": "Hoàn thành Quiz!",
      "correct": "Đúng",
      "wrong": "Sai",
      "accuracy": "Độ chính xác",
      "xpEarned": "XP nhận được",
      "needReview": "{{count}} Kanji cần ôn thêm",
      "reviewMistakes": "Ôn lại các sai",
      "nextQuiz": "Quiz tiếp theo",
      "backToBrowser": "Về Kanji Browser"
    }
  },
  "empty": "Chưa có kanji phù hợp bộ lọc"
}
```

---

## UX notes

- **Auth**: route group `(learning)` đã được `middleware.ts` bảo vệ → không check thủ công.
- **Filter state**: lưu trong URL search params (`?level=N4&status=learning&strokes=6-10`) để share/back giữ filter. Dùng `useSearchParams` + `router.replace`.
- **Search debounce**: 250ms qua `useDebounce` của `@shared/hooks`.
- **Loading**: `<Skeleton />` cho grid và detail; `<Spinner />` cho action button.
- **Empty state**: `<Empty />` khi filter không match.
- **Error**: `toast.error()` từ `sonner` trong `onError` mutation; banner inline cho query error có retry.
- **Destructive**: không có destructive trong module này.
- **Canvas perf**: dùng `requestAnimationFrame` để batch redraw; touch events `preventDefault` để tránh scroll mobile.
- **Furigana rendering**: `jpHtml` từ BE phải đã sanitize (chỉ allow `<ruby>`, `<rt>`, `<em>`, `<span class="highlight">`). FE chỉ render qua component `<FuriganaText html={...} />` (có thể tách shared sau).
- **i18n**: mọi text user-facing dùng `useTranslation('kanji')`.

---

## Module doc cần tạo sau khi implement
File: `client/.claude/modules/kanji.md`

Sections: Mục đích, Structure, Public API, Routes (4 routes), API Endpoints (10), Query Keys, Gotchas (canvas perf, furigana HTML sanitization, URL filter state, mock vs real BE).

---

## Edge cases & risks

- **Canvas trên mobile**: pointer events cần `touchAction: 'none'` để khỏi conflict với scroll. Coordinate phải normalize 0..1 trước khi gửi BE để không phụ thuộc kích thước hiển thị.
- **Stroke scoring chưa có engine**: nếu BE chưa có CV/ML chấm điểm, FE Phase 1 chỉ check số nét + thời gian; cần đánh dấu `WritingScore.feedback` rõ "demo scoring" để không gây hiểu nhầm.
- **Quiz session state mất khi reload** (giống `mockTest`) — Phase 1 chấp nhận; Phase 2 cân nhắc lưu `sessionId` vào sessionStorage.
- **Large list 2.136 kanji**: BE phải hỗ trợ pagination + filter server-side; client KHÔNG fetch toàn bộ. Grid hiển thị max ~64 (8x8) mỗi page với "Load more"/"Pagination".
- **Reuse `KanjiCard` trong Quiz options**: cẩn thận với click handler — Card hiện link router; trong Quiz cần override `onClick` thay vì navigate. Đề xuất `KanjiCard` nhận prop `interactive: 'navigate' | 'select'`.
- **Link 2 chiều với Flashcards**: Flashcards có thể link tới `/kanji/[id]` từ card của 1 từ vựng có kanji. Cần thống nhất `kanji.id` shape giữa 2 module — đề xuất dùng kanji char trực tiếp làm ID hoặc Unicode codepoint để stable.
- **SVG stroke order chưa có dữ liệu**: BE seed có thể chưa có `svgPath` — FE phải fallback hiển thị ký tự + số thứ tự (giống design hiện tại lặp `語`).
- **Furigana HTML injection risk**: nếu BE không escape, dangerouslySetInnerHTML sẽ XSS → BẮT BUỘC BE sanitize và FE document rõ contract.

---

## Effort estimate

| Phần | Effort |
|---|---|
| Types + Service (mock + real) | Med |
| Hooks (data + session + canvas) | High |
| Components Browser | Med |
| Components Detail | Med |
| Components Writing (canvas + scoring UI) | **High** |
| Components Quiz (3 modes + summary) | High |
| Routes + nav | Low |
| i18n | Low |
| **Tổng** | **High** |

---

## Checklist khi implement

- [ ] `'use client'` ở mọi file trong `components/` và `hooks/`
- [ ] `page.tsx` là server component, chỉ render component từ module
- [ ] Không có relative import `../../` — dùng path alias `@modules/*`, `@shared/*`, ...
- [ ] Service dùng `apiClient`, không dùng `fetch`
- [ ] `useQuery` có `queryKey` từ `QUERY_KEYS.KANJI.*`
- [ ] `useMutation` có `onSuccess` invalidate + toast
- [ ] Field types khớp BE response chính xác (xác nhận sau khi `/plan-new-module kanji` xong)
- [ ] Loading + empty + error state đầy đủ
- [ ] Form không có (module không có form CRUD) — bỏ qua RHF/Zod
- [ ] Text user-facing dùng `useTranslation('kanji')`, key có cả trong vi.json + en.json
- [ ] `ROUTES.KANJI`, helpers `kanjiDetailPath/kanjiWritePath` thêm vào `src/config/routes.ts`
- [ ] `QUERY_KEYS.KANJI` thêm vào `src/shared/constants/index.ts`
- [ ] KHÔNG thêm nav AppLayout (route group là `(learning)`)
- [ ] Module export qua `index.ts`
- [ ] `client/.claude/modules/kanji.md` tạo xong
- [ ] Canvas hoạt động cả mouse + touch + có `touchAction: 'none'`
- [ ] Filter state đồng bộ URL search params
- [ ] `<FuriganaText>` render qua `dangerouslySetInnerHTML` chỉ khi BE đã sanitize
- [ ] `npm run type-check` pass

---

Để implement plan này:
  `/client-implement-module kanji`

Trước đó nên chạy `/plan-new-module kanji` để có BE plan tương ứng (do BE module chưa tồn tại).
