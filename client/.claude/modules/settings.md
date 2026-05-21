# Module: settings

User settings page — learning preferences, notifications, appearance, language, and security.

## Structure

```
src/modules/settings/
├── components/
│   ├── SettingsPage.tsx        # Main page ('use client')
│   ├── SettingsNav.tsx         # Left sticky nav (desktop) / horizontal tabs (mobile)
│   ├── SettingRow.tsx          # Reusable row layout: label + desc + control
│   ├── ToggleSwitch.tsx        # Accessible toggle button (role="switch")
│   ├── ChipGroup.tsx           # Single-select chip buttons
│   ├── LearningSection.tsx     # Section: daily goal, reminder, study mode, etc.
│   ├── NotificationsSection.tsx# Section: 6 notification toggles
│   ├── AppearanceSection.tsx   # Section: theme, font size, animations, sounds
│   ├── LanguageSection.tsx     # Section: UI lang, definition lang, phonetics
│   ├── SecuritySection.tsx     # Section: email, password, 2FA, sessions, export
│   └── SaveBar.tsx             # Fixed bottom bar (slide-in when hasChanges)
├── hooks/
│   └── useSettings.ts          # Local state — no API yet
├── types/
│   └── index.ts                # SettingsState, section types, union types
└── index.ts
```

## Public API

```typescript
import { SettingsPage } from '@modules/settings'
import type { SettingsState, SettingsSection } from '@modules/settings'
```

## Route

`/settings` → `src/app/(app)/settings/page.tsx` → group `(app)` (AppLayout)

## State

Currently local state only (`useSettings` hook with `useState`). No API connection yet.
When connecting BE: add `settingsService.ts` + `useSettingsQuery.ts`, swap out local state.

## Query Keys

```typescript
QUERY_KEYS.SETTINGS.MY  // ['settings', 'my'] — reserved for future BE connection
```

## Responsive

- **Desktop**: 2-column grid — 192px sticky `SettingsNav` + flex-1 content
- **Mobile**: `SettingsNav` becomes horizontal scroll tabs (sticky below top header),
  sections stacked, `SaveBar` sits above mobile bottom nav (`bottom-16`)

## Components: key patterns

- `ToggleSwitch`: accessible `role="switch"`, `bg-pine` when checked
- `ChipGroup`: `bg-ink text-paper` when active option
- `SaveBar`: `translate-y-full` → `translate-y-0` transition when `hasChanges === true`
- `SettingRow`: `last:border-b-0` removes bottom border on last row of each card
