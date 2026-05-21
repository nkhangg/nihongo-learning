# NEW MODULE PLAN — kanji (Quản lý Kanji JLPT)

> **Ngày:** 18/05/2026

```
NEW MODULE PLAN
Module  : kanji
Domain  : Quản lý ~2.136 Jōyō Kanji với meta đầy đủ (readings, meanings, stroke order, examples, compounds, mnemonic) + user-scoped progress/mastery + luyện viết + quiz 3 mode
Scope   : BE (be-base) + FE (fe-base-admin) + Client (theo planning/kanji-client.md)
```

## Tóm tắt

Module `kanji` cung cấp 3 nhóm endpoint: **admin** (CRUD kanji + radicals, set published/draft), **public** (search/detail cho FE client + landing), **user-scoped /me** (status, mastery, writing attempt, quiz session). Domain có entity gốc `Kanji` với nhiều quan hệ 1-N (meanings/examples/compounds/similar) + entity user-scoped riêng (`KanjiUserProgress`, `KanjiWritingAttempt`, `KanjiQuizSession`/`Answer`). Có domain event `kanji.mastery_reached` khi user đạt mastery=100 → trigger notification + dashboard refresh.

Pattern theo `dictionary` (content + 3 layer presentation) kết hợp `flashcard` (user-scoped session). Plan client đã có ở `planning/kanji-client.md` — 10 endpoint client cần đã được phản ánh đầy đủ ở mục API Routes bên dưới.

---

## ━━ BACKEND (be-base) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Domain layer

Có 2 nhóm entity:
- **Catalog** (admin maintain): `Kanji`, `KanjiRadical`, và nested `KanjiMeaning`/`KanjiExample`/`KanjiCompound`/`KanjiSimilar`. `Kanji` là aggregate root, các nested entity gắn lifecycle theo nó.
- **User-scoped**: `KanjiUserProgress` (1 row / user / kanji, unique), `KanjiWritingAttempt`, `KanjiQuizSession` + `KanjiQuizAnswer`.

Trạng thái:
- `KanjiStatus`: `draft | published` (chỉ published mới expose public)
- `KanjiProgressStatus`: `unseen | learning | known`
- `KanjiQuizSessionStatus`: `in_progress | finished | abandoned`

Domain methods:
- `Kanji.publish()`, `Kanji.unpublish()`, `Kanji.update(props)`, `Kanji.replaceMeanings(meanings[])`, `Kanji.replaceExamples(...)`, `Kanji.replaceCompounds(...)`, `Kanji.replaceSimilar(...)`
- `KanjiUserProgress.markLearning()`, `markKnown()`, `recordReview(masteryDelta)` — bump `lastReviewedAt`; nếu mastery vừa đạt 100 → return event để use-case emit
- `KanjiQuizSession.recordAnswer({kanjiId, mode, isCorrect, xp})`, `finish()` — trả summary

Domain events:
- `KanjiMasteryReachedEvent { userId, kanjiId, kanjiChar, jlptLevel }` — emit khi `KanjiUserProgress.recordReview` đẩy mastery lên 100

Files to CREATE:
  - `be-base/src/modules/kanji/domain/entities/kanji.entity.ts` — aggregate root
  - `be-base/src/modules/kanji/domain/entities/kanji-radical.entity.ts`
  - `be-base/src/modules/kanji/domain/entities/kanji-user-progress.entity.ts`
  - `be-base/src/modules/kanji/domain/entities/kanji-writing-attempt.entity.ts`
  - `be-base/src/modules/kanji/domain/entities/kanji-quiz-session.entity.ts` (kèm `KanjiQuizAnswer` value object inline)
  - `be-base/src/modules/kanji/domain/value-objects/kanji-id.vo.ts`
  - `be-base/src/modules/kanji/domain/value-objects/kanji-radical-id.vo.ts`
  - `be-base/src/modules/kanji/domain/value-objects/jlpt-level.vo.ts` (enum-like, validate N1-N5)
  - `be-base/src/modules/kanji/domain/repositories/kanji.repository.ts` (`KANJI_REPOSITORY` symbol)
  - `be-base/src/modules/kanji/domain/repositories/kanji-radical.repository.ts` (`KANJI_RADICAL_REPOSITORY` symbol)
  - `be-base/src/modules/kanji/domain/repositories/kanji-user-progress.repository.ts` (`KANJI_USER_PROGRESS_REPOSITORY` symbol)
  - `be-base/src/modules/kanji/domain/repositories/kanji-writing-attempt.repository.ts` (`KANJI_WRITING_ATTEMPT_REPOSITORY` symbol)
  - `be-base/src/modules/kanji/domain/repositories/kanji-quiz-session.repository.ts` (`KANJI_QUIZ_SESSION_REPOSITORY` symbol)
  - `be-base/src/modules/kanji/domain/events/kanji-mastery-reached.event.ts`
  - `be-base/src/modules/kanji/domain/services/writing-scorer.ts` — interface `IWritingScorer.score(strokes, kanji)` trả `WritingScore`
  - `be-base/src/modules/kanji/domain/services/quiz-question-generator.ts` — interface `IQuizQuestionGenerator.generate(config)` trả `KanjiQuizQuestion[]`

