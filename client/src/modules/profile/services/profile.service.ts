import type {
  Badge,
  PublicStats,
  PublicVisibilityDto,
  UpdateProfileDto,
  UserProfile,
  UserStats,
} from '../types'

const MOCK_PROFILE: UserProfile = {
  id: '1',
  firstName: 'Minh Tuấn',
  lastName: 'Nguyễn',
  username: 'minhtuan',
  location: 'Hà Nội, Việt Nam',
  bio: 'Muốn đạt N2 trước cuối năm 2025. Học tiếng Nhật để đi du học và làm việc tại Nhật Bản.',
  learningGoal: 'study_abroad',
  currentLevel: 'N3',
}

const MOCK_STATS: UserStats = {
  masteredWords: 421,
  currentStreak: 21,
  retentionRate: 87,
}

const MOCK_PUBLIC_STATS: PublicStats = {
  studyDays: 248,
  masteredWords: 421,
  currentStreak: 21,
  bestStreak: 65,
  isPublic: true,
}

const MOCK_BADGES: Badge[] = [
  { id: '1', icon: '🔥', name: 'Streak 7 ngày', description: 'Đã đạt', locked: false },
  { id: '2', icon: '🏅', name: '100 từ đầu', description: 'Đã đạt', locked: false },
  { id: '3', icon: '⚡', name: 'Tốc độ học', description: 'Đã đạt', locked: false },
  { id: '4', icon: '🎯', name: 'N5 Hoàn thành', description: 'Đã đạt', locked: false },
  { id: '5', icon: '📚', name: 'Mọt sách', description: 'Đã đạt', locked: false },
  { id: '6', icon: '🌙', name: 'Cú đêm', description: 'Học lúc 12h đêm', locked: true },
  { id: '7', icon: '🏆', name: 'Pass N3', description: 'Chưa đạt', locked: true },
  { id: '8', icon: '💎', name: 'Streak 100', description: 'Còn 79 ngày', locked: true },
  { id: '9', icon: '🗾', name: '1000 từ vựng', description: 'Còn 579 từ', locked: true },
  { id: '10', icon: '🎌', name: 'N1 Master', description: 'Chưa đạt', locked: true },
]

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    return MOCK_PROFILE
  },

  async updateProfile(dto: UpdateProfileDto): Promise<UserProfile> {
    return { ...MOCK_PROFILE, ...dto }
  },

  async getStats(): Promise<UserStats> {
    return MOCK_STATS
  },

  async getPublicStats(): Promise<PublicStats> {
    return MOCK_PUBLIC_STATS
  },

  async updatePublicVisibility(dto: PublicVisibilityDto): Promise<void> {
    void dto
  },

  async getBadges(): Promise<Badge[]> {
    return MOCK_BADGES
  },

  async deleteLearningHistory(): Promise<void> {
    // no-op
  },

  async deleteAccount(): Promise<void> {
    // no-op
  },
}
