'use client'

import { useRouter } from 'next/navigation'
import { ROUTES } from '@config/routes'
import { QUIZ_DATA, GOALS, TIME_OPTIONS } from '../types'

interface ResultStepProps {
  answers: (number | undefined)[]
  selectedGoal: string | null
  selectedTime: string | null
}

interface DetectedLevel {
  badge: string
  bgColor: string
  fgColor: string
  label: string
}

function detectLevel(pct: number): DetectedLevel {
  if (pct >= 80) return { badge: 'N3', bgColor: '#FEF6E4', fgColor: '#C47D0E', label: 'Trung cấp' }
  if (pct >= 60) return { badge: 'N4', bgColor: '#E8F4FF', fgColor: '#1565C0', label: 'Cơ bản' }
  return { badge: 'N5', bgColor: '#E8F7F4', fgColor: '#0F8A72', label: 'Sơ cấp' }
}

export function ResultStep({ answers, selectedGoal, selectedTime }: ResultStepProps) {
  const router = useRouter()

  const correct = answers.filter((a, i) => a === QUIZ_DATA[i].ans).length
  const pct = Math.round((correct / QUIZ_DATA.length) * 100)
  const level = detectLevel(pct)

  const goalObj = GOALS.find((g) => g.id === selectedGoal)
  const timeObj = TIME_OPTIONS.find((t) => t.id === selectedTime)

  const roadmap = [
    { label: 'Tuần 1–2', desc: `Ôn lại bảng chữ cái, 20 từ vựng ${level.badge} đầu tiên` },
    { label: 'Tháng 1', desc: '150 từ vựng + 15 mẫu ngữ pháp cơ bản' },
    { label: 'Tháng 3', desc: `Mock test ${level.badge} lần đầu — dự kiến đạt 75%+` },
  ]

  return (
    <div className="animate-fade-up">
      {/* Score + heading */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-1.5 mb-6">
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground">
            Lộ trình của bạn
          </span>
        </div>

        <div className="w-24 h-24 rounded-full border-2 border-foreground mx-auto mb-6 flex flex-col items-center justify-center">
          <span className="text-[28px] font-semibold tracking-tight leading-none">
            {correct}/{QUIZ_DATA.length}
          </span>
          <span className="text-xs text-muted-foreground">{pct}% đúng</span>
        </div>

        <h1 className="text-[32px] font-light tracking-tight leading-[1.15] mb-5">
          Hệ thống đã<br />
          <strong className="font-semibold">xây dựng lộ trình!</strong>
        </h1>

        <div className="inline-flex items-center gap-2 bg-muted rounded-full px-4 py-1.5">
          <span
            className="font-mono text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: level.bgColor, color: level.fgColor }}
          >
            {level.badge}
          </span>
          <span className="text-[14px] text-foreground/80">Cấp độ phù hợp: {level.label}</span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-muted rounded-lg py-3.5 px-3 text-center">
          <div className="text-[20px] font-semibold mb-0.5 leading-none">{goalObj?.icon ?? '🎯'}</div>
          <div className="text-[11px] text-muted-foreground mt-1">{goalObj?.title ?? 'Mục tiêu'}</div>
        </div>
        <div className="bg-muted rounded-lg py-3.5 px-3 text-center">
          <div className="text-[14px] font-semibold font-mono mb-0.5">{level.badge}</div>
          <div className="text-[11px] text-muted-foreground">Cấp độ bắt đầu</div>
        </div>
        <div className="bg-muted rounded-lg py-3.5 px-3 text-center">
          <div className="text-[14px] font-semibold mb-0.5">
            {timeObj ? `${timeObj.time} phút` : '—'}
          </div>
          <div className="text-[11px] text-muted-foreground">Mỗi ngày</div>
        </div>
      </div>

      {/* Roadmap */}
      <div className="bg-card border border-border rounded-lg px-5 py-4 mb-6">
        <div className="text-[12px] font-medium text-muted-foreground mb-3 tracking-[0.04em] uppercase">
          Lộ trình gợi ý
        </div>
        <div className="flex flex-col gap-2.5">
          {roadmap.map((item, i) => (
            <div key={i} className="flex gap-2.5 items-center">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[13px] flex-shrink-0">
                {i + 1}
              </div>
              <div className="text-[13px] text-foreground/80">
                <strong className="font-semibold text-foreground">{item.label}:</strong>{' '}
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => router.push(ROUTES.DASHBOARD)}
        className="w-full py-3.5 bg-foreground text-background rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 hover:opacity-90 hover:-translate-y-px"
      >
        Vào Dashboard của tôi →
      </button>

      <p className="text-xs text-muted-foreground text-center mt-3.5">
        Bạn có thể thay đổi lộ trình bất cứ lúc nào trong cài đặt
      </p>
    </div>
  )
}
