import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { NestjsPaginateParams } from '@shared/components/ui/data-table'
import { QUERY_KEYS } from '@shared/constants'
import { kanjiService } from '../services/kanji.service'
import type { CreateKanjiDto, UpdateKanjiDto } from '../types'

export function useKanjiSearch(query: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.KANJI.LIST, 'search', query],
    queryFn: () => kanjiService.list({ search: query, searchBy: ['char', 'meaningVi'], limit: 8, page: 1 }),
    enabled: query.length >= 1,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}

export function useKanjiList(params?: NestjsPaginateParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.KANJI.LIST, JSON.stringify(params)],
    queryFn: () => kanjiService.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useKanji(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.KANJI.ENTRY, id],
    queryFn: () => kanjiService.getById(id!),
    enabled: !!id,
  })
}

export function useCreateKanji() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateKanjiDto) => kanjiService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.KANJI.LIST })
    },
    onError: () => toast.error('Thêm kanji thất bại'),
  })
}

export function useUpdateKanji() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateKanjiDto }) =>
      kanjiService.update(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.KANJI.LIST })
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.KANJI.ENTRY, id] })
    },
    onError: () => toast.error('Cập nhật kanji thất bại'),
  })
}

export function useDeleteKanji() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => kanjiService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.KANJI.LIST })
    },
    onError: () => toast.error('Xóa kanji thất bại'),
  })
}

export function usePublishKanji() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => kanjiService.publish(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.KANJI.LIST })
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.KANJI.ENTRY, id] })
    },
    onError: () => toast.error('Xuất bản thất bại'),
  })
}

export function useUnpublishKanji() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => kanjiService.unpublish(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.KANJI.LIST })
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.KANJI.ENTRY, id] })
    },
    onError: () => toast.error('Hủy xuất bản thất bại'),
  })
}
