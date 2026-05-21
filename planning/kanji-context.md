# CONTEXT BUNDLE — kanji

> Pre-loaded reference + core context. Các skill plan/implement đọc file này thay vì re-read source.

## Reference module: `dictionary`
- **Domain**: Kho từ vựng tiếng Nhật do staff/cộng đồng đóng góp, có admin CRUD + public read + user submit, kèm workflow moderation (pending/approved/rejected).
- **Lý do chọn**: Pattern gần kanji nhất — content data với 3 presentation (admin CRUD + public search + user-scoped), filter theo JLPT level, search full-text. Khác biệt chính của kanji: data tĩnh hơn (chủ yếu admin maintain), thêm user-scoped progress (status/mastery per kanji per user) → pattern này lấy thêm từ `flashcard` module.

### BE Entity pattern
- Extends: `BaseEntity<EntryIdVO>` từ `src/shared/domain/base-entity`
- Constructor: `private`, expose `static create()` (factory) + `static reconstitute()` (rehydrate từ Prisma)
- Props lưu trong 1 object `private props`, expose qua getters
- Convention method: hành động domain (`approve()`, `reject()`, `update()`) — KHÔNG dùng setter trực tiếp
- Common fields: id (VO), enum status, isPublic flag, creatorId/staffAuthorId/verifiedBy, createdAt, updatedAt
- Zero imports từ NestJS / Prisma / class-validator

### BE Use-case pattern
- `@Injectable()` class với `execute(input)` method
- Inject Repository qua Symbol token: `@Inject(DICTIONARY_REPOSITORY) private repo: IDictionaryRepository`
- Return `Result<T, E>` (union `{ok:true, value} | {ok:false, error}`) khi có thể fail; plain object/void nếu không fail
- Emit domain event sau save thành công (nếu cần): `@Inject(DOMAIN_EVENT_BUS) private events`
- File 1 use-case = 1 hành động (create/update/delete/get/search/moderate/list-pending)

### BE Controller pattern
- `@Controller('admin/<resource>')` + `@UseGuards(AdminAuthGuard)` + `@RequirePermission(resource, action)` cho admin routes
- `@Public()` cho public routes; `@UseGuards(UserPermissionGuard)` + `@Permission()` cho user routes
- **Route ordering BẮT BUỘC**: static routes (`GET /pending`) khai báo TRƯỚC param routes (`GET /:id`)
- DTOs đặt trong file controller (inline class với `@ApiProperty` + class-validator), helper `mapEntry()` cũng inline
- Pagination: `@Paginate() query: PaginateQuery` + `parsePage()` + `buildPaginated()` từ `shared/application/paginate`
- Trả response: `{ success: true, data?, ...extras }` — KHÔNG dùng `ApiResponse<T>` wrapper class

### BE Prisma repository pattern
- `implements I<Resource>Repository`
- Inject `PrismaService`
- Dùng `Mapper.toDomain()` / `Mapper.toPrisma()` để chuyển đổi
- `save()` dùng upsert pattern (check `findById` trước, hoặc Prisma `upsert`)
- KHÔNG export Prisma model ra ngoài infrastructure

### BE Module registration
- File `<module>.module.ts`:
  - Providers: bind repository symbol → Prisma impl; declare use-cases; `{ provide: ADMIN_FEATURE, useValue: MyFeature, multi: true }`
  - `onModuleInit()`: seed roles qua `AuthorizationService` (idempotent với upsert)
- Thêm import vào `src/app.module.ts`
- Thêm resource key vào `ADMIN_NAV_RESOURCES` ở `core/auth/presentation/http/auth.controller.ts` (dòng 59) nếu cần xuất hiện trên admin sidebar nav

### Admin Feature pattern
```ts
export const KanjiFeature: AdminFeature = {
  resource: 'kanji-management',
  controller: KanjiAdminController,
  permissions: ['read', 'create', 'update', 'delete'],
  menu: { label: 'Kanji', icon: 'book-text', order: 10 },
}
```

### FE-admin Service pattern
- 1 function / 1 endpoint, dùng `apiClient` từ `@lib/api-client`
- Response wrapper: `{ data } = await apiClient.get<{ success: true; data: T }>(url, { withCredentials: true })` → trả `data.data`
- List endpoint trả `DictionaryListResponse = { data: T[]; meta }` qua `NestjsPaginateParams` từ `@shared/components/ui/data-table`
- BẮT BUỘC `withCredentials: true` cho admin routes (cookie auth)

### FE-admin Hook pattern
- Query key dạng `['<module>', '<scope>', ...args]` — array constant trong file hook (KHÔNG bắt buộc đẩy vào `QUERY_KEYS` global)
- `useQuery` có `placeholderData: keepPreviousData` cho list
- `useMutation` có `onSuccess` invalidate cả LIST + DETAIL + PENDING keys

### FE-admin Component pattern
- shadcn/ui từ `@shared/components/ui` (Dialog, ConfirmDialog, DataTable, Button, ...)
- Form: React Hook Form + Zod resolver
- Toast: `toast.success/error` từ `sonner` (KHÔNG dùng `window.alert`)
- Confirm: `<ConfirmDialog>` (KHÔNG dùng `window.confirm`)
- Mọi text user-facing dùng `useTranslation()`

