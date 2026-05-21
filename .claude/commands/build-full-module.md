Orchestrator end-to-end để tạo một module **hoàn toàn mới** xuyên suốt 3 layer của dự án: **BE (be-base) + Admin (fe-base-admin) + Client (Next.js)**, từ phân tích yêu cầu → plan → implement → QA → review.

Skill này **không tự viết code mới** — nó **gọi các skill chuyên dụng đã có** theo đúng thứ tự, có checkpoint ở mỗi phase để user xác nhận trước khi đi tiếp.

Khi nào dùng:
- Tạo module hoàn toàn mới có cả BE + Admin + có thể có Client
- Muốn quy trình chuẩn hóa: plan → implement → check → simplify → typecheck → review

Khi KHÔNG dùng:
- Thêm feature vào module đã có → dùng `/be-add-feature`, `/fe-add-feature`, `/client-add-feature`
- Chỉ cần plan để discuss → dùng `/plan-new-module` hoặc `/discuss-feature`
- Module đã có UI mẫu sẵn cho client → dùng `/client-page-from-ui`

---

## Arguments

`$ARGUMENTS` — format: `<module-name> [scope] [--lite] <mô tả>`

- `module-name`: snake_case hoặc kebab-case (vd `flashcards`, `mock-test`)
- `scope` (optional): `full` (default — BE + Admin + Client) | `admin` (BE + Admin, không client) | `be-only` (chỉ BE)
- `--lite` (optional flag): chế độ tiết kiệm token cho module CRUD đơn giản. Khi bật:
  - Skip PHASE 0 (discovery)
  - Compact plan format (rút gọn)
  - QA chỉ chạy build/typecheck (skip check-module + simplify)
  - Skip PHASE 6 (/review) nếu QA pass
  - Ước lượng ~80–120k tokens thay vì ~165–280k
- `mô tả`: ngôn ngữ tự nhiên về domain

Examples:
- `flashcards Module flashcard học từ vựng có spaced repetition`
- `coupon admin Module mã giảm giá CRUD admin + public validate`
- `tags --lite Module tag CRUD đơn giản cho admin`
- `report be-only --lite Module báo cáo backend chỉ list endpoint`

Parse:
- Token 1 = module name
- Các token tiếp theo: nếu khớp {`full`, `admin`, `be-only`} → scope. Nếu là `--lite` → bật lite mode. Ngược lại → bắt đầu phần mô tả.
- Phần còn lại = mô tả

Defaults: `scope=full`, `lite=false`.

---

## Tổng quan flow

```
PHASE 0    Discovery (optional, skip nếu --lite)
PHASE 0.5  Pre-load context bundle  → planning/<m>-context.md (đọc ref 1 lần dùng nhiều phase)
PHASE 1    Planning                 → /plan-new-module + /client-plan-module
                                      CHECKPOINT 1
PHASE 2    BE implementation        → /implement-new-module <m> be
                                      CHECKPOINT 2 (Prisma migrate manual)
PHASE 3    Admin implementation     → /implement-new-module <m> fe
                                      CHECKPOINT 3
PHASE 4    Client implementation    → /client-implement-module <m> (scope=full)
                                      CHECKPOINT 4
PHASE 5    QA sweep                 → subagent module-qa-runner (truyền --lite nếu bật)
                                      + auto-fix các issue đơn giản
PHASE 6    Final review             → /review (skip nếu --lite + QA pass)
                                      → summary + gợi ý commit
```

Mỗi CHECKPOINT là điểm dừng để user confirm bằng tay. Tuyệt đối **không skip checkpoint** trừ khi user nói rõ "auto-proceed".

---

## STEP 0 — Pre-flight check

Kiểm tra nhanh:

1. Module chưa tồn tại ở cả 3 nơi:
   - `be-base/src/modules/<module>/`
   - `fe-base-admin/src/modules/<module>/`
   - `client/src/modules/<module>/`

   Nếu **bất kỳ** nơi nào đã tồn tại:
   - Báo user
   - Hỏi: "Module này đã có ở `<paths>`. Bạn muốn (a) dừng, (b) tiếp tục và chỉ implement phần còn thiếu?"

