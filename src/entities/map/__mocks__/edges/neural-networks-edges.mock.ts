import type { Edge } from '../../map.schema'

export const NEURAL_NETWORKS_EDGES: Edge[] = [
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

// Добавляем философские связи
MOCK_EDGES.push(...PHILOSOPHY_EDGES)
]
