'use client'

import { useMyProfile, useProfileStats } from '../hooks/useProfile'
import { ProfileCard } from './ProfileCard'
import { PersonalInfoForm } from './PersonalInfoForm'
import { PublicStatsSection } from './PublicStatsSection'
import { BadgesSection } from './BadgesSection'
import { DangerZoneSection } from './DangerZoneSection'

export function ProfilePage() {
  const { data: profile, isLoading: profileLoading } = useMyProfile()
  const { data: stats, isLoading: statsLoading } = useProfileStats()

  return (
    <div className="p-4 pb-8 lg:p-7 lg:pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        {/* Left */}
        <div className="lg:sticky lg:top-[57px]">
          <ProfileCard
            profile={profile}
            stats={stats}
            isLoading={profileLoading || statsLoading}
          />
        </div>

        {/* Right */}
        <div>
          <PersonalInfoForm profile={profile} isLoading={profileLoading} />
          <PublicStatsSection />
          <BadgesSection />
          <DangerZoneSection />
        </div>
      </div>
    </div>
  )
}
