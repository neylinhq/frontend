import type { Node } from '../../map.schema'

export const NEURAL_NETWORKS_NODES: Node[] = [
  {
    id: 'node-1',
    mapId: '1',
    label: 'Нейронные сети',
    description: 'Основы архитектур нейронных сетей',
    type: 'concept',
    position: { x: 100, y: 100 },
    metadata: {
      complexity: 'intermediate',
      tags: ['AI', 'ML', 'нейросети']
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
      complexity: 'advanced',
      tags: ['transformer', 'attention', 'NLP']
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
      complexity: 'advanced',
      tags: ['BERT', 'NLP', 'pretraining']
    },
    createdAt: '2024-03-12T10:00:00Z',
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
      complexity: 'advanced',
      tags: ['GPT', 'generation', 'LLM']
    },
    createdAt: '2024-03-16T10:00:00Z',
    updatedAt: '2024-03-16T10:00:00Z'
  }
]
