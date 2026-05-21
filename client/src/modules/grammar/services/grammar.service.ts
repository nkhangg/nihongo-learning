import type { GrammarFilter, GrammarLesson, GrammarListResponse } from '../types'

const MOCK_LESSONS: GrammarLesson[] = [
  { id: '1', pattern: '〜ている', meaning: 'Đang làm gì / trạng thái hiện tại', level: 'n5', types: ['Trạng từ'], structure: 'V-te + いる', examples: [{ japanese: '今、ご飯を食べています。', vietnamese: 'Tôi đang ăn cơm.' }, { japanese: '彼は結婚しています。', vietnamese: 'Anh ấy đã kết hôn (trạng thái).' }], status: 'learned' },
  { id: '2', pattern: '〜たい', meaning: 'Muốn làm gì', level: 'n5', types: ['Trạng từ'], structure: 'V-masu-stem + たい', examples: [{ japanese: '日本に行きたいです。', vietnamese: 'Tôi muốn đi Nhật.' }], status: 'learned' },
  { id: '3', pattern: '〜てください', meaning: 'Xin hãy làm gì (yêu cầu lịch sự)', level: 'n5', types: ['Lịch sự'], structure: 'V-te + ください', examples: [{ japanese: 'ここに名前を書いてください。', vietnamese: 'Xin hãy viết tên vào đây.' }], status: 'studying' },
  { id: '4', pattern: '〜ません', meaning: 'Phủ định lịch sự ở thể hiện tại', level: 'n5', types: ['Lịch sự'], structure: 'V-masu-stem + ません', examples: [{ japanese: '肉は食べません。', vietnamese: 'Tôi không ăn thịt.' }], status: 'unlearned' },
  { id: '5', pattern: '〜から', meaning: 'Vì / bởi vì (lý do)', level: 'n5', types: ['Nối câu'], structure: 'Câu + から', examples: [{ japanese: '眠いから、寝ます。', vietnamese: 'Vì buồn ngủ nên tôi đi ngủ.' }], status: 'learned' },
  { id: '6', pattern: '〜が、〜', meaning: 'Nhưng / tuy nhiên (đối lập nhẹ)', level: 'n4', types: ['Nối câu'], structure: 'Câu 1 + が + Câu 2', examples: [{ japanese: '行きたいですが、時間がありません。', vietnamese: 'Tôi muốn đi nhưng không có thời gian.' }], status: 'learned' },
  { id: '7', pattern: '〜ば', meaning: 'Nếu (điều kiện giả định)', level: 'n4', types: ['Điều kiện'], structure: 'V-ba form', examples: [{ japanese: '勉強すれば、合格できます。', vietnamese: 'Nếu học thì có thể đỗ.' }], status: 'studying' },
  { id: '8', pattern: '〜られる', meaning: 'Bị động / khả năng', level: 'n4', types: ['Bị động', 'Khả năng'], structure: 'V-passive form', examples: [{ japanese: '先生に褒められました。', vietnamese: 'Tôi được thầy khen.' }], status: 'unlearned' },
  { id: '9', pattern: '〜ながら', meaning: 'Vừa... vừa... (đồng thời)', level: 'n4', types: ['Đồng thời'], structure: 'V-masu-stem + ながら', examples: [{ japanese: '音楽を聴きながら勉強します。', vietnamese: 'Vừa học vừa nghe nhạc.' }], status: 'studying' },
  { id: '10', pattern: '〜ために', meaning: 'Để (mục đích)', level: 'n4', types: ['Nối câu'], structure: 'V-dict / N + ために', examples: [{ japanese: '合格するために、毎日勉強します。', vietnamese: 'Để đỗ, tôi học mỗi ngày.' }], status: 'unlearned' },
  { id: '11', pattern: '〜ほど', meaning: 'Càng... càng... / mức độ', level: 'n3', types: ['So sánh'], structure: 'N / V + ほど', examples: [{ japanese: '練習するほど上手になります。', vietnamese: 'Càng luyện tập càng giỏi.' }], status: 'unlearned' },
  { id: '12', pattern: '〜にもかかわらず', meaning: 'Mặc dù (đối lập mạnh)', level: 'n2', types: ['Nối câu'], structure: 'N / V-dict + にもかかわらず', examples: [{ japanese: '反対にもかかわらず、計画を進めた。', vietnamese: 'Mặc dù bị phản đối, kế hoạch vẫn tiến hành.' }], status: 'unlearned' },
  { id: '13', pattern: '〜に違いない', meaning: 'Chắc chắn là...', level: 'n2', types: ['Trạng từ'], structure: 'V-dict / Adj + に違いない', examples: [{ japanese: '彼は知っているに違いない。', vietnamese: 'Anh ấy chắc chắn biết rồi.' }], status: 'unlearned' },
  { id: '14', pattern: '〜ことになっている', meaning: 'Đã được quyết định / theo quy định', level: 'n3', types: ['Nối câu'], structure: 'V-dict / V-nai + ことになっている', examples: [{ japanese: '会議は３時に始まることになっている。', vietnamese: 'Cuộc họp được quy định bắt đầu lúc 3 giờ.' }], status: 'unlearned' },
  { id: '15', pattern: '〜わけではない', meaning: 'Không phải là (phủ định một phần)', level: 'n2', types: ['Nối câu'], structure: 'V / Adj + わけではない', examples: [{ japanese: '嫌いなわけではないが、好きでもない。', vietnamese: 'Không phải ghét nhưng cũng không phải thích.' }], status: 'unlearned' },
]

const PAGE_SIZE = 10

export const grammarService = {
  async getLessons(params: Partial<GrammarFilter>): Promise<GrammarListResponse> {
    let lessons = [...MOCK_LESSONS]

    if (params.search) {
      const q = params.search.toLowerCase()
      lessons = lessons.filter(
        (l) => l.pattern.toLowerCase().includes(q) || l.meaning.toLowerCase().includes(q),
      )
    }
    if (params.level && params.level !== 'all') {
      lessons = lessons.filter((l) => l.level === params.level)
    }
    if (params.types?.length) {
      lessons = lessons.filter((l) => params.types!.some((t) => l.types.includes(t)))
    }
    if (params.statusFilter && params.statusFilter !== 'all') {
      lessons = lessons.filter((l) => l.status === params.statusFilter)
    }

    const total = lessons.length
    const learnedCount = MOCK_LESSONS.filter((l) => l.status === 'learned').length
    const page = params.page ?? 1
    const start = (page - 1) * PAGE_SIZE
    const paginated = lessons.slice(start, start + PAGE_SIZE)

    return {
      lessons: paginated,
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      learnedCount,
    }
  },

  async addToFlashcard(_lessonId: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 300))
  },
}
