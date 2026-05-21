Kiểm tra cấu trúc một module client xem có tuân đúng rules kiến trúc của dự án `client/` (Next.js App Router) không.
Chạy từng check bằng Glob / Grep, báo cáo kết quả với ✅ ❌ ⚠️, kèm hướng dẫn sửa khi fail.

## Arguments

`$ARGUMENTS` — format: `<module-name>`

Module name có thể là camelCase hoặc kebab-case (ví dụ: `mockTest` hoặc `mock-test`).

Examples:
- `billing`
- `mockTest`
- `dashboard`
- `progress`

---

## Cách thực thi

Parse `$ARGUMENTS`:
- `moduleName` = token đầu (giữ nguyên case để tìm folder)
- `MODULE_PASCAL` = PascalCase của moduleName (billing → Billing, mockTest → MockTest, mock-test → MockTest)
- `MODULE_UPPER` = UPPER_SNAKE_CASE (billing → BILLING, mockTest → MOCK_TEST, mock-test → MOCK_TEST)
- `CLIENT_MODULE_PATH` = `client/src/modules/<moduleName>`

Detect route group: tìm `page.tsx` trong tất cả các route group:
- `client/src/app/(app)/<moduleName>/page.tsx`
- `client/src/app/(learning)/<moduleName>/page.tsx`
- `client/src/app/(auth)/<moduleName>/page.tsx`
- `client/src/app/(public)/<moduleName>/page.tsx`
- `client/src/app/(onboarding)/<moduleName>/page.tsx`

Và cả dạng kebab-case nếu moduleName là camelCase (mockTest → mock-test).

Chạy **tất cả check** bằng Glob / Grep trước, rồi in toàn bộ report một lần duy nhất ở cuối.
**Không in từng check riêng lẻ trong quá trình chạy.**

---

## Checks cần thực hiện

### ── [CLIENT] Types Layer ─────────────────────────────────────

**C-T1** `types/index.ts` tồn tại
- Glob: `client/src/modules/<moduleName>/types/index.ts`
- ❌ nếu không tồn tại → "Tạo `types/index.ts` định nghĩa interfaces / DTOs"

**C-T2** Types KHÔNG dùng `any`
- Grep pattern `: any\b` trong `client/src/modules/<moduleName>/types/`
- ⚠️ nếu có match → "Tránh dùng `any` — định nghĩa type chính xác"

---

### ── [CLIENT] Service Layer ──────────────────────────────────

**C-S1** Service file tồn tại
- Glob: `client/src/modules/<moduleName>/services/*.service.ts`
- ❌ nếu không tồn tại → "Tạo service file chứa API calls"

**C-S2** Service dùng `apiClient` hoặc là mock stub với TODO comment
- Grep pattern `apiClient` trong service file
- Nếu không có `apiClient`, grep pattern `TODO.*apiClient|TODO.*backend|apiClient` (mock stubs tạm thời)
- ✅ nếu có `apiClient` | ⚠️ nếu chỉ có mock stub (thiếu apiClient) → "Service phải dùng `apiClient` từ `@lib/api-client`, không dùng `fetch` trực tiếp"

**C-S3** Service KHÔNG chứa React hooks
- Grep pattern `useState|useEffect|useQuery|useMutation|useCallback|useMemo` trong service file
- ❌ nếu có match → "Business logic và React hooks thuộc `hooks/`, không phải service"

**C-S4** Service KHÔNG có `'use client'`
- Grep pattern `'use client'` trong service file
- ❌ nếu có match → "Service là pure functions — không cần `'use client'`"

---

### ── [CLIENT] Hooks Layer ─────────────────────────────────────

**C-H1** Ít nhất 1 hook file tồn tại
- Glob: `client/src/modules/<moduleName>/hooks/use*.ts`
- ❌ nếu không có → "Tạo hooks dùng TanStack Query để wrap service calls"

**C-H2** Hook files có `'use client'` directive
- Grep pattern `'use client'` trong tất cả file trong `hooks/`
- ❌ nếu số file hooks > số lần xuất hiện `'use client'` → "Mọi hook file phải có `'use client'` ở đầu"

**C-H3** Hooks dùng `QUERY_KEYS`
- Grep pattern `QUERY_KEYS` trong folder `hooks/`
- ❌ nếu không có → "Luôn dùng `QUERY_KEYS.<MODULE>.*` cho `queryKey`, không hardcode string"

