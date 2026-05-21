# NEW CLIENT MODULE PLAN — dictionary

> **Ngày:** 13/05/2026

- **Module**: dictionary
- **Domain**: Tra cứu từ điển tiếng Nhật — search, view detail, submit entry mới (chờ duyệt)
- **Route group**: `(app)`
- **BE module**: đã có — `be-base/src/modules/dictionary`

---

## Tóm tắt

Module dictionary cho phép user logged-in tra cứu từ tiếng Nhật theo kanji/hiragana/romaji, lọc theo JLPT level (N1–N5), xem chi tiết một entry (kanji, hiragana, romaji, meanings, jlptLevel), và submit entry mới (status `pending` chờ admin duyệt). Tích hợp với flashcards: từ trang detail/list có nút "Thêm vào flashcards" gọi `flashcardsService.addFlashcard`. Search dùng endpoint public `/dictionary` (paginate + filter q/jlptLevel), submit dùng endpoint user-auth `/me/dictionary`.

User flow chính:

1. `/dictionary` — search bar + JLPT filter + list paginated kết quả.
2. Click 1 entry → mở `<EntryDetailDialog>` modal hoặc navigate `/dictionary/:id`.
3. Detail có nút "Thêm vào flashcards" + "Báo lỗi" (optional).
4. Nút "Đóng góp từ mới" mở `<SubmitEntryDialog>` form.

Phase 1: chỉ list + detail (modal) + submit dialog. Không có sub-route `/dictionary/:id` riêng để giảm scope; detail trên modal là đủ.

---

## Types

File: `client/src/modules/dictionary/types/index.ts`

```typescript
export interface DictionaryEntry {
  id: string
  kanji: string | null
  hiragana: string
  romaji: string
  meanings: string[]
  jlptLevel: number | null
  createdAt: string
}

export interface SearchDictionaryParams {
  q?: string
  jlptLevel?: number
  page?: number
  limit?: number
  sortBy?: string  // ví dụ 'hiragana:ASC' (theo nestjs-paginate)
}

export interface SubmitEntryDto {
  kanji?: string
  hiragana: string
  romaji: string
  meanings: string[]
  jlptLevel?: number
}

export interface SubmitEntryResponse {
  success: boolean
  entryId: string
}

// JLPT level constants
export const JLPT_LEVELS = [5, 4, 3, 2, 1] as const
export type JlptLevel = (typeof JLPT_LEVELS)[number]

// PaginatedResult<DictionaryEntry> import từ @shared/types
```

---

## Service

File: `client/src/modules/dictionary/services/dictionary.service.ts`

Gọi qua `apiClient` từ `@lib/api-client`. Endpoint search trả paginate envelope (data + meta + links theo `nestjs-paginate`); detail trả `{ success, data }`.

| Function | Method | Endpoint | Mô tả |
|---|---|---|---|
| `searchDictionary(params)` | GET | `/dictionary` | Search list với pagination + filter |
| `getDictionaryEntry(id)` | GET | `/dictionary/:id` | Detail 1 entry (chỉ approved + isPublic) |
| `submitEntry(dto)` | POST | `/me/dictionary` | Gửi entry mới (status `pending`) |

```typescript
import { apiClient } from '@lib/api-client'
import type { PaginatedResult } from '@shared/types'
import type { DictionaryEntry, SearchDictionaryParams, SubmitEntryDto, SubmitEntryResponse } from '../types'

interface DetailEnvelope { success: boolean; data: DictionaryEntry }

export const dictionaryService = {
  async search(params: SearchDictionaryParams): Promise<PaginatedResult<DictionaryEntry>> {
    const { data } = await apiClient.get<PaginatedResult<DictionaryEntry>>('/dictionary', {
      params: {
        q: params.q,
        jlptLevel: params.jlptLevel,
        page: params.page,
        limit: params.limit,
        sortBy: params.sortBy,
      },
    })
    return data
  },
  async getEntry(id: string): Promise<DictionaryEntry> {
    const { data } = await apiClient.get<DetailEnvelope>(`/dictionary/${id}`)
    return data.data
  },
  async submitEntry(dto: SubmitEntryDto): Promise<SubmitEntryResponse> {
    const { data } = await apiClient.post<SubmitEntryResponse>('/me/dictionary', dto)
    return data
  },
}
```

