# Module: config

Đọc các config public từ BE (`/configs/*`) để render dynamic content phía client — bắt đầu với `client.header` và `client.footer` cho `PublicLayout`.

## Structure

```
src/modules/config/
├── services/
│   └── config.service.ts      ← batch + getByKey wrappers cho /configs/*
├── hooks/
│   └── usePublicConfig.ts     ← TanStack Query hooks (use client)
├── types/
│   └── index.ts               ← HeaderConfig, FooterConfig, NavLink, BrandLogo, ...
└── index.ts
```

## Public API

```ts
import {
  configService,
  usePublicConfigs,
  useHeaderAndFooterConfig,
  PUBLIC_CONFIG_KEYS,
  type HeaderConfig,
  type FooterConfig,
  type NavLink,
  type BrandLogo,
  type HeaderAction,
} from '@modules/config'
```

## Hooks

| Hook | Trả về |
|---|---|
| `usePublicConfigs(keys: string[])` | `useQuery` raw `Record<string, unknown>` cho danh sách keys |
| `useHeaderAndFooterConfig()` | `{ header, footer, isLoading }` — đã typed sẵn |

Query key: `QUERY_KEYS.CONFIG.PUBLIC(keys)` — keys được sort trước để cache stable.

## API Endpoints (consumed)

| Method | Path | Hook |
|---|---|---|
| GET | `/configs/batch?keys=a,b,c` | `usePublicConfigs` / `useHeaderAndFooterConfig` |
| GET | `/configs/:key` | `configService.getByKey` (chưa dùng) |

## Config keys

| Key | Shape | Dùng ở |
|---|---|---|
| `client.header` | `HeaderConfig` | `PublicLayout` header |
| `client.footer` | `FooterConfig` | `PublicLayout` footer |

### `HeaderConfig`

```ts
{
  logo: { mark: string; text: string; href?: string }
  navLinks: { href: string; label: string }[]
  actions: { href: string; label: string; variant?: 'ghost' | 'primary' }[]
}
```

### `FooterConfig`

```ts
{
  logo: { mark: string; text: string; href?: string }
  links: { href: string; label: string }[]
  copyright: string   // có thể chứa "{year}" — sẽ được replace bằng năm hiện tại
}
```

## Notes

- `PublicLayout` luôn render — có fallback `DEFAULT_HEADER` / `DEFAULT_FOOTER` ngay trong file layout để tránh flash trống khi config chưa load hoặc BE chưa cấu hình key.
- BE chỉ trả config nếu `scope === 'public'` và `isEnabled === true`. Admin tạo config key `client.header`/`client.footer` qua `/admin/configs` với scope `public`.
- `copyright` hỗ trợ placeholder `{year}` (replaced bằng `new Date().getFullYear()`).
