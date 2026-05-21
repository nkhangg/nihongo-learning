import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import type { NestjsPaginateParams } from '@shared/components/ui/data-table'
import { QUERY_KEYS } from '@shared/constants'
import type { UpdateConfigDto, CreateConfigDto } from '../types'
import { configService } from '../services/config.service'

function extractApiError(error: unknown, fallback: string): string {
  const data = (error as AxiosError<{ message: string | string[] }>).response?.data
  if (Array.isArray(data?.message) && data.message.length > 0) return data.message[0]
  if (typeof data?.message === 'string') return data.message
  return fallback
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useConfigs(params: NestjsPaginateParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CONFIGS, JSON.stringify(params)],
    queryFn: () => configService.listConfigs(params),
    placeholderData: keepPreviousData,
  })
}

export function useConfig(id: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CONFIGS, id],
    queryFn: () => configService.getConfig(id!),
    enabled: !!id,
  })
}

export function useCreateConfig() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (dto: CreateConfigDto) => configService.createConfig(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.CONFIGS }),
    onError: (error: unknown) =>
      toast.error(extractApiError(error, t('common.error', { defaultValue: 'Có lỗi xảy ra' }))),
  })
}

export function useUpdateConfig() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string } & UpdateConfigDto) =>
      configService.updateConfig(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.CONFIGS }),
    onError: (error: unknown) =>
      toast.error(extractApiError(error, t('common.error', { defaultValue: 'Có lỗi xảy ra' }))),
  })
}

export function useToggleConfig() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => configService.toggleConfig(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.CONFIGS }),
    onError: (error: unknown) =>
      toast.error(extractApiError(error, t('common.error', { defaultValue: 'Có lỗi xảy ra' }))),
  })
}

export function useDeleteConfig() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => configService.deleteConfig(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.CONFIGS }),
    onError: (error: unknown) =>
      toast.error(extractApiError(error, t('common.error', { defaultValue: 'Có lỗi xảy ra' }))),
  })
}
