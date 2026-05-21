Lập kế hoạch tạo một **module hoàn toàn mới** trong `client/` (Next.js App Router) từ mô tả tính năng. Skill này dành cho module client **chưa tồn tại** — nếu đã có, dùng `/client-add-feature`.

Phân biệt với các skill khác:
- `/plan-new-module` — plan module cho BE (be-base) + Admin (fe-base-admin). KHÔNG bao gồm client.
- `/client-page-from-ui` — tạo module client từ **UI mẫu** (URL, HTML, ảnh).
- `/client-plan-module` (skill này) — plan module client mới từ **mô tả tính năng + API BE**, không cần UI mẫu.

## Arguments

`$ARGUMENTS` — format: `<module-name> <mô tả domain / mục đích module>`

Examples:
- `flashcards Module flashcard học từ vựng với spaced repetition, có session và lịch sử`
- `vocab Module quản lý danh sách từ vựng đã thêm vào học tập của user`
- `progress-detail Module xem chi tiết tiến độ học theo chủ đề và level`

Parse:
- First token = **module name** (snake_case hoặc kebab-case)
- Rest = **mô tả domain** bằng ngôn ngữ tự nhiên

---

## Steps to execute

### STEP 1 — Kiểm tra module chưa tồn tại

Kiểm tra:
- `client/src/modules/<module-name>/` — nếu tồn tại → cảnh báo user, gợi ý dùng `/client-add-feature`

Nếu tồn tại → dừng và báo.

---

### STEP 2 — Xác định BE đã có endpoint chưa

Module client cần API từ BE. Kiểm tra:
- `be-base/src/modules/<module-name>/` — nếu tồn tại → tốt, sẽ dùng route đó
- Nếu KHÔNG tồn tại → ghi chú trong plan "**Yêu cầu BE tạo module trước**" và liệt kê các endpoint cần thiết

Khi nằm trong flow `/build-full-module`, BE thường được implement trước, nên kiểm tra này thường pass.

---

### STEP 3 — Detect shared dependencies cần đọc

Dựa trên mô tả module, xác định docs nào cần load trong `client/.claude/modules/`:

| Module liên quan đến | Đọc doc |
|---|---|
| Auth state, current user, login required | `auth.md` |
| Table, form, modal, button, layout, sidebar nav | `shared-ui.md` |
| Realtime, socket, push notification | `notification.md` |
| Billing, subscription, plan check | `billing.md` |
| Landing/marketing section (public) | `landing.md` |

Đọc kèm `client/.claude/CLAUDE.md` nếu feature có Next.js APIs lạ (server actions, middleware, dynamic params).

Chỉ đọc khi thực sự cần.

---

### STEP 4 — Đọc module mẫu làm tham chiếu

**🔥 Short-circuit:** Nếu file `planning/<module-name>-context.md` tồn tại (do `/build-full-module` pre-load) → **đọc bundle này thay vì re-read source mẫu**. Skip STEP 4 còn lại.

Ngược lại, chọn module mẫu gần nhất:
- Auth/account → `auth`
- Data list/stats → `dashboard`
- Realtime/socket → `notification`
- Marketing/landing → `landing`
- Plan/subscription → `billing`

Đọc:
- `client/.claude/modules/<reference>.md` — hiểu cấu trúc
- 1 component mẫu: `client/src/modules/<reference>/components/<X>.tsx`
- 1 hook mẫu: `client/src/modules/<reference>/hooks/use<X>.ts`
- Service mẫu: `client/src/modules/<reference>/services/<reference>.service.ts`

Mục đích: hiểu pattern, không copy code.

### COMPACT format (khi prompt có "COMPACT plan format")

Khi orchestrator yêu cầu compact, **rút plan ở STEP 6**:
- **GIỮ**: Tóm tắt, Types, Service (table), Hooks (table), Components (table), Routes, Module barrel, Modify shared files, API endpoints cần BE, i18n keys, Edge cases
- **BỎ**: UX notes section, Module doc cần tạo (đã ở implement skill), Effort estimate, Checklist tổng

Đó là rules đã có ở `/client-implement-module` — không cần lặp trong plan.

---

### STEP 5 — Quyết định route group

Module nằm trong route group nào? Mỗi group có layout riêng:

| Group | Mục đích | Khi nào dùng |
|---|---|---|
| `(public)` | Marketing, blog, pricing | User chưa đăng nhập vẫn xem được |
| `(auth)` | Login, register, forgot password | Form xác thực |
| `(onboarding)` | Onboarding sau register | User đã login nhưng chưa setup |
| `(app)` | Protected pages với sidebar | Dashboard, progress, profile — phần lớn module mới rơi vào đây |
| `(learning)` | Protected, full-screen | Learning interface không sidebar |

Ghi vào plan: **Route group**: `(app)` (default cho protected) hoặc khác nếu cần.

---

### STEP 6 — Produce implementation plan

In toàn bộ plan theo format sau (markdown thuần, không decoration):

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 NEW CLIENT MODULE PLAN
 Module      : <module-name>
 Domain      : <mô tả ngắn gọn>
 Route group : (app) / (public) / (learning) / ...
 BE module   : <"đã có" | "cần tạo trước" — module name>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Tóm tắt
<3–4 câu mô tả module làm gì, user flow chính, các state/page chính>

---

## Types
File: `client/src/modules/<module>/types/index.ts`

```typescript
export interface <Model> { ... }
export interface <Dto> { ... }
// ApiResponse<T> và PaginatedResult<T> import từ @shared/types
```

---

## Service
File: `client/src/modules/<module>/services/<module>.service.ts`

Gọi qua `apiClient` từ `@lib/api-client`. Một function cho một endpoint:

| Function | Method | Endpoint | Mô tả |
|---|---|---|---|
| `list<Module>s(params)` | GET | `/<module>` | List với pagination |
| `get<Module>(id)` | GET | `/<module>/:id` | Detail |
| `create<Module>(dto)` | POST | `/<module>` | Tạo mới |
| `update<Module>(id, dto)` | PATCH | `/<module>/:id` | Cập nhật |
| (thêm/bỏ tùy domain) |

---

## Hooks
File: `client/src/modules/<module>/hooks/use<Module>.ts`

| Hook | Loại | QueryKey / Mutation |
|---|---|---|
| `use<Module>List(params)` | useQuery | `QUERY_KEYS.<MODULE>.LIST(params)` |
| `use<Module>(id)` | useQuery | `QUERY_KEYS.<MODULE>.DETAIL(id)` |
| `useCreate<Module>()` | useMutation | invalidate LIST, toast success/error |
| `useUpdate<Module>()` | useMutation | invalidate LIST + DETAIL |
| (thêm/bỏ tùy domain) |

---

## Components
Files trong `client/src/modules/<module>/components/`:

| File | Mô tả |
|---|---|
| `<Module>Page.tsx` | Trang chính ('use client', render list/grid) |
| `<Module>Item.tsx` | Card/row hiển thị 1 item (nếu cần tách) |
| `<Module>Form.tsx` | Form create/edit (RHF + Zod) — nếu có CRUD |
| `<Module>Detail.tsx` | View chi tiết — nếu có route detail |
| (thêm component khác nếu domain phức tạp) |

Mỗi file trong `components/` và `hooks/` đều phải có `'use client'` ở đầu.

---

## Routes
Files trong `client/src/app/(<group>)/`:

| File | Loại | Render |
|---|---|---|
| `<group>/<module>/page.tsx` | Server component | `<<Module>Page />` từ module |
| (thêm sub-route nếu cần: detail, edit...) |

---

## Module barrel
File: `client/src/modules/<module>/index.ts`

Export public API:
```typescript
export { <Module>Page } from './components/<Module>Page'
export { use<Module>List, use<Module>, useCreate<Module> } from './hooks/use<Module>'
export type { <Model>, <Dto> } from './types'
```

---

## Modify shared files

| File | Thay đổi |
|---|---|
| `client/src/config/routes.ts` | Thêm `ROUTES.<MODULE>: '/<module>'` |
| `client/src/shared/constants/index.ts` | Thêm `QUERY_KEYS.<MODULE>: { LIST, DETAIL }` |
| `client/src/shared/i18n/locales/vi.json` | Thêm namespace `"<module>": { ... }` |
| `client/src/shared/i18n/locales/en.json` | Mirror keys ở vi.json |
| `client/src/shared/layouts/AppLayout.tsx` | Thêm nav item (chỉ khi module thuộc `(app)` và cần xuất hiện trên sidebar) |