Lưu ý: BE public controller dùng `@Query('q')` và `@Query('jlptLevel')` raw, KHÔNG qua nestjs-paginate filter — service truyền `q` và `jlptLevel` ở top-level params, không phải `filter.jlptLevel`. Verify ở implement-time bằng manual curl.

---

## Hooks

File: `client/src/modules/dictionary/hooks/useDictionary.ts`

| Hook | Loại | QueryKey / Mutation |
|---|---|---|
| `useDictionarySearch(params)` | useQuery | `QUERY_KEYS.DICTIONARY.SEARCH(params)` — `keepPreviousData: true` cho pagination |
| `useDictionaryEntry(id)` | useQuery | `QUERY_KEYS.DICTIONARY.DETAIL(id)` — `enabled: !!id` |
| `useSubmitEntry()` | useMutation | onSuccess: toast success "Gửi từ thành công, chờ duyệt", reset form, KHÔNG invalidate search (entry mới ở status pending, public list không thấy) |

Toàn bộ file có `'use client'` ở đầu.

---

## Components

Files trong `client/src/modules/dictionary/components/`:

| File | Mô tả |
|---|---|
| `DictionaryPage.tsx` | Trang chính: header + `<SearchBar>` + `<JlptFilter>` + `<EntryList>` + pagination + nút "Đóng góp" |
| `SearchBar.tsx` | Input có debounce 300ms (dùng `useDebounce` từ `@shared/hooks`), submit qua Enter cũng OK |
| `JlptFilter.tsx` | Pill group N5/N4/N3/N2/N1 + "Tất cả" — chọn 1 cái |
| `EntryList.tsx` | Render danh sách `<EntryCard>` + empty state + skeleton loading |
| `EntryCard.tsx` | Hiển thị 1 entry (kanji + hiragana + romaji + first meaning); click → mở detail dialog |
| `EntryDetailDialog.tsx` | Modal hiển thị full entry: kanji lớn, hiragana, romaji, meanings list, JLPT badge, nút "Thêm vào flashcards", nút "Đóng" |
| `SubmitEntryDialog.tsx` | Form RHF + Zod (kanji optional, hiragana required, romaji required, meanings array min 1, jlptLevel optional) gọi `useSubmitEntry` |
| `Pagination.tsx` | Hoặc dùng `<Pagination />` từ `@shared/components/ui` nếu có |

Mỗi file trong `components/` và `hooks/` đều có `'use client'`.

---

## Routes

Files trong `client/src/app/(app)/`:

| File | Loại | Render |
|---|---|---|
| `(app)/dictionary/page.tsx` | Server component | `<DictionaryPage />` từ module |

Không tạo sub-route `/dictionary/[id]` — chi tiết hiển thị qua modal. Nếu cần shareable URL về sau, có thể bổ sung sau.

---

## Module barrel

File: `client/src/modules/dictionary/index.ts`

```typescript
export { DictionaryPage } from './components/DictionaryPage'
export { EntryDetailDialog } from './components/EntryDetailDialog'
export { SubmitEntryDialog } from './components/SubmitEntryDialog'
export {
  useDictionarySearch,
  useDictionaryEntry,
  useSubmitEntry,
} from './hooks/useDictionary'
export { dictionaryService } from './services/dictionary.service'
export type {
  DictionaryEntry,
  SearchDictionaryParams,
  SubmitEntryDto,
  JlptLevel,
} from './types'
export { JLPT_LEVELS } from './types'
```

---

## Modify shared files