2. Working tree git: check `git status` ngắn để cảnh báo nếu có uncommitted changes lớn:
   - Nếu >10 file đã M/A/D không liên quan → gợi ý user commit trước

3. In banner:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BUILD FULL MODULE
 Module : <module-name>
 Scope  : <full | admin | be-only>
 Domain : <mô tả>

 Flow sẽ chạy:
   1. /plan-new-module          (BE + Admin plan)
  <2. /client-plan-module>      <chỉ khi scope=full>
   3. CHECKPOINT — bạn review plan
   4. /implement-new-module be  (BE)
   5. Prisma migrate (manual)
   6. /implement-new-module fe  (Admin)
  <7. /client-implement-module> <chỉ khi scope=full>
   8. Agent module-qa-runner    (check + simplify + typecheck)
   9. Auto-fix các issue đơn giản
  10. /review hoặc /security-review
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Hỏi: **"Tiếp tục với flow này? (y/n)"** — chờ confirm.

---

## STEP 1 — PHASE 0: Discovery (nếu cần)

**Nếu `--lite` → SKIP toàn bộ phase này.**

Nếu mô tả mơ hồ, có nhiều cách tiếp cận, hoặc user chưa rõ trade-off:
- Gọi `/discuss-feature` để phân tích các phương án
- Sau khi user chọn hướng → ghi vào bộ nhớ ngắn rồi đi tiếp

Nếu mô tả đã rõ ràng → **skip** phase này.

Tiêu chí "rõ ràng": mô tả nêu được (a) entity chính, (b) ai dùng (admin/user/public), (c) hành động cốt lõi. Thiếu một trong ba → nên discovery.

---

## STEP 1.5 — PHASE 0.5: Pre-load context bundle 🔥

Mục đích: **đọc shared context 1 lần**, ghi vào file `planning/<module-name>-context.md`. Các skill ở PHASE 1–4 sau đó **đọc bundle này thay vì re-read source files** → tiết kiệm ~30–50k tokens.

### Quy trình

**1. Chọn reference module** (1 module gần domain nhất, không cần đọc nhiều):
- Content/CRUD nội dung → `blog`
- Account/user → `user`
- Key-value config → `config`
- B2B/relation → `merchant`
- (xem `be-base/src/modules/` để chọn)

**2. Đọc reference files** (đọc 1 lần, ngay tại context của orchestrator):
- `be-base/src/modules/<ref>/domain/entities/<ref>.entity.ts`
- `be-base/src/modules/<ref>/application/use-cases/create-<ref>.use-case.ts` *(1 file đủ — pattern lặp lại)*
- `be-base/src/modules/<ref>/presentation/admin/<ref>-admin.controller.ts`
- `be-base/src/modules/<ref>/infrastructure/repositories/prisma-<ref>.repository.ts`
- `fe-base-admin/src/modules/<ref>/services/<ref>.service.ts`
- `fe-base-admin/src/modules/<ref>/hooks/use<Ref>s.ts`
- `fe-base-admin/src/modules/<ref>/components/<Ref>Page.tsx`
- *(Chỉ thêm client nếu scope=full)*: `client/src/modules/<client-ref>/...` — pick `dashboard` cho list, `auth` cho form

**3. Đọc core docs cần thiết** (dựa mô tả):
- Auth/permission → `be-base/.claude/modules/core-authorization.md`
- Admin shell → `be-base/.claude/modules/core-admin-shell.md`
- Events/queue → `be-base/.claude/modules/core-events.md`, `core-queue.md`
- (Chỉ docs nào mô tả thực sự cần — không đọc all)

**4. Ghi bundle** vào `planning/<module-name>-context.md`:

