import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import type { NestjsPaginateParams } from '@shared/components/ui/data-table'
import { QUERY_KEYS } from '@shared/constants'
import type { UpdateUserInfoDto } from '../types'
import { userService } from '../services/user.service'

function extractApiError(error: unknown, fallback: string): string {
  const data = (error as AxiosError<{ message: string | string[] }>).response?.data
  if (Array.isArray(data?.message) && data.message.length > 0) return data.message[0]
  if (typeof data?.message === 'string') return data.message
  return fallback
}

export function useUsers(params: NestjsPaginateParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ADMIN.USERS, JSON.stringify(params)],
    queryFn: () => userService.listUsers(params),
    placeholderData: keepPreviousData,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.USERS }),
    onError: (error) =>
      toast.error(extractApiError(error, t('common.error', { defaultValue: 'Có lỗi xảy ra' }))),
  })
}

export function useUpdateUserInfo() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string } & UpdateUserInfoDto) =>
      userService.updateUserInfo(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.USERS }),
    onError: (error) =>
      toast.error(extractApiError(error, t('common.error', { defaultValue: 'Có lỗi xảy ra' }))),
  })
}

export function useUpdateUserRole() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      userService.updateUserRole(id, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.USERS }),
    onError: (error) =>
      toast.error(extractApiError(error, t('common.error', { defaultValue: 'Có lỗi xảy ra' }))),
  })
}

export function useActivateUser() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => userService.activateUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.USERS }),
    onError: (error) =>
      toast.error(extractApiError(error, t('common.error', { defaultValue: 'Có lỗi xảy ra' }))),
  })
}

export function useDeactivateUser() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => userService.deactivateUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.USERS }),
    onError: (error) =>
      toast.error(extractApiError(error, t('common.error', { defaultValue: 'Có lỗi xảy ra' }))),
  })
}