| File | Thay đổi |
|---|---|
| `client/src/config/routes.ts` | Thêm `DICTIONARY: '/dictionary'` |
| `client/src/shared/constants/index.ts` | Thêm `QUERY_KEYS.DICTIONARY: { SEARCH: (params) => [...] , DETAIL: (id) => [...] }` |
| `client/src/shared/i18n/locales/vi.json` | Thêm namespace `dictionary` |
| `client/src/shared/i18n/locales/en.json` | Mirror keys |
| `client/src/shared/layouts/AppLayout.tsx` | Thêm nav item "Từ điển" (icon Book/Languages) — giữa Dashboard và Progress, hoặc theo thứ tự design |

Optional refactor (KHÔNG bắt buộc Phase 1):

- `client/src/modules/flashcards/services/flashcards.service.ts` đang có `getDictionaryEntry` — có thể loại bỏ và dùng `dictionaryService.getEntry` thay (DRY). Nếu làm: cập nhật `enrichWithEntries` import từ `@modules/dictionary`. Tránh circular import: dictionary KHÔNG import từ flashcards, chỉ flashcards import từ dictionary.

---

## API endpoints cần BE cung cấp

| Method | Path | Use-case BE | Dùng trong client hook |
|---|---|---|---|
| GET | `/dictionary` | SearchDictionaryUseCase | useDictionarySearch |
| GET | `/dictionary/:id` | GetDictionaryEntryUseCase | useDictionaryEntry |
| POST | `/me/dictionary` | CreateDictionaryEntryUseCase | useSubmitEntry |

Tất cả endpoint đã có ở `be-base/src/modules/dictionary/presentation/{public,user}` — KHÔNG cần thay đổi BE.

---

## i18n keys

```json
"dictionary": {
  "title": "Từ điển",
  "subtitle": "Tra cứu từ tiếng Nhật",
  "search": {
    "placeholder": "Nhập kanji, hiragana hoặc romaji…",
    "results_count": "{{count}} kết quả",
    "empty": "Không tìm thấy từ phù hợp",
    "hint": "Thử bỏ filter hoặc đổi từ khóa"
  },
  "filter": {
    "jlpt_all": "Tất cả",
    "jlpt_n1": "N1",
    "jlpt_n2": "N2",
    "jlpt_n3": "N3",
    "jlpt_n4": "N4",
    "jlpt_n5": "N5"
  },
  "fields": {
    "kanji": "Kanji",
    "hiragana": "Hiragana",
    "romaji": "Romaji",
    "meanings": "Nghĩa",
    "jlpt": "JLPT"
  },
  "actions": {
    "submit_new": "Đóng góp từ mới",
    "add_to_flashcards": "Thêm vào flashcards",
    "close": "Đóng",
    "save": "Gửi",
    "cancel": "Hủy",
    "add_meaning": "Thêm nghĩa"
  },
  "submit": {
    "title": "Đóng góp từ mới",
    "description": "Từ bạn gửi sẽ chờ admin duyệt trước khi xuất hiện công khai.",
    "success": "Đã gửi từ thành công, chờ duyệt",
    "error": "Gửi từ thất bại"
  },
  "added_to_flashcards": "Đã thêm vào flashcards",
  "already_in_flashcards": "Từ này đã có trong flashcards"
}
```

---

## UX notes

- Auth: route group `(app)` bảo vệ sẵn qua `middleware.ts`. Search endpoint là `@Public()` ở BE nhưng vẫn để trong `(app)` vì là feature dành cho user logged-in (có nút "Thêm vào flashcards").
- Debounce 300ms cho search input, `keepPreviousData: true` để tránh flicker khi đổi trang.
- Empty state: phân biệt 2 case — chưa search (chưa nhập gì) → hint "Nhập từ để bắt đầu"; search rỗng → "Không tìm thấy".
- Loading: skeleton list (5 cards) khi `isLoading`, không hiển thị spinner toàn trang.
- Error: `toast.error()` từ `sonner` trong `onError` của mutation. Search query error → inline error state trong list.
- Submit form Zod schema: `hiragana` regex Japanese chars (optional check), `romaji` chỉ a-z + space, `meanings` array `.min(1)`, `jlptLevel` enum 1–5.
- JLPT badge color: N5 green, N4 lime, N3 yellow, N2 orange, N1 red (tailwind tokens).
- Mọi text user-facing dùng `useTranslation()` namespace `dictionary` — không hardcode.
- `<EntryDetailDialog>` mở qua state local trong `DictionaryPage` (`selectedId`), không dùng URL param Phase 1.

