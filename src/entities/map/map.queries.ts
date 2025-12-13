import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { mapApi } from './map.api'
import type {
  CreateEdgeRequest,
  Edge,
  FullMap,
  MapDiscoverResponse,
  MapFilter,
  MapSearchMode,
  Node
} from './map.schema'

export const mapKeys = {
  all: ['maps'] as const,
  lists: () => [...mapKeys.all, 'list'] as const,
  list: (filters: string) => [...mapKeys.lists(), { filters }] as const,
  details: () => [...mapKeys.all, 'detail'] as const,
  detail: (id: string) => [...mapKeys.details(), id] as const,
  nodes: () => [...mapKeys.all, 'nodes'] as const,
  node: (mapId: string, nodeId: string) => [...mapKeys.nodes(), mapId, nodeId] as const,
  mapNodes: (mapId: string) => [...mapKeys.nodes(), mapId] as const,
  nodeWithContent: (mapId: string, nodeId: string) =>
    [...mapKeys.nodes(), mapId, nodeId, 'content'] as const,
  edges: () => [...mapKeys.all, 'edges'] as const,
  edge: (mapId: string, edgeId: string) => [...mapKeys.edges(), mapId, edgeId] as const,
  mapEdges: (mapId: string) => [...mapKeys.edges(), mapId] as const,
  fullMap: (mapId: string) => [...mapKeys.detail(mapId), 'full'] as const,
  lightweightMap: (mapId: string) => [...mapKeys.detail(mapId), 'lightweight'] as const,
  analysis: (mapId: string) => [...mapKeys.detail(mapId), 'analysis'] as const,
  discover: (filter: MapFilter) => [...mapKeys.all, 'discover', filter] as const,
  search: (query: string, mode: MapSearchMode) => [...mapKeys.all, 'search', query, mode] as const
}

// ====== Хуки для карт ======
export const useMaps = () => {
  return useQuery({
    queryKey: mapKeys.lists(),
    queryFn: mapApi.getMaps
  })
}

export const useMap = (id: string) => {
  return useQuery({
    queryKey: mapKeys.detail(id),
    queryFn: () => mapApi.getMapById(id),
    enabled: !!id
  })
}

export const useCreateMap = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: mapApi.createMap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mapKeys.lists() })
    }
  })
}

export const useDeleteMap = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: mapApi.deleteMap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mapKeys.lists() })
    }
  })
}

// ====== Хуки для узлов ======
export const useMapNodes = (mapId: string) => {
  return useQuery({
    queryKey: mapKeys.mapNodes(mapId),
    queryFn: () => mapApi.getNodes(mapId),
    enabled: !!mapId
  })
}

export const useCreateNode = (mapId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: mapApi.createNode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mapKeys.mapNodes(mapId) })
      queryClient.invalidateQueries({ queryKey: mapKeys.lists() })
      queryClient.invalidateQueries({ queryKey: mapKeys.fullMap(mapId) })
    }
  })
}

export const useUpdateNode = (mapId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Node> }) =>
      mapApi.updateNode(mapId, id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: mapKeys.mapNodes(mapId) })
      queryClient.invalidateQueries({ queryKey: mapKeys.fullMap(mapId) })
      queryClient.invalidateQueries({ queryKey: mapKeys.lightweightMap(mapId) })
      queryClient.invalidateQueries({ queryKey: mapKeys.nodeWithContent(mapId, variables.id) })
    }
  })
}

export const useDeleteNode = (mapId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (nodeId: string) => mapApi.deleteNode(mapId, nodeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mapKeys.mapNodes(mapId) })
      queryClient.invalidateQueries({ queryKey: mapKeys.mapEdges(mapId) })
      queryClient.invalidateQueries({ queryKey: mapKeys.lists() })
      queryClient.invalidateQueries({ queryKey: mapKeys.fullMap(mapId) })
    }
  })
}

// ====== Хуки для связей ======
export const useMapEdges = (mapId: string) => {
  return useQuery({
    queryKey: mapKeys.mapEdges(mapId),
    queryFn: () => mapApi.getEdges(mapId),
    enabled: !!mapId
  })
}

export const useCreateEdge = (mapId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEdgeRequest) => mapApi.createEdge(mapId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mapKeys.mapEdges(mapId) })
      queryClient.invalidateQueries({ queryKey: mapKeys.fullMap(mapId) })
    }
  })
}

export const useUpdateEdge = (mapId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Edge> }) =>
      mapApi.updateEdge(mapId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mapKeys.mapEdges(mapId) })
      queryClient.invalidateQueries({ queryKey: mapKeys.fullMap(mapId) })
      queryClient.invalidateQueries({ queryKey: mapKeys.lightweightMap(mapId) })
    }
  })
}

