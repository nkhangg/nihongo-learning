import { apiClient } from '@lib/api-client'
import type { CreateKanjiRadicalDto, KanjiRadical, UpdateKanjiRadicalDto } from '../types'

export const kanjiRadicalService = {
  async list(): Promise<KanjiRadical[]> {
    const { data } = await apiClient.get<{ success: boolean; data: KanjiRadical[] }>(
      '/admin/kanji/radicals',
      { withCredentials: true },
    )
    return data.data
  },

  async create(dto: CreateKanjiRadicalDto): Promise<{ success: boolean; radicalId: string }> {
    const { data } = await apiClient.post('/admin/kanji/radicals', dto, { withCredentials: true })
    return data
  },

  async update(id: string, dto: UpdateKanjiRadicalDto): Promise<void> {
    await apiClient.patch(`/admin/kanji/radicals/${id}`, dto, { withCredentials: true })
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/kanji/radicals/${id}`, { withCredentials: true })
  },
}
