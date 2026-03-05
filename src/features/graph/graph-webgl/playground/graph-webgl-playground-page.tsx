import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { Edge, Node, RelationType } from '@/entities/map'
import { Button } from '@/shared/components/button'
import { Card } from '@/shared/components/card'
import { Label } from '@/shared/components/label'
import { SegmentedControl } from '@/shared/components/segmented-control'
import { Slider } from '@/shared/components/slider'
import { Switch } from '@/shared/components/switch'
import { cn } from '@/shared/lib/cn'

import { GraphCanvas, type GraphCanvasHandle, type ViewportState } from '../components/graph-canvas'
import {
  DEFAULT_RENDER_PARAMS,
  type GraphWebGLRenderParams
} from '../model/graph-webgl.render-params'

type BackgroundMode = 'none' | 'dots' | 'paper'

function useFps() {
  const [fps, setFps] = useState(0)

  useEffect(() => {
    let raf = 0
    let frames = 0
    let last = performance.now()

    const loop = (t: number) => {
      frames += 1
      const dt = t - last
      if (dt >= 1000) {
        setFps(Math.round((frames * 1000) / dt))
        frames = 0
        last = t
      }
      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return fps
}

function createDemoGraph(mapId = 'playground') {
  const now = new Date().toISOString()
  const mkNode = (id: string, label: string, type: Node['type'], x: number, y: number): Node => ({
    id,
    mapId,
    label,
    type,
    position: { x, y },
    metadata: {},
    createdAt: now,
    updatedAt: now
  })

  const mkEdge = (
    id: string,
    sourceNodeId: string,
    targetNodeId: string,
    relationType: RelationType,
    strength: number,
    confidence: number,
    bidirectional = false
  ): Edge => ({
    id,
    mapId,
    sourceNodeId,
    targetNodeId,
    relationType,
    label: relationType,
    strength,
    bidirectional,
    metadata: { confidence, createdBy: 'ai' },
    createdAt: now,
    updatedAt: now
  })

  const sx = 360
  const sy = 220
  const x0 = 120
  const y0 = 120

  const nodes: Node[] = [
    mkNode('n1', 'Gradient Descent', 'concept', x0 + sx * 0, y0 + sy * 0),
    mkNode('n2', 'Backpropagation', 'theory', x0 + sx * 1, y0 + sy * 0),
    mkNode('n3', 'Chain Rule', 'fact', x0 + sx * 2, y0 + sy * 0),
    mkNode(
      'n4',
      'Why do deep networks generalize even when over-parameterized?',
      'question',
      x0 + sx * 3,
      y0 + sy * 0
    ),
    mkNode('n5', 'XOR (Nonlinear Separability)', 'example', x0 + sx * 0, y0 + sy * 1),
    mkNode('n6', 'Dropout Improves Generalization', 'hypothesis', x0 + sx * 1, y0 + sy * 1),
    mkNode('n7', 'Geoffrey Hinton', 'person', x0 + sx * 2, y0 + sy * 1),
    mkNode('n8', 'Stanford', 'school', x0 + sx * 3, y0 + sy * 1)
  ]

  const edges: Edge[] = [
    mkEdge('e1', 'n3', 'n2', 'prerequisite', 0.7, 0.95),
    mkEdge('e2', 'n2', 'n1', 'explains', 0.65, 0.92),
    mkEdge('e3', 'n6', 'n4', 'influences', 0.55, 0.9),
    mkEdge('e4', 'n5', 'n1', 'related-to', 0.4, 0.85, true),
    mkEdge('e5', 'n6', 'n1', 'has-a', 0.45, 0.6),
    mkEdge('e6', 'n7', 'n6', 'causes', 0.35, 0.8),
    mkEdge('e7', 'n8', 'n7', 'part-of', 0.3, 0.55),
    mkEdge('e8', 'n5', 'n2', 'is-a', 0.5, 0.7),
    mkEdge('e9', 'n4', 'n6', 'contradicts', 0.25, 0.35),
    mkEdge('e10', 'n7', 'n8', 'similar-to', 0.2, 0.4)
  ]

  return { nodes, edges }
}

function generateLargeGraph(mapId: string, nodeCount: number, edgeCount: number) {
  const now = new Date().toISOString()
  const types: Node['type'][] = [
    'concept',
    'theory',
    'fact',
    'example',
    'question',
    'hypothesis',
    'person',
    'school'
  ]
  const rels: RelationType[] = [
    'is-a',
    'has-a',
    'causes',
    'explains',
    'related-to',
    'influences',
    'part-of',
    'prerequisite',
    'contradicts',
    'similar-to'
  ]

  const cols = Math.ceil(Math.sqrt(nodeCount))
  const dx = 320
  const dy = 180

  const nodes: Node[] = new Array(nodeCount)
  for (let i = 0; i < nodeCount; i++) {
    const x = (i % cols) * dx
    const y = Math.floor(i / cols) * dy
    nodes[i] = {
      id: `L${i}`,
      mapId,
      label: `Node ${i}`,
      type: types[i % types.length],
      position: { x, y },
      metadata: {},
      createdAt: now,
      updatedAt: now
    }
  }

  const edges: Edge[] = new Array(edgeCount)
  for (let i = 0; i < edgeCount; i++) {
    const s = i % nodeCount
    const t = (i * 31 + 7) % nodeCount
    const relationType = rels[i % rels.length]
    const confidence = relationType === 'contradicts' || relationType === 'similar-to' ? 0.35 : 0.85
    edges[i] = {
      id: `E${i}`,
      mapId,
      sourceNodeId: `L${s}`,
      targetNodeId: `L${t}`,
      relationType,
      label: relationType,
      strength: 0.35 + ((i % 100) / 100) * 0.55,
      bidirectional: (i & 7) === 0,
      metadata: { confidence, createdBy: 'ai' },
      createdAt: now,
      updatedAt: now
    }
  }

  return { nodes, edges }
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  format?: (v: number) => string
}) {
  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between gap-3'>
        <Label className='text-xs text-muted-foreground'>{label}</Label>
        <div className='text-xs tabular-nums text-foreground/80'>
          {format ? format(value) : value.toFixed(2)}
        </div>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={v => onChange(v[0] ?? value)}
      />
    </div>
  )
}

function SwitchField({
  label,
  checked,
  onChange
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className='flex items-center justify-between gap-3'>
      <Label className='text-xs text-muted-foreground'>{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

export const GraphWebGLPlaygroundPage = () => {
  const fps = useFps()

  const canvasRef = useRef<GraphCanvasHandle>(null)
  const [viewport, setViewport] = useState<ViewportState | null>(null)

  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('paper')

  const [params, setParams] = useState<GraphWebGLRenderParams>(DEFAULT_RENDER_PARAMS)

  const demo = useMemo(() => createDemoGraph(), [])
  const [graph, setGraph] = useState<{ nodes: Node[]; edges: Edge[] }>(demo)
  const [autoLayout, setAutoLayout] = useState(false)

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null)

  const stats = useMemo(() => {
    const z = viewport?.zoom ?? 1
    return {
      nodes: graph.nodes.length,
      edges: graph.edges.length,
      zoom: z
    }
  }, [graph.nodes.length, graph.edges.length, viewport?.zoom])

  const update = useCallback(
    <K extends keyof GraphWebGLRenderParams>(key: K, value: GraphWebGLRenderParams[K]) => {
      setParams(p => ({ ...p, [key]: value }))
    },
    []
  )

  const handleNodeClick = useCallback((id: string | null) => {
    setSelectedNodeId(id)
  }, [])

  const handleNodeDoubleClick = useCallback((id: string) => {
    setFocusedNodeId(prev => (prev === id ? null : id))
  }, [])

  const resetDemo = useCallback(() => {
    setGraph(demo)
    setAutoLayout(false)
    setSelectedNodeId(null)
    setFocusedNodeId(null)
    setTimeout(() => canvasRef.current?.fitView(), 0)
  }, [demo])

  const loadLarge = useCallback((n: number, e: number) => {
    const g = generateLargeGraph('perf', n, e)
    setGraph(g)
    setAutoLayout(false)
    setSelectedNodeId(null)
    setFocusedNodeId(null)
    setTimeout(() => canvasRef.current?.fitView(), 0)
  }, [])

  return (
    <div className='h-full w-full'>
      <div className={cn('h-full w-full flex flex-col md:flex-row gap-3 p-3')}>
        <div className='relative flex-1 min-h-[55vh] md:min-h-0'>
          <div className='absolute inset-0 rounded-lg overflow-hidden border border-border/60'>
            <GraphCanvas
              ref={canvasRef}
              nodes={graph.nodes}
              edges={graph.edges}
              autoLayout={autoLayout}
              backgroundMode={backgroundMode}
              renderParams={params}
              selectedNodeId={selectedNodeId}
              focusedNodeId={focusedNodeId}
              dimmedNodeIds={[]}
              onNodeClick={handleNodeClick}
              onNodeDoubleClick={handleNodeDoubleClick}
              onViewportChange={setViewport}
              className='h-full w-full'
            />
          </div>
        </div>

        <div className='w-full md:w-[380px] md:shrink-0'>
          <Card className='h-full max-h-[40vh] md:max-h-none overflow-hidden'>
            <div className='p-4 border-b border-border/60'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <div className='text-sm font-semibold'>WebGL Graph Playground</div>
                  <div className='mt-1 text-xs text-muted-foreground tabular-nums'>
                    {stats.nodes.toLocaleString()} nodes · {stats.edges.toLocaleString()} edges ·
                    zoom {stats.zoom.toFixed(2)} · {fps} fps
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Button
                    size='sm'
                    variant='secondary'
                    onClick={() => canvasRef.current?.fitView()}
                  >
                    Fit
                  </Button>
                  <Button size='sm' variant='secondary' onClick={resetDemo}>
                    Demo
                  </Button>
                </div>
              </div>

              <div className='mt-3 flex flex-wrap gap-2'>
                <Button size='sm' variant='outline' onClick={() => loadLarge(2000, 4000)}>
                  2k/4k
                </Button>
                <Button size='sm' variant='outline' onClick={() => loadLarge(10000, 20000)}>
                  10k/20k
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => setParams(DEFAULT_RENDER_PARAMS)}
                >
                  Reset Style
                </Button>
              </div>
            </div>

            <div className='p-4 overflow-y-auto max-h-[calc(40vh-120px)] md:max-h-[calc(100vh-200px)] space-y-6'>
              <div className='space-y-3'>
                <div className='text-xs font-semibold tracking-wide text-foreground/70'>Global</div>
                <div className='space-y-2'>
                  <Label className='text-xs text-muted-foreground'>Background</Label>
                  <SegmentedControl<BackgroundMode>
                    value={backgroundMode}
                    onChange={setBackgroundMode}
                    stretch
                    options={[
                      { value: 'paper', label: 'Paper' },
                      { value: 'dots', label: 'Dots' },
                      { value: 'none', label: 'None' }
                    ]}
                  />
                </div>

                <SliderField
                  label='Icon Zoom Threshold'
                  value={params.icon_zoom_threshold}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={v => update('icon_zoom_threshold', v)}
                  format={v => v.toFixed(2)}
                />
                <SliderField
                  label='Text Zoom Threshold'
                  value={params.text_zoom_threshold}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={v => update('text_zoom_threshold', v)}
                  format={v => v.toFixed(2)}
                />
              </div>

              <div className='space-y-3'>
                <div className='text-xs font-semibold tracking-wide text-foreground/70'>Nodes</div>
                <SliderField
                  label='Corner Radius'
                  value={params.node_corner_radius}
                  min={0}
                  max={32}
                  step={0.5}
                  onChange={v => update('node_corner_radius', v)}
                  format={v => `${v.toFixed(1)}wu`}
                />
                <SliderField
                  label='Border Width'
                  value={params.node_border_width_px}
                  min={0}
                  max={6}
                  step={0.1}
                  onChange={v => update('node_border_width_px', v)}
                  format={v => `${v.toFixed(1)}px`}
                />
                <SliderField
                  label='Accent Width'
                  value={params.node_accent_width_px}
                  min={0}
                  max={12}
                  step={0.25}
                  onChange={v => update('node_accent_width_px', v)}
                  format={v => `${v.toFixed(2)}px`}
                />
                <SliderField
                  label='Shadow Strength'
                  value={params.node_shadow_strength}
                  min={0}
                  max={0.6}
                  step={0.01}
                  onChange={v => update('node_shadow_strength', v)}
                  format={v => v.toFixed(2)}
                />
                <SliderField
                  label='Shadow Blur'
                  value={params.node_shadow_blur_px}
                  min={0}
                  max={40}
                  step={0.5}
                  onChange={v => update('node_shadow_blur_px', v)}
                  format={v => `${v.toFixed(1)}px`}
                />
                <SliderField
                  label='Selection Ring Width'
                  value={params.node_selection_ring_width_px}
                  min={0}
                  max={8}
                  step={0.25}
                  onChange={v => update('node_selection_ring_width_px', v)}
                  format={v => `${v.toFixed(2)}px`}
                />
                <SliderField
                  label='Focus Glow Intensity'
                  value={params.node_focus_glow_intensity}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={v => update('node_focus_glow_intensity', v)}
                  format={v => v.toFixed(2)}
                />
                <SliderField
                  label='Node Padding'
                  value={params.node_padding_px}
                  min={6}
                  max={32}
                  step={0.5}
                  onChange={v => update('node_padding_px', v)}
                  format={v => `${v.toFixed(1)}px`}
                />
              </div>

              <div className='space-y-3'>
                <div className='text-xs font-semibold tracking-wide text-foreground/70'>Edges</div>
                <SliderField
                  label='Base Width Scale'
                  value={params.edge_width_scale}
                  min={0.25}
                  max={3}
                  step={0.05}
                  onChange={v => update('edge_width_scale', v)}
                  format={v => v.toFixed(2)}
                />
                <SliderField
                  label='Hover Width Scale'
                  value={params.edge_hover_width_scale}
                  min={0.25}
                  max={4}
                  step={0.05}
                  onChange={v => update('edge_hover_width_scale', v)}
                  format={v => v.toFixed(2)}
                />
                <SliderField
                  label='Hover Mix'
                  value={params.edge_hover_mix}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={v => update('edge_hover_mix', v)}
                  format={v => v.toFixed(2)}
                />
                <SliderField
                  label='AA Softness'
                  value={params.edge_aa_softness}
                  min={0.5}
                  max={2.5}
                  step={0.05}
                  onChange={v => update('edge_aa_softness', v)}
                  format={v => v.toFixed(2)}
                />
                <SliderField
                  label='Dash Length'
                  value={params.edge_dash_length_px}
                  min={2}
                  max={24}
                  step={0.5}
                  onChange={v => update('edge_dash_length_px', v)}
                  format={v => `${v.toFixed(1)}px`}
                />
                <SliderField
                  label='Dash Gap'
                  value={params.edge_dash_gap_px}
                  min={2}
                  max={24}
                  step={0.5}
                  onChange={v => update('edge_dash_gap_px', v)}
                  format={v => `${v.toFixed(1)}px`}
                />
                <SliderField
                  label='Curvature'
                  value={params.edge_curvature}
                  min={0}
                  max={0.8}
                  step={0.01}
                  onChange={v => update('edge_curvature', v)}
                  format={v => v.toFixed(2)}
                />
                <SliderField
                  label='Glow Intensity'
                  value={params.edge_glow_intensity}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={v => update('edge_glow_intensity', v)}
                  format={v => v.toFixed(2)}
                />
              </div>

              <div className='space-y-3'>
                <div className='text-xs font-semibold tracking-wide text-foreground/70'>Text</div>
                <SliderField
                  label='Font Size'
                  value={params.text_font_size}
                  min={10}
                  max={22}
                  step={0.5}
                  onChange={v => update('text_font_size', v)}
                  format={v => `${v.toFixed(1)}wu`}
                />
                <SliderField
                  label='Weight'
                  value={params.text_weight}
                  min={-1}
                  max={1}
                  step={0.05}
                  onChange={v => update('text_weight', v)}
                  format={v => v.toFixed(2)}
                />
                <SliderField
                  label='Contrast'
                  value={params.text_contrast}
                  min={0.8}
                  max={2.2}
                  step={0.05}
                  onChange={v => update('text_contrast', v)}
                  format={v => v.toFixed(2)}
                />
                <SliderField
                  label='pxRange Scale'
                  value={params.text_px_range_scale}
                  min={0.6}
                  max={1.6}
                  step={0.02}
                  onChange={v => update('text_px_range_scale', v)}
                  format={v => v.toFixed(2)}
                />
                <SliderField
                  label='Max Lines'
                  value={params.text_max_lines}
                  min={1}
                  max={4}
                  step={1}
                  onChange={v => update('text_max_lines', Math.round(v))}
                  format={v => `${Math.round(v)}`}
                />
                <SwitchField
                  label='Ellipsis'
                  checked={params.text_ellipsis}
                  onChange={v => update('text_ellipsis', v)}
                />
              </div>

              <div className='space-y-3'>
                <div className='text-xs font-semibold tracking-wide text-foreground/70'>
                  Interaction
                </div>
                <SwitchField label='Auto Layout' checked={autoLayout} onChange={setAutoLayout} />
                <div className='text-xs text-muted-foreground'>
                  Click selects. Double-click focuses (glow).
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