```markdown
# CONTEXT BUNDLE — <module-name>

> Pre-loaded reference + core context. Các skill plan/implement đọc file này thay vì re-read source.

## Reference module: <ref-name>
- Domain: <1 câu>
- Lý do chọn: <1 câu>

### Entity pattern
- Extends: <BaseEntity hoặc class khác>
- Convention method: <vd markAsRead() thay vì setStatus()>
- Common fields: id, status enum, createdAt, updatedAt

### Use-case pattern
- Decorator: @Injectable()
- Return type: Result<T, E> cho operations có thể fail; plain return cho không-fail
- Inject: Repository qua Symbol (KHÔNG inject Prisma trực tiếp)
- Domain event: emit sau save thành công (nếu cần)

### Controller pattern
- Admin: @UseGuards(AdminAuthGuard) + @RequirePermission(resource, action)
- Public: @Public() + @Throttle nếu cần
- **Static routes TRƯỚC param routes** (BẮT BUỘC)
- Resource key cũng phải thêm vào ADMIN_NAV_RESOURCES

### Prisma repository pattern
- Implements Repository interface (qua Symbol token)
- Dùng Mapper.toDomain() / toPrisma()
- KHÔNG export Prisma model ra domain layer

### FE service pattern
- 1 function / 1 endpoint
- Gọi qua apiClient từ `lib/api-client/`
- Trả về `ApiResponse<T>` / plain data (đọc service mẫu để xác định)

### FE hooks pattern
- useQuery có queryKey từ `QUERY_KEYS.<MODULE>.*`
- useMutation: invalidateQueries + toast.success/error trong onSuccess/onError

### FE component pattern
- shadcn/ui từ `@shared/components/ui`
- Form: React Hook Form + Zod
- Mọi text dùng `useTranslation()`

## Core conventions cần nhớ
- BE: clean architecture 4 layers (domain → application → infrastructure → presentation)
- BE: domain entity zero NestJS/Prisma imports
- FE-admin: lazy import route trong router.tsx + ROUTES + QUERY_KEYS + i18n vi+en
<!-- Client (chỉ khi scope=full): -->
- Client: 'use client' trong components/ và hooks/; page.tsx là server component
- Client: Next.js App Router (không react-router-dom); useRouter từ next/navigation

## Core docs đã consult
- <list path các doc đã đọc, ko paste nội dung>

## Files modify quan trọng (cross-cutting)
- be-base/src/app.module.ts (import module)
- be-base/src/core/auth/presentation/http/auth.controller.ts (ADMIN_NAV_RESOURCES nếu có nav)
- fe-base-admin/src/app/router.tsx + config/routes.ts + shared/constants/index.ts
<!-- Client: client/src/config/routes.ts + shared/constants/index.ts + shared/layouts/AppLayout.tsx -->
```

Bundle **phải <3k tokens**. Không paste source code — chỉ patterns + rules.

### Thông báo cho user

```
Context bundle đã sẵn sàng: planning/<module-name>-context.md (~<size>k tokens)
Các phase sau sẽ đọc bundle này thay vì re-read reference → tiết kiệm ~30–50k tokens.
```

---

## STEP 2 — PHASE 1: Planning

### 2a. BE + Admin plan

Gọi skill: `/plan-new-module <module-name> <mô tả>`

**Quan trọng — inject hint vào prompt khi gọi**:
```
/plan-new-module <module-name> <mô tả>

CONTEXT BUNDLE đã có sẵn tại `planning/<module-name>-context.md`.
Hãy đọc bundle này TRƯỚC, KHÔNG re-read reference module source.
<Nếu --lite:> Dùng COMPACT plan format (bỏ UX notes / effort estimate / checklist tổng).
```

Skill này sẽ:
- Đọc bundle (skip STEP 3 re-read reference)
- Tạo file `planning/<module-name>.md`
- In plan
- Dừng

Verify: file `planning/<module-name>.md` đã được tạo.

### 2b. Client plan (chỉ khi scope=`full`)

Gọi skill: `/client-plan-module <module-name> <mô tả>`

**Quan trọng — inject context vào prompt**:
```
/client-plan-module <module-name> <mô tả>

CONTEXT BUNDLE: planning/<module-name>-context.md (đọc trước, skip re-read reference).
BE PLAN đã có: planning/<module-name>.md — đọc phần "API Routes" để biết endpoints client phải dùng.
<Nếu --lite:> COMPACT format (bỏ UX notes / effort estimate / checklist tổng).
```

### 2c. CHECKPOINT 1

In ra:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CHECKPOINT 1 — Plan đã sẵn sàng
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Files đã tạo:
  - planning/<module-name>.md           (BE + Admin)
  <- planning/<module-name>-client.md   (Client)>

