# NEW CLIENT MODULE PLAN — flashcards
> **Ngày:** 13/05/2026

- Module      : flashcards
- Domain      : Phiên ôn từ vựng dạng SRS (SM-2), 2 modes: Recognition + Typing
- Route group : (learning)
- BE module   : đã có (be-base/src/modules/flashcard)

## Tóm tắt
Module flashcards là phiên ôn từ vựng có 3 view: **session** (đang ôn, gồm front/back card + answer buttons hoặc typing input), **idle/empty** (nếu chưa có thẻ due) và **result overlay** (sau khi xong). User chọn `recognition` (lật thẻ rồi đánh giá Quên/Khó/Ổn/Dễ → submit SM-2 rating) hoặc `typing` (gõ tiếng Nhật → kiểm tra). Mỗi rating gọi BE `/me/flashcards/:id/review`, BE trả `nextReview`. Khi hết queue → show result overlay với stats. Có sidebar bên phải hiển thị progress phiên + 3-4 thẻ tiếp theo. Keyboard shortcuts: Space lật, 1-4 đánh giá, → bỏ qua.

---

## Types
File: `client/src/modules/flashcards/types/index.ts`

```typescript
import type { PaginatedResult } from '@shared/types'

export type FlashcardStatus = 'new' | 'learning' | 'mastered'
export type ReviewMode = 'recognition' | 'typing'
export type SessionView = 'idle' | 'reviewing' | 'completed'

export type SrsRating = 1 | 2 | 3 | 4 | 5  // BE chấp nhận 1..5

// Response shape từ BE `/me/flashcards/due` và `/me/flashcards`
export interface Flashcard {
  id: string
  dictionaryEntryId: string
  interval: number
  easeFactor: number
  nextReview: string          // ISO date
  status: FlashcardStatus
  lastReviewedAt: string | null
  createdAt: string
}

// Response từ `/dictionary/:id`
export interface DictionaryEntry {
  id: string
  kanji: string | null
  hiragana: string
  romaji: string
  meanings: string[]
  jlptLevel: number | null
  createdAt: string
}

// Composite shape client-side (Flashcard ∪ DictionaryEntry)
export interface ReviewCard {
  flashcard: Flashcard
  entry: DictionaryEntry
}

export interface AddFlashcardDto {
  dictionaryEntryId: string
}

export interface SubmitReviewDto {
  rating: SrsRating
}

export interface SubmitReviewResponse {
  nextReview: string
}

// State của 1 phiên ôn
export interface SessionState {
  view: SessionView
  mode: ReviewMode
  cards: ReviewCard[]              // queue đầy đủ của phiên
  currentIndex: number
  flippedIds: Set<string>          // các thẻ đã lật trong session
  stats: {
    completed: number
    again: number                  // rating = 1
    correct: number                // rating ≥ 3
    startedAt: number              // Date.now()
  }
}

export type ListFlashcardsParams = { status?: FlashcardStatus; page?: number; limit?: number }
export type ListFlashcardsResult = { data: Flashcard[]; total: number }
```

> **Note:** không reuse `PaginatedResult<T>` vì BE flashcard list trả shape custom `{ data, total }` chứ không qua `nestjs-paginate`.

---

## Service
File: `client/src/modules/flashcards/services/flashcards.service.ts`

Gọi qua `apiClient` từ `@lib/api-client`.

| Function | Method | Endpoint | Mô tả |
|---|---|---|---|
| `getDueCards(limit?)` | GET | `/me/flashcards/due?limit=` | Lấy queue thẻ đến hạn cho phiên hôm nay → `{ data: Flashcard[] }` |
| `listFlashcards(params)` | GET | `/me/flashcards` | List tất cả thẻ của user, filter status, paginated → `{ data, total }` (dùng cho History sau này) |
| `getDictionaryEntry(id)` | GET | `/dictionary/:id` | Lấy chi tiết entry → unwrap `{ success, data }` → `DictionaryEntry` |
| `submitReview(flashcardId, dto)` | POST | `/me/flashcards/:id/review` | Submit rating SM-2 → `{ nextReview }` |
| `deleteFlashcard(id)` | DELETE | `/me/flashcards/:id` | Xóa thẻ khỏi deck → `{ success: true }` |
| `addFlashcard(dto)` | POST | `/me/flashcards` | (giữ sẵn cho Dictionary module sau) → `{ flashcardId }` |

