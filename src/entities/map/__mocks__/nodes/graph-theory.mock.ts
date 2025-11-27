import type { Node } from '../../map.schema'

export const GRAPH_THEORY_NODES: Node[] = [
  // Корневой узел + цепочка
  {
    id: 'gt-1',
    mapId: '3',
    label: 'Граф',
    description: 'Математическая структура из вершин и рёбер',
    type: 'concept',
    position: { x: 0, y: 0 },
    metadata: { confidence: 0.95, complexity: 'basic', tags: ['основы'] },
    createdAt: '2024-03-21T08:00:00Z',
    updatedAt: '2024-03-21T08:00:00Z'
  },
  {
    id: 'gt-2',
    mapId: '3',
    label: 'Вершина',
    description: 'Узел графа',
    type: 'concept',
    position: { x: 0, y: 100 },
    metadata: { confidence: 0.9, complexity: 'basic', tags: ['основы'] },
    createdAt: '2024-03-21T08:01:00Z',
    updatedAt: '2024-03-21T08:01:00Z'
  },
  {
    id: 'gt-3',
    mapId: '3',
    label: 'Ребро',
    description: 'Связь между вершинами',
    type: 'concept',
    position: { x: 0, y: 200 },
    metadata: { confidence: 0.9, complexity: 'basic', tags: ['основы'] },
    createdAt: '2024-03-21T08:02:00Z',
    updatedAt: '2024-03-21T08:02:00Z'
  },

  // Веер вниз от корня
  {
    id: 'gt-4',
    mapId: '3',
    label: 'Направленный граф',
    description: 'Граф с направленными рёбрами',
    type: 'theory',
    position: { x: 150, y: 100 },
    metadata: { confidence: 0.85, complexity: 'intermediate', tags: ['типы'] },
    createdAt: '2024-03-21T08:03:00Z',
    updatedAt: '2024-03-21T08:03:00Z'
  },
  {
    id: 'gt-5',
    mapId: '3',
    label: 'Ненаправленный граф',
    description: 'Граф без направления рёбер',
    type: 'theory',
    position: { x: 300, y: 100 },
    metadata: { confidence: 0.85, complexity: 'intermediate', tags: ['типы'] },
    createdAt: '2024-03-21T08:04:00Z',
    updatedAt: '2024-03-21T08:04:00Z'
  },
  {
    id: 'gt-6',
    mapId: '3',
    label: 'Дерево',
    description: 'Связный граф без циклов',
    type: 'theory',
    position: { x: 450, y: 100 },
    metadata: { confidence: 0.9, complexity: 'intermediate', tags: ['типы'] },
    createdAt: '2024-03-21T08:05:00Z',
    updatedAt: '2024-03-21T08:05:00Z'
  },

  // Цикл (3 узла)
  {
    id: 'gt-7',
    mapId: '3',
    label: 'Цикл',
    description: 'Замкнутый путь в графе',
    type: 'concept',
    position: { x: -200, y: 150 },
    metadata: { confidence: 0.85, complexity: 'intermediate', tags: ['структуры'] },
    createdAt: '2024-03-21T08:06:00Z',
    updatedAt: '2024-03-21T08:06:00Z'
  },
  {
    id: 'gt-8',
    mapId: '3',
    label: 'Путь',
    description: 'Последовательность вершин и рёбер',
    type: 'concept',
    position: { x: -200, y: 250 },
    metadata: { confidence: 0.85, complexity: 'basic', tags: ['структуры'] },
    createdAt: '2024-03-21T08:07:00Z',
    updatedAt: '2024-03-21T08:07:00Z'
  },
  {
    id: 'gt-9',
    mapId: '3',
    label: 'Маршрут',
    description: 'Путь с возможными повторами',
    type: 'concept',
    position: { x: -300, y: 200 },
    metadata: { confidence: 0.8, complexity: 'intermediate', tags: ['структуры'] },
    createdAt: '2024-03-21T08:08:00Z',
    updatedAt: '2024-03-21T08:08:00Z'
  },

  // Ромб
  {
    id: 'gt-10',
    mapId: '3',
    label: 'Обход графа',
    description: 'Посещение всех вершин',
    type: 'concept',
    position: { x: 200, y: 250 },
    metadata: { confidence: 0.9, complexity: 'intermediate', tags: ['алгоритмы'] },
    createdAt: '2024-03-21T08:09:00Z',
    updatedAt: '2024-03-21T08:09:00Z'
  },
  {
    id: 'gt-11',
    mapId: '3',
    label: 'BFS',
    description: 'Поиск в ширину',
    type: 'example',
    position: { x: 150, y: 350 },
    metadata: { confidence: 0.9, complexity: 'intermediate', tags: ['алгоритмы'] },
    createdAt: '2024-03-21T08:10:00Z',
    updatedAt: '2024-03-21T08:10:00Z'
  },
  {
    id: 'gt-12',
    mapId: '3',
    label: 'DFS',
    description: 'Поиск в глубину',
    type: 'example',
    position: { x: 250, y: 350 },
    metadata: { confidence: 0.9, complexity: 'intermediate', tags: ['алгоритмы'] },
    createdAt: '2024-03-21T08:11:00Z',
    updatedAt: '2024-03-21T08:11:00Z'
  },

  // Взаимные связи
  {
    id: 'gt-13',
    mapId: '3',
    label: 'Матрица смежности',
    description: 'Представление графа матрицей',
    type: 'fact',
    position: { x: 400, y: 300 },
    metadata: { confidence: 0.85, complexity: 'intermediate', tags: ['представление'] },
    createdAt: '2024-03-21T08:12:00Z',
    updatedAt: '2024-03-21T08:12:00Z'
  },
  {
    id: 'gt-14',
    mapId: '3',
    label: 'Список смежности',
    description: 'Представление графа списками',
    type: 'fact',
    position: { x: 400, y: 400 },
    metadata: { confidence: 0.85, complexity: 'intermediate', tags: ['представление'] },
    createdAt: '2024-03-21T08:13:00Z',
    updatedAt: '2024-03-21T08:13:00Z'
  },

  // Изолированный узел
  {
    id: 'gt-15',
    mapId: '3',
    label: 'Гиперграф',
    description: 'Обобщение графа с гиперрёбрами',
    type: 'hypothesis',
    position: { x: -100, y: 400 },
    metadata: { confidence: 0.6, complexity: 'advanced', tags: ['расширения'] },
    createdAt: '2024-03-21T08:14:00Z',
    updatedAt: '2024-03-21T08:14:00Z'
  }
]
