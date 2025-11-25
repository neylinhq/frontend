import type { Edge, FullMap, MapEntity, Node } from './map.schema'

// Mock Data
const MOCK_MAPS: MapEntity[] = [
  {
    id: '1',
    title: 'Основы нейросетей',
    description: 'Разбор архитектур трансформеров и их применение в NLP.',
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-03-20T15:30:00Z',
    nodesCount: 5,
    previewUrl: undefined
  },
  {
    id: '2',
    title: 'История философии',
    description: 'Связи между античными школами и современным экзистенциализмом.',
    createdAt: '2024-02-15T09:00:00Z',
    updatedAt: '2024-03-18T12:00:00Z',
    nodesCount: 156,
    previewUrl: undefined
  },
  {
    id: '3',
    title: 'Мой стартап',
    description: '',
    createdAt: '2024-03-21T08:00:00Z',
    updatedAt: '2024-03-21T08:05:00Z',
    nodesCount: 3,
    previewUrl: undefined
  }
]

// Mock узлы для карты "Основы нейросетей"
const MOCK_NODES: Node[] = [
  {
    id: 'node-1',
    mapId: '1',
    label: 'Нейронные сети',
    description: 'Основы архитектур нейронных сетей',
    type: 'concept',
    position: { x: 100, y: 100 },
    metadata: {
      confidence: 0.9,
      complexity: 'intermediate',
      tags: ['AI', 'ML', 'нейросети'],
      lastReviewed: '2024-03-20T10:00:00Z',
      reviewCount: 5
    },
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z'
  },
  {
    id: 'node-2',
    mapId: '1',
    label: 'Трансформеры',
    description: 'Архитектура Transformer для обработки последовательностей',
    type: 'theory',
    position: { x: 300, y: 150 },
    metadata: {
      confidence: 0.85,
      complexity: 'advanced',
      tags: ['transformer', 'attention', 'NLP'],
      lastReviewed: '2024-03-18T14:30:00Z',
      reviewCount: 3
    },
    createdAt: '2024-03-12T10:00:00Z',
    updatedAt: '2024-03-18T14:30:00Z'
  },
  {
    id: 'node-3',
    mapId: '1',
    label: 'Attention Mechanism',
    description: 'Механизм внимания в нейронных сетях',
    type: 'concept',
    position: { x: 200, y: 250 },
    metadata: {
      confidence: 0.7,
      complexity: 'intermediate',
      tags: ['attention', 'mechanism']
    },
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z'
  },
  {
    id: 'node-4',
    mapId: '1',
    label: 'BERT',
    description: 'Bidirectional Encoder Representations from Transformers',
    type: 'theory',
    position: { x: 450, y: 200 },
    metadata: {
      confidence: 0.8,
      complexity: 'advanced',
      tags: ['BERT', 'NLP', 'pretraining']
    },
    createdAt: '2024-03-14T10:00:00Z',
    updatedAt: '2024-03-14T10:00:00Z'
  },
  {
    id: 'node-5',
    mapId: '1',
    label: 'GPT',
    description: 'Generative Pre-trained Transformer',
    type: 'theory',
    position: { x: 450, y: 300 },
    metadata: {
      confidence: 0.75,
      complexity: 'advanced',
      tags: ['GPT', 'generation', 'LLM']
    },
    createdAt: '2024-03-16T10:00:00Z',
    updatedAt: '2024-03-16T10:00:00Z'
  }
]

