# Module: profile

Trang hồ sơ cá nhân — xem/chỉnh sửa thông tin, xem thành tích, quản lý thống kê công khai, danger zone.

## Structure

```
src/modules/profile/
├── components/
│   ├── ProfilePage.tsx        # Orchestrator, 2-col grid
│   ├── ProfileCard.tsx        # Left sidebar card (avatar, stats, quick links)
│   ├── PersonalInfoForm.tsx   # RHF + Zod form (7 fields)
│   ├── PublicStatsSection.tsx # 4 stats + visibility toggle
│   ├── BadgesSection.tsx      # 5-col badge grid
│   └── DangerZoneSection.tsx  # Delete history + delete account
├── hooks/useProfile.ts
├── services/profile.service.ts  # mock data (chưa connect BE)
├── types/index.ts
└── index.ts
```

## Public API

```ts
import { ProfilePage, useMyProfile, useProfileStats } from '@modules/profile'
```

## Route

`/profile` → `src/app/(app)/profile/page.tsx` → `(app)` group (protected, sidebar)

## API Endpoints (khi connect BE)

| Method | Path | Hook |
|---|---|---|
| GET | /profile/me | `useMyProfile` |
| PATCH | /profile/me | `useUpdateProfile` |
| GET | /profile/stats | `useProfileStats` |
| GET | /profile/public-stats | `usePublicStats` |
| PATCH | /profile/public-settings | `useUpdatePublicVisibility` |
| GET | /profile/badges | `useProfileBadges` |
| DELETE | /profile/learning-history | `useDeleteLearningHistory` |
| DELETE | /profile/account | `useDeleteAccount` |

## Query Keys

```ts
QUERY_KEYS.PROFILE.ME
QUERY_KEYS.PROFILE.STATS
QUERY_KEYS.PROFILE.PUBLIC_STATS
QUERY_KEYS.PROFILE.BADGES
```

## Notes

- Service dùng mock data — khi connect BE chỉ cần thay mock bằng `apiClient` calls
- `ProfileCard` dùng `useLogout` từ `@modules/auth`