Vui lòng review và điều chỉnh plan nếu cần.
Khi sẵn sàng, trả lời:
  - "ok" / "tiếp" — proceed sang implementation
  - "sửa <X>" — tao sẽ regenerate phần đó
  - "dừng" — abort flow

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**DỪNG** và chờ user. Không tự ý đi tiếp.

---

## STEP 3 — PHASE 2: BE implementation

Gọi skill: `/implement-new-module <module-name> be`

**Inject context bundle hint**:
```
/implement-new-module <module-name> be

CONTEXT BUNDLE: planning/<module-name>-context.md đã có. Đọc bundle, KHÔNG re-read reference module.
```

Skill sẽ:
- Đọc plan + bundle (skip STEP 4 re-read source)
- Implement BE layer by layer
- In Prisma schema snippet ở cuối + lệnh migrate

Sau khi skill chạy xong:

### CHECKPOINT 2a — Prisma migrate

In ra (đã được skill in, nhưng nhắc lại rõ ràng):

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CHECKPOINT 2 — Cần action thủ công
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Mở be-base/prisma/schema.prisma
2. Paste snippet Prisma từ output ở trên
3. Chạy migrate:
     cd be-base && npx prisma migrate dev --name add-<module-name>-module
4. Verify BE start OK:
     cd be-base && npm run start:dev
   → Xem log có lỗi seedRoles / module init không

Khi xong, trả lời "ok migrate" để tiếp tục.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**DỪNG** chờ user confirm migrate đã chạy thành công.

Lý do tách checkpoint riêng cho Prisma: migration là **destructive operation** trên DB local, không nên tự chạy.

---

## STEP 4 — PHASE 3: Admin implementation

Gọi skill: `/implement-new-module <module-name> fe`

**Inject context bundle hint** (giống PHASE 2).

Skill sẽ implement fe-base-admin (types/service/hooks/components/router/i18n).

Sau khi xong, chạy nhanh typecheck (nếu fe-base-admin có script):
```bash
cd fe-base-admin && npm run type-check 2>&1 | tail -30
```

(Nếu không có `type-check`, dùng `npx tsc --noEmit`.)

### CHECKPOINT 3

In ra:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CHECKPOINT 3 — Admin đã implement
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Typecheck: <PASS / FAIL>
<nếu FAIL: list lỗi chính>

Tiếp theo: <Client implementation | QA phase nếu scope != full>

Trả lời "tiếp" để proceed, hoặc "fix" nếu muốn xử lý lỗi trước.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Nếu scope là `be-only` hoặc `admin` → bỏ qua PHASE 4, nhảy thẳng PHASE 5.

---

## STEP 5 — PHASE 4: Client implementation (chỉ khi scope=full)

Gọi skill: `/client-implement-module <module-name>`

**Inject context bundle hint** (giống PHASE 2).

Skill sẽ implement module trong `client/` (types/service/hooks/components/route/i18n).

Sau khi xong:
```bash
cd client && npm run type-check 2>&1 | tail -30
```

### CHECKPOINT 4

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CHECKPOINT 4 — Client đã implement
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Typecheck: <PASS / FAIL>
<list lỗi nếu fail>

Đề xuất verify UI:
  cd client && npm run dev
  → http://localhost:3000/<module-name>

Trả lời "tiếp" để chạy QA sweep, hoặc "fix" để xử lý lỗi.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## STEP 6 — PHASE 5: QA sweep

Spawn subagent `module-qa-runner` để chạy toàn bộ QA trong context riêng:

Dùng tool Agent với:
- `subagent_type: "module-qa-runner"`
- `description`: "QA sweep cho module <module-name>"
- `prompt`: cung cấp module name, scope, danh sách file đã thay đổi (từ git status), tóm tắt context — đủ để subagent chạy độc lập

Prompt mẫu cho subagent:
```
Chạy QA sweep cho module mới: <module-name>

Scope cần check:
- be: be-base/src/modules/<module-name>/
- fe: fe-base-admin/src/modules/<module-name>/
<- client: client/src/modules/<module-name>/>  <chỉ khi scope=full>

Mode: <"lite" nếu --lite | "full" mặc định>

Yêu cầu (xem agent definition cho chi tiết):
1. Architecture check
2. Simplify review (SKIP nếu lite hoặc module nhỏ <10 files)
3. Build/typecheck từng project
4. Trả report theo format trong agent definition

File changed list (từ git status): <paste git status output>
```

