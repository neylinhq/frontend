/**
 * React hook 4;O C?@02;5=8O WASM graph engine
 */
import { useEffect, useRef, useState } from 'react'
import type { GraphEngine } from '../lib/wasm-adapter'

export interface UseGraphEngineOptions {
  autoInit?: boolean
}

export interface UseGraphEngineReturn {
  engine: GraphEngine | null
  ready: boolean
  error: Error | null
  initEngine: (canvas: HTMLCanvasElement) => Promise<void>
}

export const useGraphEngine = (options: UseGraphEngineOptions = {}): UseGraphEngineReturn => {
  const { autoInit = true } = options

  const [engine, setEngine] = useState<GraphEngine | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const initPromiseRef = useRef<Promise<void> | null>(null)

  const initEngine = async (canvas: HTMLCanvasElement) => {
    // Prevent multiple initializations
    if (initPromiseRef.current) {
      return initPromiseRef.current
    }

    canvasRef.current = canvas

    const promise = (async () => {
      try {
        setError(null)

        // Dynamic import 4;O :>40-A?;8BB8=30
        const { GraphEngine } = await import('../lib/wasm-adapter')

        const engineInstance = new GraphEngine()
        await engineInstance.init(canvas)

        setEngine(engineInstance)
        setReady(true)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize graph engine')
        setError(error)
        throw error
      }
    })()

    initPromiseRef.current = promise
    return promise
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (engine) {
        engine.dispose()
      }
    }
  }, [engine])

  return {
    engine,
    ready,
    error,
    initEngine
  }
}
