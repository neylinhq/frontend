/**
 * WebGL-based graph visualization (WASM + WebGL2)
 * Drop-in replacement 4;O GraphVisualization A B0:8< 65 API
 */

import { Loader2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Edge, FullMap, Node } from '@/entities/map'
import { useFullMap } from '@/entities/map'
import { Card } from '@/shared/components/card'
import { cn } from '@/shared/lib/cn'
import { useGraphEngine } from '../hooks/use-graph-engine'

interface GraphWebGLVisualizationProps {
  mapId: string
  className?: string
  interactive?: boolean
  initialData?: FullMap
  renderConnectionsPanel?: (
    node: Node,
    edges: Edge[],
    allNodes: Node[],
    onOpenNode?: (id: string) => void,
    onPanToNode?: (id: string) => void
  ) => React.ReactNode
}

export const GraphWebGLVisualization = ({
  mapId,
  className,
  interactive = true,
  initialData,
  renderConnectionsPanel
}: GraphWebGLVisualizationProps) => {
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()

  // Fetch data (8;8 8A?>;L7>20BL initialData 4;O SSR)
  const { data: fetchedMap, isLoading, isError } = useFullMap(mapId, { enabled: !initialData })
  const fullMap = initialData ?? fetchedMap

  // Initialize WASM engine
  const { engine, ready, error, initEngine } = useGraphEngine({ autoInit: false })

  // View state
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)

  // Initialize engine when canvas is ready
  useEffect(() => {
    if (canvasRef.current && !ready && !error) {
      initEngine(canvasRef.current).catch(err => {
        console.error('Failed to init engine:', err)
      })
    }
  }, [ready, error, initEngine])

  // Load graph data when ready
  useEffect(() => {
    if (engine && ready && fullMap) {
      try {
        console.log('[GraphWebGL] Loading graph:', {
          nodes: fullMap.nodes.length,
          edges: fullMap.edges.length
        })

        engine.loadGraph(fullMap.nodes, fullMap.edges)
        engine.runLayout(150)

        console.log('[GraphWebGL] Layout complete, stats:', engine.getStats())
      } catch (err) {
        console.error('Failed to load graph:', err)
      }
    }
  }, [engine, ready, fullMap])

  // Handle canvas resize
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !engine) return

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        const canvas = canvasRef.current
        if (canvas) {
          // Set canvas size with device pixel ratio
          const dpr = window.devicePixelRatio || 1
          canvas.width = width * dpr
          canvas.height = height * dpr
          canvas.style.width = `${width}px`
          canvas.style.height = `${height}px`

          engine.setResolution(width * dpr, height * dpr)
        }
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [engine])

  // Render loop
  useEffect(() => {
    if (!engine || !ready) return

    let frameCount = 0
    const renderFrame = () => {
      try {
        engine.setView(panX, panY, zoom)
        engine.render()

        // Log first few frames
        if (frameCount < 3) {
          console.log('[GraphWebGL] Render frame', frameCount, 'view:', { panX, panY, zoom })
          frameCount++
        }
      } catch (err) {
        console.error('Render error:', err)
      }

      animationFrameRef.current = requestAnimationFrame(renderFrame)
    }

    renderFrame()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [engine, ready, panX, panY, zoom])

  // Mouse controls
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!interactive) return

      setIsDragging(true)
      dragStartRef.current = { x: e.clientX, y: e.clientY }
    },
    [interactive]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDragging || !dragStartRef.current) return

      const dx = e.clientX - dragStartRef.current.x
      const dy = e.clientY - dragStartRef.current.y

      setPanX(prev => prev + dx / zoom)
      setPanY(prev => prev + dy / zoom)

      dragStartRef.current = { x: e.clientX, y: e.clientY }
    },
    [isDragging, zoom]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    dragStartRef.current = null
  }, [])

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      if (!interactive) return

      e.preventDefault()

      const delta = -e.deltaY * 0.001
      setZoom(prev => Math.max(0.1, Math.min(5, prev * (1 + delta))))
    },
    [interactive]
  )

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn('flex items-center justify-center', className)}>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        <span className='ml-2 text-muted-foreground'>{t('graph.loading')}</span>
      </Card>
    )
  }

  // Error state
  if (isError || error) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className='text-center'>
          <p className='text-destructive font-medium'>{t('graph.error')}</p>
          <p className='text-sm text-muted-foreground mt-1'>
            {error?.message || t('graph.error_loading')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative w-full h-full', className)} ref={containerRef}>
      <canvas
        ref={canvasRef}
        className='w-full h-full cursor-move'
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Status overlay */}
      {ready && engine && (
        <div className='absolute top-2 right-2 bg-background border rounded px-2 py-1 text-xs font-mono shadow-sm'>
          <div>Zoom: {zoom.toFixed(2)}x</div>
          <div>Nodes: {engine.getStats().nodesRendered}</div>
          <div className='text-green-500'>WebGL</div>
        </div>
      )}

      {/* Loading overlay while initializing */}
      {!ready && !error && (
        <div className='absolute inset-0 flex items-center justify-center bg-background/90'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <span className='ml-2'>Initializing WebGL...</span>
        </div>
      )}
    </div>
  )
}
