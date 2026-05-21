import { apiClient } from '@lib/api-client'
import type { NestjsPaginateParams } from '@shared/components/ui/data-table'
import type {
  CreateKanjiDto,
  KanjiDetail,
  KanjiListResponse,
  UpdateKanjiDto,
} from '../types'

export const kanjiService = {
  async list(params?: NestjsPaginateParams): Promise<KanjiListResponse> {
    const { data } = await apiClient.get<{ success: boolean } & KanjiListResponse>(
      '/admin/kanji',
      { params, withCredentials: true },
    )
    return { data: data.data, meta: data.meta }
  },

  async getById(id: string): Promise<KanjiDetail> {
    const { data } = await apiClient.get<{ success: boolean; data: KanjiDetail }>(
      `/admin/kanji/${id}`,
      { withCredentials: true },
    )
    return data.data
  },

  async create(dto: CreateKanjiDto): Promise<{ success: boolean; kanjiId: string }> {
    const { data } = await apiClient.post('/admin/kanji', dto, { withCredentials: true })
    return data
  },

  async update(id: string, dto: UpdateKanjiDto): Promise<void> {
    await apiClient.patch(`/admin/kanji/${id}`, dto, { withCredentials: true })
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/kanji/${id}`, { withCredentials: true })
  },

  async publish(id: string): Promise<void> {
    await apiClient.post(`/admin/kanji/${id}/publish`, {}, { withCredentials: true })
  },

  async unpublish(id: string): Promise<void> {
    await apiClient.post(`/admin/kanji/${id}/unpublish`, {}, { withCredentials: true })
  },
}
