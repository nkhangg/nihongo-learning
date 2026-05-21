'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '@shared/constants'
import { profileService } from '../services/profile.service'
import type { PublicVisibilityDto, UpdateProfileDto } from '../types'

export function useMyProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.PROFILE.ME,
    queryFn: profileService.getProfile,
  })
}

export function useProfileStats() {
  return useQuery({
    queryKey: QUERY_KEYS.PROFILE.STATS,
    queryFn: profileService.getStats,
  })
}

export function usePublicStats() {
  return useQuery({
    queryKey: QUERY_KEYS.PROFILE.PUBLIC_STATS,
    queryFn: profileService.getPublicStats,
  })
}

export function useProfileBadges() {
  return useQuery({
    queryKey: QUERY_KEYS.PROFILE.BADGES,
    queryFn: profileService.getBadges,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: UpdateProfileDto) => profileService.updateProfile(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE.ME })
      toast.success('Đã lưu thay đổi')
    },
    onError: () => {
      toast.error('Không thể lưu thay đổi. Thử lại sau.')
    },
  })
}

export function useUpdatePublicVisibility() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: PublicVisibilityDto) => profileService.updatePublicVisibility(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE.PUBLIC_STATS })
    },
    onError: () => {
      toast.error('Không thể cập nhật cài đặt. Thử lại sau.')
    },
  })
}

export function useDeleteLearningHistory() {
  return useMutation({
    mutationFn: profileService.deleteLearningHistory,
    onSuccess: () => {
      toast.success('Đã gửi yêu cầu xác nhận đến email của bạn')
    },
    onError: () => {
      toast.error('Có lỗi xảy ra. Thử lại sau.')
    },
  })
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: profileService.deleteAccount,
    onSuccess: () => {
      toast.success('Đã gửi yêu cầu xác nhận đến email của bạn')
    },
    onError: () => {
      toast.error('Có lỗi xảy ra. Thử lại sau.')
    },
  })
}
