import { API_DELAYS, delay } from '@/shared/config/api-delays'
import type { LightweightNode } from '../node'
import {
  ALL_EDGES,
  GRAPH_THEORY_EDGES,
  NEURAL_NETWORKS_EDGES,
  PHILOSOPHY_EDGES
} from './__mocks__/edges'
// Import mock data
import { GENERATED_GRAPH, MOCK_MAPS } from './__mocks__/maps.mock'
import { MOCK_NODE_WITH_CONTENT } from './__mocks__/node-content.mock'
import {
  ALL_NODES,
  GRAPH_THEORY_NODES,
  NEURAL_NETWORKS_NODES,
  PHILOSOPHY_NODES
} from './__mocks__/nodes'
import type { Edge, FullMap, MapEntity, Node } from './map.schema'

export const mapApi = {
  // ====== Работа с картами ======
  getMaps: async (): Promise<MapEntity[]> => {
    await delay(API_DELAYS.MAP_GET_MAPS)
    return MOCK_MAPS
  },

  getMapById: async (id: string): Promise<MapEntity | null> => {
    await delay(API_DELAYS.MAP_GET_BY_ID)
    return MOCK_MAPS.find(m => m.id === id) || null
  },

  createMap: async (
    data: Omit<MapEntity, 'id' | 'createdAt' | 'updatedAt' | 'nodesCount'>
  ): Promise<MapEntity> => {
    await delay(API_DELAYS.MAP_CREATE)
    const newMap: MapEntity = {
      ...data,
      id: `map-${Date.now()}`,
      nodesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    MOCK_MAPS.push(newMap)
    return newMap
  },

  deleteMap: async (id: string): Promise<void> => {
    await delay(API_DELAYS.MAP_DELETE)
    const index = MOCK_MAPS.findIndex(m => m.id === id)
    if (index !== -1) {
      MOCK_MAPS.splice(index, 1)
    }
    // Also delete all nodes and edges for this map
    const nodesToDelete = ALL_NODES.filter(n => n.mapId === id)
    nodesToDelete.forEach(node => {
      const nodeIndex = ALL_NODES.findIndex(n => n.id === node.id)
      if (nodeIndex !== -1) ALL_NODES.splice(nodeIndex, 1)
    })
    const edgesToDelete = ALL_EDGES.filter(e => {
      const sourceNode = ALL_NODES.find(n => n.id === e.sourceNodeId)
      return sourceNode?.mapId === id
    })
    edgesToDelete.forEach(edge => {
      const edgeIndex = ALL_EDGES.findIndex(e => e.id === edge.id)
      if (edgeIndex !== -1) ALL_EDGES.splice(edgeIndex, 1)
    })
  },

  // ====== Работа с узлами ======
  getNodes: async (mapId: string): Promise<LightweightNode[]> => {
    await delay(API_DELAYS.MAP_GET_NODES)
    // Use generated graph for map '4'
    if (mapId === '4') {
      return GENERATED_GRAPH.nodes.map(
        (n): LightweightNode => ({
          id: n.id,
          mapId: n.mapId,
          label: n.label,
          description: n.description,
          type: n.type,
          position: n.position,
          metadata: n.metadata,
          createdAt: n.createdAt,
          updatedAt: n.updatedAt
        })
      )
    }

    const allMockNodes = [...NEURAL_NETWORKS_NODES, ...PHILOSOPHY_NODES, ...GRAPH_THEORY_NODES]

    return allMockNodes
      .filter(n => n.mapId === mapId)
      .map(
        (n): LightweightNode => ({
          id: n.id,
          mapId: n.mapId,
          label: n.label,
          description: n.description,
          type: n.type,
          position: n.position,
          metadata: n.metadata,
          createdAt: n.createdAt,
          updatedAt: n.updatedAt
        })
      )
  },

  getNodeWithContent: async (nodeId: string): Promise<Node | null> => {
    await delay(API_DELAYS.MAP_GET_NODE_WITH_CONTENT)
    // For editor demo
    if (nodeId === 'mock-editor') {
      return MOCK_NODE_WITH_CONTENT
    }

    const allMockNodes = [...NEURAL_NETWORKS_NODES, ...PHILOSOPHY_NODES, ...GRAPH_THEORY_NODES]

    return allMockNodes.find(n => n.id === nodeId) || null
  },

  createNode: async (data: Omit<Node, 'id' | 'createdAt' | 'updatedAt'>): Promise<Node> => {
    await delay(API_DELAYS.MAP_CREATE_NODE)
    const newNode: Node = {
      ...data,
      id: `node-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    ALL_NODES.push(newNode)

    // Update map's nodesCount
    const map = MOCK_MAPS.find(m => m.id === data.mapId)
    if (map) {
      map.nodesCount++
    }

    return newNode
  },

  updateNode: async (
    id: string,
    data: Partial<Omit<Node, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Node> => {
    await delay(API_DELAYS.MAP_UPDATE_NODE)
    const allMockNodes = [...NEURAL_NETWORKS_NODES, ...PHILOSOPHY_NODES, ...GRAPH_THEORY_NODES]

    const node = allMockNodes.find(n => n.id === id)
    if (!node) {
      throw new Error(`Node with id ${id} not found`)
    }
    Object.assign(node, { ...data, updatedAt: new Date().toISOString() })
    return node
  },

  deleteNode: async (id: string): Promise<void> => {
    await delay(API_DELAYS.MAP_DELETE_NODE)
    const allMockNodes = [...NEURAL_NETWORKS_NODES, ...PHILOSOPHY_NODES, ...GRAPH_THEORY_NODES]

    const index = allMockNodes.findIndex(n => n.id === id)
    if (index !== -1) {
      const node = allMockNodes[index]
      allMockNodes.splice(index, 1)

      // Update map's nodesCount
      const map = MOCK_MAPS.find(m => m.id === node.mapId)
      if (map) {
        map.nodesCount = Math.max(0, map.nodesCount - 1)
      }

      // Also delete all edges connected to this node
      const edgesToDelete = ALL_EDGES.filter(e => e.sourceNodeId === id || e.targetNodeId === id)
      edgesToDelete.forEach(edge => {
        const edgeIndex = ALL_EDGES.findIndex(e => e.id === edge.id)
        if (edgeIndex !== -1) ALL_EDGES.splice(edgeIndex, 1)
      })
    }
  },

  // ====== Работа со связями ======
  getEdges: async (mapId: string): Promise<Edge[]> => {
    await delay(API_DELAYS.MAP_GET_EDGES)
    // Use generated graph for map '4'
    if (mapId === '4') {
      return GENERATED_GRAPH.edges
    }

    const allMockEdges = [...NEURAL_NETWORKS_EDGES, ...PHILOSOPHY_EDGES, ...GRAPH_THEORY_EDGES]

    const allMockNodes = [...NEURAL_NETWORKS_NODES, ...PHILOSOPHY_NODES, ...GRAPH_THEORY_NODES]

    return allMockEdges.filter(e => {
      const sourceNode = allMockNodes.find(n => n.id === e.sourceNodeId)
      return sourceNode?.mapId === mapId
    })
  },

  createEdge: async (data: Omit<Edge, 'id' | 'createdAt' | 'updatedAt'>): Promise<Edge> => {
    await delay(API_DELAYS.MAP_CREATE_EDGE)
    const newEdge: Edge = {
      ...data,
      id: `edge-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    ALL_EDGES.push(newEdge)
    return newEdge
  },

  updateEdge: async (
    id: string,
    data: Partial<Omit<Edge, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Edge> => {
    await delay(API_DELAYS.MAP_UPDATE_EDGE)
    const allMockEdges = [...NEURAL_NETWORKS_EDGES, ...PHILOSOPHY_EDGES, ...GRAPH_THEORY_EDGES]

    const edge = allMockEdges.find(e => e.id === id)
    if (!edge) {
      throw new Error(`Edge with id ${id} not found`)
    }
    Object.assign(edge, { ...data, updatedAt: new Date().toISOString() })
    return edge
  },

  deleteEdge: async (id: string): Promise<void> => {
    await delay(API_DELAYS.MAP_DELETE_EDGE)
    const allMockEdges = [...NEURAL_NETWORKS_EDGES, ...PHILOSOPHY_EDGES, ...GRAPH_THEORY_EDGES]

    const index = allMockEdges.findIndex(e => e.id === id)
    if (index !== -1) {
      allMockEdges.splice(index, 1)
    }
  },

  // ====== Полный граф (карта + узлы + связи) ======
  getFullMap: async (mapId: string, includeContent: boolean = false): Promise<FullMap | null> => {
    await delay(API_DELAYS.MAP_GET_FULL_MAP)

    const map = await mapApi.getMapById(mapId)
    if (!map) return null

    const nodes = includeContent
      ? await Promise.all(
          (await mapApi.getNodes(mapId)).map(ln => mapApi.getNodeWithContent(ln.id))
        ).then(results => results.filter((n): n is Node => n !== null))
      : ((await mapApi.getNodes(mapId)) as Node[])

    const edges = await mapApi.getEdges(mapId)

    return {
      ...map,
      nodes,
      edges,
      aiAnalysis: {
        gaps: [],
        suggestions: [],
        complexityScore: 0,
        completenessScore: 0,
        structuralIssues: []
      }
    }
  },

  // ====== Анализ графа через AI ======
  analyzeGraph: async (_mapId: string): Promise<FullMap['aiAnalysis']> => {
    await delay(API_DELAYS.MAP_ANALYZE_GRAPH) // Имитация долгой обработки AI
    return {
      lastAnalyzed: new Date().toISOString(),
      gaps: ['Отсутствует связь между GPT и практическими применениями'],
      suggestions: ['Добавить связь между BERT и Attention Mechanism'],
      complexityScore: 0.75,
      completenessScore: 0.65,
      structuralIssues: []
    }
  }
}
