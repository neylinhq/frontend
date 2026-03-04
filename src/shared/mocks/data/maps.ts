import type { MapEntity } from '@/entities/map'
import { GRAPH_PRESETS, generateMockGraph } from '@/entities/map'

// Generated test graph
const GENERATED_GRAPH = generateMockGraph({ ...GRAPH_PRESETS.mixed, mapId: '4', nodeCount: 100 })

export const MOCK_MAPS: MapEntity[] = [
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
    nodesCount: 53,
    previewUrl: undefined
  },
  {
    id: '3',
    title: 'Теория графов',
    description: 'Тестовая карта для проверки layout алгоритмов',
    createdAt: '2024-03-21T08:00:00Z',
    updatedAt: '2024-03-21T08:05:00Z',
    nodesCount: 15,
    previewUrl: undefined
  },
  {
    id: '4',
    title: 'Тест: Все паттерны',
    description: 'Сгенерированный граф со всеми типами узлов, связей и структур',
    createdAt: '2024-03-22T10:00:00Z',
    updatedAt: '2024-03-22T10:00:00Z',
    nodesCount: GENERATED_GRAPH.nodes.length,
    previewUrl: undefined
  }
]

export { GENERATED_GRAPH }
