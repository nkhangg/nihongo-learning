# Module: flashcards

Phiên ôn từ vựng dạng SRS (SM-2) với 2 mode Recognition + Typing. Render trong route group `(learning)` qua `LearningLayout`.

## Structure

```
src/modules/flashcards/
├── components/
│   ├── AnswerButtons.tsx
│   ├── EmptyState.tsx
│   ├── FlashCard.tsx
│   ├── FlashcardsPage.tsx
│   ├── KeyboardHints.tsx
│   ├── ModeToggle.tsx
│   ├── ProgressStrip.tsx
│   ├── QueueNext.tsx
│   ├── ResultOverlay.tsx
│   ├── SessionHeader.tsx
│   ├── SessionSidebar.tsx
│   └── TypingCard.tsx
├── hooks/
│   ├── useFlashcards.ts          # data hooks (useQuery/useMutation)
│   └── useFlashcardSession.ts    # state machine cho phiên ôn + keyboard
├── services/
│   └── flashcards.service.ts
├── types/
│   └── index.ts
└── index.ts
```

## Public API

```typescript
import {
  FlashcardsPage,
  useDueCards,
  useFlashcardList,
  useSubmitReview,
  useDeleteFlashcard,
  useFlashcardSession,
} from '@modules/flashcards'
import type { Flashcard, ReviewCard, SrsRating } from '@modules/flashcards'
```

## Route

| Route | Page | Group |
|---|---|---|
| `/flashcards` | `(learning)/flashcards/page.tsx` | `(learning)` — `LearningLayout` |

## API Endpoints

| Hook | Method | Endpoint |
|---|---|---|
| `useDueCards` | GET | `/me/flashcards/due` |
| `useFlashcardList` | GET | `/me/flashcards` |
| `useSubmitReview` | POST | `/me/flashcards/:id/review` |
| `useDeleteFlashcard` | DELETE | `/me/flashcards/:id` |
| `flashcardsService.addFlashcard` | POST | `/me/flashcards` |
| `flashcardsService.getDictionaryEntry` (qua `enrichWithEntries`) | GET | `/dictionary/:id` |

## Query Keys

```typescript
QUERY_KEYS.FLASHCARD.SESSION   // hook `useDueCards`
QUERY_KEYS.FLASHCARD.HISTORY   // hook `useFlashcardList`
QUERY_KEYS.DASHBOARD.STATS     // invalidated khi phiên kết thúc
```

## Rating Mapping (SM-2)

| UI Label | Key | SrsRating |
|---|---|---|
| Quên | `again` | 1 |
| Khó | `hard` | 2 |
| Ổn | `good` | 4 |
| Dễ | `easy` | 5 |

Constant: `SR_RATING_MAP` trong `types/index.ts`.

## Gotchas

- **N+1 dictionary fetch:** mỗi phiên đang fetch `/dictionary/:id` cho từng card (qua `enrichWithEntries`). Cards mỗi phiên thường <50 → chấp nhận, dùng `Promise.all`. Đề xuất BE enrich response `/me/flashcards/due` trong tương lai.
- **Layout:** module dùng `LearningLayout` (route group `(learning)`), KHÔNG dùng `AppLayout` — không thêm nav item vào sidebar AppLayout.
- **Keyboard shortcuts** chỉ active khi `view === 'reviewing'` và `mode === 'recognition'`. Mode `typing` dùng Enter trong form.
- **Typing validation** so sánh sau khi normalize (trim, lowercase, strip spaces) với cả `entry.hiragana` lẫn `entry.romaji` — match một trong hai là đúng. Không hỗ trợ kanji input.
- **Optimistic UX:** rating submit ngay khi user nhấn (queue advances), mutation chạy background. Nếu fail → toast error, không rollback index.
- **Session interrupt:** state phiên (currentIndex, stats) lưu trong reducer — reload mất. Phase 1 chấp nhận.
- **Result overlay**: khi `view === 'completed'` mở dialog; nhấn Continue → quay về Dashboard và invalidate `FLASHCARD.SESSION` + `DASHBOARD.STATS`.
