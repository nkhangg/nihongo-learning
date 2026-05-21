# Module: modules/config

## Mục đích
Quản lý key-value config (JSON). Có editor đặc biệt cho object JSON dạng cards. Toggle bật/tắt config. Giao diện chia thành 4 sub-pages điều hướng bằng tab.

## Cấu trúc
```
modules/config/
├── components/
│   ├── _config-columns.tsx         # Internal: CopyKeyButton, ActionDropdown, buildColumns (shared bởi ConfigPage)
│   ├── ConfigLayout.tsx            # Tab navigation wrapper (Tất cả / Pages / Hệ thống / Client) + <Outlet/>
│   ├── ConfigPage.tsx              # Tab "Tất cả" — list all configs + CRUD
│   ├── ConfigPagesPage.tsx         # Tab "Pages" — full-page editor cho configs prefix pages.*
│   ├── ConfigSystemsPage.tsx       # Tab "Hệ thống" — delegate ConfigPrefixEditorPage prefix="system"
│   ├── ConfigClientPage.tsx        # Tab "Client" — delegate ConfigPrefixEditorPage prefix="client"
│   ├── ConfigPrefixEditorPage.tsx  # Reusable 2-panel editor (sidebar + form) cho bất kỳ prefix nào
│   ├── ConfigTemplatesPanel.tsx    # Nút "Bảng thiết kế" + Dialog hiển thị toàn bộ template (mẫu đã tạo có badge "Đã tạo")
│   ├── ConfigFormModal.tsx         # Tạo/sửa config (key, value JSON, description) — hỗ trợ `prefill`
│   ├── ObjectEditorCards.tsx       # Hiển thị/edit JSON object dạng card key-value
│   ├── AutoFieldEditor.tsx         # Auto-render field theo type (string/number/boolean/url/textarea/json)
│   └── PageConfigEditor.tsx        # Sheet slide-over (legacy, vẫn export nhưng không dùng trong routing)
├── hooks/
│   ├── useConfigs.ts           # useConfigList, useCreateConfig, useUpdateConfig,
│   │                           # useToggleConfig, useDeleteConfig
│   ├── usePageConfigs.ts       # Fetch pages.* configs, group theo section
│   ├── usePrefixConfigs.ts     # Fetch configs theo prefix bất kỳ, group theo section, tính stats
│   └── useJsonObjectEditor.ts  # State management cho ObjectEditorCards
├── services/
│   └── config.service.ts
├── templates/
│   ├── index.ts                # ConfigTemplate type + getTemplatesForPrefix(prefix)
│   └── client.templates.ts     # CLIENT_CONFIG_TEMPLATES — client.header, client.footer
├── types/
│   └── index.ts                # AppConfig { id, key, value, isActive, description }
└── index.ts
```

## Routes
| Route | Component | Guard |
|---|---|---|
| `/configs` | `ConfigLayout` → `ConfigPage` (index) | `AdminGuard` |
| `/configs/pages` | `ConfigLayout` → `ConfigPagesPage` | `AdminGuard` |
| `/configs/systems` | `ConfigLayout` → `ConfigSystemsPage` | `AdminGuard` |
| `/configs/client` | `ConfigLayout` → `ConfigClientPage` | `AdminGuard` |

Route constants: `ROUTES.CONFIGS`, `ROUTES.CONFIG_PAGES`, `ROUTES.CONFIG_SYSTEMS`, `ROUTES.CONFIG_CLIENT`

## API Endpoints
| Method | Path | Hook |
|---|---|---|
| GET | `/admin/configs` | `useConfigList` (paginate) |
| POST | `/admin/configs` | `useCreateConfig` |
| GET | `/admin/configs/:id` | `useConfigDetail` |
| PATCH | `/admin/configs/:id` | `useUpdateConfig` |
| PATCH | `/admin/configs/:id/toggle` | `useToggleConfig` |
| DELETE | `/admin/configs/:id` | `useDeleteConfig` |

Prefix filtering dùng `filter.key: '$sw:<prefix>.'` — ví dụ `filter.key: '$sw:system.'` cho SystemsPage. BE controller đã được fix để forward `keyPrefix` vào use case (trước đây filter.key bị ignore). `maxLimit` của endpoint này là 200.

## Query Keys
`QUERY_KEYS.CONFIGS` (hoặc `CONFIGS_QUERY_KEY = ['configs']` trong useConfigs.ts)

