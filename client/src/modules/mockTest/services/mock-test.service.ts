import type { JlptLevel, LevelMeta, Question, PreviousAttempt, SectionBreakdown, WeaknessItem, ExamResult, OptionId } from '../types'

export const LEVEL_META: Record<JlptLevel, LevelMeta> = {
  N5: { questionCount: 60, duration: 50, passingScore: 80, maxScore: 120 },
  N4: { questionCount: 75, duration: 70, passingScore: 90, maxScore: 150 },
  N3: { questionCount: 95, duration: 105, passingScore: 95, maxScore: 180 },
  N2: { questionCount: 110, duration: 125, passingScore: 90, maxScore: 180 },
  N1: { questionCount: 110, duration: 170, passingScore: 100, maxScore: 180 },
}

export const LEVEL_LABELS: Record<JlptLevel, string> = {
  N5: 'Sơ cấp',
  N4: 'Cơ bản',
  N3: 'Trung cấp',
  N2: 'Cao cấp',
  N1: 'Thành thạo',
}

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 1,
    section: 'vocabulary',
    text: 'Chọn nghĩa đúng của từ được gạch chân:',
    jpText: '彼女は毎朝散歩します。',
    underlinedWord: '散歩',
    options: [
      { id: 'A', text: 'tập thể dục trong nhà' },
      { id: 'B', text: 'đi dạo, tản bộ' },
      { id: 'C', text: 'đi mua sắm' },
      { id: 'D', text: 'nghỉ ngơi, thư giãn' },
    ],
    correctId: 'B',
    explanation: '散歩（さんぽ）nghĩa là "đi dạo, tản bộ". Câu này có nghĩa: "Mỗi sáng cô ấy đi dạo."',
  },
  {
    id: 2,
    section: 'vocabulary',
    text: 'Chọn từ phù hợp để điền vào chỗ trống:',
    jpText: '彼は____な人です。いつも親切にしてくれます。',
    options: [
      { id: 'A', text: '厳しい — nghiêm khắc' },
      { id: 'B', text: '優しい — tốt bụng, hiền' },
      { id: 'C', text: '難しい — khó' },
      { id: 'D', text: '寂しい — cô đơn' },
    ],
    correctId: 'B',
    explanation: '優しい（やさしい）nghĩa là "tốt bụng, hiền lành". Câu: "Anh ấy là người tốt bụng. Luôn đối xử tử tế."',
  },
  {
    id: 3,
    section: 'vocabulary',
    text: 'Chọn cách đọc đúng của từ được gạch chân:',
    jpText: 'この店の料理はとても美味しい。',
    underlinedWord: '料理',
    options: [
      { id: 'A', text: 'りょうり' },
      { id: 'B', text: 'りょり' },
      { id: 'C', text: 'ろうり' },
      { id: 'D', text: 'りょりょ' },
    ],
    correctId: 'A',
    explanation: '料理（りょうり）nghĩa là "món ăn, nấu ăn". Câu: "Món ăn ở cửa hàng này rất ngon."',
  },
  {
    id: 4,
    section: 'vocabulary',
    text: 'Chọn từ trái nghĩa với「複雑」:',
    jpText: '彼女の説明はとても複雑だった。',
    underlinedWord: '複雑',
    options: [
      { id: 'A', text: '単純 — đơn giản' },
      { id: 'B', text: '簡単 — dễ dàng' },
      { id: 'C', text: '普通 — bình thường' },
      { id: 'D', text: '特別 — đặc biệt' },
    ],
    correctId: 'A',
    explanation: '複雑（ふくざつ）= phức tạp. Trái nghĩa là 単純（たんじゅん）= đơn giản.',
  },
  {
    id: 5,
    section: 'vocabulary',
    text: 'Từ nào sau đây có nghĩa là "tham gia, tham dự"?',
    jpText: '会議に____する予定です。',
    options: [
      { id: 'A', text: '参加（さんか）' },
      { id: 'B', text: '参考（さんこう）' },
      { id: 'C', text: '参拝（さんぱい）' },
      { id: 'D', text: '参列（さんれつ）' },
    ],
    correctId: 'A',
    explanation: '参加（さんか）= "tham gia, tham dự". Câu: "Tôi dự định tham gia cuộc họp."',
  },
  {
    id: 6,
    section: 'vocabulary',
    text: 'Chọn nghĩa đúng của cụm từ:',
    jpText: '彼は時間を____して、いつも遅刻します。',
    options: [
      { id: 'A', text: '大切に（trân trọng）' },
      { id: 'B', text: '無駄に（lãng phí）' },
      { id: 'C', text: '上手に（khéo léo）' },
      { id: 'D', text: '正直に（trung thực）' },
    ],
    correctId: 'B',
    explanation: '無駄にする（むだにする）= lãng phí. Câu: "Anh ấy lãng phí thời gian nên lúc nào cũng đến muộn."',
  },
  {
    id: 7,
    section: 'vocabulary',
    text: 'Từ nào sau đây có nghĩa là "cẩn thận, chú ý"?',
    jpText: '____して運転してください。',
    options: [
      { id: 'A', text: '注意（ちゅうい）' },
      { id: 'B', text: '注目（ちゅうもく）' },
      { id: 'C', text: '注文（ちゅうもん）' },
      { id: 'D', text: '注射（ちゅうしゃ）' },
    ],
    correctId: 'A',
    explanation: '注意（ちゅうい）= chú ý, cẩn thận. Câu: "Xin hãy lái xe cẩn thận."',
  },
  {
    id: 8,
    section: 'grammar',
    text: 'Chọn mẫu ngữ pháp phù hợp để hoàn thành câu:',
    jpText: '雨が降る____、試合は中止になるでしょう。',
    options: [
      { id: 'A', text: 'と' },
      { id: 'B', text: 'なら' },
      { id: 'C', text: 'たら' },
      { id: 'D', text: 'ば' },
    ],
    correctId: 'A',
    explanation: '〜と biểu thị điều kiện tự nhiên/kết quả chắc chắn. Câu: "Nếu trời mưa thì trận đấu sẽ bị hủy."',
  },
  {
    id: 9,
    section: 'grammar',
    text: 'Chọn dạng đúng để điền vào chỗ trống:',
    jpText: 'もっと早く来れば____のに。',
    options: [
      { id: 'A', text: 'よかった' },
      { id: 'B', text: 'いい' },
      { id: 'C', text: 'よかって' },
      { id: 'D', text: 'いかった' },
    ],
    correctId: 'A',
    explanation: '〜ればよかった biểu thị sự hối tiếc. Câu: "Giá mà đến sớm hơn thì tốt rồi."',
  },
  {
    id: 10,
    section: 'grammar',
    text: 'Chọn trợ từ đúng trong câu sử dụng thể sai khiến:',
    jpText: '先生は学生____レポートを書かせました。',
    options: [
      { id: 'A', text: 'を' },
      { id: 'B', text: 'に' },
      { id: 'C', text: 'が' },
      { id: 'D', text: 'で' },
    ],
    correctId: 'B',
    explanation: '「Aに〜させる」= để A làm ~. Câu: "Giáo viên để học sinh viết báo cáo."',
  },
  {
    id: 11,
    section: 'grammar',
    text: 'Chọn mẫu câu biểu thị "mặc dù...nhưng":',
    jpText: '毎日練習した____、試験に落ちてしまった。',
    options: [
      { id: 'A', text: 'のに' },
      { id: 'B', text: 'から' },
      { id: 'C', text: 'ので' },
      { id: 'D', text: 'が' },
    ],
    correctId: 'A',
    explanation: '〜のに biểu thị sự tương phản/thất vọng. Câu: "Mặc dù luyện tập mỗi ngày nhưng vẫn trượt thi."',
  },
  {
    id: 12,
    section: 'grammar',
    text: 'Chọn mẫu câu phù hợp:',
    jpText: '彼は病気____、学校を休んだ。',
    options: [
      { id: 'A', text: 'なので' },
      { id: 'B', text: 'ので' },
      { id: 'C', text: 'だが' },
      { id: 'D', text: 'から' },
    ],
    correctId: 'A',
    explanation: 'Danh từ + なので: "vì là ~". Câu: "Vì bị ốm nên anh ấy nghỉ học."',
  },
  {
    id: 13,
    section: 'grammar',
    text: 'Chọn đáp án đúng để hoàn thành câu chờ đợi:',
    jpText: '彼女が来る____待っていました。',
    options: [
      { id: 'A', text: 'のを' },
      { id: 'B', text: 'のは' },
      { id: 'C', text: 'のに' },
      { id: 'D', text: 'のが' },
    ],
    correctId: 'A',
    explanation: '「〜のを待つ」= chờ đợi (ai/cái gì). Câu: "Tôi đã chờ cô ấy đến."',
  },
  {
    id: 14,
    section: 'grammar',
    text: 'Câu nào diễn đạt đúng ý "Tôi muốn bạn giúp tôi":',
    jpText: 'あなたに____もらいたいです。',
    options: [
      { id: 'A', text: '手伝って' },
      { id: 'B', text: '手伝う' },
      { id: 'C', text: '手伝い' },
      { id: 'D', text: '手伝わ' },
    ],
    correctId: 'A',
    explanation: '「Te-form + もらいたい」= muốn được ai đó làm. Câu: "Tôi muốn bạn giúp tôi."',
  },
  {
    id: 15,
    section: 'reading',
    text: 'Tác giả muốn nói điều gì qua đoạn văn sau?',
    jpText:
      '日本では、春になると桜の花が咲きます。人々は公園や川のそばで花見をして、春の訪れを喜びます。',
    options: [
      { id: 'A', text: 'Người Nhật thích ngắm hoa anh đào vào mùa xuân' },
      { id: 'B', text: 'Mùa xuân ở Nhật rất nguy hiểm' },
      { id: 'C', text: 'Hoa anh đào chỉ nở ở công viên' },
      { id: 'D', text: 'Người Nhật không thích mùa xuân' },
    ],
    correctId: 'A',
    explanation: 'Đoạn văn mô tả tập tục hanami — ngắm hoa anh đào tại công viên và bờ sông vào mùa xuân.',
  },
  {
    id: 16,
    section: 'reading',
    text: 'Theo thông báo, điều gì đúng?',
    jpText: '電車が5分遅れています。お客様にはご不便をおかけして申し訳ございません。',
    options: [
      { id: 'A', text: 'Tàu điện đến sớm 5 phút' },
      { id: 'B', text: 'Tàu điện bị hoãn 5 phút' },
      { id: 'C', text: 'Tàu điện bị hủy toàn bộ' },
      { id: 'D', text: 'Tàu điện chạy đúng giờ' },
    ],
    correctId: 'B',
    explanation: '遅れる = "bị trễ, bị hoãn". Thông báo xin lỗi vì tàu trễ 5 phút.',
  },
  {
    id: 17,
    section: 'reading',
    text: 'Chọn tiêu đề phù hợp nhất cho đoạn văn:',
    jpText:
      '毎日少しずつ勉強することが大切です。一度にたくさん勉強しようとすると、すぐに疲れてしまいます。継続は力なりと言います。',
    options: [
      { id: 'A', text: 'Học một lần nhiều giờ là tốt nhất' },
      { id: 'B', text: 'Kiên trì học từng bước mỗi ngày' },
      { id: 'C', text: 'Không cần học hàng ngày' },
      { id: 'D', text: 'Học tiếng Nhật rất khó' },
    ],
    correctId: 'B',
    explanation: '継続は力なり = "Kiên trì là sức mạnh". Đoạn văn nhấn mạnh học từng chút mỗi ngày hiệu quả hơn học nhiều một lúc.',
  },
  {
    id: 18,
    section: 'reading',
    text: 'Theo đoạn văn, điều gì xảy ra khi cố học nhiều một lúc?',
    jpText:
      '毎日少しずつ勉強することが大切です。一度にたくさん勉強しようとすると、すぐに疲れてしまいます。',
    options: [
      { id: 'A', text: 'Học được nhiều hơn' },
      { id: 'B', text: 'Mau mệt' },
      { id: 'C', text: 'Học tốt hơn' },
      { id: 'D', text: 'Nhớ lâu hơn' },
    ],
    correctId: 'B',
    explanation: '「すぐに疲れてしまいます」= "sẽ mệt ngay". Học nhiều một lúc sẽ mau mệt.',
  },
  {
    id: 19,
    section: 'reading',
    text: 'Người viết thư muốn nói điều gì?',
    jpText:
      '先日はお世話になりました。おかげさまで無事に帰国することができました。またいつかお会いできることを楽しみにしております。',
    options: [
      { id: 'A', text: 'Xin lỗi vì đã làm phiền' },
      { id: 'B', text: 'Cảm ơn và mong gặp lại' },
      { id: 'C', text: 'Thông báo đã về nước' },
      { id: 'D', text: 'Mời gặp mặt lần sau' },
    ],
    correctId: 'B',
    explanation: '「またいつかお会いできることを楽しみにしております」= mong được gặp lại. Thư bày tỏ lòng biết ơn và hy vọng gặp lại.',
  },
  {
    id: 20,
    section: 'reading',
    text: 'Từ「申し訳ございません」trong đoạn văn có nghĩa là gì?',
    jpText: '本日はご迷惑をおかけしてしまい、申し訳ございません。',
    options: [
      { id: 'A', text: 'Cảm ơn rất nhiều' },
      { id: 'B', text: 'Xin lỗi (lịch sự)' },
      { id: 'C', text: 'Chào mừng' },
      { id: 'D', text: 'Hẹn gặp lại' },
    ],
    correctId: 'B',
    explanation: '「申し訳ございません」là cách xin lỗi rất lịch sự trong tiếng Nhật. Câu: "Hôm nay đã làm phiền quý vị, tôi rất xin lỗi."',
  },
]

