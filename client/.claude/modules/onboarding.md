# Module: onboarding

5-step onboarding wizard: goal → level → quiz → time → result/roadmap. Fully static (no BE), UI-only.

## Structure

```
src/modules/onboarding/
├── types/index.ts            → interfaces + static data constants (GOALS, LEVELS, QUIZ_DATA, TIME_OPTIONS)
├── components/
│   ├── OnboardingPage.tsx    → main wizard controller, all useState here
│   ├── OnboardingTopbar.tsx  → sticky topbar (logo + step counter) + progress bar
│   ├── GoalStep.tsx          → step 1: 2-col goal card grid
│   ├── LevelStep.tsx         → step 2: vertical level row list
│   ├── QuizStep.tsx          → step 3: quiz card with inline feedback
│   ├── TimeStep.tsx          → step 4: 3-col time card grid
│   └── ResultStep.tsx        → step 5: score circle + roadmap
└── index.ts                  → exports OnboardingPage
```

## Public API

```typescript
import { OnboardingPage } from '@modules/onboarding'
```

## Route

`/onboarding` → `src/app/(onboarding)/onboarding/page.tsx` → `(onboarding)` group

Layout: `(onboarding)/layout.tsx` is a pass-through — `OnboardingPage` owns its full-screen layout.

## State

All wizard state lives in `OnboardingPage`:
- `step` (1–5), `selectedGoal`, `selectedLevel`, `selectedTime`
- `quizAnswers[]`, `quizIndex`

Step transitions use `key` prop → remount → `animate-fade-up` CSS animation triggers.

## API Endpoints

None — all data is static (`GOALS`, `LEVELS`, `QUIZ_DATA`, `TIME_OPTIONS` in `types/index.ts`).

On finish (step 5 → "Vào Dashboard"): `router.push(ROUTES.DASHBOARD)`.

## Design tokens used

`bg-background`, `bg-card`, `bg-muted`, `bg-surface`, `bg-pine-light`, `bg-vermillion-light`,
`text-foreground`, `text-muted-foreground`, `text-pine`, `text-vermillion`,
`border-border`, `border-foreground`, `border-pine`, `border-vermillion`,
`animate-fade-up`, `font-mono`, `rounded-xl` (20px), `rounded-lg` (14px)
