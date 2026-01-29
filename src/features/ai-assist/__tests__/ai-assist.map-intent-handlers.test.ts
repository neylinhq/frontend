import { describe, expect, it, vi } from 'vitest'

vi.mock('@/entities/ai', () => ({
  aiApi: {
    analyzeMap: vi.fn(),
    suggestEdges: vi.fn(),
    detectGaps: vi.fn()
  }
}))

import { aiApi } from '@/entities/ai'
import { analyzeHandler, gapsHandler, mapIntentHandlers, suggestHandler, summaryHandler } from '../lib/map-intent-handlers'

const mapContext = {
  type: 'map',
  mapId: 'map-1',
  mapName: 'Test Map',
  nodeCount: 3
} as const

const nodeContext = {
  type: 'node',
  mapId: 'map-1',
  nodeId: 'node-1',
  nodeName: 'Node',
  nodeType: 'concept',
  description: '',
  tags: [],
  relatedNodes: []
} as const

describe('map intent handlers', () => {
  it('detects analyze commands', () => {
    expect(analyzeHandler.detect('/analyze')).toBe(true)
    expect(analyzeHandler.detect(' /analysis ')).toBe(true)
  })

  it('detects suggest/gaps/summary commands', () => {
    expect(suggestHandler.detect('/connections')).toBe(true)
    expect(suggestHandler.detect('/edges')).toBe(true)
    expect(gapsHandler.detect('/missing')).toBe(true)
    expect(summaryHandler.detect('/overview')).toBe(true)
    expect(suggestHandler.detect('hello')).toBe(false)
  })

  it('handles analyze for maps', async () => {
    const result = await analyzeHandler.execute(mapContext, '/analyze', 'fast')
    expect(aiApi.analyzeMap).toHaveBeenCalledWith('map-1', 'fast')
    expect(result.content).toContain('Analysis started')
  })

  it('rejects analyze outside map context', async () => {
    const result = await analyzeHandler.execute(nodeContext, '/analyze', 'fast')
    expect(result.content).toContain('only available for maps')
  })

  it('handles suggest and gaps', async () => {
    await suggestHandler.execute(mapContext, '/suggest', 'fast')
    await gapsHandler.execute(mapContext, '/gaps', 'fast')

    expect(aiApi.suggestEdges).toHaveBeenCalledWith('map-1')
    expect(aiApi.detectGaps).toHaveBeenCalledWith('map-1')
  })

  it('rejects suggest/gaps/summary outside map context', async () => {
    const suggestResult = await suggestHandler.execute(nodeContext, '/suggest', 'fast')
    const gapsResult = await gapsHandler.execute(nodeContext, '/gaps', 'fast')
    const summaryResult = await summaryHandler.execute(nodeContext, '/summary', 'fast')

    expect(suggestResult.content).toContain('only available for maps')
    expect(gapsResult.content).toContain('only available for maps')
    expect(summaryResult.content).toContain('only available for maps')
  })

  it('handles summary without API call', async () => {
    const result = await summaryHandler.execute(mapContext, '/summary', 'fast')
    expect(result.content).toContain('Test Map')
    expect(result.content).toContain('3 nodes')
  })

  it('exports all handlers', () => {
    expect(mapIntentHandlers).toHaveLength(4)
  })
})
