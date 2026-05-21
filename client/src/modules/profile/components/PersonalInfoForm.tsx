'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Skeleton } from '@shared/components/ui'
import type { LearningGoal, JlptLevel, UserProfile } from '../types'
import { useUpdateProfile } from '../hooks/useProfile'

const schema = z.object({
  firstName: z.string().min(1, 'Bắt buộc'),
  lastName: z.string().min(1, 'Bắt buộc'),
  username: z.string().min(2, 'Tối thiểu 2 ký tự').regex(/^[a-z0-9_]+$/, 'Chỉ dùng chữ thường, số và _'),
  location: z.string().min(1, 'Bắt buộc'),
  bio: z.string().max(300, 'Tối đa 300 ký tự'),
  learningGoal: z.enum(['study_abroad', 'work', 'jlpt', 'culture']),
  currentLevel: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
})

type FormValues = z.infer<typeof schema>

const GOAL_OPTIONS: { value: LearningGoal; label: string }[] = [
  { value: 'study_abroad', label: 'Du học Nhật Bản' },
  { value: 'work', label: 'Làm việc tại Nhật' },
  { value: 'jlpt', label: 'Thi JLPT' },
  { value: 'culture', label: 'Yêu thích văn hóa Nhật' },
]

const LEVEL_OPTIONS: { value: JlptLevel; label: string }[] = [
  { value: 'N5', label: 'N5 — Sơ cấp' },
  { value: 'N4', label: 'N4 — Cơ bản' },
  { value: 'N3', label: 'N3 — Trung cấp' },
  { value: 'N2', label: 'N2 — Cao cấp' },
  { value: 'N1', label: 'N1 — Thành thạo' },
]

interface PersonalInfoFormProps {
  profile: UserProfile | undefined
  isLoading: boolean
}

export function PersonalInfoForm({ profile, isLoading }: PersonalInfoFormProps) {
  const { mutate: update, isPending } = useUpdateProfile()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      location: '',
      bio: '',
      learningGoal: 'study_abroad',
      currentLevel: 'N3',
    },
  })

  useEffect(() => {
    if (profile) reset(profile)
  }, [profile, reset])

  const onSubmit = (values: FormValues) => {
    update(values)
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-black/[.07] rounded-2xl overflow-hidden mb-5">
        <div className="px-5 py-4 border-b border-black/[.07]">
          <Skeleton className="h-4 w-36 mb-1" />
          <Skeleton className="h-3 w-52" />
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={i === 4 ? 'sm:col-span-2' : ''}>
              <Skeleton className="h-3 w-20 mb-1.5" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-black/[.07] rounded-2xl overflow-hidden mb-5">
      <div className="px-5 py-4 border-b border-black/[.07]">
        <p className="text-[13px] font-semibold">Thông tin cá nhân</p>
        <p className="text-[11px] text-zinc-500 mt-0.5">Hiển thị công khai trên hồ sơ của bạn</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Họ */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-700">Họ</label>
            <Input {...register('firstName')} className="h-10 rounded-xl text-[13px]" />
            {errors.firstName && <p className="text-[11px] text-red-500">{errors.firstName.message}</p>}
          </div>

          {/* Tên */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-700">Tên</label>
            <Input {...register('lastName')} className="h-10 rounded-xl text-[13px]" />
            {errors.lastName && <p className="text-[11px] text-red-500">{errors.lastName.message}</p>}
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-700">Username</label>
            <Input {...register('username')} className="h-10 rounded-xl text-[13px]" />
            {errors.username && <p className="text-[11px] text-red-500">{errors.username.message}</p>}
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-700">Thành phố / Quốc gia</label>
            <Input {...register('location')} className="h-10 rounded-xl text-[13px]" />
            {errors.location && <p className="text-[11px] text-red-500">{errors.location.message}</p>}
          </div>

          {/* Bio — full width */}
          <div className="sm:col-span-2 flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-700">Giới thiệu bản thân</label>
            <textarea
              {...register('bio')}
              rows={3}
              className="border border-zinc-200 rounded-xl px-3 py-2.5 text-[13px] text-zinc-900 resize-none focus:outline-none focus:border-zinc-900 transition-colors"
            />
            {errors.bio && <p className="text-[11px] text-red-500">{errors.bio.message}</p>}
          </div>

          {/* Learning goal */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-700">Mục tiêu học</label>
            <select
              {...register('learningGoal')}
              className="h-10 border border-zinc-200 rounded-xl px-3 text-[13px] text-zinc-900 bg-white focus:outline-none focus:border-zinc-900 transition-colors appearance-none cursor-pointer"
            >
              {GOAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Current level */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-700">Cấp độ hiện tại</label>
            <select
              {...register('currentLevel')}
              className="h-10 border border-zinc-200 rounded-xl px-3 text-[13px] text-zinc-900 bg-white focus:outline-none focus:border-zinc-900 transition-colors appearance-none cursor-pointer"
            >
              {LEVEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-black/[.07]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => profile && reset(profile)}
            disabled={!isDirty || isPending}
          >
            Huỷ
          </Button>
          <Button type="submit" size="sm" isLoading={isPending} disabled={!isDirty}>
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </div>
  )
}