### Client (Next.js) — reference cho scope=full
- Module mẫu gần nhất: `flashcards` (user-scoped + session state) + `mockTest` (multi-view: select/in-progress/result)
- `'use client'` ở mọi file trong `components/` và `hooks/`; `page.tsx` là server component
- Routing: `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`) — KHÔNG dùng react-router-dom
- Module barrel `index.ts` export public API; KHÔNG import sâu vào nội bộ
- Service dùng `apiClient` từ `@lib/api-client`
- Query key từ `QUERY_KEYS.<MODULE>` trong `src/shared/constants/index.ts`
- Route group: `(learning)` cho kanji (full-screen learning, không sidebar `AppLayout`)
- Plan client đã sẵn tại: `planning/kanji-client.md` (đã review)

## Core conventions cần nhớ

### BE
- Clean architecture 4 layers: `domain → application → infrastructure → presentation` (1 chiều)
- Domain entity: zero NestJS/Prisma/validator imports
- `AuthorizationModule`, `EventsModule`, `QueueModule` đều `@Global()` — không cần import lại
- `PermissionCache.clear()` BẮT BUỘC sau mọi mutation roles/permissions
- Pagination: dùng `nestjs-paginate` (`@Paginate()`, `parsePage`, `buildPaginated`), KHÔNG tự parse tay

### FE-admin
- Lazy import route trong `src/app/router.tsx` + thêm vào `src/config/routes.ts`
- i18n keys cần có ở cả `shared/i18n/locales/vi.json` + `en.json`

### Client (Next.js 16)
- Next.js 16 breaking: `params` là `Promise` trong server component → `const { id } = await params`
- `next/navigation` cho navigation; `<Link>` cho links
- Furigana HTML từ BE BẮT BUỘC sanitize trước khi render qua `dangerouslySetInnerHTML`

## Core docs đã consult
- `be-base/.claude/CLAUDE.md` (architecture, pagination, RBAC, key rules)
- `be-base/.claude/modules/dictionary.md` (reference module — gần nhất)
- `fe-base-admin/.claude/CLAUDE.md` (structure, rules, QUERY_KEYS, naming)
- `client/.claude/CLAUDE.md` + `client/AGENTS.md` (Next.js 16 lưu ý)
- `planning/kanji-client.md` (client plan đã có sẵn, sẽ tái sử dụng)

## Files modify quan trọng (cross-cutting)

### BE
- `be-base/src/app.module.ts` (import `KanjiModule`)
- `be-base/src/core/auth/presentation/http/auth.controller.ts` dòng 59 (`ADMIN_NAV_RESOURCES` → thêm `'kanji-management'`)
- `be-base/prisma/schema.prisma` (thêm models `Kanji`, `KanjiRadical`, `KanjiUserProgress`, `KanjiWritingAttempt`, `KanjiQuizSession`, ...)

### FE-admin
- `fe-base-admin/src/app/router.tsx` (lazy import + route)
- `fe-base-admin/src/config/routes.ts` (`ROUTES.KANJI`)
- `fe-base-admin/src/shared/constants/index.ts` (tùy: query key constant — pattern dictionary không bắt buộc)
- `fe-base-admin/src/shared/i18n/locales/vi.json` + `en.json` (namespace `kanji`)

### Client (scope=full)
- `client/src/config/routes.ts` (`ROUTES.KANJI`, helpers `kanjiDetailPath(id)`, `kanjiWritePath(id)`, `KANJI_QUIZ`)
- `client/src/shared/constants/index.ts` (`QUERY_KEYS.KANJI`)
- `client/src/shared/i18n/locales/vi.json` + `en.json` (namespace `kanji`)
- KHÔNG đụng `AppLayout.tsx` (kanji thuộc `(learning)` group)

## Domain notes riêng cho kanji (so với dictionary)

Khác biệt cần plan thêm:
1. **Static content lớn (~2.136 Jōyō)** — admin chủ yếu update/seed, không workflow pending phức tạp như dictionary. Nhưng vẫn nên có `status: draft|published` để admin có thể chuẩn bị trước khi expose.
2. **User-scoped progress** (giống flashcard): `KanjiUserProgress` riêng với `status: known|learning|unseen`, `mastery: 0-100`, `lastReviewedAt`. Cần endpoint `/me/kanji/progress` + `PATCH /me/kanji/:id/status`.
3. **Writing attempt scoring** — Phase 1 có thể dùng heuristic đơn giản (số nét + thời gian); Phase 2 mới cần CV engine. Plan rõ điểm cắt này.
4. **Quiz session** — pattern giống flashcard session: state lưu BE qua `KanjiQuizSession`, FE chỉ giữ index hiện tại. Tham khảo flashcard session pattern.
5. **Stroke order data** — field `svgPaths: string[]` nullable; admin có thể không có sẵn → FE fallback hiển thị ký tự + số thứ tự.
6. **Furigana ví dụ** — BE phải sanitize HTML (`<ruby>`, `<rt>`, `<em>`, `<span class="highlight">` only) trước khi trả về.