// Mock связи для карты
const MOCK_EDGES: Edge[] = [
  {
    id: 'edge-1',
    mapId: '1',
    sourceNodeId: 'node-2',
    targetNodeId: 'node-3',
    relationType: 'has-a',
    label: 'использует',
    strength: 0.9,
    bidirectional: false,
    metadata: {
      confidence: 0.95,
      createdBy: 'user'
    },
    createdAt: '2024-03-12T10:00:00Z',
    updatedAt: '2024-03-12T10:00:00Z'
  },
  {
    id: 'edge-2',
    mapId: '1',
    sourceNodeId: 'node-1',
    targetNodeId: 'node-2',
    relationType: 'has-a',
    label: 'включает',
    strength: 0.8,
    bidirectional: false,
    metadata: {
      confidence: 0.9,
      createdBy: 'user'
    },
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-03-10T10:00:00Z'
  },
  {
    id: 'edge-3',
    mapId: '1',
    sourceNodeId: 'node-2',
    targetNodeId: 'node-4',
    relationType: 'is-a',
    label: 'является архитектурой для',
    strength: 0.95,
    bidirectional: false,
    metadata: {
      confidence: 0.9,
      createdBy: 'user'
    },
    createdAt: '2024-03-14T10:00:00Z',
    updatedAt: '2024-03-14T10:00:00Z'
  },
  {
    id: 'edge-4',
    mapId: '1',
    sourceNodeId: 'node-2',
    targetNodeId: 'node-5',
    relationType: 'is-a',
    label: 'является архитектурой для',
    strength: 0.95,
    bidirectional: false,
    metadata: {
      confidence: 0.9,
      createdBy: 'user'
    },
    createdAt: '2024-03-16T10:00:00Z',
    updatedAt: '2024-03-16T10:00:00Z'
  }
]