**Hydration helper** (cùng file): `enrichWithEntries(cards: Flashcard[]): Promise<ReviewCard[]>` — gọi `getDictionaryEntry` song song bằng `Promise.all` rồi map. Dùng cho session khởi tạo (số lượng cards thường nhỏ, <50, chấp nhận N+1).

---

## Hooks
File: `client/src/modules/flashcards/hooks/useFlashcards.ts`

| Hook | Loại | Key / Behavior |
|---|---|---|
| `useDueCards(limit?)` | `useQuery` | `QUERY_KEYS.FLASHCARD.SESSION` — fetch + enrich via `enrichWithEntries`. `staleTime: 0` (mỗi lần vào trang refetch). |
| `useFlashcardList(params)` | `useQuery` | `[...QUERY_KEYS.FLASHCARD.HISTORY, params]` — paginated list (chưa dùng phase 1, expose sẵn) |
| `useSubmitReview()` | `useMutation` | Body `{ flashcardId, rating }`. `onSuccess`: optimistic — không refetch SESSION giữa phiên (state phiên local). Sau khi phiên xong (view=completed): invalidate `QUERY_KEYS.FLASHCARD.SESSION` + `QUERY_KEYS.DASHBOARD.STATS`. |
| `useDeleteFlashcard()` | `useMutation` | `onSuccess`: invalidate `QUERY_KEYS.FLASHCARD.SESSION` + `HISTORY`. `toast.success`. |

File: `client/src/modules/flashcards/hooks/useFlashcardSession.ts`

State machine cho phiên ôn, **không phải data hook** — tách riêng vì logic dày:

```typescript
'use client'
export function useFlashcardSession(cards: ReviewCard[]) {
  // state: view, mode, currentIndex, flippedIds, stats
  // actions: setMode, flip, rate(rating), skip, finish, restart
  // selectors: currentCard, queueAhead (3-4 cards tiếp theo), progress (currentIndex/total), elapsedMs
  // side-effect: keyboard handler (Space, 1-4, →) qua useEffect
  // gọi useSubmitReview() bên trong rate()
}
```

Trả về `{ view, mode, currentCard, queueAhead, progress, stats, elapsedMs, isFlipped, actions: {...} }`.

---

## Components
Files trong `client/src/modules/flashcards/components/`:

| File | Mô tả |
|---|---|
| `FlashcardsPage.tsx` | Orchestrator — gọi `useDueCards`, tùy data → render `EmptyState` / `SessionView` / `ResultOverlay`. Wrap toàn trang với `LearningLayout` shell (layout đã đặt sẵn ở route). |
| `EmptyState.tsx` | Khi `data.length === 0`: "Không còn thẻ nào cần ôn hôm nay" + CTA quay về dashboard hoặc thêm từ từ Dictionary. |
| `SessionHeader.tsx` | Title "Ôn tập từ vựng" + 3 sinfo dots (số due / new / ước lượng phút) + button "Kết thúc phiên". |
| `ProgressStrip.tsx` | Thanh progress 3px height, fill theo `progress`. |
| `ModeToggle.tsx` | 2 button Recognition / Typing, controlled. |
| `FlashCard.tsx` | Front/back card cho mode Recognition. Front: kanji + reading + nút "Lật thẻ". Back: thêm meaning + example + `AnswerButtons`. Animation flip CSS. |
| `TypingCard.tsx` | Mode Typing. Show meaning, input tiếng Nhật, nút "Kiểm tra"/"Xem đáp án". Validate input vs `entry.hiragana` hoặc `entry.romaji`. Visual feedback correct/wrong với animation shake. |
| `AnswerButtons.tsx` | 4 button: Quên/Khó/Ổn/Dễ → rating 1/2/4/5 (mapping cố định, có constant `RATING_LABELS`). |
| `SessionSidebar.tsx` | Panel phải: stats (done, again, remaining, accuracy, elapsed) + `QueueNext` (4 card tiếp). Sticky desktop, inline mobile. |
| `QueueNext.tsx` | List 4 card tiếp theo (kanji + meaning short + status dot). |
| `KeyboardHints.tsx` | Hiển thị Space / 1-4 / → hints. |
| `ResultOverlay.tsx` | Modal khi `view === 'completed'`: emoji + title + 3 stat cards (accuracy, completed, again) + streak banner nếu có + 2 button (Xem chi tiết / Tiếp tục). |