### Application layer

Use-cases được nhóm theo audience:

**Admin (catalog management)**
- `CreateKanjiUseCase` — input: char + meta + nested arrays; tạo draft mặc định
- `UpdateKanjiUseCase` — patch meta, replace nested arrays
- `DeleteKanjiUseCase` — cascade theo Prisma
- `GetKanjiUseCase` — full include nested
- `ListKanjiAdminUseCase` — filter level/status/radical/search, paginate
- `PublishKanjiUseCase`, `UnpublishKanjiUseCase`
- `CreateKanjiRadicalUseCase`, `UpdateKanjiRadicalUseCase`, `DeleteKanjiRadicalUseCase`, `ListKanjiRadicalsUseCase`

**Public**
- `SearchKanjiPublicUseCase` — chỉ published; filter level/status (user-scoped phải pass userId? KHÔNG — public dùng query level/radical/strokes/search)
- `GetKanjiPublicUseCase` — chỉ published, include nested + similar
- `ListRadicalsPublicUseCase`

**User-scoped /me**
- `GetMyKanjiProgressSummaryUseCase` — counts by level + total mastery
- `ListMyKanjiUseCase` — kanji list kèm user progress (cho FE client browser merge status)
- `UpdateKanjiStatusUseCase` — set known/learning/unseen
- `SubmitWritingAttemptUseCase` — inject `IWritingScorer`, lưu attempt, tăng mastery, emit `KanjiMasteryReachedEvent` nếu đạt 100
- `GetMyWritingQueueUseCase` — kanji đang `learning` của user, optional filter level
- `StartKanjiQuizUseCase` — inject `IQuizQuestionGenerator`, tạo session + return questions
- `SubmitKanjiQuizAnswerUseCase` — record answer, trả `{ correct, xpEarned, explanation }`, nếu correct → tăng mastery (có thể emit event)
- `FinishKanjiQuizUseCase` — set status=finished, tính summary (correct/wrong/accuracy/xp/mistakes)

Files to CREATE: 18 use-case files trong `application/use-cases/`.

### Infrastructure layer

Files to CREATE:
  - `infrastructure/repositories/prisma-kanji.repository.ts` — implements `IKanjiRepository`; dùng `include` cho nested khi `findById` detail
  - `infrastructure/repositories/in-memory-kanji.repository.ts`
  - `infrastructure/repositories/prisma-kanji-radical.repository.ts`
  - `infrastructure/repositories/in-memory-kanji-radical.repository.ts`
  - `infrastructure/repositories/prisma-kanji-user-progress.repository.ts`
  - `infrastructure/repositories/in-memory-kanji-user-progress.repository.ts`
  - `infrastructure/repositories/prisma-kanji-writing-attempt.repository.ts`
  - `infrastructure/repositories/in-memory-kanji-writing-attempt.repository.ts`
  - `infrastructure/repositories/prisma-kanji-quiz-session.repository.ts`
  - `infrastructure/repositories/in-memory-kanji-quiz-session.repository.ts`
  - `infrastructure/mappers/kanji.mapper.ts` — bao gồm helper cho nested arrays (Prisma model với `include` ↔ domain)
  - `infrastructure/mappers/kanji-radical.mapper.ts`
  - `infrastructure/mappers/kanji-user-progress.mapper.ts`
  - `infrastructure/mappers/kanji-writing-attempt.mapper.ts`
  - `infrastructure/mappers/kanji-quiz-session.mapper.ts`
  - `infrastructure/services/heuristic-writing-scorer.ts` — implements `IWritingScorer`, chấm điểm dựa trên số nét + thời gian + bounding box (Phase 1, đánh dấu rõ "heuristic")
  - `infrastructure/services/random-quiz-question-generator.ts` — implements `IQuizQuestionGenerator`, lấy ngẫu nhiên kanji theo level/mode

