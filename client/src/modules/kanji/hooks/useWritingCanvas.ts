'use client'

import { useCallback, useRef, useState } from 'react'
import type { WritingStroke } from '../types'

export type CanvasMode = 'free' | 'step' | 'guided'
export type CanvasTool = 'pen' | 'eraser'

interface CanvasState {
  strokes: WritingStroke[]
  currentStroke: WritingStroke | null
  mode: CanvasMode
  tool: CanvasTool
  strokeWidth: number
  isDrawing: boolean
  startedAt: number | null
}

const INITIAL_STATE: CanvasState = {
  strokes: [],
  currentStroke: null,
  mode: 'free',
  tool: 'pen',
  strokeWidth: 4,
  isDrawing: false,
  startedAt: null,
}

export function useWritingCanvas() {
  const [state, setState] = useState<CanvasState>(INITIAL_STATE)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const historyRef = useRef<WritingStroke[][]>([[]])

  const normalizePoint = useCallback(
    (clientX: number, clientY: number): { x: number; y: number; t: number } => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0, t: Date.now() }
      const rect = canvas.getBoundingClientRect()
      return {
        x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
        y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
        t: Date.now(),
      }
    },
    [],
  )

  const startStroke = useCallback(
    (clientX: number, clientY: number) => {
      const pt = normalizePoint(clientX, clientY)
      setState((prev) => ({
        ...prev,
        isDrawing: true,
        startedAt: prev.startedAt ?? Date.now(),
        currentStroke: { points: [pt] },
      }))
    },
    [normalizePoint],
  )

  const continueStroke = useCallback(
    (clientX: number, clientY: number) => {
      setState((prev) => {
        if (!prev.isDrawing || !prev.currentStroke) return prev
        const pt = normalizePoint(clientX, clientY)
        return {
          ...prev,
          currentStroke: {
            points: [...prev.currentStroke.points, pt],
          },
        }
      })
    },
    [normalizePoint],
  )

  const endStroke = useCallback(() => {
    setState((prev) => {
      if (!prev.currentStroke) return prev
      const newStrokes = [...prev.strokes, prev.currentStroke]
      historyRef.current.push(newStrokes)
      return { ...prev, isDrawing: false, strokes: newStrokes, currentStroke: null }
    })
  }, [])

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.strokes.length === 0) return prev
      const newStrokes = prev.strokes.slice(0, -1)
      return { ...prev, strokes: newStrokes, currentStroke: null }
    })
  }, [])

  const clear = useCallback(() => {
    setState((prev) => ({ ...prev, strokes: [], currentStroke: null, startedAt: null }))
    historyRef.current = [[]]
  }, [])

  const setMode = useCallback((mode: CanvasMode) => setState((prev) => ({ ...prev, mode })), [])
  const setTool = useCallback((tool: CanvasTool) => setState((prev) => ({ ...prev, tool })), [])
  const setStrokeWidth = useCallback(
    (strokeWidth: number) => setState((prev) => ({ ...prev, strokeWidth })),
    [],
  )

  const getDurationMs = useCallback(() => {
    if (!state.startedAt) return 0
    return Date.now() - state.startedAt
  }, [state.startedAt])

  return {
    canvasRef,
    strokes: state.strokes,
    currentStroke: state.currentStroke,
    mode: state.mode,
    tool: state.tool,
    strokeWidth: state.strokeWidth,
    isDrawing: state.isDrawing,
    strokeCount: state.strokes.length,
    startStroke,
    continueStroke,
    endStroke,
    undo,
    clear,
    setMode,
    setTool,
    setStrokeWidth,
    getDurationMs,
  }
}