**C-H4** Mutations có `invalidateQueries` on success
- Grep pattern `useMutation` trong hooks — nếu có mutation
- Grep pattern `invalidateQueries` trong hooks
- ❌ nếu có `useMutation` nhưng không có `invalidateQueries` → "Mutation `onSuccess` phải gọi `qc.invalidateQueries()`"

**C-H5** Mutations có `toast.error` trong `onError`
- Grep pattern `toast\.error` trong hooks
- ❌ nếu có `useMutation` nhưng không có `toast.error` → "`onError` phải gọi `toast.error()` từ `sonner`"

---

### ── [CLIENT] Components Layer ───────────────────────────────

**C-C1** Ít nhất 1 component file tồn tại
- Glob: `client/src/modules/<moduleName>/components/*.tsx`
- ❌ nếu không có

**C-C2** Component files có `'use client'` directive
- Grep pattern `'use client'` trong tất cả `.tsx` trong `components/`
- ❌ nếu có file dùng hooks/event handlers nhưng không có `'use client'`
- Grep `useState|useEffect|useQuery|onClick|onChange` để phát hiện files cần `'use client'`
- ⚠️ "Kiểm tra thủ công — mọi component dùng hooks hoặc event handler phải có `'use client'`"

**C-C3** KHÔNG dùng `window.confirm`
- Grep pattern `window\.confirm` trong folder `components/`
- ❌ nếu có match → "Dùng `<ConfirmDialog>` từ `@shared/components/ui` thay vì `window.confirm`"

**C-C4** Không dùng relative imports `../../` — phải dùng path alias
- Grep pattern `from '\.\./\.\./` trong folder `components/`
- ❌ nếu có match → "Dùng path alias `@modules/*`, `@shared/*`, `@lib/*` — không dùng `../../`"

**C-C5** Không import sâu vào nội bộ module khác (phải qua `index.ts`)
- Grep pattern `from '@modules/[^']+/(?!index)[^']+` trong folder `components/`
- ❌ nếu có match → "Import từ module khác phải qua `index.ts`: `import { X } from '@modules/<other>'`"

---

### ── [CLIENT] Route Layer ─────────────────────────────────────

**C-R1** `page.tsx` tồn tại trong một route group
- Glob trong tất cả groups: `(app)`, `(learning)`, `(auth)`, `(public)`, `(onboarding)`
- Thử cả camelCase và kebab-case của moduleName
- ❌ nếu không tìm thấy → "Tạo `page.tsx` trong route group phù hợp"
- ✅ kèm note: **Route group phát hiện:** `(<group>)`

**C-R2** `page.tsx` là server component (KHÔNG có `'use client'`)
- Grep pattern `'use client'` trong page.tsx
- ❌ nếu có → "`page.tsx` phải là server component — bỏ `'use client'`, render component từ module"

**C-R3** `page.tsx` import từ module barrel (`@modules/<moduleName>`)
- Grep pattern `@modules/<moduleName>` trong page.tsx
- ❌ nếu không có → "`page.tsx` phải import `<MODULE_PASCAL>Page` qua barrel: `import { <MODULE_PASCAL>Page } from '@modules/<moduleName>'`"

---

### ── [CLIENT] Wiring & Constants ─────────────────────────────

**C-W1** Barrel `index.ts` tồn tại
- Glob: `client/src/modules/<moduleName>/index.ts`
- ❌ nếu không tồn tại → "Tạo `index.ts` export public API của module"

**C-W2** `ROUTES.<MODULE_UPPER>` trong `client/src/config/routes.ts`
- Grep pattern `MODULE_UPPER` hoặc uppercase key liên quan đến module trong `client/src/config/routes.ts`
- ❌ nếu không có → "Thêm `ROUTES.<MODULE_UPPER>: '/<path>'` vào `src/config/routes.ts`"

**C-W3** `QUERY_KEYS.<MODULE_UPPER>` trong `client/src/shared/constants/index.ts`
- Grep pattern `<MODULE_UPPER>:` trong `client/src/shared/constants/index.ts`
- ❌ nếu không có → "Thêm `QUERY_KEYS.<MODULE_UPPER>: { ... }` vào `src/shared/constants/index.ts`"