### Presentation layer

Files to CREATE:
  - `presentation/admin/kanji-admin.controller.ts` — `@Controller('admin/kanji')`, AdminAuthGuard, các route CRUD kanji + radicals (radicals đặt sub-route `/admin/kanji/radicals` — static, đặt TRƯỚC `/:id`)
  - `presentation/admin/kanji-admin.feature.ts` — `AdminFeature` config: resource `'kanji-management'`, menu label "Kanji", icon `'book-text'`, order 10
  - `presentation/public/kanji-public.controller.ts` — `@Controller('kanji')`, `@Public()`, search + detail + radicals list
  - `presentation/user/kanji-user.controller.ts` — `@Controller('me/kanji')`, `@UseGuards(UserAuthGuard)`, progress + status + writing + quiz routes
  - `presentation/dtos/` — DTOs inline trong từng controller (theo pattern dictionary), không tách file riêng

Files to MODIFY:
  - `be-base/src/app.module.ts` — import `KanjiModule`
  - `be-base/src/core/auth/presentation/http/auth.controller.ts` dòng 59 — thêm `'kanji-management'` vào `ADMIN_NAV_RESOURCES`

### Module file

Files to CREATE:
  - `be-base/src/modules/kanji/kanji.module.ts`:
    - Providers: bind 5 REPOSITORY symbols → Prisma impl
    - Providers: bind `IWritingScorer` → `HeuristicWritingScorer`; `IQuizQuestionGenerator` → `RandomQuizQuestionGenerator`
    - Providers: 18 use-cases + 3 controllers
    - `{ provide: ADMIN_FEATURE, useValue: KanjiFeature, multi: true }`
    - Imports: `EventsModule` (để publish mastery event)
    - `onModuleInit()`: seed roles `kanji-editor` / `kanji-viewer` với `upsert` qua `AuthorizationService`

---

## API Routes (BE)

### Admin (`/admin/kanji`) — AdminAuthGuard + @RequirePermission
| Method | Path | Use-case | Permission |
|---|---|---|---|
| GET | `/admin/kanji/radicals` | ListKanjiRadicalsUseCase | read |
| POST | `/admin/kanji/radicals` | CreateKanjiRadicalUseCase | create |
| PATCH | `/admin/kanji/radicals/:id` | UpdateKanjiRadicalUseCase | update |
| DELETE | `/admin/kanji/radicals/:id` | DeleteKanjiRadicalUseCase | delete |
| GET | `/admin/kanji` | ListKanjiAdminUseCase | read |
| POST | `/admin/kanji` | CreateKanjiUseCase | create |
| GET | `/admin/kanji/:id` | GetKanjiUseCase | read |
| PATCH | `/admin/kanji/:id` | UpdateKanjiUseCase | update |
| DELETE | `/admin/kanji/:id` | DeleteKanjiUseCase | delete |
| POST | `/admin/kanji/:id/publish` | PublishKanjiUseCase | publish |
| POST | `/admin/kanji/:id/unpublish` | UnpublishKanjiUseCase | publish |

⚠️ Route ordering: `/admin/kanji/radicals*` BẮT BUỘC khai báo trước `/admin/kanji/:id`.

### Public (`/kanji`) — @Public
| Method | Path | Use-case | Mô tả |
|---|---|---|---|
| GET | `/kanji/radicals` | ListRadicalsPublicUseCase | List radicals cho filter chip |
| GET | `/kanji` | SearchKanjiPublicUseCase | Search/filter (level, status, strokes range, radical, q) — chỉ published, paginate |
| GET | `/kanji/:id` | GetKanjiPublicUseCase | Detail (nested + similar) — chỉ published |

