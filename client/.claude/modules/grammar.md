# Module: grammar

Browse và học các mẫu câu ngữ pháp JLPT với filter, accordion cards, và tích hợp Flashcard.

## Structure

```
src/modules/grammar/
├── components/
│   ├── GrammarPage.tsx       # Main page — manages all state
│   ├── GrammarCard.tsx       # Accordion card for one pattern
│   └── GrammarFilterPanel.tsx # Filter sidebar (desktop + mobile Sheet)
├── hooks/
│   └── useGrammar.ts         # useGrammarLessons, useAddToFlashcard
├── services/
│   └── grammar.service.ts    # getLessons, addToFlashcard
├── types/
│   └── index.ts              # JLPTLevel, GrammarLesson, GrammarFilter, ...
└── index.ts
```

## Public API

```ts
import { GrammarPage, useGrammarLessons, useAddToFlashcard } from '@modules/grammar'
import type { GrammarLesson, GrammarFilter, JLPTLevel, GrammarStatus } from '@modules/grammar'
```

## Route

`/grammar` → `src/app/(learning)/grammar/page.tsx` → `(learning)` group (LearningLayout)

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /grammar/lessons | List with search/level/types/status/page params |
| POST | /grammar/lessons/:id/flashcard | Add pattern to flashcard deck |

## Query Keys

```ts
QUERY_KEYS.GRAMMAR.LESSONS  // base key; actual query uses [...LESSONS, filter]
```

## Responsive Design

- **Mobile**: filter hidden in Sheet drawer (triggered by SlidersHorizontal button in topbar)
- **Desktop (lg+)**: sticky filter sidebar (w-64) + scrollable main content