## Shared Column Helpers (`_config-columns.tsx`)
Nội bộ module. Export: `CopyKeyButton`, `ActionDropdown`, `buildColumns`, `ConfigRow`, `SCOPE_OPTIONS`, `SCOPE_COLORS`. Dùng bởi ConfigPage, ConfigSystemsPage, ConfigClientPage.

## ConfigLayout
Tab bar dùng `NavLink` với `end={true}` trên tab "Tất cả" để chỉ match exact `/configs`. Renders `<Outlet />`. Cần `h-full flex flex-col` để layout hoạt động đúng với MainLayout.

## ConfigPagesPage
Card layout — dùng `usePrefixConfigs('pages')`. Mỗi config = 1 `PageConfigCard` (single-column, full-width):
- Header card: key label + monospace full key + description + Dropdown (Sửa chi tiết / Bật-Tắt / Xoá)
- Body: grid 2-cột (label | AutoFieldEditor) cho từng field của JSON object value
- Non-object value: fallback "Edit qua JSON editor" button
- Save button: chỉ hiện khi dirty; ring xanh trên card
- Grouped by section với section headers (giống System/Client)

## ConfigPrefixEditorPage
Component tái sử dụng — props: `prefix`, `title`, `description`, `icon`. Render card grid layout:
- Header: title + StatCards (tổng/bật/tắt) + nút "Tạo config" (mở ConfigFormModal)
- Body: configs grouped theo section, mỗi section có header + 2-cột card grid
- Mỗi ConfigCard:
  - Primitive value (string/number/boolean) → AutoFieldEditor inline, save button xuất hiện khi dirty
  - Object/Array value → "N fields" badge + click "Sửa chi tiết" mở ConfigFormModal
  - Dropdown (⋮): Sửa chi tiết / Bật-Tắt / Xoá (confirm dialog)
  - Ring xanh khi card có thay đổi chưa lưu

## ConfigSystemsPage / ConfigClientPage
Thin wrapper — mỗi file chỉ delegate sang `ConfigPrefixEditorPage` với prefix/title/icon tương ứng.
- `ConfigSystemsPage`: prefix="system", icon=Settings
- `ConfigClientPage`: prefix="client", icon=Globe

## usePrefixConfigs
`usePrefixConfigs(prefix)` — gọi `configService.listConfigs` với `filter.key: $sw:<prefix>.` và `limit: 200`.
Group by segment thứ 2; 2-segment key → section "general". Returns: `configs, sections, totalEnabled, totalDisabled, meta`.

## Templates (Quick-create)

Một số config "tiêu chuẩn" có sẵn template với default value để admin tạo nhanh bằng 1 click:

| Prefix | Key | Mô tả |
|---|---|---|
| `client` | `client.header` | Header (logo, navLinks, actions) cho `PublicLayout` của client |
| `client` | `client.footer` | Footer (logo, links, copyright) cho `PublicLayout` của client |

Template được khai báo trong `modules/config/templates/<prefix>.templates.ts` và đăng ký vào `TEMPLATES_BY_PREFIX` trong `templates/index.ts`.

`ConfigPrefixEditorPage` gọi `getTemplatesForPrefix(prefix)` và truyền cả `existingKeys` (Set các key đã tồn tại) vào `ConfigTemplatesPanel`. Component này render một button **"Bảng thiết kế"** (icon `LayoutTemplate`, có tooltip mô tả, badge số mẫu còn thiếu màu hổ phách) nằm cạnh nút "Tạo config" trên header. Click button mở Dialog hiển thị **toàn bộ** template của prefix — mẫu đã được tạo gắn badge "Đã tạo" và button "Tạo nhanh" bị disable; mẫu chưa tạo bấm "Tạo nhanh từ mẫu" sẽ đóng Dialog và mở `ConfigFormModal` với prefill key/value/description/scope/tags. Khi prefix không có template nào, button tự ẩn.

`ConfigFormModal` nhận thêm prop optional `prefill?: ConfigPrefill` (key/value/description/scope/tags) — chỉ áp dụng khi `editingConfig` rỗng.

Default values của 2 template client.* được sync với `client/src/shared/layouts/PublicLayout.tsx` (`DEFAULT_HEADER`/`DEFAULT_FOOTER`) — khi đổi shape header/footer ở client, nhớ update template tương ứng.

## AutoFieldEditor — string types
- key khớp `/description|content|message|text|note|bio|remark|html|body/i` (và không phải URL) → Textarea
- key khớp `/url|image|logo|src|photo|avatar/i` → Input + MediaPicker button
- string thông thường → Input
