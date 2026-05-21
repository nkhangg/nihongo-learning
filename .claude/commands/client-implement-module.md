Thực thi plan client từ `/client-plan-module` — tạo toàn bộ module client mới từ đầu trong `client/` (Next.js App Router).
Skill này đọc plan đã lưu trong `planning/<module-name>-client.md`, load đúng context, rồi implement layer by layer theo đúng convention của project.

Phân biệt với các skill khác:
- `/implement-new-module` — implement module cho BE + Admin. KHÔNG bao gồm client.
- `/client-implement-module` (skill này) — implement module mới trong `client/` từ plan có sẵn.

## Arguments

`$ARGUMENTS` — format: `<module-name>`

Examples:
- `flashcards`
- `vocab-list`

---

## Steps to execute

### STEP 1 — Đọc plan file

Đọc: `planning/<module-name>-client.md`

Nếu không tồn tại → dừng, thông báo:
```
Plan client cho module '<module-name>' chưa có.
Hãy chạy: /client-plan-module <module-name> <mô tả>
```

Parse plan để extract:
- Route group (`(app)`, `(public)`, `(learning)`, ...)
- Danh sách types, service methods, hooks, components
- API endpoints cần dùng (verify BE đã có)
- i18n keys
- Files MODIFY (routes.ts, constants, AppLayout, i18n)

---

### STEP 2 — Kiểm tra trạng thái hiện tại

- `client/src/modules/<module-name>/` — đã tồn tại chưa?
  - Nếu có → dừng, gợi ý `/client-add-feature`
- Verify BE module tương ứng tồn tại trong `be-base/src/modules/<module-name>/` (chỉ cảnh báo nếu không có — không dừng, vì có thể đang phát triển song song)

---

### STEP 3 — Load core context

Đọc tối thiểu:
- `client/.claude/CLAUDE.md` — chỉ skim phần "Development Rules" và "Routing" (đã loaded sẵn nếu trong flow `/build-full-module`)

Dựa trên plan, đọc các shared docs cần thiết trong `client/.claude/modules/`:

| Plan đề cập | Đọc doc |
|---|---|
| Bảng dữ liệu, form, modal, button, layout | `shared-ui.md` |
| Auth check, current user | `auth.md` |
| Realtime, socket | `notification.md` |
| Billing/plan check | `billing.md` |

---

### STEP 4 — Đọc source files tham chiếu

**🔥 Short-circuit:** Nếu file `planning/<module-name>-context.md` tồn tại → **đọc bundle này** thay vì re-read source mẫu. Bundle có tóm tắt pattern client. Skip phần còn lại của STEP 4.

Vẫn cần đọc các file nhỏ này (không có trong bundle, format thay đổi theo project):
- `client/src/config/routes.ts` — xem format hiện tại của `ROUTES`
- `client/src/shared/constants/index.ts` — xem format `QUERY_KEYS`

Ngược lại (không có bundle), chọn module mẫu gần nhất (đã ghi trong plan, hoặc tự chọn: `dashboard` cho list/stats, `auth` cho form, `notification` cho socket):

- 1 service mẫu: `client/src/modules/<ref>/services/<ref>.service.ts`
- 1 hook mẫu: `client/src/modules/<ref>/hooks/use<Ref>.ts`
- 1 component mẫu: `client/src/modules/<ref>/components/<Ref>Page.tsx`
- 1 page route mẫu: `client/src/app/(<group>)/<ref>/page.tsx`
- `client/src/config/routes.ts` — xem format ROUTES
- `client/src/shared/constants/index.ts` — xem format QUERY_KEYS
- `client/src/shared/i18n/locales/vi.json` — xem cách tổ chức namespace

Mục đích: hiểu exact convention — không copy code.

---

### STEP 5 — Print implementation summary & confirm

In tóm tắt:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 IMPLEMENT CLIENT MODULE: <module-name>
 Route group: (<group>)
 Plan:  planning/<module-name>-client.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Files to CREATE (<n> files):
  Module:  client/src/modules/<module>/
           - types/index.ts
           - services/<module>.service.ts
           - hooks/use<Module>.ts
           - components/<Module>Page.tsx (+ các component khác)
           - index.ts
  Route:   client/src/app/(<group>)/<module>/page.tsx

