import type { ProgressData, ProgressRange, HeatmapCell } from '../types'

const MOCK_DAILY_CARDS = [12,8,15,22,18,0,25,14,19,11,20,17,0,23,16,21,13,18,22,0,15,19,24,17,20,14,18,23,21,16]

const HEATMAP_LEVELS = [0,0,1,2,1,0,3,2,3,4,2,1,0,2,3,3,2,4,3,0,1,2,3,2,3,4,3,2,1,0,2,3,4,3,2,1,3,2,0,3,4,3,2,3,1,2,3,4,3,2]

function buildHeatmapCells(levels: number[]): HeatmapCell[][] {
  const COLS = 52
  const ROWS = 7
  return Array.from({ length: COLS }, (_, c) =>
    Array.from({ length: ROWS }, (_, r) => ({
      level: (levels[(c * ROWS + r) % levels.length] ?? 0) as 0 | 1 | 2 | 3 | 4,
    })),
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getProgressData(_range: ProgressRange): ProgressData {
  return {
    stats: {
      wordsLearned: 421,
      wordsLearnedChange: 48,
      streak: 21,
      isPersonalRecord: true,
      retentionRate: 87,
      retentionChange: 4,
      studyHours: 24,
      studyHoursChange: 6,
    },
    dailyCards: MOCK_DAILY_CARDS,
    srs: {
      total: 630,
      stages: [
        { name: 'Mới', count: 48, color: '#E8334A', percentage: 8 },
        { name: 'Học', count: 72, color: '#C47D0E', percentage: 11 },
        { name: 'Trẻ', count: 128, color: '#6DB8E0', percentage: 20 },
        { name: 'Trưởng thành', count: 173, color: '#0F8A72', percentage: 27 },
        { name: 'Đã thuộc', count: 209, color: '#096b55', percentage: 33 },
      ],
    },
    skills: [
      { name: 'Từ vựng', percentage: 64, current: 421, total: 658, unit: 'từ N4', color: '#E8334A', trend: '↑ +48 tháng này', trendColor: '#0F8A72' },
      { name: 'Ngữ pháp', percentage: 48, current: 34, total: 72, unit: 'mẫu câu', color: '#C47D0E', trend: '↑ +8 tháng này', trendColor: '#0F8A72' },
      { name: 'Hiragana', percentage: 82, current: 41, total: 50, unit: 'ký tự', color: '#0F8A72', trend: '↑ Gần thành thạo', trendColor: '#0F8A72' },
      { name: 'Kanji', percentage: 40, current: 132, total: 330, unit: 'kanji', color: '#3A3A40', trend: '→ Ổn định', trendColor: '#7A7A85' },
    ],
    heatmap: {
      cells: buildHeatmapCells(HEATMAP_LEVELS),
      months: ['T11', 'T12', 'T1', 'T2', 'T3', 'T4'],
      studyDaysThisMonth: 24,
    },
    weakWords: [
      { id: '1', japanese: '懐かしい', meaning: 'hoài niệm', level: 'N2', retentionRate: 28, reviewCount: 8 },
      { id: '2', japanese: '渋滞', meaning: 'kẹt xe', level: 'N3', retentionRate: 35, reviewCount: 5 },
      { id: '3', japanese: '羨ましい', meaning: 'thèm muốn', level: 'N3', retentionRate: 41, reviewCount: 6 },
      { id: '4', japanese: '諦める', meaning: 'từ bỏ', level: 'N3', retentionRate: 45, reviewCount: 4 },
      { id: '5', japanese: '遠慮する', meaning: 'e ngại, khách sáo', level: 'N3', retentionRate: 49, reviewCount: 3 },
    ],
  }
}
