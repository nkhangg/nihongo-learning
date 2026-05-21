export interface OnboardingGoal {
  id: string
  icon: string
  title: string
  desc: string
}

export interface OnboardingLevel {
  id: string
  badge: string
  bgColor: string
  fgColor: string
  title: string
  desc: string
}

export interface QuizQuestion {
  q: string
  jp?: string
  reading?: string
  opts: string[]
  ans: number
  level: string
}

export interface TimeOption {
  id: string
  time: string
  unit: string
  desc: string
}

export const TOTAL_STEPS = 5

export const GOALS: OnboardingGoal[] = [
  { id: 'jlpt', icon: '🏆', title: 'Thi JLPT', desc: 'Chuẩn bị cho kỳ thi năng lực tiếng Nhật N5 → N1' },
  { id: 'work', icon: '💼', title: 'Làm việc', desc: 'Giao tiếp công việc, email, hội họp bằng tiếng Nhật' },
  { id: 'travel', icon: '✈️', title: 'Du lịch', desc: 'Giao tiếp khi đi du lịch, đọc biển hiệu, hỏi đường' },
  { id: 'anime', icon: '🎌', title: 'Anime & Manga', desc: 'Hiểu không cần phụ đề, đọc manga bản gốc' },
  { id: 'culture', icon: '🍣', title: 'Văn hóa & Ẩm thực', desc: 'Hiểu sâu hơn về văn hóa, ẩm thực, cuộc sống Nhật' },
  { id: 'other', icon: '✨', title: 'Mục tiêu khác', desc: 'Tôi có lý do riêng để học tiếng Nhật' },
]

export const LEVELS: OnboardingLevel[] = [
  { id: 'zero', badge: '0', bgColor: '#F2F2EF', fgColor: '#7A7A85', title: 'Chưa biết gì', desc: 'Chưa biết bảng chữ cái Hiragana, bắt đầu từ đầu' },
  { id: 'n5', badge: 'N5', bgColor: '#E8F7F4', fgColor: '#0F8A72', title: 'Sơ cấp', desc: 'Biết Hiragana/Katakana, vốn từ vựng và ngữ pháp cơ bản' },
  { id: 'n4', badge: 'N4', bgColor: '#E8F4FF', fgColor: '#1565C0', title: 'Cơ bản', desc: 'Giao tiếp hàng ngày đơn giản, biết khoảng 300–500 Kanji' },
  { id: 'n3', badge: 'N3', bgColor: '#FEF6E4', fgColor: '#C47D0E', title: 'Trung cấp', desc: 'Đọc hiểu tương đối, làm việc môi trường Nhật được' },
  { id: 'n2n1', badge: 'N2+', bgColor: '#FFF0F2', fgColor: '#E8334A', title: 'Cao cấp', desc: 'Thành thạo, chỉ cần luyện thêm các kỹ năng chuyên sâu' },
]

export const QUIZ_DATA: QuizQuestion[] = [
  {
    q: '「ありがとう」có nghĩa là gì?',
    jp: 'ありがとう',
    reading: 'arigatou',
    opts: ['Xin chào', 'Cảm ơn', 'Tạm biệt', 'Xin lỗi'],
    ans: 1,
    level: 'N5',
  },
  {
    q: 'Chọn cách đọc đúng của chữ Kanji này:',
    jp: '山',
    reading: '',
    opts: ['かわ / kawa', 'やま / yama', 'もり / mori', 'うみ / umi'],
    ans: 1,
    level: 'N5',
  },
  {
    q: '「電車で学校に＿＿＿＿」— Điền mẫu câu đúng:',
    opts: ['行きます', '行くです', '行いです', '行きです'],
    ans: 0,
    level: 'N4',
  },
  {
    q: '「彼女は歌が上手だ」có nghĩa là gì?',
    opts: ['Cô ấy thích hát', 'Cô ấy hát hay', 'Cô ấy đang hát', 'Cô ấy học hát'],
    ans: 1,
    level: 'N3',
  },
  {
    q: '「〜にもかかわらず」diễn đạt ý nghĩa nào?',
    opts: ['Vì vậy / do đó', 'Mặc dù / bất chấp', 'Nếu / trong trường hợp', 'Trong khi / đồng thời'],
    ans: 1,
    level: 'N2',
  },
]

export const TIME_OPTIONS: TimeOption[] = [
  { id: '5', time: '5', unit: 'phút/ngày', desc: 'Học nhẹ nhàng, ổn định' },
  { id: '15', time: '15', unit: 'phút/ngày', desc: 'Tiến độ đều đặn' },
  { id: '30', time: '30', unit: 'phút/ngày', desc: 'Học nghiêm túc' },
  { id: '60', time: '60', unit: 'phút/ngày', desc: 'Tăng tốc nhanh' },
  { id: 'custom', time: '—', unit: 'Tự chọn', desc: 'Linh hoạt mỗi ngày' },
]
