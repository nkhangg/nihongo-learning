import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '@shared/constants'
import { kanjiRadicalService } from '../services/kanji-radical.service'
import type { CreateKanjiRadicalDto, UpdateKanjiRadicalDto } from '../types'

export function useKanjiRadicals() {
  return useQuery({
    queryKey: QUERY_KEYS.KANJI.RADICALS,
    queryFn: () => kanjiRadicalService.list(),
  })
}

export function useCreateKanjiRadical() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateKanjiRadicalDto) => kanjiRadicalService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.KANJI.RADICALS })
    },
    onError: () => toast.error('Thêm bộ thủ thất bại'),
  })
}

export function useUpdateKanjiRadical() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateKanjiRadicalDto }) =>
      kanjiRadicalService.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.KANJI.RADICALS })
    },
    onError: () => toast.error('Cập nhật bộ thủ thất bại'),
  })
}

export function useDeleteKanjiRadical() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => kanjiRadicalService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.KANJI.RADICALS })
    },
    onError: () => toast.error('Xóa bộ thủ thất bại'),
  })
}