Files to MODIFY:
  - client/src/config/routes.ts                     — thêm ROUTES.<MODULE>
  - client/src/shared/constants/index.ts            — thêm QUERY_KEYS.<MODULE>
  - client/src/shared/i18n/locales/vi.json          — thêm namespace
  - client/src/shared/i18n/locales/en.json          — thêm namespace
  - client/src/shared/layouts/AppLayout.tsx         — thêm nav item (nếu cần)

API endpoints sẽ gọi: <n> endpoints
BE module: <"exists" | "WARNING: chưa có">
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Hỏi: **"Proceed với implementation?"** — chờ user xác nhận.

(Nếu chạy trong flow `/build-full-module` với chế độ auto-proceed, có thể skip xác nhận này theo chỉ đạo của orchestrator.)

---

### STEP 6 — Implement layer by layer

#### Layer 1: Types
File: `client/src/modules/<module>/types/index.ts`

Rules:
- Field names khớp **chính xác** với BE response
- Dùng `ApiResponse<T>` và `PaginatedResult<T>` từ `@shared/types`
- KHÔNG cần `'use client'` (pure types)

#### Layer 2: Service
File: `client/src/modules/<module>/services/<module>.service.ts`

Rules:
- Gọi qua `apiClient` từ `@lib/api-client` — **không dùng `fetch` trực tiếp**
- Một function cho một endpoint, đặt tên rõ ràng
- Không có business logic — chỉ là HTTP wrapper
- Trả về `ApiResponse<T>` hoặc plain data tùy interceptor (đọc service mẫu để xác định)
- KHÔNG cần `'use client'`

#### Layer 3: Hooks
File: `client/src/modules/<module>/hooks/use<Module>.ts`

Rules (TanStack Query v5):
- `'use client'` ở đầu file — **BẮT BUỘC**
- `useQuery`: queryKey lấy từ `QUERY_KEYS.<MODULE>.*`
- `useMutation`: `onSuccess` invalidate queries liên quan + `toast.success()`
- `onError`: `toast.error()` từ `sonner`
- Export từng hook riêng (không export default)

#### Layer 4: Components
Files trong `client/src/modules/<module>/components/`:

Rules:
- `'use client'` ở đầu mỗi file — **BẮT BUỘC**
- Dùng shadcn/ui từ `@shared/components/ui` — không tự viết HTML/CSS thuần
- Form: React Hook Form + Zod schema validation
- Loading: `<Spinner />` hoặc `<Skeleton />`
- Empty: `<Empty />` component hoặc inline message
- Destructive action: `<ConfirmDialog>` (không `window.confirm`)
- Mọi text user-facing dùng `useTranslation()` — key có trong cả vi.json và en.json
- Navigation: `useRouter()` từ `next/navigation`, `<Link>` từ `next/link`

#### Layer 5: Module barrel
File: `client/src/modules/<module>/index.ts`

Export:
- Components dùng từ ngoài (Page component, modal nếu cần reuse)
- Hooks public
- Types public

KHÔNG export internal helpers / sub-components.

#### Layer 6: Route page(s)
File: `client/src/app/(<group>)/<module>/page.tsx`

Rules:
- **Server component** — KHÔNG có `'use client'`
- KHÔNG dùng hooks
- Chỉ import & render component từ module qua `@modules/<module>`

Pattern:
```typescript
import { <Module>Page } from '@modules/<module>'

export default function Page() {
  return <<Module>Page />
}
```

Nếu có sub-route (vd `/[id]`, `/settings`) → tạo `page.tsx` riêng cho mỗi route, mỗi cái server component wrap component từ module.

#### Layer 7: Modify shared files

**`client/src/config/routes.ts`** — thêm vào object `ROUTES`:
```typescript
<MODULE_CONST>: '/<module>',
```
(Nếu có sub-route: thêm `<MODULE>_DETAIL: (id: string) => '/<module>/' + id` hoặc tương tự — xem pattern hiện có)

**`client/src/shared/constants/index.ts`** — thêm vào object `QUERY_KEYS`:
```typescript
<MODULE>: {
  LIST: (params?: ...) => [...] as const,
  DETAIL: (id: string) => [...] as const,
  // ...
},
```
(Đọc QUERY_KEYS hiện có để follow đúng pattern)

