# Module: modules/kanji

## Mục đích
Quản lý ~2.136 Jōyō Kanji với meta đầy đủ (readings, meanings, stroke order, examples, compounds, mnemonic) + user-scoped progress/mastery + luyện viết có chấm điểm + quiz 3 mode. Dữ liệu nguồn cho client `kanji` module và link tới từ flashcard / mock-test.

## Cấu trúc
```
modules/kanji/
├── domain/
│   ├── entities/
│   │   ├── kanji.entity.ts                    # Aggregate root: meta + nested (meanings/examples/compounds/similar)
│   │   ├── kanji-radical.entity.ts            # Bộ thủ
│   │   ├── kanji-user-progress.entity.ts      # User-scoped status/mastery (recordReview returns masteryJustReached100)
│   │   ├── kanji-writing-attempt.entity.ts    # Lưu lần luyện viết + 4 score criteria
│   │   └── kanji-quiz-session.entity.ts       # Quiz session + answers value objects
│   ├── value-objects/
│   │   ├── kanji-id.vo.ts
│   │   ├── kanji-radical-id.vo.ts
│   │   └── jlpt-level.vo.ts                   # Type alias + JLPT_LEVELS array + isJlptLevel guard
│   ├── repositories/
│   │   ├── kanji.repository.ts                # KANJI_REPOSITORY symbol
│   │   ├── kanji-radical.repository.ts        # KANJI_RADICAL_REPOSITORY
│   │   ├── kanji-user-progress.repository.ts  # KANJI_USER_PROGRESS_REPOSITORY + getSummary, pickLearningKanjiIds
│   │   ├── kanji-writing-attempt.repository.ts# KANJI_WRITING_ATTEMPT_REPOSITORY
│   │   └── kanji-quiz-session.repository.ts   # KANJI_QUIZ_SESSION_REPOSITORY
│   ├── events/
│   │   └── kanji-mastery-reached.event.ts     # 'kanji.mastery_reached' — emit khi mastery vừa lên 100
│   └── services/
│       ├── writing-scorer.ts                  # IWritingScorer interface — abstract scoring
│       └── quiz-question-generator.ts         # IQuizQuestionGenerator interface
│
├── application/
│   ├── services/
│   │   └── sanitize-example-html.ts           # sanitize-html whitelist: <ruby>, <rt>, <em>, <span class="highlight">
│   └── use-cases/                             # 20 use cases
│       ├── create-kanji.use-case.ts           # validate char unique, sanitize examples
│       ├── update-kanji.use-case.ts           # patch + replace nested arrays + re-sanitize examples
│       ├── delete-kanji.use-case.ts
│       ├── get-kanji.use-case.ts
│       ├── list-kanji-admin.use-case.ts       # filter level/status/radical/strokes/search + paginate
│       ├── publish-kanji.use-case.ts
│       ├── unpublish-kanji.use-case.ts
│       ├── create-kanji-radical.use-case.ts
│       ├── update-kanji-radical.use-case.ts
│       ├── delete-kanji-radical.use-case.ts
│       ├── list-kanji-radicals.use-case.ts
│       ├── search-kanji-public.use-case.ts    # publishedOnly: true
│       ├── get-kanji-public.use-case.ts       # 404 nếu draft
│       ├── get-my-kanji-progress-summary.use-case.ts
│       ├── list-my-kanji.use-case.ts          # batch fetch progress, merge in app layer (no N+1)
│       ├── update-kanji-status.use-case.ts    # upsert progress
│       ├── get-my-writing-queue.use-case.ts   # kanji đang learning, oldest first
│       ├── submit-writing-attempt.use-case.ts # scorer → progress.recordReview → emit event nếu 100%
│       ├── start-kanji-quiz.use-case.ts       # repo.pickRandomPublished → generator → save session
│       ├── submit-kanji-quiz-answer.use-case.ts # append answer + progress.recordReview nếu correct
│       └── finish-kanji-quiz.use-case.ts      # tính summary + mistakes
│
├── infrastructure/
│   ├── mappers/                               # 5 mappers (Prisma row ↔ domain)
│   │   ├── kanji.mapper.ts                    # với loose record types (KanjiRecord, KanjiMeaningRecord, ...)
│   │   ├── kanji-radical.mapper.ts
│   │   ├── kanji-user-progress.mapper.ts
│   │   ├── kanji-writing-attempt.mapper.ts
│   │   └── kanji-quiz-session.mapper.ts
│   ├── repositories/                          # 5 Prisma + 5 InMemory
│   │   ├── prisma-kanji.repository.ts         # aggregate save: tx + delete-then-recreate nested
│   │   ├── prisma-kanji-radical.repository.ts # upsert by id
│   │   ├── prisma-kanji-user-progress.repository.ts # upsert by userId_kanjiId; raw SQL cho getSummary
│   │   ├── prisma-kanji-writing-attempt.repository.ts
│   │   ├── prisma-kanji-quiz-session.repository.ts # append-only answers via createMany
│   │   ├── in-memory-kanji.repository.ts
│   │   ├── in-memory-kanji-radical.repository.ts
│   │   ├── in-memory-kanji-user-progress.repository.ts # cần inject IKanjiRepository cho getSummary
│   │   ├── in-memory-kanji-writing-attempt.repository.ts
│   │   └── in-memory-kanji-quiz-session.repository.ts
│   └── services/
│       ├── heuristic-writing-scorer.ts        # PHASE 1 DEMO — stroke count + bounding box + duration
│       └── random-quiz-question-generator.ts  # random pick + 3 distractors per recognition/meaningToKanji
│
├── presentation/
│   ├── admin/
│   │   ├── kanji-admin.controller.ts          # /admin/kanji + /admin/kanji/radicals (static routes FIRST)
│   │   └── kanji-admin.feature.ts             # AdminFeature: resource='kanji-management', menu label 'Kanji'
│   ├── public/
│   │   └── kanji-public.controller.ts         # /kanji — search/detail/radicals, published only
│   └── user/
│       └── kanji-user.controller.ts           # /me/kanji — static routes (progress/writing-queue/quiz/*) FIRST
│
└── kanji.module.ts                            # Seed KANJI_ROLES on onModuleInit
```