Mọi file phải có `'use client'` ở đầu.

---

## Routes
| File | Loại | Render |
|---|---|---|
| `client/src/app/(learning)/flashcards/page.tsx` | Server component | `<FlashcardsPage />` từ `@modules/flashcards` (sửa stub hiện tại) |

Route đã tồn tại với stub — chỉ thay nội dung.

---

## Module barrel
File: `client/src/modules/flashcards/index.ts`

```typescript
export { FlashcardsPage } from './components/FlashcardsPage'
export { useDueCards, useSubmitReview, useDeleteFlashcard, useFlashcardList } from './hooks/useFlashcards'
export type { Flashcard, ReviewCard, FlashcardStatus, ReviewMode, SrsRating } from './types'
```

---

## Modify shared files

| File | Thay đổi |
|---|---|
| `client/src/config/routes.ts` | **Không cần** — `ROUTES.FLASHCARDS = '/flashcards'` đã có |
| `client/src/shared/constants/index.ts` | Cập nhật `QUERY_KEYS.FLASHCARD`: giữ `SESSION` + `HISTORY`, thêm `DUE` để rõ ngữ nghĩa (alias của SESSION OK), thêm `ENTRY: (id) => ['dictionary', 'entry', id]` (vì module này gọi `/dictionary/:id`) — hoặc đặt key này trong constants riêng cho dictionary nếu dictionary module sắp tới sẽ thêm |
| `client/src/shared/i18n/locales/vi.json` | Thêm namespace `"flashcards": { ... }` (chi tiết bên dưới) |
| `client/src/shared/i18n/locales/en.json` | Mirror keys |
| `client/src/shared/layouts/AppLayout.tsx` | **Không thêm** — flashcards thuộc `(learning)`, không hiện trong sidebar AppLayout. Nếu cần shortcut từ AppLayout sidebar → để chủ Dashboard hoặc CTA riêng |
| `client/src/shared/layouts/LearningLayout.tsx` | Kiểm tra nav — nếu LearningLayout có top tabs (theo design HTML có sidebar riêng cho learning), đảm bảo item "Flashcard" trỏ tới `/flashcards` |

---

## API endpoints cần BE cung cấp

| Method | Path | Use-case BE | Dùng trong client hook | Status |
|---|---|---|---|---|
| GET | `/me/flashcards/due?limit=` | GetReviewSessionUseCase | `useDueCards` | ✓ đã có |
| GET | `/me/flashcards?status=&page=&limit=` | ListFlashcardsUseCase | `useFlashcardList` | ✓ đã có |
| POST | `/me/flashcards/:id/review` | SubmitReviewUseCase | `useSubmitReview` | ✓ đã có |
| DELETE | `/me/flashcards/:id` | DeleteFlashcardUseCase | `useDeleteFlashcard` | ✓ đã có |
| POST | `/me/flashcards` | AddFlashcardUseCase | (chưa dùng phase 1) | ✓ đã có |
| GET | `/dictionary/:id` | GetDictionaryEntryUseCase | `enrichWithEntries` | ✓ đã có (public) |