**`client/src/shared/i18n/locales/vi.json` + `en.json`**:
- Thêm namespace `"<module>": { ... }` theo plan
- Mirror keys giữa vi và en
- Translate đúng (vi: tiếng Việt, en: English)

**`client/src/shared/layouts/AppLayout.tsx`** — chỉ khi module thuộc `(app)` group và cần xuất hiện trên sidebar:
- Tìm array định nghĩa nav items
- Thêm item mới với icon, label (dùng t() để i18n), href từ `ROUTES.<MODULE>`
- Đọc các nav item hiện có để follow pattern

#### Layer 8: Middleware (chỉ khi cần)

Mặc định: KHÔNG sửa `src/middleware.ts`. Route group đã định nghĩa auth scope:
- `(app)`, `(learning)`, `(onboarding)` — protected (middleware tự handle)
- `(public)`, `(auth)` — không cần login

Chỉ sửa middleware nếu route mới có exception rule rõ ràng (ví dụ: 1 route trong `(app)` nhưng cho phép guest) — và phải confirm với user trước.

---

### STEP 7 — Tạo module doc

**Bắt buộc** tạo `client/.claude/modules/<module-name>.md`:

```markdown
# Module: <module-name>

<1-2 câu mô tả module>

## Structure

\`\`\`
src/modules/<module>/
├── components/
│   └── ...
├── hooks/
│   └── ...
├── services/
│   └── ...
├── types/
│   └── index.ts
└── index.ts
\`\`\`

## Public API

\`\`\`typescript
import { <Module>Page, use<Module>List, ... } from '@modules/<module>'
import type { <Model>, ... } from '@modules/<module>'
\`\`\`

## Route

| Route | Page | Group |
|---|---|---|
| `/<module>` | `(<group>)/<module>/page.tsx` | (<group>) — <layout name> |

## API Endpoints

| Hook | Method | Endpoint |
|---|---|---|
| `use<Module>List` | GET | `/<module>` |
| ... | | |

## Query Keys

\`\`\`typescript
QUERY_KEYS.<MODULE>.LIST(params)
QUERY_KEYS.<MODULE>.DETAIL(id)
\`\`\`

## Gotchas

- <edge case quan trọng 1 từ plan>
- <edge case 2>
```

---

### STEP 8 — Verify

Chạy type-check:
```bash
cd client && npm run type-check
```

Nếu fail → fix lỗi ngay (đừng ép user fix). Lỗi điển hình:
- Field type không khớp BE → đọc BE DTO để align
- Missing 'use client' khi dùng hook → thêm directive
- Wrong import path → đổi sang path alias

Sau khi type-check pass, nhắc user verify trong trình duyệt:
```
Module đã implement xong. Để verify UI:
  cd client && npm run dev
  → mở http://localhost:3000/<module>
```

---

### STEP 9 — Print quality checklist

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 QUALITY CHECKLIST — CLIENT <module-name>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 [ ] 'use client' ở mọi file trong components/ và hooks/
 [ ] page.tsx là server component, chỉ render
 [ ] Path alias dùng đúng (@modules, @shared, @lib)
 [ ] Service gọi qua apiClient, không có fetch trực tiếp
 [ ] useQuery có queryKey từ QUERY_KEYS.<MODULE>
 [ ] useMutation có onSuccess invalidate + toast
 [ ] Loading + empty + error state đầy đủ
 [ ] Form dùng RHF + Zod
 [ ] Destructive action có ConfirmDialog
 [ ] Text dùng useTranslation, key có cả vi.json + en.json
 [ ] ROUTES.<MODULE> đã thêm vào src/config/routes.ts
 [ ] QUERY_KEYS.<MODULE> đã thêm vào src/shared/constants/index.ts
 [ ] Nav item thêm vào AppLayout (nếu thuộc (app) group)
 [ ] Module export qua index.ts
 [ ] client/.claude/modules/<module>.md tạo xong
 [ ] npm run type-check pass

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Để thêm feature mới vào module này sau:
  /client-add-feature <module-name> <feature>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
