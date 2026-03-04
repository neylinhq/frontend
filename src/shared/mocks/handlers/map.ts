import { delay, HttpResponse, http } from 'msw'

import type { MapEntity } from '@/entities/map'
import { API_URL } from '@/shared/config/env'

import { ALL_EDGES, ALL_NODES, MOCK_MAPS } from '../data'

// Mutable maps state
let maps = [...MOCK_MAPS]

export const mapHandlers = [
  // List maps
  http.get(`${API_URL}/maps`, async ({ request }) => {
    await delay(300)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '20', 10)
    const offset = parseInt(url.searchParams.get('offset') || '0', 10)

    const paginatedMaps = maps.slice(offset, offset + limit)

    return HttpResponse.json({
      success: true,
      data: paginatedMaps,
      meta: {
        total: maps.length,
        limit,
        offset
      }
    })
  }),

  // Create map
  http.post(`${API_URL}/maps`, async ({ request }) => {
    await delay(300)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const body = (await request.json()) as { title: string; description?: string }

    const newMap: MapEntity = {
      id: crypto.randomUUID(),
      title: body.title,
      description: body.description || '',
      nodesCount: 0,
      edgesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    maps.unshift(newMap)

    return HttpResponse.json(
      {
        success: true,
        data: newMap
      },
      { status: 201 }
    )
  }),

  // Get single map
  http.get(`${API_URL}/maps/:id`, async ({ params }) => {
    await delay(200)

    const map = maps.find(m => m.id === params.id)
    if (!map) {
      return HttpResponse.json(
        { success: false, error: { code: 'MAP_NOT_FOUND', message: 'Map not found' } },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: map
    })
  }),

  // Get full map (with nodes and edges)
  http.get(`${API_URL}/maps/:id/full`, async ({ params }) => {
    await delay(400)

    const map = maps.find(m => m.id === params.id)
    if (!map) {
      return HttpResponse.json(
        { success: false, error: { code: 'MAP_NOT_FOUND', message: 'Map not found' } },
        { status: 404 }
      )
    }

    // Get nodes and edges for this map
    const nodes = ALL_NODES.filter(n => n.mapId === params.id)
    const edges = ALL_EDGES.filter(e => e.mapId === params.id)

    return HttpResponse.json({
      success: true,
      data: {
        ...map,
        nodes,
        edges,
        aiAnalysis: {
          lastAnalyzed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          gaps: ['Consider adding more connections between isolated concepts'],
          suggestions: ['Add a node explaining the relationship between key ideas'],
          complexityScore: 0.65,
          completenessScore: 0.78,
          structuralIssues: []
        }
      }
    })
  }),

  // Update map
  http.patch(`${API_URL}/maps/:id`, async ({ request, params }) => {
    await delay(200)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const mapIndex = maps.findIndex(m => m.id === params.id)
    if (mapIndex === -1) {
      return HttpResponse.json(
        { success: false, error: { code: 'MAP_NOT_FOUND', message: 'Map not found' } },
        { status: 404 }
      )
    }

    const body = (await request.json()) as Partial<MapEntity>
    maps[mapIndex] = {
      ...maps[mapIndex],
      ...body,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({
      success: true,
      data: maps[mapIndex]
    })
  }),

  // Delete map
  http.delete(`${API_URL}/maps/:id`, async ({ request, params }) => {
    await delay(300)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const mapIndex = maps.findIndex(m => m.id === params.id)
    if (mapIndex === -1) {
      return HttpResponse.json(
        { success: false, error: { code: 'MAP_NOT_FOUND', message: 'Map not found' } },
        { status: 404 }
      )
    }

    maps.splice(mapIndex, 1)

    return new HttpResponse(null, { status: 204 })
  }),

  // Analyze map (AI)
  http.post(`${API_URL}/maps/:id/analyze`, async ({ request, params }) => {
    await delay(2000) // AI analysis takes time

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const map = maps.find(m => m.id === params.id)
    if (!map) {
      return HttpResponse.json(
        { success: false, error: { code: 'MAP_NOT_FOUND', message: 'Map not found' } },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        lastAnalyzed: new Date().toISOString(),
        gaps: [
          'Missing connection between "Fundamentals" and "Advanced Topics"',
          'Consider adding prerequisite relationships'
        ],
        suggestions: [
          'Add examples for abstract concepts',
          'Create a summary node linking main ideas'
        ],
        complexityScore: Math.random() * 0.4 + 0.5,
        completenessScore: Math.random() * 0.3 + 0.6,
        structuralIssues: []
      }
    })
  })
]

// Export for resetting state in tests
export const resetMapState = () => {
  maps = [...MOCK_MAPS]
}