### User-scoped (`/me/kanji`) — UserAuthGuard
| Method | Path | Use-case | Mô tả |
|---|---|---|---|
| GET | `/me/kanji/progress` | GetMyKanjiProgressSummaryUseCase | Summary: total/known/learning/unseen + breakdown N5-N1 |
| GET | `/me/kanji` | ListMyKanjiUseCase | Kanji list kèm user status (override SearchKanji với progress merge) |
| PATCH | `/me/kanji/:id/status` | UpdateKanjiStatusUseCase | Body: `{ status: 'known' \| 'learning' \| 'unseen' }` |
| GET | `/me/kanji/writing-queue` | GetMyWritingQueueUseCase | Query: `level?` — kanji đang learning |
| POST | `/me/kanji/:id/writing-attempt` | SubmitWritingAttemptUseCase | Body: `{ strokes: [...], durationMs }` → `WritingScore` |
| POST | `/me/kanji/quiz/start` | StartKanjiQuizUseCase | Body: `{ level, mode, questionCount, livesEnabled }` → `{ sessionId, questions[] }` |
| POST | `/me/kanji/quiz/:sessionId/answer` | SubmitKanjiQuizAnswerUseCase | Body: `{ questionId, selectedOptionId?, writingAttempt? }` → `{ correct, xpEarned, explanation }` |
| POST | `/me/kanji/quiz/:sessionId/finish` | FinishKanjiQuizUseCase | → `KanjiQuizSummary` |

⚠️ Route ordering trong user controller: `/me/kanji/progress`, `/me/kanji/writing-queue`, `/me/kanji/quiz/*` đặt TRƯỚC `/me/kanji/:id/*`.

---

## Prisma schema (BE)