Sau khi subagent trả report:

### Auto-fix attempt

Đọc report. Phân loại issue:

**Có thể auto-fix** (làm ngay, không hỏi):
- Missing `'use client'` directive → add
- Wrong import path (relative thay vì alias) → đổi sang alias
- Missing i18n key trong en.json (đã có ở vi.json) → mirror sang
- TypeScript lỗi rõ (missing type import, wrong field name)

**Không auto-fix** (gắn cờ, hỏi user):
- Architecture violation cần thiết kế lại (vd entity import Prisma)
- Logic / business rule issue
- Lỗi build do thiếu env / Prisma client chưa generate

Sau khi fix xong nhóm auto-fix → re-run typecheck nhanh để confirm.

### CHECKPOINT 5

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CHECKPOINT 5 — QA report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QA tổng: <PASS | WARN | FAIL>

Đã auto-fix:
  - <file>: <issue>
  ...

Cần action thủ công:
  1. <issue>
  2. ...

Trả lời:
  - "tiếp" — chuyển sang review cuối
  - "fix <số>" — tao sẽ fix issue đó

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## STEP 7 — PHASE 6: Final review

**Nếu `--lite` AND QA pass → SKIP phase này.** Báo cho user:
```
Lite mode: skip /review vì QA pass. Nếu cần review chuyên sâu, chạy thủ công:
  /review     hoặc     /security-review
```

Ngược lại, gọi 1 trong 2:
- `/review` — code review tổng thể
- `/security-review` — chỉ khi module có yếu tố nhạy cảm

Đề xuất tự động dựa trên nội dung plan (CHẶT để tránh chạy oan):
- Mô tả/plan có "auth", "permission", "password", "payment", "upload", "PII" → security-review
- User có thể override bằng flag `--security` trong arguments
- Mặc định còn lại → `/review`

Sau khi review chạy xong, in summary cuối cùng:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BUILD FULL MODULE — HOÀN THÀNH
 Module : <module-name>
 Scope  : <scope>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Layers đã tạo:
  ✓ BE (be-base/src/modules/<module>/)         — <N> files
  ✓ Admin (fe-base-admin/src/modules/<module>/) — <N> files
  <✓ Client (client/src/modules/<module>/)     — <N> files>

Module docs:
  ✓ be-base/.claude/modules/<module>.md
  ✓ fe-base-admin/.claude/modules/<module>.md
  <✓ client/.claude/modules/<module>.md>

QA:
  ✓ Architecture check pass
  ✓ Build / typecheck pass
  Review notes: <X mục cần xem lại — xem output /review ở trên>

Commit gợi ý:
  feat(module): Add <module-name> module — <mô tả ngắn>

  - BE: CRUD admin + <public routes nếu có>
  - Admin: <module list page + form>
  <- Client: <module page>>

Steps tiếp theo:
  1. Verify thủ công các flow chính (admin tạo/sửa/xóa, <client view nếu có>)
  2. Khi sẵn sàng: git add . && git commit -m "..."
  3. /ultrareview để review chuyên sâu trước khi tạo PR

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Không tự commit** — để user quyết định.

---

## Skill này KHÔNG được:

- Tự chạy `git commit`, `git push` — destructive, user phải quyết định
- Tự chạy `prisma migrate` — destructive với DB local
- Skip CHECKPOINT trừ khi user nói rõ "auto-proceed all"
- Implement code mới ngoài 4 skill orchestrate — mọi code đi qua skill chuyên dụng
- Đọc toàn bộ source codebase — context đã được phân tải qua các skill con

## Skill này NÊN:

- Giữ context chính nhẹ — dùng subagent cho QA, dùng skill con cho implement
- Print summary ngắn gọn sau mỗi phase
- Detect early khi user nói "skip QA" hoặc "không cần client" → bỏ phase tương ứng
- Khi gặp lỗi không tự xử được → dừng + báo user, không retry mù