**C-W4** Nav entry trong `AppLayout.tsx` (chỉ check nếu route group là `(app)`)
- Grep pattern `ROUTES\.<MODULE_UPPER>|/<path-of-module>` trong `client/src/shared/layouts/AppLayout.tsx`
- ⚠️ nếu không có → "Module trong `(app)` group nhưng chưa có nav item trong `navSections` của `AppLayout.tsx`"

**C-W5** i18n key trong `vi.json`
- Grep pattern `"<moduleName>":` trong `client/src/shared/i18n/locales/vi.json`
- ❌ nếu không có → "Thêm namespace `\"<moduleName>\": { ... }` vào `vi.json`"

**C-W6** i18n key trong `en.json`
- Grep pattern `"<moduleName>":` trong `client/src/shared/i18n/locales/en.json`
- ❌ nếu không có → "Thêm namespace `\"<moduleName>\": { ... }` vào `en.json` (mirror keys từ vi.json)"

**C-W7** Module doc tồn tại
- Glob: `client/.claude/modules/<moduleName>.md`
- ⚠️ nếu không có → "Tạo `client/.claude/modules/<moduleName>.md` để các skill khác reference"

---

## Format output

Sau khi chạy tất cả checks, in report theo format:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CLIENT MODULE CHECK: <module-name>
 Route group: (<group>) / không tìm thấy page.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[CLIENT] client/src/modules/<module>/
─────────────────────────────────────────────────────────
 Types
  ✅/❌/⚠️  C-T1  types/index.ts tồn tại
  ✅/❌/⚠️  C-T2  Không dùng any

 Service
  ✅/❌/⚠️  C-S1  Service file tồn tại
  ✅/❌/⚠️  C-S2  Service dùng apiClient
  ✅/❌/⚠️  C-S3  Service không chứa React hooks
  ✅/❌/⚠️  C-S4  Service không có 'use client'

 Hooks
  ✅/❌/⚠️  C-H1  Có hook files
  ✅/❌/⚠️  C-H2  Hook files có 'use client'
  ✅/❌/⚠️  C-H3  Hooks dùng QUERY_KEYS
  ✅/❌/⚠️  C-H4  Mutations có invalidateQueries
  ✅/❌/⚠️  C-H5  Mutations có toast.error

 Components
  ✅/❌/⚠️  C-C1  Có component files
  ⚠️        C-C2  Components có 'use client' — kiểm tra thủ công
  ✅/❌/⚠️  C-C3  Không dùng window.confirm
  ✅/❌/⚠️  C-C4  Không dùng relative imports ../../
  ✅/❌/⚠️  C-C5  Không import sâu vào nội bộ module khác

 Route
  ✅/❌/⚠️  C-R1  page.tsx tồn tại
  ✅/❌/⚠️  C-R2  page.tsx là server component
  ✅/❌/⚠️  C-R3  page.tsx import từ module barrel

 Wiring & Constants
  ✅/❌/⚠️  C-W1  Barrel index.ts tồn tại
  ✅/❌/⚠️  C-W2  ROUTES constant tồn tại
  ✅/❌/⚠️  C-W3  QUERY_KEYS constant tồn tại
  ✅/❌/⚠️  C-W4  Nav entry trong AppLayout.tsx
  ✅/❌/⚠️  C-W5  i18n key trong vi.json
  ✅/❌/⚠️  C-W6  i18n key trong en.json
  ✅/❌/⚠️  C-W7  Module doc tồn tại

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Kết quả: <N> ✅ passed · <N> ❌ failed · <N> ⚠️ cần xem lại
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Lỗi cần sửa:
  ❌ C-Sx — <mô tả ngắn gọn vấn đề và cách sửa>

Cần xem lại thủ công:
  ⚠️ C-C2 — Kiểm tra mọi component dùng hooks/event handler đều có 'use client' ở đầu file
  ⚠️ ...
```

Nếu module `client/src/modules/<moduleName>/` không tồn tại → dừng ngay và in:
`❌ Không tìm thấy client/src/modules/<moduleName>/ — module chưa được tạo.`

Nếu tất cả checks đều pass → in thêm:
`🎉 Module <name> tuân đúng kiến trúc client.`
