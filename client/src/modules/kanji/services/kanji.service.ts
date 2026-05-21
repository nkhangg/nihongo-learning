import { apiClient } from '@lib/api-client'
import type {
  KanjiDetail,
  KanjiListResult,
  KanjiProgressSummary,
  KanjiQuizAnswerDto,
  KanjiQuizAnswerResult,
  KanjiQuizConfig,
  KanjiQuizSummary,
  KanjiStatus,
  ListKanjiParams,
  Radical,
  WritingAttemptDto,
  WritingScore,
} from '../types'

export const kanjiService = {
  async listKanji(params: ListKanjiParams = {}): Promise<KanjiListResult> {
    const { data } = await apiClient.get<KanjiListResult>('/kanji', {
      params: {
        filter: {
          ...(params.level && params.level !== 'all' ? { jlptLevel: params.level } : {}),
          ...(params.status && params.status !== 'all' ? { status: params.status.toUpperCase() } : {}),
        },
        ...(params.search ? { searchBy: ['char', 'meaningVi'], search: params.search } : {}),
        page: params.page ?? 1,
        limit: params.limit ?? 64,
        sortBy: 'jlptLevel:ASC',
      },
    })
    return data
  },

  async getKanji(id: string): Promise<KanjiDetail> {
    const { data } = await apiClient.get<{ success: boolean; data: KanjiDetail }>(`/me/kanji/${id}`)
    return data.data
  },

  async listRadicals(): Promise<Radical[]> {
    const { data } = await apiClient.get<{ success: boolean; data: Radical[] }>('/kanji/radicals')
    return data.data
  },

  async getMyKanjiProgress(): Promise<KanjiProgressSummary> {
    const { data } = await apiClient.get<{ success: boolean; data: KanjiProgressSummary }>(
      '/me/kanji/progress',
    )
    return data.data
  },

  async updateKanjiStatus(id: string, status: KanjiStatus): Promise<void> {
    await apiClient.patch(`/me/kanji/${id}/status`, { status })
  },

  async submitWritingAttempt(id: string, dto: WritingAttemptDto): Promise<WritingScore> {
    const { data } = await apiClient.post<{ success: boolean; data: { score: Omit<WritingScore, 'starsLabel'>; newMastery: number } }>(
      `/me/kanji/${id}/writing-attempt`,
      dto,
    )
    const s = data.data.score
    const overall = s.overall
    const starsLabel: WritingScore['starsLabel'] =
      overall >= 90 ? '⭐⭐⭐⭐⭐'
      : overall >= 75 ? '⭐⭐⭐⭐'
      : overall >= 60 ? '⭐⭐⭐'
      : overall >= 40 ? '⭐⭐'
      : '⭐'
    return { ...s, starsLabel }
  },

  async getWritingQueue(level?: string): Promise<KanjiDetail[]> {
    const { data } = await apiClient.get<{ success: boolean; data: KanjiDetail[] }>(
      '/me/kanji/writing-queue',
      { params: level ? { level } : undefined },
    )
    return data.data
  },

  async startKanjiQuiz(config: KanjiQuizConfig): Promise<{ sessionId: string; questions: import('../types').KanjiQuizQuestion[] }> {
    const { data } = await apiClient.post('/me/kanji/quiz/start', {
      level: config.level,
      mode: config.mode.toUpperCase(),
      questionCount: config.questionCount,
      livesEnabled: config.livesEnabled,
    })
    return data.data
  },

  async submitKanjiQuizAnswer(
    sessionId: string,
    dto: KanjiQuizAnswerDto,
  ): Promise<KanjiQuizAnswerResult> {
    const { data } = await apiClient.post<{ success: boolean; data: KanjiQuizAnswerResult }>(
      `/me/kanji/quiz/${sessionId}/answer`,
      dto,
    )
    return data.data
  },

  async finishKanjiQuiz(sessionId: string): Promise<KanjiQuizSummary> {
    const { data } = await apiClient.post<{ success: boolean; data: KanjiQuizSummary }>(
      `/me/kanji/quiz/${sessionId}/finish`,
      {},
    )
    return data.data
  },
}
