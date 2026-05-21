'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '@shared/constants'
import { flashcardsService } from '../services/flashcards.service'
import type {
  ListFlashcardsParams,
  ListFlashcardsResult,
  ReviewCard,
  SubmitReviewDto,
  SubmitReviewResponse,
} from '../types'

export function useDueCards(limit?: number) {
  return useQuery<ReviewCard[]>({
    queryKey: QUERY_KEYS.FLASHCARD.SESSION,
    queryFn: async () => {
      const cards = await flashcardsService.getDueCards(limit)
      if (cards.length === 0) return []
      return flashcardsService.enrichWithEntries(cards)
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  })
}

export function useFlashcardList(params: ListFlashcardsParams = {}) {
  return useQuery<ListFlashcardsResult>({
    queryKey: [...QUERY_KEYS.FLASHCARD.HISTORY, params],
    queryFn: () => flashcardsService.listFlashcards(params),
  })
}

interface SubmitReviewVars {
  flashcardId: string
  rating: SubmitReviewDto['rating']
}

export function useSubmitReview() {
  return useMutation<SubmitReviewResponse, Error, SubmitReviewVars>({
    mutationFn: ({ flashcardId, rating }) =>
      flashcardsService.submitReview(flashcardId, { rating }),
    onError: () => {
      toast.error('Không thể lưu đánh giá. Vui lòng thử lại.')
    },
  })
}

export function useInvalidateFlashcards() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FLASHCARD.HISTORY })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD.STATS })
  }
}

export function useDeleteFlashcard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => flashcardsService.deleteFlashcard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FLASHCARD.SESSION })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FLASHCARD.HISTORY })
      toast.success('Đã xoá thẻ')
    },
    onError: () => {
      toast.error('Không thể xoá thẻ')
    },
  })
}
