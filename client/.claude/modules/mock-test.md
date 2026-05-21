# Module: mockTest

Trang thi thử JLPT với 3 view states: chọn đề → làm bài → kết quả. Toàn bộ state local, mock data.

## Structure

```
client/src/modules/mockTest/
├── types/index.ts              — JlptLevel, TestSection, Question, ExamResult, ...
├── services/
│   └── mock-test.service.ts   — MOCK_QUESTIONS, LEVEL_META, computeExamResult()
├── hooks/
│   └── useMockTest.ts         — state máy (view, answers, timer, flagged)
├── components/
│   ├── MockTestPage.tsx        — orchestrator, chọn view
│   ├── SelectView.tsx          — chọn level / config / bắt đầu thi
│   ├── ExamView.tsx            — exam header + progress + question + map
│   ├── ResultView.tsx          — kết quả, breakdown, điểm yếu
│   ├── QuestionPanel.tsx       — câu hỏi, 4 options, explanation reveal
│   ├── QuestionMap.tsx         — dot grid, legend, section progress, nộp bài
│   └── ScoreRing.tsx           — SVG circular progress
└── index.ts
```

## Public API

```typescript
import { MockTestPage } from '@modules/mockTest'
```

## Route

`/mock-test` → `src/app/(learning)/mock-test/page.tsx` → `LearningLayout`

## Responsive

- Level grid: `grid-cols-3 sm:grid-cols-5`
- Config cards: `grid-cols-1 sm:grid-cols-2`
- Exam body: `grid-cols-1 lg:grid-cols-[1fr_220px]`
- Breakdown: `grid-cols-1 sm:grid-cols-3`
- QuestionMap: inline below question on mobile, sticky sidebar on desktop

## Mock Data

`MOCK_QUESTIONS` — 20 câu N3 (7 từ vựng + 7 ngữ pháp + 6 đọc hiểu)  
`LEVEL_META` — config cho N5→N1 (số câu, phút, điểm đậu, điểm tối đa)  
`MOCK_PREVIOUS_ATTEMPT` — N3, 78/180, chưa đạt

Scoring: (correct/total) * sectionMaxScore (60/section). Timer tự nộp bài khi hết giờ.

## Note

Chưa kết nối BE. Khi cần connect: thay mock data trong service bằng apiClient call, wrap hook bằng useQuery/useMutation.