```prisma
enum JlptLevel {
  N5
  N4
  N3
  N2
  N1
}

enum KanjiStatus {
  DRAFT
  PUBLISHED
}

enum KanjiProgressStatus {
  UNSEEN
  LEARNING
  KNOWN
}

enum KanjiQuizMode {
  RECOGNITION
  MEANING_TO_KANJI
  WRITING
  MIXED
}

enum KanjiQuizSessionStatus {
  IN_PROGRESS
  FINISHED
  ABANDONED
}

model Kanji {
  id              String    @id @default(cuid())
  char            String    @unique
  jlptLevel       JlptLevel
  strokes         Int
  radicalId       String?
  frequency       Int?
  joyoOrder       Int?
  unicode         String
  onReadings      String[]
  kunReadings     String[]
  meaningVi       String
  meaningEn       String
  strokeOrderSvg  String[]   // SVG path strings; có thể empty
  mnemonicVi      String?
  status          KanjiStatus @default(DRAFT)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  radical         KanjiRadical? @relation(fields: [radicalId], references: [id], onDelete: SetNull)
  meanings        KanjiMeaning[]
  examples        KanjiExample[]
  compounds       KanjiCompound[]
  similarFrom     KanjiSimilar[] @relation("KanjiSimilarFrom")
  similarTo       KanjiSimilar[] @relation("KanjiSimilarTo")
  userProgress    KanjiUserProgress[]
  writingAttempts KanjiWritingAttempt[]
  quizAnswers     KanjiQuizAnswer[]

  @@index([jlptLevel, status])
  @@index([radicalId])
  @@map("kanjis")
}

model KanjiRadical {
  id          String   @id @default(cuid())
  char        String   @unique
  meaningVi   String
  strokes     Int
  isPopular   Boolean  @default(false)

  kanjis      Kanji[]

  @@map("kanji_radicals")
}

model KanjiMeaning {
  id          String   @id @default(cuid())
  kanjiId     String
  index       Int
  pos         String   // 'noun' | 'verb' | 'adj' | 'adv' | 'other'
  textVi      String
  jpExample   String?

  kanji       Kanji    @relation(fields: [kanjiId], references: [id], onDelete: Cascade)

  @@unique([kanjiId, index])
  @@map("kanji_meanings")
}

model KanjiExample {
  id          String   @id @default(cuid())
  kanjiId     String
  jpHtml      String   // sanitized: <ruby>, <rt>, <em>, <span class="highlight"> only
  vi          String
  source      String?

  kanji       Kanji    @relation(fields: [kanjiId], references: [id], onDelete: Cascade)

  @@index([kanjiId])
  @@map("kanji_examples")
}

model KanjiCompound {
  id          String   @id @default(cuid())
  kanjiId     String
  jp          String
  reading     String
  meaningVi   String

  kanji       Kanji    @relation(fields: [kanjiId], references: [id], onDelete: Cascade)

  @@index([kanjiId])
  @@map("kanji_compounds")
}

model KanjiSimilar {
  id              String   @id @default(cuid())
  kanjiId         String
  similarKanjiId  String
  reason          String

  kanji         Kanji    @relation("KanjiSimilarFrom", fields: [kanjiId], references: [id], onDelete: Cascade)
  similarKanji  Kanji    @relation("KanjiSimilarTo", fields: [similarKanjiId], references: [id], onDelete: Cascade)

  @@unique([kanjiId, similarKanjiId])
  @@map("kanji_similars")
}

model KanjiUserProgress {
  id              String   @id @default(cuid())
  userId          String
  kanjiId         String
  status          KanjiProgressStatus @default(UNSEEN)
  mastery         Int      @default(0)
  lastReviewedAt  DateTime?
  updatedAt       DateTime @updatedAt

  kanji           Kanji    @relation(fields: [kanjiId], references: [id], onDelete: Cascade)

  @@unique([userId, kanjiId])
  @@index([userId, status])
  @@map("kanji_user_progress")
}

model KanjiWritingAttempt {
  id              String   @id @default(cuid())
  userId          String
  kanjiId         String
  scoreOverall    Int
  scoreOrder      Int
  scoreSize       Int
  scoreDirection  Int
  scorePosition   Int
  durationMs      Int
  feedback        String?
  createdAt       DateTime @default(now())

  kanji           Kanji    @relation(fields: [kanjiId], references: [id], onDelete: Cascade)

  @@index([userId, kanjiId, createdAt])
  @@map("kanji_writing_attempts")
}

model KanjiQuizSession {
  id              String   @id @default(cuid())
  userId          String
  jlptLevel       JlptLevel
  mode            KanjiQuizMode
  questionCount   Int
  livesEnabled    Boolean  @default(false)
  status          KanjiQuizSessionStatus @default(IN_PROGRESS)
  startedAt       DateTime @default(now())
  finishedAt      DateTime?

  answers         KanjiQuizAnswer[]

  @@index([userId, status])
  @@map("kanji_quiz_sessions")
}

model KanjiQuizAnswer {
  id                String   @id @default(cuid())
  sessionId         String
  kanjiId           String
  mode              KanjiQuizMode
  isCorrect         Boolean
  selectedOptionId  String?
  xpEarned          Int      @default(0)
  createdAt         DateTime @default(now())

  session           KanjiQuizSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  kanji             Kanji            @relation(fields: [kanjiId], references: [id])

  @@index([sessionId])
  @@map("kanji_quiz_answers")
}
```

Migration name: `add-kanji-module`

---

## Seeded Roles

| Role | SubjectType | Permissions |
|---|---|---|
| `kanji-editor` | admin | `kanji-management` → read, create, update, delete, publish |
| `kanji-viewer` | admin | `kanji-management` → read |

Seed trong `KanjiModule.onModuleInit()` qua `AuthorizationService.upsertRole(...)`.

---

## Domain Events Published

- `kanji.mastery_reached` — payload: `{ userId, kanjiId, kanjiChar, jlptLevel }`. Emit khi `KanjiUserProgress.recordReview` đẩy mastery từ <100 lên 100. Handler (trong `IntegrationModule` hoặc bổ sung mới) → enqueue notification "Bạn vừa thuộc lòng kanji X! 🎉".

---

## ━━ FRONTEND (fe-base-admin) ━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Types

Files to CREATE:
  - `fe-base-admin/src/modules/kanji/types/index.ts` — `Kanji`, `KanjiListItem` (light), `KanjiDetail` (full + nested), `KanjiRadical`, `KanjiStatus`, `KanjiMeaning`, `KanjiExample`, `KanjiCompound`, `KanjiSimilarRef`, `JlptLevel`, `CreateKanjiDto`, `UpdateKanjiDto`, `CreateKanjiRadicalDto`, `UpdateKanjiRadicalDto`, `KanjiListResponse` (qua `NestjsPaginateParams`)

