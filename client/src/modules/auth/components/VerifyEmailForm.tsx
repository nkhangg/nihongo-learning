'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@shared/utils'
import { ROUTES } from '@shared/constants'

const OTP_LENGTH = 6

type Phase = 'form' | 'success'
type VerifyState = 'idle' | 'loading' | 'success' | 'error'

interface VerifyEmailFormProps {
  email?: string
}

export function VerifyEmailForm({ email = 'your@email.com' }: VerifyEmailFormProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('form')
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [verifyState, setVerifyState] = useState<VerifyState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [timerSec, setTimerSec] = useState(600)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null))

  // Countdown timer
  useEffect(() => {
    if (phase !== 'form') return
    const id = setInterval(() => {
      setTimerSec((s) => {
        if (s <= 1) {
          clearInterval(id)
          setCanResend(true)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [phase])

  // Auto-redirect after success
  useEffect(() => {
    if (phase !== 'success') return
    const id = setTimeout(() => router.push(ROUTES.ONBOARDING), 3500)
    return () => clearTimeout(id)
  }, [phase, router])

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const isFull = digits.every((d) => d !== '')

  const clearErrors = useCallback(() => {
    setErrorMsg('')
    if (verifyState === 'error') setVerifyState('idle')
  }, [verifyState])

  const handleInput = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    clearErrors()
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits]
      next[index - 1] = ''
      setDigits(next)
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text')
    const digs = text.replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!digs) return
    const next = Array(OTP_LENGTH).fill('')
    digs.split('').forEach((ch, i) => { next[i] = ch })
    setDigits(next)
    const focusIdx = Math.min(digs.length, OTP_LENGTH - 1)
    inputRefs.current[focusIdx]?.focus()
    clearErrors()
  }

  const handleVerify = async () => {
    if (!isFull || verifyState === 'loading' || verifyState === 'success') return
    setVerifyState('loading')
    // Mock: simulate API call — replace with real hook when BE is ready
    await new Promise((r) => setTimeout(r, 1000))
    setVerifyState('success')
    setTimeout(() => setPhase('success'), 600)
  }

  const handleResend = () => {
    setTimerSec(600)
    setCanResend(false)
    setDigits(Array(OTP_LENGTH).fill(''))
    setVerifyState('idle')
    setErrorMsg('')
    inputRefs.current[0]?.focus()
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* ── Nav ── */}
      <nav className="flex items-center justify-between border-b border-border bg-card px-6 py-3.5 sm:px-8">
        <Link href={ROUTES.HOME} className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-foreground">
            <span className="font-mono text-xs text-background">日</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">Nihongo</span>
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="h-1.5 w-1.5 rounded-full bg-pine" title="Đăng ký" />
          <div className="h-1.5 w-1.5 rounded-full bg-foreground" title="Xác nhận email" />
          <div className="h-1.5 w-1.5 rounded-full bg-surface-2" title="Onboarding" />
          <span className="ml-1">Bước 2 / 3</span>
        </div>
      </nav>

      {/* ── Step bar ── */}
      <div className="h-[3px] bg-surface-2">
        <div className="h-full w-2/3 bg-foreground transition-all duration-500" />
      </div>

      {/* ── Page ── */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(13,13,15,0.04) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 w-full max-w-[420px]">

          {/* ── FORM STATE ── */}
          {phase === 'form' && (
            <div className="rounded-xl border border-border bg-card px-8 py-10 text-center shadow-[0_4px_32px_rgba(13,13,15,0.06)] sm:rounded-[20px] sm:px-9">

              {/* Email icon */}
              <div className="relative mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-surface">
                <span className="text-[28px] leading-none">✉️</span>
                <span className="absolute right-1 top-1 h-4 w-4 animate-pulse rounded-full border-2 border-card bg-amber" />
              </div>

              <h1 className="mb-1.5 text-[22px] font-semibold tracking-tight">
                Xác nhận email
              </h1>
              <span className="mb-[1.1rem] inline-block rounded-md border border-border bg-surface px-2.5 py-0.5 font-mono text-xs text-foreground/70">
                {email}
              </span>
              <p className="mx-auto mb-7 max-w-[300px] text-[13px] leading-relaxed text-muted-foreground">
                Chúng tôi đã gửi mã xác nhận 6 chữ số đến email của bạn. Mã có hiệu lực trong{' '}
                <strong className="text-foreground/80">10 phút</strong>.
              </p>

              {/* OTP inputs */}
              <div
                className="mb-3 flex justify-center gap-1.5 sm:gap-2"
                onPaste={handlePaste}
              >
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    value={digit}
                    onChange={(e) => handleInput(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={cn(
                      'h-[50px] w-[40px] rounded-lg border-[1.5px] text-center font-mono text-xl font-medium text-foreground outline-none transition-all',
                      'sm:h-[54px] sm:w-[46px] sm:rounded-[14px] sm:text-[22px]',
                      'focus:border-foreground focus:bg-surface focus:shadow-[0_0_0_3px_rgba(13,13,15,0.06)]',
                      !digit && 'border-border bg-card',
                      digit && verifyState !== 'error' && verifyState !== 'success' && 'border-foreground/40 bg-card',
                      verifyState === 'error' && 'animate-shake border-destructive bg-vermillion-light',
                      verifyState === 'success' && 'border-pine bg-pine-light',
                    )}
                  />
                ))}
              </div>

              <p className="mb-5 text-xs text-muted-foreground/70">
                Nhập mã gồm <strong className="text-muted-foreground">6 chữ số</strong>
              </p>

              {/* Error message */}
              <p
                className={cn(
                  'mb-3 min-h-[16px] text-xs text-destructive transition-opacity duration-200',
                  errorMsg ? 'opacity-100' : 'opacity-0 select-none',
                )}
              >
                {errorMsg || ' '}
              </p>

              {/* Resend row */}
              <div className="mb-6 flex items-center justify-center gap-2 text-[13px] text-muted-foreground">
                <span>Chưa nhận được?</span>
                {!canResend ? (
                  <span className="font-mono text-[13px] font-medium text-foreground/60">
                    {formatTime(timerSec)}
                  </span>
                ) : (
                  <button
                    onClick={handleResend}
                    className="font-medium text-muted-foreground underline underline-offset-[3px] transition-colors hover:text-foreground"
                  >
                    Gửi lại
                  </button>
                )}
              </div>

              {/* Verify button */}
              <button
                onClick={handleVerify}
                disabled={!isFull || verifyState === 'loading' || verifyState === 'success'}
                className={cn(
                  'mb-[1.1rem] flex h-12 w-full items-center justify-center gap-2 rounded-lg text-[15px] font-semibold tracking-tight text-white transition-all duration-200',
                  'sm:rounded-[14px]',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  verifyState !== 'success' && 'bg-foreground enabled:hover:-translate-y-px enabled:hover:bg-foreground/80 enabled:hover:shadow-[0_4px_12px_rgba(13,13,15,0.12)]',
                  verifyState === 'loading' && 'cursor-wait opacity-70',
                  verifyState === 'success' && 'bg-pine',
                )}
              >
                {verifyState === 'loading' && (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Đang xác nhận...
                  </span>
                )}
                {verifyState === 'success' && '✓ Đã xác nhận'}
                {(verifyState === 'idle' || verifyState === 'error') && 'Xác nhận'}
              </button>

              {/* Footer */}
              <p className="text-xs text-muted-foreground/60">
                Email sai?{' '}
                <button
                  onClick={() => {
                    // Placeholder — change email flow when BE ready
                  }}
                  className="text-muted-foreground underline underline-offset-[3px] transition-colors hover:text-foreground"
                >
                  Thay đổi email
                </button>
                <span className="mx-1.5 opacity-40">·</span>
                <Link
                  href={ROUTES.DASHBOARD}
                  className="text-muted-foreground underline underline-offset-[3px] transition-colors hover:text-foreground"
                >
                  Bỏ qua
                </Link>
              </p>
            </div>
          )}

          {/* ── SUCCESS STATE ── */}
          {phase === 'success' && (
            <div className="rounded-xl border border-border bg-card px-8 py-10 text-center shadow-[0_4px_32px_rgba(13,13,15,0.06)] sm:rounded-[20px] sm:px-9">
              <div className="mx-auto mb-6 flex h-[72px] w-[72px] animate-pop-in items-center justify-center rounded-full border-2 border-pine-light bg-pine-light text-[30px]">
                ✅
              </div>
              <h2 className="mb-2 text-[22px] font-semibold tracking-tight">
                Email đã xác nhận!
              </h2>
              <p className="mx-auto mb-3 max-w-[280px] text-[13px] leading-relaxed text-muted-foreground">
                Tài khoản của bạn đã được kích hoạt. Hãy hoàn thành thêm vài bước để cá nhân hoá lộ trình học.
              </p>
              <p className="mb-1 text-xs text-muted-foreground/60">
                Chuyển hướng tự động sau 3 giây...
              </p>
              <div className="my-3 h-1 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full animate-countdown rounded-full bg-pine" />
              </div>
              <Link href={ROUTES.ONBOARDING} className="block">
                <button className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-pine text-[15px] font-semibold tracking-tight text-white transition-all hover:-translate-y-px hover:bg-pine/90 sm:rounded-[14px]">
                  Tiếp tục cài đặt →
                </button>
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
