'use client'

import { useCallback, useEffect, useRef } from 'react'

// Node colors from CSS variables (HSL values)
const NODE_COLORS_LIGHT = [
  'hsl(250, 100%, 65%)', // violet
  'hsl(210, 100%, 60%)', // blue
  'hsl(185, 100%, 50%)', // cyan
  'hsl(160, 85%, 45%)',  // emerald
  'hsl(40, 95%, 55%)',   // amber
  'hsl(350, 90%, 60%)',  // rose
]

const NODE_COLORS_DARK = [
  'hsl(250, 100%, 70%)', // violet
  'hsl(210, 100%, 65%)', // blue
  'hsl(185, 100%, 55%)', // cyan
  'hsl(160, 85%, 50%)',  // emerald
  'hsl(40, 95%, 60%)',   // amber
  'hsl(350, 90%, 65%)',  // rose
]

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  colorIndex: number
  phase: number
  pulseSpeed: number
}

interface Edge {
  from: number
  to: number
}

interface HeroGraphProps {
  className?: string
  nodeCount?: number
  connectionDistance?: number
}

export function HeroGraph({
  className = '',
  nodeCount = 50,
  connectionDistance = 150
}: HeroGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<Node[]>([])
  const edgesRef = useRef<Edge[]>([])
  const animationRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0, y: 0, active: false })
  const isDarkRef = useRef(false)

  // Initialize nodes once
  const initNodes = useCallback((width: number, height: number) => {
    const nodes: Node[] = []
    const padding = 50

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: padding + Math.random() * (width - padding * 2),
        y: padding + Math.random() * (height - padding * 2),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 2 + Math.random() * 2,
        colorIndex: Math.floor(Math.random() * NODE_COLORS_LIGHT.length),
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.5 + Math.random() * 1,
      })
    }

    // Pre-calculate edges
    const edges: Edge[] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x
        const dy = nodes[i].y - nodes[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < connectionDistance) {
          edges.push({ from: i, to: j })
        }
      }
    }

    nodesRef.current = nodes
    edgesRef.current = edges
  }, [nodeCount, connectionDistance])

  // Main render loop - optimized
  const render = useCallback((time: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // Throttle to ~40fps for better performance
    const delta = time - lastTimeRef.current
    if (delta < 25) {
      animationRef.current = requestAnimationFrame(render)
      return
    }
    lastTimeRef.current = time

    const { width, height } = canvas
    const dpr = window.devicePixelRatio || 1
    const w = width / dpr
    const h = height / dpr

    const nodes = nodesRef.current
    const edges = edgesRef.current
    const colors = isDarkRef.current ? NODE_COLORS_DARK : NODE_COLORS_LIGHT
    const lineColor = isDarkRef.current ? 'rgba(255,255,255,' : 'rgba(0,0,0,'

    // Clear
    ctx.clearRect(0, 0, width, height)

    // Update positions
    const timeSec = time * 0.001
    for (const node of nodes) {
      // Gentle drift
      node.x += node.vx
      node.y += node.vy

      // Bounce off edges
      if (node.x < 20 || node.x > w - 20) node.vx *= -1
      if (node.y < 20 || node.y > h - 20) node.vy *= -1

      // Clamp
      node.x = Math.max(10, Math.min(w - 10, node.x))
      node.y = Math.max(10, Math.min(h - 10, node.y))

      // Subtle mouse attraction
      if (mouseRef.current.active) {
        const dx = mouseRef.current.x - node.x
        const dy = mouseRef.current.y - node.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200 && dist > 0) {
          const force = 0.0003 * (200 - dist)
          node.vx += (dx / dist) * force
          node.vy += (dy / dist) * force
        }
      }

      // Damping
      node.vx *= 0.995
      node.vy *= 0.995
    }

    // Draw edges
    ctx.lineWidth = 1 * dpr
    for (const edge of edges) {
      const n1 = nodes[edge.from]
      const n2 = nodes[edge.to]
      const dx = n1.x - n2.x
      const dy = n1.y - n2.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < connectionDistance * 1.2) {
        const alpha = Math.max(0, 0.15 * (1 - dist / (connectionDistance * 1.2)))
        ctx.strokeStyle = lineColor + alpha + ')'
        ctx.beginPath()
        ctx.moveTo(n1.x * dpr, n1.y * dpr)
        ctx.lineTo(n2.x * dpr, n2.y * dpr)
        ctx.stroke()
      }
    }

    // Draw nodes with glow
    for (const node of nodes) {
      const pulse = 1 + Math.sin(timeSec * node.pulseSpeed + node.phase) * 0.3
      const r = node.radius * pulse * dpr
      const color = colors[node.colorIndex]

      // Glow (simple radial gradient)
      const gradient = ctx.createRadialGradient(
        node.x * dpr, node.y * dpr, 0,
        node.x * dpr, node.y * dpr, r * 4
      )
      gradient.addColorStop(0, color.replace(')', ', 0.6)').replace('hsl', 'hsla'))
      gradient.addColorStop(0.5, color.replace(')', ', 0.15)').replace('hsl', 'hsla'))
      gradient.addColorStop(1, 'transparent')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(node.x * dpr, node.y * dpr, r * 4, 0, Math.PI * 2)
      ctx.fill()

      // Core
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(node.x * dpr, node.y * dpr, r, 0, Math.PI * 2)
      ctx.fill()
    }

    animationRef.current = requestAnimationFrame(render)
  }, [connectionDistance])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Check dark mode
    const checkDark = () => {
      isDarkRef.current = document.documentElement.classList.contains('dark')
    }
    checkDark()

    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    const handleResize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (!rect) return

      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      initNodes(rect.width, rect.height)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current.active = false
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    animationRef.current = requestAnimationFrame(render)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', handleResize)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationRef.current)
    }
  }, [initNodes, render])

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  )
}