### Service

Files to CREATE:
  - `fe-base-admin/src/modules/kanji/services/kanji.service.ts`:
    - `list(params)` GET `/admin/kanji`
    - `getById(id)` GET `/admin/kanji/:id`
    - `create(dto)` POST `/admin/kanji`
    - `update(id, dto)` PATCH `/admin/kanji/:id`
    - `delete(id)` DELETE `/admin/kanji/:id`
    - `publish(id)` POST `/admin/kanji/:id/publish`
    - `unpublish(id)` POST `/admin/kanji/:id/unpublish`
  - `fe-base-admin/src/modules/kanji/services/kanji-radical.service.ts`:
    - `list()` GET `/admin/kanji/radicals`
    - `create(dto)`, `update(id, dto)`, `delete(id)` — `/admin/kanji/radicals[/:id]`

### Hooks

Files to CREATE:
  - `fe-base-admin/src/modules/kanji/hooks/useKanjis.ts`:
    - `useKanjiList(params)` — `useQuery`, key `['kanji', 'list', params]`, `placeholderData: keepPreviousData`
    - `useKanji(id)` — key `['kanji', 'entry', id]`, `enabled: !!id`
    - `useCreateKanji()`, `useUpdateKanji()`, `useDeleteKanji()` — invalidate LIST + ENTRY
    - `usePublishKanji()`, `useUnpublishKanji()` — invalidate cả LIST + ENTRY
  - `fe-base-admin/src/modules/kanji/hooks/useKanjiRadicals.ts`:
    - `useKanjiRadicals()`, `useCreateKanjiRadical()`, `useUpdateKanjiRadical()`, `useDeleteKanjiRadical()`

### Components

Files to CREATE:
  - `fe-base-admin/src/modules/kanji/components/KanjiPage.tsx` — DataTable + filter bar (level, status, radical, search)
  - `fe-base-admin/src/modules/kanji/components/KanjiFormModal.tsx` — Dialog với form lớn: char/level/strokes/radical/readings/meaningVi/meaningEn/mnemonic/status, tabs cho nested:
  - `fe-base-admin/src/modules/kanji/components/MeaningsEditor.tsx` — RHF `useFieldArray` cho nested meanings
  - `fe-base-admin/src/modules/kanji/components/ExamplesEditor.tsx` — useFieldArray cho examples (jpHtml + vi + source); cảnh báo user về HTML allowed tags
  - `fe-base-admin/src/modules/kanji/components/CompoundsEditor.tsx` — useFieldArray
  - `fe-base-admin/src/modules/kanji/components/SimilarKanjiEditor.tsx` — autocomplete chọn kanji + reason
  - `fe-base-admin/src/modules/kanji/components/StrokeOrderEditor.tsx` — textarea multiline cho `strokeOrderSvg[]`, mỗi dòng 1 SVG path; preview render đơn giản
  - `fe-base-admin/src/modules/kanji/components/KanjiRadicalsPage.tsx` — DataTable + modal CRUD radicals
  - `fe-base-admin/src/modules/kanji/components/KanjiRadicalFormModal.tsx` — Dialog form đơn giản

### Router & Navigation

Files to MODIFY:
  - `fe-base-admin/src/app/router.tsx` — 2 lazy routes `/kanji` (KanjiPage) và `/kanji/radicals` (KanjiRadicalsPage) trong AdminGuard group
  - `fe-base-admin/src/config/routes.ts` — `ROUTES.KANJI: '/kanji'`, `ROUTES.KANJI_RADICALS: '/kanji/radicals'`

### Module barrel

Files to CREATE:
  - `fe-base-admin/src/modules/kanji/index.ts` — export `KanjiPage`, `KanjiRadicalsPage` (lazy import qua router) + hooks public + types

### i18n