## API Routes

### Admin (`/admin/kanji`) — AdminAuthGuard + @RequirePermission
| Method | Path | Permission |
|---|---|---|
| GET | `/admin/kanji/radicals` | read |
| POST | `/admin/kanji/radicals` | create |
| PATCH | `/admin/kanji/radicals/:id` | update |
| DELETE | `/admin/kanji/radicals/:id` | delete |
| GET | `/admin/kanji` | read |
| POST | `/admin/kanji` | create |
| GET | `/admin/kanji/:id` | read |
| PATCH | `/admin/kanji/:id` | update |
| DELETE | `/admin/kanji/:id` | delete |
| POST | `/admin/kanji/:id/publish` | publish |
| POST | `/admin/kanji/:id/unpublish` | publish |

### Public (`/kanji`)
| Method | Path | Mô tả |
|---|---|---|
| GET | `/kanji/radicals` | List radicals |
| GET | `/kanji` | Search published kanji (filter: jlptLevel, radicalId, strokesMin/Max, search; paginate) |
| GET | `/kanji/:id` | Detail (404 nếu draft) |

### User (`/me/kanji`) — yêu cầu JWT (req.user.userId)
| Method | Path | Mô tả |
|---|---|---|
| GET | `/me/kanji/progress` | Summary tiến độ |
| GET | `/me/kanji/writing-queue` | Kanji đang learning (query: jlptLevel?, limit?) |
| POST | `/me/kanji/quiz/start` | Bắt đầu phiên quiz → `{sessionId, questions[]}` |
| POST | `/me/kanji/quiz/:sessionId/answer` | Gửi câu trả lời → `{correct, xpEarned}` |
| POST | `/me/kanji/quiz/:sessionId/finish` | Kết thúc + summary |
| GET | `/me/kanji` | Kanji list kèm user status (cho client browser) |
| PATCH | `/me/kanji/:id/status` | Set known/learning/unseen |
| POST | `/me/kanji/:id/writing-attempt` | Submit writing → score 4 criteria |