---

## Module doc cần tạo sau khi implement

File: `client/.claude/modules/dictionary.md`

Sections: Mục đích, Structure, Public API, Route, API Endpoints, Query Keys, JLPT mapping, Gotchas (BE filter param mapping, no detail route).

---

## Edge cases & risks

- **BE search param mapping:** Public controller đọc `q` và `jlptLevel` là raw `@Query`, KHÔNG qua nestjs-paginate filter — service phải gửi `q` và `jlptLevel` ở top-level params, không phải `filter.jlptLevel` hay `search`. Verify khi implement bằng cách thử `curl /dictionary?q=ne&jlptLevel=5`.
- **Detail 404 cho pending/private entry:** BE return 404 nếu `status !== 'approved'` hoặc `isPublic === false` — UI cần handle gracefully (đóng modal, toast "Từ không tồn tại hoặc chưa duyệt").
- **Submit khi chưa đăng nhập:** route `(app)` đã chặn, nhưng nếu cookie hết hạn giữa session, POST `/me/dictionary` sẽ trả 401 → axios interceptor tự refresh → retry. Nếu refresh fail → redirect login (đã có sẵn).
- **Trùng entry:** BE không có dedup, user có thể submit từ đã tồn tại — UI nên cảnh báo user search trước khi submit; có thể bật check "Bạn đã chắc chắn từ này chưa có?" ở form (Phase 2).
- **Thêm vào flashcards trùng:** nếu user đã có flashcard cho entry này, BE có thể trả 409 hoặc 200 — UI handle cả 2 (toast "Đã có trong flashcards"). Verify response của `POST /me/flashcards` khi implement.
- **Pagination khi filter đổi:** đổi `jlptLevel` phải reset `page` về 1, không giữ page cũ.

---

## Effort estimate

| Phần | Effort |
|---|---|
| Types + Service | Low |
| Hooks | Low |
| Components (7 components, 1 modal phức tạp) | Med |
| Routes + nav | Low |
| i18n | Low |
| **Tổng** | **Med** |

---

## Checklist khi implement

- [ ] `'use client'` ở mọi file trong `components/` và `hooks/`
- [ ] `page.tsx` là server component, chỉ render `<DictionaryPage />`
- [ ] Không có relative import `../../` — dùng `@modules/*`, `@shared/*`
- [ ] Service dùng `apiClient`, không `fetch`
- [ ] `useQuery` có `queryKey` từ `QUERY_KEYS.DICTIONARY.*`, `keepPreviousData: true` cho search
- [ ] `useMutation` có `onSuccess` toast + reset, `onError` toast
- [ ] Field types khớp BE response (kanji nullable, jlptLevel nullable)
- [ ] Loading skeleton + empty (2 case) + error state đầy đủ
- [ ] Form submit dùng RHF + Zod, validate hiragana/romaji/meanings
- [ ] Text user-facing dùng `useTranslation('dictionary')`, key trong cả vi.json + en.json
- [ ] `ROUTES.DICTIONARY` thêm vào `src/config/routes.ts`
- [ ] `QUERY_KEYS.DICTIONARY` thêm vào `src/shared/constants/index.ts` (SEARCH params hashable)
- [ ] Nav item "Từ điển" thêm vào `AppLayout.tsx` (icon từ lucide-react)
- [ ] Module export qua `index.ts`
- [ ] `client/.claude/modules/dictionary.md` tạo xong
- [ ] `npm run type-check` pass
- [ ] Verify BE param mapping (`q`, `jlptLevel` raw vs filter) bằng manual curl trước khi đóng task

---

Để implement plan này:

```
/client-implement-module dictionary
```