export const useDeleteEdge = (mapId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (edgeId: string) => mapApi.deleteEdge(mapId, edgeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mapKeys.mapEdges(mapId) })
      queryClient.invalidateQueries({ queryKey: mapKeys.fullMap(mapId) })
      queryClient.invalidateQueries({ queryKey: mapKeys.lightweightMap(mapId) })
    }
  })
}

// ====== Хуки для полных карт и анализа ======
interface UseFullMapOptions {
  enabled?: boolean
  initialData?: FullMap
}

export const useFullMap = (mapId: string, options?: UseFullMapOptions) => {
  return useQuery({
    queryKey: mapKeys.fullMap(mapId),
    queryFn: () => mapApi.getFullMap(mapId),
    enabled: (options?.enabled ?? true) && !!mapId,
    initialData: options?.initialData
  })
}

// Lightweight map for graph visualization
// Note: Currently uses full map endpoint. For true lightweight mode,
// backend would need a separate endpoint that excludes node content.
export const useLightweightMap = (mapId: string) => {
  return useQuery({
    queryKey: mapKeys.lightweightMap(mapId),
    queryFn: () => mapApi.getFullMap(mapId),
    enabled: !!mapId,
    staleTime: 5 * 60 * 1000 // 5 min - aggressive caching for graph views
  })
}

// Single node with full content (for editor)
export const useNodeWithContent = (mapId: string, nodeId: string) => {
  return useQuery({
    queryKey: mapKeys.nodeWithContent(mapId, nodeId),
    queryFn: () => mapApi.getNodeWithContent(mapId, nodeId),
    enabled: !!mapId && !!nodeId,
    staleTime: 2 * 60 * 1000 // 2 min cache
  })
}

export const useGraphAnalysis = (mapId: string) => {
  return useQuery({
    queryKey: mapKeys.analysis(mapId),
    queryFn: () => mapApi.analyzeGraph(mapId),
    enabled: !!mapId
  })
}

export const useAnalyzeGraph = (mapId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => mapApi.analyzeGraph(mapId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mapKeys.analysis(mapId) })
      queryClient.invalidateQueries({ queryKey: mapKeys.fullMap(mapId) })
    }
  })
}

// ====== Position updates (optimistic, no cache invalidation) ======
export const useUpdateNodePosition = (mapId: string) => {
  return useMutation({
    mutationFn: ({ id, position }: { id: string; position: { x: number; y: number } }) =>
      mapApi.updateNodePosition(mapId, id, position)
  })
}

export const useUpdateNodePositions = (mapId: string) => {
  return useMutation({
    mutationFn: (updates: Array<{ id: string; position: { x: number; y: number } }>) =>
      mapApi.updateNodePositions(mapId, updates)
  })
}

// ====== Хуки для публичных карт ======

export interface UseDiscoverMapsOptions {
  filter?: MapFilter
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
  initialData?: MapDiscoverResponse
}

export const useDiscoverMaps = (options: UseDiscoverMapsOptions = {}) => {
  const { initialData, ...params } = options
  return useQuery({
    queryKey: [
      ...mapKeys.all,
      'discover',
      params.filter ?? 'all',
      params.sortBy,
      params.sortOrder,
      params.limit,
      params.offset
    ],
    queryFn: () => mapApi.discoverMaps(params),
    initialData,
    staleTime: 30 * 1000, // 30 sec - don't refetch when switching tabs
    gcTime: 5 * 60 * 1000 // 5 min - keep in memory
  })
}

export interface UseSearchMapsOptions {
  query: string
  mode?: MapSearchMode
  filter?: MapFilter
  limit?: number
  offset?: number
  enabled?: boolean
}

export const useSearchMaps = (options: UseSearchMapsOptions) => {
  const mode = options.mode ?? 'all'
  return useQuery({
    queryKey: mapKeys.search(options.query, mode),
    queryFn: () => mapApi.searchMaps(options),
    enabled: (options.enabled ?? true) && options.query.length >= 1
  })
}

export const useCopyMap = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: mapApi.copyMap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mapKeys.lists() })
      queryClient.invalidateQueries({ queryKey: mapKeys.discover('all') })
      queryClient.invalidateQueries({ queryKey: mapKeys.discover('owned') })
    }
  })
}

export const useSetVisibility = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ mapId, isPublic }: { mapId: string; isPublic: boolean }) =>
      mapApi.setVisibility(mapId, isPublic),
    onSuccess: (_, { mapId }) => {
      queryClient.invalidateQueries({ queryKey: mapKeys.detail(mapId) })
      queryClient.invalidateQueries({ queryKey: mapKeys.lists() })
      queryClient.invalidateQueries({ queryKey: mapKeys.discover('all') })
      queryClient.invalidateQueries({ queryKey: mapKeys.discover('owned') })
      queryClient.invalidateQueries({ queryKey: mapKeys.discover('public') })
    }
  })
}
