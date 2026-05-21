import { apiClient } from '@lib/api-client'
import type {
  AddFlashcardDto,
  DictionaryEntry,
  Flashcard,
  ListFlashcardsParams,
  ListFlashcardsResult,
  ReviewCard,
  SubmitReviewDto,
  SubmitReviewResponse,
} from '../types'

interface DueResponse {
  data: Flashcard[]
}

interface DictionaryEntryEnvelope {
  success: boolean
  data: DictionaryEntry
}

export const flashcardsService = {
  async getDueCards(limit?: number): Promise<Flashcard[]> {
    const { data } = await apiClient.get<DueResponse>('/me/flashcards/due', {
      params: limit ? { limit } : undefined,
    })
    return data.data
  },

  async listFlashcards(params: ListFlashcardsParams = {}): Promise<ListFlashcardsResult> {
    const { data } = await apiClient.get<ListFlashcardsResult>('/me/flashcards', {
      params: {
        status: params.status,
        page: params.page,
        limit: params.limit,
      },
    })
    return data
  },

  async getDictionaryEntry(id: string): Promise<DictionaryEntry> {
    const { data } = await apiClient.get<DictionaryEntryEnvelope>(`/dictionary/${id}`)
    return data.data
  },

  async submitReview(flashcardId: string, dto: SubmitReviewDto): Promise<SubmitReviewResponse> {
    const { data } = await apiClient.post<SubmitReviewResponse>(
      `/me/flashcards/${flashcardId}/review`,
      dto,
    )
    return data
  },

  async deleteFlashcard(id: string): Promise<void> {
    await apiClient.delete(`/me/flashcards/${id}`)
  },

  async addFlashcard(dto: AddFlashcardDto): Promise<{ flashcardId: string }> {
    const { data } = await apiClient.post<{ flashcardId: string }>('/me/flashcards', dto)
    return data
  },

  async enrichWithEntries(cards: Flashcard[]): Promise<ReviewCard[]> {
    const entries = await Promise.all(
      cards.map((card) => flashcardsService.getDictionaryEntry(card.dictionaryEntryId)),
    )
    return cards.map((flashcard, idx) => ({ flashcard, entry: entries[idx] }))
  },
}
