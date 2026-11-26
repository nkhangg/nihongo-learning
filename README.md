# Nihongo Learning

Nền tảng học tiếng Nhật gồm 3 ứng dụng: **API backend** (NestJS), **trang quản trị** (React + Vite) và **trang học viên** (Next.js). Học viên tra từ điển, học Kanji (thứ tự nét, bộ thủ, thành phần), ôn flashcard, làm câu hỏi và theo dõi tiến độ (XP, streak). Quản trị viên quản lý nội dung, người dùng, phân quyền và cấu hình hệ thống.

Mục tiêu chính của repo là thể hiện cách tổ chức một backend **modular monolith** theo **Clean Architecture / DDD**: mỗi nghiệp vụ là một module độc lập, tách rõ domain, use case, hạ tầng và giao tiếp HTTP.

## Tech stack

| Thành phần | Công nghệ |
|---|---|
| Backend (`be-base`) | NestJS 11, TypeScript, Prisma 6, PostgreSQL 16, Redis, BullMQ, Socket.IO, Swagger, Jest |
| Trang quản trị (`fe-base-admin`) | React 19, Vite 6, TanStack Query, React Hook Form, Zod, Tailwind CSS, shadcn/ui (Radix), i18next, Vitest |
| Trang học viên (`client`) | Next.js 16 (App Router), React 19, TanStack Query, Tailwind CSS, shadcn/ui |
| Hạ tầng dev | Docker Compose (PostgreSQL, Redis, MailHog) |

## Kiến trúc tổng quan

```
┌──────────────────┐   ┌──────────────────┐
│  client (Next.js)│   │ fe-base-admin    │
│  trang học viên  │   │ (React + Vite)   │
└────────┬─────────┘   └────────┬─────────┘
         │  REST /api  ·  Socket.IO         │
         └──────────────┬───────────────────┘
                        ▼
        ┌───────────────────────────────┐
        │          be-base (NestJS)      │
        │  core/     auth, authorization,│
        │            events, queue, mail,│
        │            health, integration │
        │  modules/  16 module nghiệp vụ │
        └──────┬──────────────┬─────────┘
               ▼              ▼
          PostgreSQL       Redis (BullMQ queue,
          (Prisma)          cache phân quyền)
```

### Cấu trúc thư mục

```
.
├── be-base/          # API NestJS
│   ├── prisma/       # schema, migrations, script seed dữ liệu Kanji
│   └── src/
│       ├── core/     # hạ tầng dùng chung cho mọi module
│       ├── modules/  # các module nghiệp vụ
│       └── shared/   # base class, kiểu dữ liệu, tiện ích chung
├── fe-base-admin/    # trang quản trị
├── client/           # trang học viên
└── planning/         # thiết kế CSDL (dbml), kế hoạch module, báo cáo kiểm thử
```

### Module nghiệp vụ (`be-base/src/modules`)

| Nhóm | Module |
|---|---|
| Học tập | `kanji`, `dictionary`, `flashcard`, `question`, `progress` |
| Nội dung | `article`, `blog`, `media` |
| Người dùng & tổ chức | `user`, `admin`, `organization` |
| Vận hành | `config`, `audit`, `notification`, `contacts`, `merchant` |

### Hạ tầng dùng chung (`be-base/src/core`)

- **auth**: đăng ký, đăng nhập, refresh token theo phiên, đăng xuất, quên/đặt lại mật khẩu, đăng nhập Google OAuth.
- **authorization**: phân quyền theo permission (RBAC), có cache trên Redis.
- **events / integration**: domain event giữa các module qua event emitter, giảm phụ thuộc trực tiếp giữa các module.
- **queue / mail**: gửi email và thông báo bất đồng bộ bằng BullMQ, template Handlebars.
- **health**: endpoint healthcheck cho PostgreSQL và Redis.
- Toàn cục: rate limit (Throttler), validation DTO, Swagger tại `/docs`.

## Cấu trúc một module

Mỗi module tuân theo cùng một khuôn 4 lớp. Ví dụ module `kanji`:

```
modules/kanji/
├── domain/                 # nghiệp vụ thuần, không phụ thuộc framework
│   ├── entities/           # entity và quy tắc nghiệp vụ
│   ├── value-objects/      # ID và giá trị có ràng buộc
│   ├── events/             # domain event
│   ├── repositories/       # interface repository (port)
│   └── services/           # domain service
├── application/
│   ├── use-cases/          # mỗi hành động là một use case
│   └── services/
├── infrastructure/
│   ├── repositories/       # triển khai bằng Prisma và bản in-memory cho test
│   ├── mappers/            # chuyển đổi giữa Prisma model và entity
│   └── services/
├── presentation/
│   ├── admin/              # controller cho trang quản trị
│   ├── user/               # controller cho học viên đã đăng nhập
│   └── public/             # controller công khai
└── kanji.module.ts
```

Nguyên tắc:

- `domain` không import NestJS hay Prisma. Use case chỉ phụ thuộc interface repository.
- Phần lớn repository có cả bản Prisma (chạy thật) và bản in-memory (unit test nhanh, không cần DB).
- Controller tách theo đối tượng sử dụng (admin / user / public) để phân quyền rõ ràng.
- Luồng liên module (ví dụ liên hệ mới → thông báo, email) đi qua domain event và `core/integration` thay vì gọi trực tiếp service của module khác.

## Chạy dự án

Yêu cầu: Node.js 20+, Docker.

```bash
# 1. Hạ tầng: PostgreSQL, Redis, MailHog (http://localhost:8025)
cd be-base
cp .env.example .env
docker compose up -d

# 2. Backend
npm install
npx prisma migrate deploy
npm run seed:kanji && npm run seed:radicals && npm run seed:components
npm run start:dev          # API: http://localhost:3000/api · Swagger: /docs

# 3. Trang quản trị
cd ../fe-base-admin
cp .env.example .env       # chỉnh VITE_API_BASE_URL cho khớp PORT của backend
npm install && npm run dev # http://localhost:5173

# 4. Trang học viên
cd ../client
cp .env.local.example .env.local
npm install && npm run dev
```

Tài khoản admin đầu tiên được tạo tự động từ `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` trong `be-base/.env`.

## Kiểm thử

```bash
cd be-base && npm test          # unit test (Jest)
cd be-base && npm run test:e2e  # E2E
cd fe-base-admin && npm test    # Vitest
```

## Tài liệu thiết kế

Thư mục [`planning/`](planning/) chứa thiết kế CSDL ([`db-deisgn.dbml`](planning/db-deisgn.dbml)), sơ đồ trang, kế hoạch triển khai từng module backend/frontend và báo cáo kiểm thử.

## Repo liên quan

[base-nestjs-reactjs](https://github.com/nkhangg/base-nestjs-reactjs): bộ khung tách ra từ dự án này, chỉ giữ các module nền tảng (auth, user, admin, phân quyền, media, notification…) để dùng lại cho dự án mới.