**Gap quan trọng — đề xuất BE enrich:** Hiện BE `/me/flashcards/due` trả về thẻ chỉ có `dictionaryEntryId`. Client phải fetch dictionary entry N lần. Khi scale cards/session lên >50, sẽ chậm và tốn requests. Khuyến nghị BE bổ sung: response của `/due` và `/me/flashcards` include luôn `entry: DictionaryEntryDto` (server-side join). Nếu nâng cấp BE, plan client chỉ cần xóa `enrichWithEntries`. **Không block phase 1** — accept N+1 với batch parallel.

---

## i18n keys

```json
"flashcards": {
  "title": "Ôn tập từ vựng",
  "empty": {
    "title": "Không còn thẻ nào cần ôn hôm nay",
    "subtitle": "Quay lại vào ngày mai hoặc thêm thẻ mới từ từ điển",
    "cta": "Về Tổng quan"
  },
  "mode": {
    "recognition": "Recognition — Nhận diện",
    "typing": "Gõ tiếng Nhật"
  },
  "header": {
    "dueCount": "{{count}} thẻ cần ôn",
    "newCount": "{{count}} thẻ mới",
    "estimate": "~{{minutes}} phút",
    "end": "Kết thúc phiên"
  },
  "card": {
    "flip": "Lật thẻ",
    "skip": "Bỏ qua"
  },
  "rating": {
    "again": "Quên",
    "hard": "Khó",
    "good": "Ổn",
    "easy": "Dễ",
    "intervalAgain": "< 1 phút",
    "intervalHard": "{{n}} phút",
    "intervalGood": "{{n}} ngày",
    "intervalEasy": "{{n}} ngày"
  },
  "typing": {
    "placeholder": "Gõ tiếng Nhật...",
    "hint": "Gõ chữ Nhật hoặc romaji",
    "showAnswer": "Xem đáp án",
    "check": "Kiểm tra"
  },
  "session": {
    "panelTitle": "Phiên học hôm nay",
    "done": "Đã xong",
    "again": "Cần xem lại",
    "remaining": "Còn lại",
    "accuracy": "Tỉ lệ đúng",
    "elapsed": "Thời gian",
    "queueNext": "Thẻ tiếp theo"
  },
  "result": {
    "title": "Phiên học hoàn thành!",
    "subtitle": "{{deck}} · {{count}} thẻ · {{duration}}",
    "accuracy": "Tỉ lệ đúng",
    "completed": "Thẻ xong",
    "again": "Cần ôn lại",
    "streakBanner": "Streak {{n}} ngày!",
    "streakSub": "Tiếp tục ngày mai để duy trì nhé",
    "viewDetail": "Xem chi tiết",
    "continue": "Tiếp tục"
  },
  "shortcuts": {
    "flip": "Lật thẻ",
    "rate": "Đánh giá",
    "skip": "Bỏ qua"
  }
}
```

---

## UX notes
- Auth: route group `(learning)` được `middleware.ts` bảo vệ, không check thủ công.
- Loading: dùng `<Spinner />` trong `FlashcardsPage` khi `useDueCards.isLoading`. Skeleton riêng cho `FlashCard` không cần thiết — full-page spinner OK vì thông tin nhỏ.
- Empty: `EmptyState` khi `data.length === 0`. Toast không phù hợp.
- Error: `toast.error()` trong `onError` của `useSubmitReview` + `useDeleteFlashcard`. Nếu `useDueCards` lỗi → inline error card với nút retry.
- Destructive: xoá thẻ → confirm qua `<ConfirmDialog>` từ `@shared/components/ui`.
- Keyboard: `useEffect` attach window listener, **chỉ active khi `view === 'reviewing'`** và `mode === 'recognition'` (typing mode dùng Enter từ input).
- Submit rating: optimistic UX — đẩy `currentIndex++` ngay khi nhấn, gọi mutation background. Nếu mutation fail → toast error + giữ index, không rollback (UX flashcard ưu tiên flow).
- Typing validation: so sánh `input.trim().toLowerCase()` với `entry.hiragana` HOẶC `entry.romaji.toLowerCase()`. Match một trong hai → correct.
- Rating mapping (constant `SR_RATING_MAP`):
  - Again → 1
  - Hard → 2
  - Good → 4
  - Easy → 5