## Seeded Roles
| Role | SubjectType | Permissions |
|---|---|---|
| `kanji-editor` | admin | `kanji-management` → read, create, update, delete, publish |
| `kanji-viewer` | admin | `kanji-management` → read |

## Domain Events Published
- `kanji.mastery_reached` — payload `{ userId, kanjiId, kanjiChar, jlptLevel }`. Emit duy nhất khi `KanjiUserProgress.recordReview` đẩy mastery từ <100 lên ≥100 (check `oldMastery < 100 && newMastery >= 100`). Có thể wire trong `IntegrationModule` để gửi notification.

## Domain Model methods
- `Kanji.create(props)` / `reconstitute(id, props)` — factory + rehydrate
- `Kanji.update(partialMeta)`, `replaceMeanings/Examples/Compounds/Similar(items)` — replace toàn bộ array (caller wholesale)
- `Kanji.publish() / unpublish()` — set status
- `KanjiUserProgress.create({userId, kanjiId})` — status='unseen', mastery=0
- `KanjiUserProgress.setStatus(status)`, `markLearning/Known/Unseen()`
- `KanjiUserProgress.recordReview(delta)` → `{newMastery, masteryJustReached100}` (use-case dùng flag này để emit event)
- `KanjiQuizSession.recordAnswer({...})` — append; throw nếu không in_progress
- `KanjiQuizSession.finish() / abandon()` — set finishedAt

## Dependencies
- Imports `EventsModule` (publish `kanji.mastery_reached`)
- Prisma models: `Kanji`, `KanjiRadical`, `KanjiMeaning`, `KanjiExample`, `KanjiCompound`, `KanjiSimilar`, `KanjiUserProgress`, `KanjiWritingAttempt`, `KanjiQuizSession`, `KanjiQuizAnswer` (xem snippet ở `planning/kanji.md`)
- npm package: **`sanitize-html`** + **`@types/sanitize-html`** (chưa cài — xem migration notes)

## Gotchas
- **Route ordering**: static routes (`/radicals`, `/progress`, `/writing-queue`, `/quiz/*`) BẮT BUỘC khai báo TRƯỚC `/:id` trong cùng controller, nếu không NestJS sẽ parse `radicals`/`progress` như `:id`.
- **`KanjiExample.jpHtml` XSS**: input từ admin BẮT BUỘC qua `sanitizeExampleHtml()` ở `create-kanji.use-case` và `update-kanji.use-case` (whitelist `<ruby>`, `<rt>`, `<em>`, `<span class="highlight">`). KHÔNG được trust HTML từ DTO.
- **Aggregate save**: `prisma-kanji.repository.save()` dùng `$transaction` để wipe + recreate nested children (meanings/examples/compounds/similar). Phù hợp với domain semantics (`replaceX` wholesale) nhưng đắt cho update lớn.
- **Writing scorer Phase 1 demo**: `HeuristicWritingScorer` chỉ dựa stroke count + bounding box + duration — KHÔNG đánh giá thứ tự nét thực sự. FE phải hiển thị disclaimer.
- **Quiz session state**: lưu cả `answers[]` trong session entity. Khi save lại sau mỗi answer, repo chỉ append phần mới (slice từ `existingCount`) để tránh duplicate insert.
- **`getSummary` raw SQL**: dùng `$queryRaw` với template literal (parameterized) — KHÔNG được dùng `$queryRawUnsafe` để tránh SQL injection qua userId.
- **`pickRandomPublished`**: dùng `ORDER BY random()` — OK cho pool nhỏ (quiz pool ~80 kanji); với 2k+ rows cần thay bằng `TABLESAMPLE` hoặc app-level shuffle.
- **Cascade delete user data**: khi admin xóa 1 kanji, Prisma `onDelete: Cascade` sẽ wipe `KanjiUserProgress` của tất cả user. Nên cân nhắc soft-delete (`unpublish`) thay vì hard delete trong production.