Thêm vào `vi.json` + `en.json` (mirror):
```json
"kanji": {
  "title": "Kanji",
  "radicalsTitle": "Bộ thủ Kanji",
  "actions": {
    "create": "Thêm Kanji",
    "edit": "Chỉnh sửa",
    "delete": "Xóa",
    "publish": "Xuất bản",
    "unpublish": "Hủy xuất bản",
    "manageRadicals": "Quản lý bộ thủ"
  },
  "fields": {
    "char": "Ký tự",
    "jlptLevel": "Cấp JLPT",
    "strokes": "Số nét",
    "radical": "Bộ thủ",
    "frequency": "Tần suất",
    "joyoOrder": "Thứ tự Jōyō",
    "unicode": "Unicode",
    "onReadings": "Âm On",
    "kunReadings": "Âm Kun",
    "meaningVi": "Nghĩa (VN)",
    "meaningEn": "Nghĩa (EN)",
    "mnemonic": "Mnemonic",
    "strokeOrderSvg": "Stroke order (SVG paths)",
    "meanings": "Các nghĩa",
    "examples": "Ví dụ",
    "compounds": "Từ ghép",
    "similar": "Kanji tương tự",
    "status": "Trạng thái"
  },
  "status": {
    "draft": "Nháp",
    "published": "Đã xuất bản"
  },
  "hints": {
    "exampleHtml": "Chỉ cho phép thẻ <ruby>, <rt>, <em>, <span class=\"highlight\">. Mọi HTML khác sẽ bị strip khi lưu.",
    "svgPath": "Mỗi dòng là 1 SVG path. Bỏ trống nếu chưa có dữ liệu."
  },
  "deleteConfirm": "Xóa kanji này sẽ xóa toàn bộ nested data (nghĩa, ví dụ, từ ghép, similar, progress của user)."
}
```

---

## UX notes (FE admin)

- Loading: skeleton DataTable khi `isLoading`
- Error: `toast.error()` từ Sonner
- Empty: "Chưa có kanji nào — bấm Thêm Kanji"
- Delete: `<ConfirmDialog>` với cảnh báo cascade (xóa cả progress của user)
- Form lớn: dùng `Tabs` (Meta / Readings / Stroke / Meanings / Examples / Compounds / Similar / Mnemonic) trong Dialog để dễ điều hướng
- HTML editor cho `jpHtml`: textarea + hint về allowed tags + helper button "Insert ruby" (Phase 2)
- Filter bar: level chips, status chips, radical autocomplete, search debounce 300ms

---

## Module docs cần tạo sau khi implement

Files to CREATE:
  - `be-base/.claude/modules/kanji.md` — Mục đích, Cấu trúc folder, API Routes (admin/public/user), Seeded Roles, Domain Events, Domain Model methods, Dependencies (EventsModule)
  - `fe-base-admin/.claude/modules/kanji.md` — Mục đích, Cấu trúc, Public API, Routes, API Endpoints, Query Keys, Gotchas (HTML sanitize, cascade delete, nested form)
  - `client/.claude/modules/kanji.md` — sẽ tạo trong PHASE 4 (đã có plan)

---

## Edge cases & risks

- **Bulk seeding 2.136 kanji**: KHÔNG fit vào single CreateUseCase. Đề xuất chuẩn bị script `prisma/seed-kanji.ts` (tách riêng, chạy thủ công khi cần) nguồn từ JSON file public domain (vd KANJIDIC2). Không trong scope module này, nhưng nên ghi chú TODO.
- **Furigana HTML XSS**: BE BẮT BUỘC sanitize `KanjiExample.jpHtml` bằng `sanitize-html` (whitelist `ruby`, `rt`, `em`, `span class="highlight"`) trước khi save. Nếu skip, dangerouslySetInnerHTML ở client là attack vector.
- **Cascade delete user data**: xóa 1 kanji sẽ xóa `KanjiUserProgress` của tất cả user — destructive. Cân nhắc soft-delete (set `status=DRAFT`) thay vì hard delete trong tương lai.
- **Quiz session abandonment**: nếu user start quiz rồi không finish, session `IN_PROGRESS` tích lũy. Cần job/cron đánh dấu `ABANDONED` sau X giờ (out of scope Phase 1 — chỉ ghi note).
- **Writing scorer heuristic Phase 1**: `HeuristicWritingScorer` chỉ chấm theo stroke count + duration → scoring rất thô. FE phải hiển thị disclaimer "demo scoring" cho đến khi có ML scorer.
- **Route ordering trap**: `/admin/kanji/radicals` và `/me/kanji/quiz/start` là static routes phải khai báo trước param routes — nếu lỡ NestJS sẽ parse `radicals`/`start` như `:id` và crash.
- **Listing performance**: 2.136 published kanji + filter + paginate cần `@@index([jlptLevel, status])` đã thêm. Nếu thêm filter theo strokes range thì cần thêm index `([strokes])`.
- **`ListMyKanjiUseCase` N+1**: phải JOIN `KanjiUserProgress` trong 1 query (Prisma `include` hoặc raw join), KHÔNG loop fetch progress từng kanji.
- **Domain event `mastery_reached` duplicate**: nếu `recordReview` được gọi 2 lần liên tiếp với mastery=100, event không được phép emit 2 lần. Logic phải check `oldMastery < 100 && newMastery >= 100`.

