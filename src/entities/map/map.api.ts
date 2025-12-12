import { api } from '@/shared/api/client'
import type { Edge } from '../edge'
import type { LightweightNode, Node } from '../node'
import type {
  FullMap,
  MapEntity,
  MapDiscoverResponse,
  MapSearchResponse,
  MapFilter,
  MapSearchMode
} from './map.schema'

// Response types
interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: {
    total: number
    limit: number
    offset: number
  }
}

interface CreateMapRequest {
  title: string
  description?: string
}

interface CreateNodeRequest {
  label: string
  description?: string
  content?: string
  type: Node['type']
  position: { x: number; y: number }
  metadata?: Node['metadata']
}

interface CreateEdgeRequest {
  sourceNodeId: string
  targetNodeId: string
  relationType: Edge['relationType']
  label?: string
  strength?: number
  bidirectional?: boolean
  metadata?: Edge['metadata']
}

interface PositionUpdate {
  id: string
  x: number
  y: number
}

export const mapApi = {
  // ====== Maps ======
  getMaps: async (
    limit = 20,
    offset = 0,
    options?: { cookies?: string }
  ): Promise<{ maps: MapEntity[]; total: number }> => {
    const response = await api.get<ApiResponse<MapEntity[]>>(
      `/maps?limit=${limit}&offset=${offset}`,
      { cookies: options?.cookies }
    )
    return {
      maps: response.data,
      total: response.meta?.total || response.data.length
    }
  },

  getMapById: async (id: string): Promise<MapEntity> => {
    const response = await api.get<ApiResponse<MapEntity>>(`/maps/${id}`)
    return response.data
  },

  createMap: async (data: CreateMapRequest): Promise<MapEntity> => {
    const response = await api.post<ApiResponse<MapEntity>>('/maps', data)
    return response.data
  },

  updateMap: async (id: string, data: Partial<CreateMapRequest>): Promise<MapEntity> => {
    const response = await api.patch<ApiResponse<MapEntity>>(`/maps/${id}`, data)
    return response.data
  },

  deleteMap: async (id: string): Promise<void> => {
    await api.delete(`/maps/${id}`)
  },

  // Public maps discovery
  discoverMaps: async (
    params: {
      filter?: MapFilter
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
      limit?: number
      offset?: number
    },
    options?: { cookies?: string }
  ): Promise<MapDiscoverResponse> => {
    const searchParams = new URLSearchParams()
    if (params.filter) searchParams.set('filter', params.filter)
    if (params.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
    if (params.limit) searchParams.set('limit', String(params.limit))
    if (params.offset) searchParams.set('offset', String(params.offset))

    const response = await api.get<ApiResponse<MapDiscoverResponse>>(
      `/maps/discover?${searchParams.toString()}`,
      { cookies: options?.cookies }
    )
    return response.data
  },

  // Search maps by title and optionally by node labels
  searchMaps: async (params: {
    query: string
    mode?: MapSearchMode
    filter?: MapFilter
    limit?: number
    offset?: number
  }): Promise<MapSearchResponse> => {
    const searchParams = new URLSearchParams()
    searchParams.set('q', params.query)
    if (params.mode) searchParams.set('mode', params.mode)
    if (params.filter) searchParams.set('filter', params.filter)
    if (params.limit) searchParams.set('limit', String(params.limit))
    if (params.offset) searchParams.set('offset', String(params.offset))

    const response = await api.get<ApiResponse<MapSearchResponse>>(
      `/maps/search?${searchParams.toString()}`
    )
    return response.data
  },

  // Copy a public map to own collection
  copyMap: async (mapId: string): Promise<MapEntity> => {
    const response = await api.post<ApiResponse<MapEntity>>(`/maps/${mapId}/copy`)
    return response.data
  },

  // Set map visibility (public/private)
  setVisibility: async (mapId: string, isPublic: boolean): Promise<MapEntity> => {
    const response = await api.patch<ApiResponse<MapEntity>>(`/maps/${mapId}/visibility`, {
      isPublic
    })
    return response.data
  },

  getFullMap: async (mapId: string, options?: { cookies?: string }): Promise<FullMap> => {
    const response = await api.get<ApiResponse<FullMap>>(`/maps/${mapId}/full`, {
      cookies: options?.cookies
    })
    return response.data
  },

  analyzeGraph: async (
    mapId: string,
    model: string = 'gpt-4',
    runAsync: boolean = true
  ): Promise<FullMap['aiAnalysis'] | { taskId: string; status: string }> => {
    const response = await api.post<
      ApiResponse<FullMap['aiAnalysis'] | { taskId: string; status: string }>
    >(`/maps/${mapId}/analyze`, { model, async: runAsync })
    return response.data
  },

  // ====== Nodes ======
  getNodes: async (mapId: string, type?: string): Promise<LightweightNode[]> => {
    const params = type ? `?type=${type}` : ''
    const response = await api.get<ApiResponse<LightweightNode[]>>(`/maps/${mapId}/nodes${params}`)
    return response.data
  },

  getNodeWithContent: async (
    mapId: string,
    nodeId: string,
    options?: { cookies?: string }
  ): Promise<Node> => {
    const response = await api.get<ApiResponse<Node>>(`/maps/${mapId}/nodes/${nodeId}`, {
      cookies: options?.cookies
    })
    return response.data
  },

  createNode: async (mapId: string, data: CreateNodeRequest): Promise<Node> => {
    const response = await api.post<ApiResponse<Node>>(`/maps/${mapId}/nodes`, data)
    return response.data
  },

  updateNode: async (
    mapId: string,
    nodeId: string,
    data: Partial<CreateNodeRequest>
  ): Promise<Node> => {
    const response = await api.patch<ApiResponse<Node>>(`/maps/${mapId}/nodes/${nodeId}`, data)
    return response.data
  },

  deleteNode: async (mapId: string, nodeId: string): Promise<void> => {
    await api.delete(`/maps/${mapId}/nodes/${nodeId}`)
  },

  updateNodePosition: async (
    mapId: string,
    nodeId: string,
    position: { x: number; y: number }
  ): Promise<void> => {
    await api.patch(`/maps/${mapId}/nodes/${nodeId}`, { position })
  },

  updateNodePositions: async (mapId: string, positions: PositionUpdate[]): Promise<void> => {
    await api.patch(`/maps/${mapId}/nodes/positions`, { positions })
  },

  // ====== Edges ======
  getEdges: async (
    mapId: string,
    limit = 100,
    offset = 0
  ): Promise<{ edges: Edge[]; total: number }> => {
    const response = await api.get<ApiResponse<Edge[]>>(
      `/maps/${mapId}/edges?limit=${limit}&offset=${offset}`
    )
    return {
      edges: response.data,
      total: response.meta?.total || response.data.length
    }
  },

  createEdge: async (mapId: string, data: CreateEdgeRequest): Promise<Edge> => {
    const response = await api.post<ApiResponse<Edge>>(`/maps/${mapId}/edges`, data)
    return response.data
  },

  updateEdge: async (
    mapId: string,
    edgeId: string,
    data: Partial<CreateEdgeRequest>
  ): Promise<Edge> => {
    const response = await api.patch<ApiResponse<Edge>>(`/maps/${mapId}/edges/${edgeId}`, data)
    return response.data
  },

  deleteEdge: async (mapId: string, edgeId: string): Promise<void> => {
    await api.delete(`/maps/${mapId}/edges/${edgeId}`)
  }
}