- Mọi text user-facing dùng `useTranslation()`.

---

## Module doc cần tạo sau khi implement
File: `client/.claude/modules/flashcards.md`

Sections: Mục đích, Structure, Public API, Route, API Endpoints, Query Keys, Rating Mapping (Again→1 Hard→2 Good→4 Easy→5), Gotchas (N+1 dictionary fetch, keyboard chỉ active recognition mode, typing chấp nhận cả hiragana lẫn romaji, dùng `LearningLayout` không phải `AppLayout`).

---

## Edge cases & risks
- **N+1 dictionary fetch:** session 50 cards → 50 calls `/dictionary/:id`. Mitigate bằng `Promise.all` (parallel) và `staleTime: Infinity` cho `getDictionaryEntry` cache (entry không đổi). Đề xuất BE enrich response trong roadmap.
- **Session interrupt:** user reload giữa phiên → state phiên (currentIndex, stats) mất. Phase 1 chấp nhận; nếu cần resume → lưu vào localStorage qua `storage` util.
- **Race rating submit:** user spam rating khi mutation chưa xong → giữ queue rating local, không block UI. Mutation key bằng `flashcardId` để React Query dedupe.
- **Typing edge cases:** input có kana lẫn romaji, dấu câu, khoảng trắng → normalize input + cả hai field hiragana/romaji trước khi so. Không hỗ trợ kanji input phase 1.
- **Empty due nhưng có new cards:** BE `/due` đã merge new + due, nếu không → cần thêm query param. Verify từ `get-review-session.use-case.ts`.
- **JLPT level null:** một số entry không có `jlptLevel` → ẩn badge thay vì show "null".
- **Time zone:** `nextReview` server tính theo UTC, client hiển thị local — chú ý khi format "phiên hôm nay".

---

## Effort estimate
| Phần | Effort |
|---|---|
| Types + Service | Low |
| Hooks (useFlashcards) | Low |
| useFlashcardSession (state machine + keyboard) | Med |
| Components (10 files, animation, layout 2 cột) | High |
| i18n | Low |
| **Tổng** | **Med-High** |

---

## Checklist khi implement

- [ ] `'use client'` ở mọi file trong `components/` và `hooks/`
- [ ] `page.tsx` là server component, chỉ render `<FlashcardsPage />`
- [ ] Không có relative import `../../` — dùng `@modules/*`, `@shared/*`, `@lib/*`
- [ ] Service dùng `apiClient`, không dùng `fetch`
- [ ] `useQuery` dùng key từ `QUERY_KEYS.FLASHCARD.*`
- [ ] `useSubmitReview.onSuccess` (sau khi phiên xong) invalidate `FLASHCARD.SESSION` + `DASHBOARD.STATS`
- [ ] Dictionary entry query có `staleTime: Infinity` (entry không đổi)
- [ ] Field types Flashcard, DictionaryEntry khớp BE serializer chính xác
- [ ] Loading + empty + error state đầy đủ cho `useDueCards`
- [ ] Confirm dialog cho action delete flashcard
- [ ] Keyboard listener cleanup trong `useEffect` return
- [ ] Keyboard listener chỉ active khi `view === 'reviewing'` & `mode === 'recognition'`
- [ ] Animation flip card mượt (CSS transform, không re-mount)
- [ ] Typing input có animation shake khi wrong (giống design)
- [ ] Text user-facing dùng `useTranslation()`, key có trong vi.json + en.json
- [ ] Mapping rating Again=1, Hard=2, Good=4, Easy=5 đúng SM-2
- [ ] `ROUTES.FLASHCARDS` đã có — không cần thêm
- [ ] `QUERY_KEYS.FLASHCARD.SESSION` đã có — bổ sung `DUE` nếu cần phân biệt
- [ ] Module export qua `index.ts`
- [ ] `client/.claude/modules/flashcards.md` tạo xong
- [ ] `npm run type-check` pass

---

Để implement plan này:

```
/client-implement-module flashcards
```
