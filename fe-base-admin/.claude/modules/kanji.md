# Module: modules/kanji

## Mục đích
Admin CRUD cho ~2.136 Jōyō Kanji (ký tự, JLPT level, readings, nested meanings/examples/compounds/similar) + quản lý Radicals (bộ thủ). Chỉ chức năng catalog admin — không có user-scoped progress ở admin layer.

## Cấu trúc
```
src/modules/kanji/
├── types/
│   └── index.ts          — KanjiListItem, KanjiDetail (với components/similar), KanjiComponent, KanjiRadical, DTOs, JlptLevel, KanjiStatus
├── services/
│   ├── kanji.service.ts            — list/getById/create/update/delete/publish/unpublish
│   └── kanji-radical.service.ts   — list/create/update/delete
├── hooks/
│   ├── useKanjis.ts        — useKanjiSearch, useKanjiList, useKanji, useCreateKanji, useUpdateKanji, useDeleteKanji, usePublishKanji, useUnpublishKanji
│   └── useKanjiRadicals.ts — useKanjiRadicals, useCreateKanjiRadical, useUpdateKanjiRadical, useDeleteKanjiRadical
├── components/
│   ├── KanjiPage.tsx             — DataTable list + filter (JLPT level, status, search) + actions
│   ├── KanjiFormModal.tsx        — Tabs: Meta(+readings) | Nghĩa | Ví dụ | Từ ghép | Thành phần | Tương tự | Nâng cao(stroke+mnemonic) | JSON
│   ├── KanjiJsonImportTab.tsx    — Tab "Nhập JSON": single object → fill form, array → bulk import
│   ├── MeaningsEditor.tsx        — useFieldArray cho nested meanings
│   ├── ExamplesEditor.tsx        — useFieldArray cho examples (với HTML warning)
│   ├── CompoundsEditor.tsx       — useFieldArray cho compounds
│   ├── ComponentsEditor.tsx      — useFieldArray cho components (thành phần ghép: char + meaningVi)
│   ├── SimilarEditor.tsx         — useFieldArray + search combobox cho kanji tương tự (similarKanjiId + reason)
│   ├── KanjiRadicalsPage.tsx     — DataTable + CRUD radicals
│   └── KanjiRadicalFormModal.tsx — Dialog form đơn giản cho radical
└── index.ts                      — public API exports
```

## Routes
| Route | Component |
|---|---|
| `/kanji` | `KanjiPage` |
| `/kanji/radicals` | `KanjiRadicalsPage` |

## API Endpoints
| Method | Path | Chức năng |
|---|---|---|
| GET | `/admin/kanji` | List với paginate + filter |
| GET | `/admin/kanji/:id` | Get detail (nested) |
| POST | `/admin/kanji` | Tạo kanji |
| PATCH | `/admin/kanji/:id` | Update kanji |
| DELETE | `/admin/kanji/:id` | Xóa kanji (cascade) |
| POST | `/admin/kanji/:id/publish` | Xuất bản |
| POST | `/admin/kanji/:id/unpublish` | Hủy xuất bản |
| GET | `/admin/kanji/radicals` | List radicals |
| POST | `/admin/kanji/radicals` | Tạo radical |
| PATCH | `/admin/kanji/radicals/:id` | Update radical |
| DELETE | `/admin/kanji/radicals/:id` | Xóa radical |

## Query Keys
```ts
const KANJI_LIST_KEY = ['kanji', 'list']
const KANJI_ENTRY_KEY = ['kanji', 'entry']
const RADICAL_LIST_KEY = ['kanji', 'radicals']
```

## JSON Import (KanjiJsonImportTab)
- Chỉ hiện trong create mode (`!isEdit`) — tab label "Nhập JSON" nằm cuối TabsList
- Object đơn → nút "Điền vào form" → `reset()` form values + switch sang tab `meta`
- Mảng → nút "Nhập hàng loạt" → gọi `createKanji.mutateAsync` tuần tự → toast kết quả → close modal
- Validate bằng Zod trước khi cho phép import
- Footer Submit bị ẩn khi `activeTab === 'json'`

## Gotchas
- `KanjiDetail.examples[].jpHtml` chứa sanitized HTML — không render trực tiếp ở admin (chỉ dùng textarea để edit)
- Xóa kanji là cascade: xóa cả progress của user → ConfirmDialog với cảnh báo rõ ràng
- `onReadings` và `kunReadings` nhập qua text field phân cách bằng dấu phẩy, split khi submit
- `strokeOrderSvg` nhập qua textarea mỗi dòng 1 SVG path, split by newline khi submit
- `FieldLabel` trong codebase này không có prop `required` — dùng ký tự `*` inline trong label text
- `ConfirmDialog` dùng `onClose` (không phải `onOpenChange`) và `loading` (không phải `isPending`)
- `ConfirmVariant` là `'danger'` (không phải `'destructive'`)