export const MOCK_PREVIOUS_ATTEMPT: PreviousAttempt = {
  level: 'N3',
  score: 78,
  maxScore: 180,
  passed: false,
  needMorePoints: 17,
}

const WEAKNESS_DESCRIPTIONS: Record<string, string> = {
  grammar: 'Ngữ pháp điều kiện (〜たら、〜ば、〜と、〜なら)',
  vocabulary: 'Từ vựng N3 — Nhóm trạng từ và phó từ',
  reading: 'Đọc hiểu — Tìm ý chính đoạn văn dài',
}

export function computeExamResult(
  questions: Question[],
  answers: Record<number, OptionId>,
  levelMeta: LevelMeta,
  previousScore: number,
): ExamResult {
  const SECTION_MAX = 60
  const sectionKeys = ['vocabulary', 'grammar', 'reading'] as const
  const sectionLabels = { vocabulary: 'Từ vựng', grammar: 'Ngữ pháp', reading: 'Đọc hiểu' }
  const sectionColors = { vocabulary: 'teal', grammar: 'amber', reading: 'red' }

  const breakdown: SectionBreakdown[] = sectionKeys
    .map((section) => {
      const qs = questions.filter((q) => q.section === section)
      if (qs.length === 0) return null
      const correct = qs.filter((q) => answers[q.id] === q.correctId).length
      const percentage = Math.round((correct / qs.length) * 100)
      const score = Math.round((correct / qs.length) * SECTION_MAX)
      return {
        section,
        label: sectionLabels[section],
        score,
        maxScore: SECTION_MAX,
        percentage,
        color: sectionColors[section],
      }
    })
    .filter(Boolean) as SectionBreakdown[]

  const totalScore = breakdown.reduce((sum, bd) => sum + bd.score, 0)
  const maxScore = breakdown.reduce((sum, bd) => sum + bd.maxScore, 0)
  const passed = totalScore >= levelMeta.passingScore
  const needMorePoints = Math.max(0, levelMeta.passingScore - totalScore)
  const improvedBy = Math.max(0, totalScore - previousScore)

  const weaknesses: WeaknessItem[] = [...breakdown]
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 3)
    .map((bd, i) => ({
      text: WEAKNESS_DESCRIPTIONS[bd.section] ?? bd.label,
      percentage: bd.percentage,
      color: (['red', 'amber', 'teal'] as const)[i],
    }))

  return { totalScore, maxScore, passed, breakdown, weaknesses, previousScore, improvedBy, needMorePoints }
}
