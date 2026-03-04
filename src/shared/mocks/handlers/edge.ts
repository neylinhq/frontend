import { delay, HttpResponse, http } from 'msw'

import type { Edge } from '@/entities/edge'
import { API_URL } from '@/shared/config/env'

import { ALL_EDGES } from '../data'

// Mutable edges state
let edges = [...ALL_EDGES]

export const edgeHandlers = [
  // List edges for a map
  http.get(`${API_URL}/maps/:mapId/edges`, async ({ params, request }) => {
    await delay(150)

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '100', 10)
    const offset = parseInt(url.searchParams.get('offset') || '0', 10)

    const mapEdges = edges.filter(e => e.mapId === params.mapId)
    const paginatedEdges = mapEdges.slice(offset, offset + limit)

    return HttpResponse.json({
      success: true,
      data: paginatedEdges,
      meta: {
        total: mapEdges.length,
        limit,
        offset
      }
    })
  }),

  // Create edge
  http.post(`${API_URL}/maps/:mapId/edges`, async ({ request, params }) => {
    await delay(200)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const body = (await request.json()) as Partial<Edge>

    if (!body.sourceNodeId || !body.targetNodeId) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'sourceNodeId and targetNodeId are required' }
        },
        { status: 400 }
      )
    }

    const newEdge: Edge = {
      id: crypto.randomUUID(),
      mapId: params.mapId as string,
      sourceNodeId: body.sourceNodeId,
      targetNodeId: body.targetNodeId,
      relationType: body.relationType || 'related-to',
      label: body.label || '',
      strength: body.strength ?? 0.5,
      bidirectional: body.bidirectional ?? false,
      metadata: {
        confidence: body.metadata?.confidence || 0.8,
        evidence: body.metadata?.evidence || [],
        examples: body.metadata?.examples || [],
        createdBy: 'user',
        lastValidated: undefined
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    edges.push(newEdge)

    return HttpResponse.json(
      {
        success: true,
        data: newEdge
      },
      { status: 201 }
    )
  }),

  // Update edge
  http.patch(`${API_URL}/maps/:mapId/edges/:edgeId`, async ({ request, params }) => {
    await delay(150)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const edgeIndex = edges.findIndex(e => e.id === params.edgeId && e.mapId === params.mapId)
    if (edgeIndex === -1) {
      return HttpResponse.json(
        { success: false, error: { code: 'EDGE_NOT_FOUND', message: 'Edge not found' } },
        { status: 404 }
      )
    }

    const body = (await request.json()) as Partial<Edge>
    edges[edgeIndex] = {
      ...edges[edgeIndex],
      ...body,
      metadata: {
        ...edges[edgeIndex].metadata,
        ...body.metadata
      },
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({
      success: true,
      data: edges[edgeIndex]
    })
  }),

  // Delete edge
  http.delete(`${API_URL}/maps/:mapId/edges/:edgeId`, async ({ request, params }) => {
    await delay(150)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const edgeIndex = edges.findIndex(e => e.id === params.edgeId && e.mapId === params.mapId)
    if (edgeIndex === -1) {
      return HttpResponse.json(
        { success: false, error: { code: 'EDGE_NOT_FOUND', message: 'Edge not found' } },
        { status: 404 }
      )
    }

    edges.splice(edgeIndex, 1)

    return new HttpResponse(null, { status: 204 })
  })
]

// Export for resetting state in tests
export const resetEdgeState = () => {
  edges = [...ALL_EDGES]
}