export const mapApi = {
  // ====== Работа с картами ======
  getMaps: async (): Promise<MapEntity[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))
    return MOCK_MAPS
  },

  getMapById: async (id: string): Promise<MapEntity | null> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return MOCK_MAPS.find(map => map.id === id) || null
  },

  createMap: async (data: Pick<MapEntity, 'title' | 'description'>): Promise<MapEntity> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const newMap: MapEntity = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nodesCount: 0
    }
    MOCK_MAPS.unshift(newMap)
    return newMap
  },

  deleteMap: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const index = MOCK_MAPS.findIndex(map => map.id === id)
    if (index > -1) {
      MOCK_MAPS.splice(index, 1)
    }
    // Удаляем связанные узлы и связи
    const nodeIndices = MOCK_NODES.map((node, index) => ({ node, index }))
      .filter(({ node }) => node.mapId === id)
      .map(({ index }) => index)
      .reverse()
    nodeIndices.forEach(index => MOCK_NODES.splice(index, 1))

    const edgeIndices = MOCK_EDGES.map((edge, index) => ({ edge, index }))
      .filter(({ edge }) => edge.mapId === id)
      .map(({ index }) => index)
      .reverse()
    edgeIndices.forEach(index => MOCK_EDGES.splice(index, 1))
  },

  // ====== Работа с узлами ======
  getNodes: async (mapId: string): Promise<Node[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return MOCK_NODES.filter(node => node.mapId === mapId)
  },

  createNode: async (data: Omit<Node, 'id' | 'createdAt' | 'updatedAt'>): Promise<Node> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newNode: Node = {
      ...data,
      id: `node-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    MOCK_NODES.push(newNode)

    // Обновляем счетчик узлов в карте
    const mapIndex = MOCK_MAPS.findIndex(map => map.id === newNode.mapId)
    if (mapIndex > -1) {
      MOCK_MAPS[mapIndex].nodesCount += 1
      MOCK_MAPS[mapIndex].updatedAt = new Date().toISOString()
    }

    return newNode
  },

  updateNode: async (id: string, data: Partial<Node>): Promise<Node> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    const index = MOCK_NODES.findIndex(node => node.id === id)
    if (index === -1) {
      throw new Error('Узел не найден')
    }
    MOCK_NODES[index] = {
      ...MOCK_NODES[index],
      ...data,
      updatedAt: new Date().toISOString()
    }
    return MOCK_NODES[index]
  },

  deleteNode: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const nodeIndex = MOCK_NODES.findIndex(node => node.id === id)
    if (nodeIndex > -1) {
      const mapId = MOCK_NODES[nodeIndex].mapId
      MOCK_NODES.splice(nodeIndex, 1)

      // Обновляем счетчик узлов в карте
      const mapIndex = MOCK_MAPS.findIndex(map => map.id === mapId)
      if (mapIndex > -1) {
        MOCK_MAPS[mapIndex].nodesCount -= 1
        MOCK_MAPS[mapIndex].updatedAt = new Date().toISOString()
      }
    }

    // Удаляем связанные связи
    const edgeIndices = MOCK_EDGES.map((edge, index) => ({ edge, index }))
      .filter(({ edge }) => edge.sourceNodeId === id || edge.targetNodeId === id)
      .map(({ index }) => index)
      .reverse()
    edgeIndices.forEach(index => MOCK_EDGES.splice(index, 1))
  },

  // ====== Работа со связями ======
  getEdges: async (mapId: string): Promise<Edge[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return MOCK_EDGES.filter(edge => edge.mapId === mapId)
  },

  createEdge: async (data: Omit<Edge, 'id' | 'createdAt' | 'updatedAt'>): Promise<Edge> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newEdge: Edge = {
      ...data,
      id: `edge-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    MOCK_EDGES.push(newEdge)
    return newEdge
  },

  updateEdge: async (id: string, data: Partial<Edge>): Promise<Edge> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    const index = MOCK_EDGES.findIndex(edge => edge.id === id)
    if (index === -1) {
      throw new Error('Связь не найдена')
    }
    MOCK_EDGES[index] = {
      ...MOCK_EDGES[index],
      ...data,
      updatedAt: new Date().toISOString()
    }
    return MOCK_EDGES[index]
  },

  deleteEdge: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = MOCK_EDGES.findIndex(edge => edge.id === id)
    if (index > -1) {
      MOCK_EDGES.splice(index, 1)
    }
  },

  // ====== Полная карта с графом ======
  getFullMap: async (mapId: string): Promise<FullMap | null> => {
    await new Promise(resolve => setTimeout(resolve, 400))

    const map = MOCK_MAPS.find(m => m.id === mapId)
    if (!map) return null

    const nodes = MOCK_NODES.filter(node => node.mapId === mapId)
    const edges = MOCK_EDGES.filter(edge => edge.mapId === mapId)

    return {
      ...map,
      nodes,
      edges,
      aiAnalysis: {
        lastAnalyzed: '2024-03-20T16:00:00Z',
        gaps: [
          'Отсутствуют практические примеры применения',
          'Нет связей с конкретными задачами NLP'
        ],
        suggestions: [
          'Добавить узел "Компьютерное зрение" как еще одну область применения',
          'Рассмотреть добавление связей с фундаментальными концепциями линейной алгебры'
        ],
        complexityScore: 0.7,
        completenessScore: 0.6,
        structuralIssues: ['Обнаружена петля в графе: node-2 → node-3 → node-1']
      }
    }
  },

  // ====== ИИ-анализ графа ======
  analyzeGraph: async (mapId: string) => {
    await new Promise(resolve => setTimeout(resolve, 2000)) // Имитация долгого анализа

    const nodes = MOCK_NODES.filter(node => node.mapId === mapId)
    const edges = MOCK_EDGES.filter(edge => edge.mapId === mapId)

    // Простой анализ
    const analysis = {
      gaps: ['Не хватает вводного узла "Введение в ИИ"', 'Отсутствуют практические примеры'],
      suggestions: [
        'Рассмотрите добавление узла "История нейронных сетей"',
        'Можно добавить связь "Вдохновлен биологическими нейронными сетями"'
      ],
      complexityScore: 0.75,
      completenessScore: 0.6,
      structuralIssues: ['Обнаружены изолированные узлы'],
      nodeCount: nodes.length,
      edgeCount: edges.length,
      density: edges.length / ((nodes.length * (nodes.length - 1)) / 2)
    }

    return analysis
  }
}
