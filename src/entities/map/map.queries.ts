import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { mapApi } from './map.api'
import type { Edge, Node } from './map.schema'

export const mapKeys = {
  all: ['maps'] as const,
  lists: () => [...mapKeys.all, 'list'] as const,
  list: (filters: string) => [...mapKeys.lists(), { filters }] as const,
  details: () => [...mapKeys.all, 'detail'] as const,
  detail: (id: string) => [...mapKeys.details(), id] as const,
  nodes: () => [...mapKeys.all, 'nodes'] as const,
  node: (mapId: string, nodeId: string) => [...mapKeys.nodes(), mapId, nodeId] as const,
  mapNodes: (mapId: string) => [...mapKeys.nodes(), mapId] as const,
  edges: () => [...mapKeys.all, 'edges'] as const,
  edge: (mapId: string, edgeId: string) => [...mapKeys.edges(), mapId, edgeId] as const,
  mapEdges: (mapId: string) => [...mapKeys.edges(), mapId] as const,
  fullMap: (mapId: string) => [...mapKeys.detail(mapId), 'full'] as const,
  analysis: (mapId: string) => [...mapKeys.detail(mapId), 'analysis'] as const
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
    mutationFn: ({ id, data }: { id: string; data: Partial<Node> }) => mapApi.updateNode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mapKeys.mapNodes(mapId) })
      queryClient.invalidateQueries({ queryKey: mapKeys.fullMap(mapId) })
    }
  })
}

export const useDeleteNode = (mapId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: mapApi.deleteNode,
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
    mutationFn: mapApi.createEdge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mapKeys.mapEdges(mapId) })
      queryClient.invalidateQueries({ queryKey: mapKeys.fullMap(mapId) })
    }
  })
}

export const useUpdateEdge = (mapId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Edge> }) => mapApi.updateEdge(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mapKeys.mapEdges(mapId) })
      queryClient.invalidateQueries({ queryKey: mapKeys.fullMap(mapId) })
    }
  })
}

export const useDeleteEdge = (mapId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: mapApi.deleteEdge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mapKeys.mapEdges(mapId) })
      queryClient.invalidateQueries({ queryKey: mapKeys.fullMap(mapId) })
    }
  })
}

// ====== Хуки для полных карт и анализа ======
export const useFullMap = (mapId: string) => {
  return useQuery({
    queryKey: mapKeys.fullMap(mapId),
    queryFn: () => mapApi.getFullMap(mapId),
    enabled: !!mapId
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
