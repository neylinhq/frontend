import { delay, HttpResponse, http } from 'msw'

import type { Node } from '@/entities/node'
import { API_URL } from '@/shared/config/env'

import { ALL_NODES } from '../data'

// Mutable nodes state
let nodes = [...ALL_NODES]

export const nodeHandlers = [
  // List nodes for a map
  http.get(`${API_URL}/maps/:mapId/nodes`, async ({ params, request }) => {
    await delay(200)

    const url = new URL(request.url)
    const typeFilter = url.searchParams.get('type')

    let mapNodes = nodes.filter(n => n.mapId === params.mapId)

    if (typeFilter) {
      mapNodes = mapNodes.filter(n => n.type === typeFilter)
    }

    return HttpResponse.json({
      success: true,
      data: mapNodes
    })
  }),

  // Create node
  http.post(`${API_URL}/maps/:mapId/nodes`, async ({ request, params }) => {
    await delay(200)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const body = (await request.json()) as Partial<Node>

    const newNode: Node = {
      id: crypto.randomUUID(),
      mapId: params.mapId as string,
      label: body.label || 'New Node',
      description: body.description || '',
      content: body.content || '',
      type: body.type || 'concept',
      position: body.position || { x: Math.random() * 500, y: Math.random() * 500 },
      metadata: {
        confidence: body.metadata?.confidence || 0.8,
        complexity: body.metadata?.complexity || 'intermediate',
        sources: body.metadata?.sources || [],
        tags: body.metadata?.tags || [],
        lastReviewed: undefined,
        reviewCount: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    nodes.push(newNode)

    return HttpResponse.json(
      {
        success: true,
        data: newNode
      },
      { status: 201 }
    )
  }),

  // Get single node
  http.get(`${API_URL}/maps/:mapId/nodes/:nodeId`, async ({ params }) => {
    await delay(100)

    const node = nodes.find(n => n.id === params.nodeId && n.mapId === params.mapId)
    if (!node) {
      return HttpResponse.json(
        { success: false, error: { code: 'NODE_NOT_FOUND', message: 'Node not found' } },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: node
    })
  }),

  // Update node
  http.patch(`${API_URL}/maps/:mapId/nodes/:nodeId`, async ({ request, params }) => {
    await delay(150)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const nodeIndex = nodes.findIndex(n => n.id === params.nodeId && n.mapId === params.mapId)
    if (nodeIndex === -1) {
      return HttpResponse.json(
        { success: false, error: { code: 'NODE_NOT_FOUND', message: 'Node not found' } },
        { status: 404 }
      )
    }

    const body = (await request.json()) as Partial<Node>
    nodes[nodeIndex] = {
      ...nodes[nodeIndex],
      ...body,
      metadata: {
        ...nodes[nodeIndex].metadata,
        ...body.metadata
      },
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({
      success: true,
      data: nodes[nodeIndex]
    })
  }),

  // Delete node
  http.delete(`${API_URL}/maps/:mapId/nodes/:nodeId`, async ({ request, params }) => {
    await delay(200)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const nodeIndex = nodes.findIndex(n => n.id === params.nodeId && n.mapId === params.mapId)
    if (nodeIndex === -1) {
      return HttpResponse.json(
        { success: false, error: { code: 'NODE_NOT_FOUND', message: 'Node not found' } },
        { status: 404 }
      )
    }

    nodes.splice(nodeIndex, 1)

    return new HttpResponse(null, { status: 204 })
  }),

  // Batch update node positions
  http.patch(`${API_URL}/maps/:mapId/nodes/positions`, async ({ request, params }) => {
    await delay(100)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const body = (await request.json()) as {
      positions: Array<{ id: string; x: number; y: number }>
    }

    for (const pos of body.positions) {
      const nodeIndex = nodes.findIndex(n => n.id === pos.id && n.mapId === params.mapId)
      if (nodeIndex !== -1) {
        nodes[nodeIndex] = {
          ...nodes[nodeIndex],
          position: { x: pos.x, y: pos.y },
          updatedAt: new Date().toISOString()
        }
      }
    }

    return new HttpResponse(null, { status: 204 })
  })
]

// Export for resetting state in tests
export const resetNodeState = () => {
  nodes = [...ALL_NODES]
}
