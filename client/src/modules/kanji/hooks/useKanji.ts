'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '@shared/constants'
import { kanjiService } from '../services/kanji.service'
import type { KanjiStatus, ListKanjiParams } from '../types'

export function useKanjiList(params: ListKanjiParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.KANJI.LIST(params),
    queryFn: () => kanjiService.listKanji(params),
    placeholderData: keepPreviousData,
  })
}

export function useKanji(id: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.KANJI.DETAIL(id ?? ''),
    queryFn: () => kanjiService.getKanji(id!),
    enabled: !!id,
  })
}

export function useRadicals() {
  return useQuery({
    queryKey: QUERY_KEYS.KANJI.RADICALS,
    queryFn: () => kanjiService.listRadicals(),
    staleTime: Infinity,
  })
}

export function useMyKanjiProgress() {
  return useQuery({
    queryKey: QUERY_KEYS.KANJI.PROGRESS,
    queryFn: () => kanjiService.getMyKanjiProgress(),
  })
}

export function useWritingQueue(level?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.KANJI.WRITING_QUEUE(level),
    queryFn: () => kanjiService.getWritingQueue(level),
  })
}

export function useUpdateKanjiStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: KanjiStatus }) =>
      kanjiService.updateKanjiStatus(id, status),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.KANJI.LIST({}) })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.KANJI.DETAIL(id) })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.KANJI.PROGRESS })
      toast.success('Đã cập nhật trạng thái')
    },
    onError: () => toast.error('Cập nhật thất bại'),
  })
}

export function useSubmitWritingAttempt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: import('../types').WritingAttemptDto }) =>
      kanjiService.submitWritingAttempt(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.KANJI.DETAIL(id) })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.KANJI.PROGRESS })
    },
    onError: () => toast.error('Không thể lưu kết quả. Vui lòng thử lại.'),
  })
}

export function useStartKanjiQuiz() {
  return useMutation({
    mutationFn: (config: import('../types').KanjiQuizConfig) =>
      kanjiService.startKanjiQuiz(config),
    onError: () => toast.error('Không thể bắt đầu quiz. Vui lòng thử lại.'),
  })
}

export function useSubmitKanjiQuizAnswer() {
  return useMutation({
    mutationFn: ({ sessionId, dto }: { sessionId: string; dto: import('../types').KanjiQuizAnswerDto }) =>
      kanjiService.submitKanjiQuizAnswer(sessionId, dto),
    onError: () => toast.error('Lỗi gửi đáp án'),
  })
}

export function useFinishKanjiQuiz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) => kanjiService.finishKanjiQuiz(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.KANJI.PROGRESS })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD.STATS })
    },
    onError: () => toast.error('Không thể kết thúc quiz'),
  })
}