---

## API endpoints cần BE cung cấp

| Method | Path | Use-case BE | Dùng trong client hook |
|---|---|---|---|
| GET | `/<module>` | List<Module>sUseCase | use<Module>List |
| GET | `/<module>/:id` | Get<Module>UseCase | use<Module> |
| POST | `/<module>` | Create<Module>UseCase | useCreate<Module> |
| ... | | | |

Note: nếu BE chưa có, plan này phải reference đúng route do `/plan-new-module` đã định nghĩa.

---

## i18n keys

```json
"<module>": {
  "title": "...",
  "empty": "Chưa có dữ liệu",
  "actions": {
    "create": "Tạo mới",
    "save": "Lưu",
    "cancel": "Hủy"
  },
  "fields": {
    "<field1>": "...",
    "<field2>": "..."
  },
  "status": {
    "<value1>": "...",
    "<value2>": "..."
  }
}
```

---

## UX notes
- Auth: route group `(app)` đã được `middleware.ts` bảo vệ, không cần check thủ công
- Loading: dùng `<Spinner />` hoặc `<Skeleton />` từ `@shared/components/ui`
- Empty state: `<Empty />` component nếu có
- Error: `toast.error()` từ `sonner` trong `onError` của mutation
- Destructive action: `<ConfirmDialog>` từ `@shared/components/ui`
- Mọi text user-facing dùng `useTranslation()` — không hardcode

---

## Module doc cần tạo sau khi implement
File: `client/.claude/modules/<module>.md`

Sections: Mục đích, Structure, Public API, Route, API Endpoints, Query Keys, Gotchas.

---

## Edge cases & risks
- <edge case 1 — cụ thể, ko ghi vấn đề hiển nhiên>
- <edge case 2>
- (tối thiểu 2)

---

## Effort estimate
| Phần | Effort |
|---|---|
| Types + Service | Low/Med/High |
| Hooks | Low/Med/High |
| Components | Low/Med/High |
| Routes + nav | Low/Med/High |
| i18n | Low/Med/High |
| **Tổng** | **Low/Med/High** |

---

## Checklist khi implement

- [ ] `'use client'` ở mọi file trong `components/` và `hooks/`
- [ ] `page.tsx` là server component, chỉ render component từ module
- [ ] Không có relative import `../../` — dùng path alias `@modules/*`, `@shared/*`, ...
- [ ] Service dùng `apiClient`, không dùng `fetch`
- [ ] `useQuery` có `queryKey` từ `QUERY_KEYS.<MODULE>.*`
- [ ] `useMutation` có `onSuccess` invalidate + toast
- [ ] Field types khớp BE response chính xác
- [ ] Loading + empty + error state đầy đủ
- [ ] Form dùng RHF + Zod
- [ ] Destructive action có `ConfirmDialog`
- [ ] Text user-facing dùng `useTranslation()`, key có cả trong vi.json + en.json
- [ ] Lazy import KHÔNG cần (Next.js tự code-split theo route)
- [ ] `ROUTES.<MODULE>` thêm vào `src/config/routes.ts`
- [ ] `QUERY_KEYS.<MODULE>` thêm vào `src/shared/constants/index.ts`
- [ ] Nav item thêm vào AppLayout (nếu module thuộc `(app)`)
- [ ] Module export qua `index.ts`
- [ ] `client/.claude/modules/<module>.md` tạo xong
- [ ] `npm run type-check` pass

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Để implement plan này:
  /client-implement-module <module-name>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### STEP 7 — Lưu plan vào folder planning

Sau khi in plan, **bắt buộc** lưu thành file:

```
planning/<module-name>-client.md
```

Format:
- Header: `# NEW CLIENT MODULE PLAN — <module-name>`
- Dòng thứ hai: `> **Ngày:** <DD/MM/YYYY>`
- Toàn bộ nội dung plan (markdown thuần, không dấu ━)

Sau khi lưu, thông báo:
```
Plan client đã được lưu tại: planning/<module-name>-client.md
```

Do NOT implement anything. Stop after saving the plan file.
