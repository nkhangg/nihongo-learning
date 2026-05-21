# Module: modules/config

## Mục đích
Key-value config store dạng JSON — lưu cấu hình linh hoạt cho app (feature flags, settings,...). Có 3 presentation layers: admin (full CRUD), authenticated (read với auth), public (read không cần auth).

## Cấu trúc
```
modules/config/
├── domain/
│   ├── entities/app-config.entity.ts   # { id, key, value (JSON), valueKeyOrder, isEnabled, scope, tags, description, createdBy, updatedBy }
│   └── repositories/config.repository.ts   # CONFIG_REPOSITORY
├── application/
│   ├── services/config-cache.service.ts    # In-memory cache cho config values
│   └── use-cases/
│       ├── create-config.use-case.ts
│       ├── get-config-by-id.use-case.ts
│       ├── get-config-by-key.use-case.ts   # Dùng bởi các module khác
│       ├── get-configs-batch.use-case.ts   # Bulk read nhiều keys
│       ├── list-configs.use-case.ts
│       ├── update-config.use-case.ts
│       ├── toggle-config.use-case.ts       # Bật/tắt isEnabled
│       └── delete-config.use-case.ts
├── infrastructure/repositories/
│   └── prisma-config.repository.ts
├── presentation/
│   ├── admin/
│   │   ├── config-admin.controller.ts     # /admin/configs (AdminAuthGuard)
│   │   └── config-admin.feature.ts
│   ├── authenticated/
│   │   └── config-auth.controller.ts      # /configs (JWT required, user/merchant)
│   └── public/
│       └── config-public.controller.ts    # /public/configs (no auth)
└── config.module.ts    # seeds CONFIG_ROLES, exports CONFIG_REPOSITORY + use-cases
```

## API Routes

### Admin (`/admin/configs`)
| Method | Path | Permission |
|---|---|---|
| GET | `/admin/configs` | read (paginate) |
| POST | `/admin/configs` | create |
| GET | `/admin/configs/:id` | read |
| PATCH | `/admin/configs/:id` | update |
| PATCH | `/admin/configs/:id/toggle` | update |
| DELETE | `/admin/configs/:id` | delete |

### Authenticated (`/configs/me`)
| Method | Path | Guard |
|---|---|---|
| GET | `/configs/me/:key` | UserPermissionGuard (`configs:read`) — đọc 1 key, scope `public + members` |
| GET | `/configs/me/batch?keys=a,b,c` | UserPermissionGuard — batch read (comma-separated query) |

### Public (`/configs`)
| Method | Path | Mô tả |
|---|---|---|
| GET | `/configs/:key` | Read config theo key, scope `public` only, chỉ trả khi `isEnabled = true` |
| GET | `/configs/batch?keys=a,b,c` | Batch read các key public (comma-separated query) |

## Seeded Roles

| Role | SubjectType | Permissions |
|---|---|---|
| admin | admin | config-management → read, create, update, delete |
| viewer | admin | config-management → read |
| member | user | configs → read |
| staff | merchant | configs → read |

## Exports
- `CONFIG_REPOSITORY` — inject trực tiếp nếu cần
- `GetConfigByKeyUseCase` — đọc config theo key từ module khác
- `GetConfigsBatchUseCase` — đọc nhiều keys cùng lúc

## Domain Events Published
- `config.changed` — sau khi update/toggle config (handler trong IntegrationModule)
