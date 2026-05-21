'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '@shared/constants'
import { grammarService } from '../services/grammar.service'
import type { GrammarFilter } from '../types'

export function useGrammarLessons(filter: GrammarFilter) {
  return useQuery({
    queryKey: [...QUERY_KEYS.GRAMMAR.LESSONS, filter],
    queryFn: () => grammarService.getLessons(filter),
  })
}

export function useAddToFlashcard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: grammarService.addToFlashcard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FLASHCARD.SESSION })
      toast.success('Đã thêm vào Flashcard')
    },
    onError: () => {
      toast.error('Không thể thêm vào Flashcard')
    },
  })
}
