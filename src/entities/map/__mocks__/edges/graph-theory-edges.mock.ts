import type { Edge } from '../../map.schema'

export const GRAPH_THEORY_EDGES: Edge[] = [
  // Цепочка: Граф → Вершина → Ребро
  {
    id: 'gt-edge-1',
    mapId: '3',
    sourceNodeId: 'gt-1',
    targetNodeId: 'gt-2',
    relationType: 'has-a',
    label: 'состоит из',
    strength: 0.95,
    bidirectional: false,
    metadata: { confidence: 0.95, createdBy: 'user' },
    createdAt: '2024-03-21T09:00:00Z',
    updatedAt: '2024-03-21T09:00:00Z'
  },
  {
    id: 'gt-edge-2',
    mapId: '3',
    sourceNodeId: 'gt-1',
    targetNodeId: 'gt-3',
    relationType: 'has-a',
    label: 'состоит из',
    strength: 0.95,
    bidirectional: false,
    metadata: { confidence: 0.95, createdBy: 'user' },
    createdAt: '2024-03-21T09:01:00Z',
    updatedAt: '2024-03-21T09:01:00Z'
  },

  // Веер вниз: Граф → типы графов
  {
    id: 'gt-edge-3',
    mapId: '3',
    sourceNodeId: 'gt-1',
    targetNodeId: 'gt-4',
    relationType: 'is-a',
    label: 'вид',
    strength: 0.9,
    bidirectional: false,
    metadata: { confidence: 0.9, createdBy: 'user' },
    createdAt: '2024-03-21T09:02:00Z',
    updatedAt: '2024-03-21T09:02:00Z'
  },
  {
    id: 'gt-edge-4',
    mapId: '3',
    sourceNodeId: 'gt-1',
    targetNodeId: 'gt-5',
    relationType: 'is-a',
    label: 'вид',
    strength: 0.9,
    bidirectional: false,
    metadata: { confidence: 0.9, createdBy: 'user' },
    createdAt: '2024-03-21T09:03:00Z',
    updatedAt: '2024-03-21T09:03:00Z'
  },
  {
    id: 'gt-edge-5',
    mapId: '3',
    sourceNodeId: 'gt-1',
    targetNodeId: 'gt-6',
    relationType: 'is-a',
    label: 'вид',
    strength: 0.9,
    bidirectional: false,
    metadata: { confidence: 0.9, createdBy: 'user' },
    createdAt: '2024-03-21T09:04:00Z',
    updatedAt: '2024-03-21T09:04:00Z'
  },

  // Цикл: Цикл → Путь → Маршрут → Цикл
  {
    id: 'gt-edge-6',
    mapId: '3',
    sourceNodeId: 'gt-7',
    targetNodeId: 'gt-8',
    relationType: 'related-to',
    label: 'частный случай',
    strength: 0.8,
    bidirectional: false,
    metadata: { confidence: 0.85, createdBy: 'user' },
    createdAt: '2024-03-21T09:05:00Z',
    updatedAt: '2024-03-21T09:05:00Z'
  },
  {
    id: 'gt-edge-7',
    mapId: '3',
    sourceNodeId: 'gt-8',
    targetNodeId: 'gt-9',
    relationType: 'related-to',
    label: 'обобщение',
    strength: 0.8,
    bidirectional: false,
    metadata: { confidence: 0.85, createdBy: 'user' },
    createdAt: '2024-03-21T09:06:00Z',
    updatedAt: '2024-03-21T09:06:00Z'
  },
  {
    id: 'gt-edge-8',
    mapId: '3',
    sourceNodeId: 'gt-9',
    targetNodeId: 'gt-7',
    relationType: 'related-to',
    label: 'может образовать',
    strength: 0.7,
    bidirectional: false,
    metadata: { confidence: 0.8, createdBy: 'user' },
    createdAt: '2024-03-21T09:07:00Z',
    updatedAt: '2024-03-21T09:07:00Z'
  },

  // Ромб: Обход графа → BFS/DFS → Дерево
  {
    id: 'gt-edge-9',
    mapId: '3',
    sourceNodeId: 'gt-10',
    targetNodeId: 'gt-11',
    relationType: 'has-a',
    label: 'метод',
    strength: 0.9,
    bidirectional: false,
    metadata: { confidence: 0.95, createdBy: 'user' },
    createdAt: '2024-03-21T09:08:00Z',
    updatedAt: '2024-03-21T09:08:00Z'
  },
  {
    id: 'gt-edge-10',
    mapId: '3',
    sourceNodeId: 'gt-10',
    targetNodeId: 'gt-12',
    relationType: 'has-a',
    label: 'метод',
    strength: 0.9,
    bidirectional: false,
    metadata: { confidence: 0.95, createdBy: 'user' },
    createdAt: '2024-03-21T09:09:00Z',
    updatedAt: '2024-03-21T09:09:00Z'
  },
  {
    id: 'gt-edge-11',
    mapId: '3',
    sourceNodeId: 'gt-11',
    targetNodeId: 'gt-6',
    relationType: 'causes',
    label: 'строит',
    strength: 0.85,
    bidirectional: false,
    metadata: { confidence: 0.9, createdBy: 'user' },
    createdAt: '2024-03-21T09:10:00Z',
    updatedAt: '2024-03-21T09:10:00Z'
  },
  {
    id: 'gt-edge-12',
    mapId: '3',
    sourceNodeId: 'gt-12',
    targetNodeId: 'gt-6',
    relationType: 'causes',
    label: 'строит',
    strength: 0.85,
    bidirectional: false,
    metadata: { confidence: 0.9, createdBy: 'user' },
    createdAt: '2024-03-21T09:11:00Z',
    updatedAt: '2024-03-21T09:11:00Z'
  },

  // Взаимные связи: Матрица ⇄ Список
  {
    id: 'gt-edge-13',
    mapId: '3',
    sourceNodeId: 'gt-13',
    targetNodeId: 'gt-14',
    relationType: 'similar-to',
    label: 'альтернатива',
    strength: 0.9,
    bidirectional: true,
    metadata: { confidence: 0.95, createdBy: 'user' },
    createdAt: '2024-03-21T09:12:00Z',
    updatedAt: '2024-03-21T09:12:00Z'
  },

  // Связь представлений с графом
  {
    id: 'gt-edge-14',
    mapId: '3',
    sourceNodeId: 'gt-1',
    targetNodeId: 'gt-13',
    relationType: 'explains',
    label: 'представляется',
    strength: 0.85,
    bidirectional: false,
    metadata: { confidence: 0.9, createdBy: 'user' },
    createdAt: '2024-03-21T09:13:00Z',
    updatedAt: '2024-03-21T09:13:00Z'
  },
  {
    id: 'gt-edge-15',
    mapId: '3',
    sourceNodeId: 'gt-1',
    targetNodeId: 'gt-14',
    relationType: 'explains',
    label: 'представляется',
    strength: 0.85,
    bidirectional: false,
    metadata: { confidence: 0.9, createdBy: 'user' },
    createdAt: '2024-03-21T09:14:00Z',
    updatedAt: '2024-03-21T09:14:00Z'
  }

  // gt-15 (Гиперграф) остаётся изолированным - без связей
]
