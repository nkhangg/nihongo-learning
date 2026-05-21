'use client'

import { useEffect, useCallback } from 'react'
import type { useWritingCanvas } from '../hooks/useWritingCanvas'

type CanvasController = ReturnType<typeof useWritingCanvas>

interface StrokeCanvasProps {
  controller: CanvasController
  ghostChar?: string
  showAnswer?: boolean
  size?: number
}

function drawStrokes(
  ctx: CanvasRenderingContext2D,
  strokes: CanvasController['strokes'],
  currentStroke: CanvasController['currentStroke'],
  strokeWidth: number,
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  const w = ctx.canvas.width
  const h = ctx.canvas.height

  // Grid lines
  ctx.strokeStyle = 'rgba(13,13,15,0.07)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h)
  ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2)
  ctx.moveTo(0, 0); ctx.lineTo(w, h)
  ctx.moveTo(w, 0); ctx.lineTo(0, h)
  ctx.stroke()
  ctx.setLineDash([])

  const drawPath = (points: Array<{ x: number; y: number }>, color: string) => {
    if (points.length < 2) return
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = strokeWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.moveTo(points[0].x * w, points[0].y * h)
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x * w, points[i].y * h)
    }
    ctx.stroke()
  }

  strokes.forEach((s, idx) => {
    const alpha = 0.4 + 0.6 * ((idx + 1) / (strokes.length || 1))
    drawPath(s.points, `rgba(79,70,229,${alpha})`)
  })

  if (currentStroke) {
    drawPath(currentStroke.points, '#4f46e5')
  }
}

export function StrokeCanvas({ controller, ghostChar, showAnswer = false, size = 280 }: StrokeCanvasProps) {
  const { canvasRef, strokes, currentStroke, strokeWidth, startStroke, continueStroke, endStroke } = controller

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawStrokes(ctx, strokes, currentStroke, strokeWidth)
  }, [canvasRef, strokes, currentStroke, strokeWidth])

  useEffect(() => {
    redraw()
  }, [redraw])

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    startStroke(e.clientX, e.clientY)
  }
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.buttons === 0) return
    continueStroke(e.clientX, e.clientY)
  }
  const handlePointerUp = () => endStroke()

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Ghost kanji */}
      {ghostChar && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span style={{ fontSize: size * 0.78, color: showAnswer ? 'rgba(13,13,15,0.18)' : 'rgba(13,13,15,0.05)', lineHeight: 1 }}>
            {ghostChar}
          </span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{ touchAction: 'none', cursor: 'crosshair', background: '#fffef7', display: 'block' }}
        className="rounded-xl border border-black/[.07]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  )
}