---

## Effort estimate

| Phần | Layer | Effort |
|---|---|---|
| BE | Domain (10+ entities/VOs/events/services) | High |
| BE | Application (18 use-cases) | High |
| BE | Infrastructure (5 Prisma repos + 5 in-memory + 5 mappers + 2 services) | High |
| BE | Presentation (3 controllers + AdminFeature + DTOs) | High |
| FE | Types + Service (2 services) | Med |
| FE | Hooks (2 hook files) | Med |
| FE | Components (8 components, có nested form lớn) | **High** |
| FE | Router + i18n | Low |
| **Tổng** | | **High** (lớn nhất so với modules đã có) |

---

## Checklist khi implement

### BE checklist
- [ ] Domain entities không import NestJS / Prisma / class-validator
- [ ] Tất cả import trong domain layer dùng relative path
- [ ] 5 repository interfaces có đầy đủ method (findById, save, delete, query methods cần)
- [ ] InMemory repos implement đúng interface để hỗ trợ unit test
- [ ] Prisma repos dùng mapper, không leak Prisma model ra ngoài
- [ ] DTOs đều có `@ApiProperty` / `@ApiPropertyOptional` + class-validator
- [ ] Admin routes có `@RequirePermission('kanji-management', '<action>')`
- [ ] Static routes `/radicals`, `/quiz/start`, `/quiz/:sessionId/answer`, `/quiz/:sessionId/finish`, `/progress`, `/writing-queue` khai báo TRƯỚC `/:id`
- [ ] `ADMIN_NAV_RESOURCES` cập nhật thêm `'kanji-management'`
- [ ] `KanjiModule` import vào `AppModule`
- [ ] `seedRoles()` trong `onModuleInit` dùng upsert
- [ ] `EventsModule` được import cho mastery event
- [ ] Prisma schema thêm 9 model + 5 enum + indexes + migration name `add-kanji-module`
- [ ] `KanjiExample.jpHtml` sanitize bằng `sanitize-html` ở use-case `CreateKanjiUseCase`/`UpdateKanjiUseCase` (whitelist `ruby`, `rt`, `em`, `span`)
- [ ] `HeuristicWritingScorer` có comment ghi rõ "Phase 1 — chấm thô"

### FE checklist
- [ ] Types match BE response chính xác
- [ ] Service function riêng cho mỗi endpoint, có `withCredentials: true`
- [ ] `useQuery` hooks có `placeholderData: keepPreviousData` cho list
- [ ] `useMutation` invalidate đúng keys (LIST + ENTRY) + toast success/error
- [ ] Form RHF + Zod cho cả KanjiFormModal lẫn RadicalFormModal
- [ ] `useFieldArray` cho meanings/examples/compounds/similar — không hardcode N field
- [ ] `<ConfirmDialog>` cho delete với cảnh báo cascade
- [ ] Tất cả text dùng `useTranslation('kanji')`, keys ở cả vi.json + en.json
- [ ] Route lazy load + thêm vào router.tsx + ROUTES constant
- [ ] Module export qua `index.ts`

### Sau khi implement
- [ ] `be-base/.claude/modules/kanji.md` — tạo module doc
- [ ] `fe-base-admin/.claude/modules/kanji.md` — tạo module doc

---

Để implement theo plan này:
  BE: `/implement-new-module kanji be`
  FE: `/implement-new-module kanji fe`
  Client: `/client-implement-module kanji`
  (Hoặc tiếp tục flow `/build-full-module` đã đang chạy.)
