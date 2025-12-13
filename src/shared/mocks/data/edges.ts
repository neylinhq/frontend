import type { Edge } from '@/entities/map'
import { GRAPH_THEORY_EDGES as _gtEdges } from './graph-theory-edges.mock'
import { NEURAL_NETWORKS_EDGES as _nnEdges } from './neural-networks-edges.mock'
import { PHILOSOPHY_EDGES as _philEdges } from './philosophy-edges.mock'

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

export const PHILOSOPHY_EDGES: Edge[] = [
  // Античная философия
  {
    id: 'phil-edge-1',
    mapId: '2',
    sourceNodeId: 'phil-2',
    targetNodeId: 'phil-1',
    relationType: 'influences',
    label: 'ученик',
    strength: 0.95,
    bidirectional: false,
    metadata: { confidence: 0.95, createdBy: 'user' },
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z'
  },
  {
    id: 'phil-edge-2',
    mapId: '2',
    sourceNodeId: 'phil-3',
    targetNodeId: 'phil-2',
    relationType: 'influences',
    label: 'ученик',
    strength: 0.95,
    bidirectional: false,
    metadata: { confidence: 0.95, createdBy: 'user' },
    createdAt: '2024-02-15T10:01:00Z',
    updatedAt: '2024-02-15T10:01:00Z'
  },
  {
    id: 'phil-edge-3',
    mapId: '2',
    sourceNodeId: 'phil-2',
    targetNodeId: 'phil-40',
    relationType: 'explains',
    label: 'развивает',
    strength: 0.9,
    bidirectional: false,
    metadata: { confidence: 0.9, createdBy: 'user' },
    createdAt: '2024-02-15T10:02:00Z',
    updatedAt: '2024-02-15T10:02:00Z'
  },
  {
    id: 'phil-edge-4',
    mapId: '2',
    sourceNodeId: 'phil-6',
    targetNodeId: 'phil-5',
    relationType: 'part-of',
    label: 'представитель',
    strength: 0.85,
    bidirectional: false,
    metadata: { confidence: 0.9, createdBy: 'user' },
    createdAt: '2024-02-15T10:03:00Z',
    updatedAt: '2024-02-15T10:03:00Z'
  },
  {
    id: 'phil-edge-5',
    mapId: '2',
    sourceNodeId: 'phil-7',
    targetNodeId: 'phil-5',
    relationType: 'part-of',
    label: 'представитель',
    strength: 0.9,
    bidirectional: false,
    metadata: { confidence: 0.95, createdBy: 'user' },
    createdAt: '2024-02-15T10:04:00Z',
    updatedAt: '2024-02-15T10:04:00Z'
  },

  // Средневековье и влияние античности
  {
    id: 'phil-edge-6',
    mapId: '2',
    sourceNodeId: 'phil-8',
    targetNodeId: 'phil-2',
    relationType: 'influences',
    label: 'вдохновлен',
    strength: 0.8,
    bidirectional: false,
    metadata: { confidence: 0.85, createdBy: 'user' },
    createdAt: '2024-02-15T10:05:00Z',
    updatedAt: '2024-02-15T10:05:00Z'
  },
  {
    id: 'phil-edge-7',
    mapId: '2',
    sourceNodeId: 'phil-9',
    targetNodeId: 'phil-3',
    relationType: 'influences',
    label: 'синтезирует с христианством',
    strength: 0.85,
    bidirectional: false,
    metadata: { confidence: 0.9, createdBy: 'user' },
    createdAt: '2024-02-15T10:06:00Z',
    updatedAt: '2024-02-15T10:06:00Z'
  },

  // Новое время - рационалисты
  {
    id: 'phil-edge-8',
    mapId: '2',
    sourceNodeId: 'phil-10',
    targetNodeId: 'phil-29',
    relationType: 'part-of',
    label: 'основатель',
    strength: 0.95,
    bidirectional: false,
    metadata: { confidence: 0.95, createdBy: 'user' },
    createdAt: '2024-02-15T10:07:00Z',
    updatedAt: '2024-02-15T10:07:00Z'
  },
  {
    id: 'phil-edge-9',
    mapId: '2',
    sourceNodeId: 'phil-11',
    targetNodeId: 'phil-29',
    relationType: 'part-of',
    label: 'представитель',
    strength: 0.9,
    bidirectional: false,
    metadata: { confidence: 0.9, createdBy: 'user' },
    createdAt: '2024-02-15T10:08:00Z',
    updatedAt: '2024-02-15T10:08:00Z'
  },
  {
    id: 'phil-edge-10',
    mapId: '2',
    sourceNodeId: 'phil-12',
    targetNodeId: 'phil-29',
    relationType: 'part-of',
    label: 'представитель',
    strength: 0.85,
    bidirectional: false,
    metadata: { confidence: 0.85, createdBy: 'user' },
    createdAt: '2024-02-15T10:09:00Z',
    updatedAt: '2024-02-15T10:09:00Z'
  },
  {
    id: 'phil-edge-11',
    mapId: '2',
    sourceNodeId: 'phil-11',
    targetNodeId: 'phil-10',
    relationType: 'influences',
    label: 'критикует',
    strength: 0.7,
    bidirectional: false,
    metadata: { confidence: 0.8, createdBy: 'user' },
    createdAt: '2024-02-15T10:10:00Z',
    updatedAt: '2024-02-15T10:10:00Z'
  },

  // Новое время - эмпиристы
  {
    id: 'phil-edge-12',
    mapId: '2',
    sourceNodeId: 'phil-13',
    targetNodeId: 'phil-30',
    relationType: 'part-of',
    label: 'основатель',
    strength: 0.95,
    bidirectional: false,
    metadata: { confidence: 0.95, createdBy: 'user' },
    createdAt: '2024-02-15T10:11:00Z',
    updatedAt: '2024-02-15T10:11:00Z'
  },
  {
    id: 'phil-edge-13',
    mapId: '2',
    sourceNodeId: 'phil-14',
    targetNodeId: 'phil-30',
    relationType: 'part-of',
    label: 'представитель',
    strength: 0.9,
    bidirectional: false,
    metadata: { confidence: 0.9, createdBy: 'user' },
    createdAt: '2024-02-15T10:12:00Z',
    updatedAt: '2024-02-15T10:12:00Z'
  },
  {
    id: 'phil-edge-14',
    mapId: '2',
    sourceNodeId: 'phil-47',
    targetNodeId: 'phil-30',
    relationType: 'part-of',
    label: 'представитель',
    strength: 0.85,
    bidirectional: false,
    metadata: { confidence: 0.85, createdBy: 'user' },
    createdAt: '2024-02-15T10:13:00Z',
    updatedAt: '2024-02-15T10:13:00Z'
  },
  {
    id: 'phil-edge-15',
    mapId: '2',
    sourceNodeId: 'phil-29',
    targetNodeId: 'phil-30',
    relationType: 'contradicts',
    label: 'противопоставлены',
    strength: 0.9,
    bidirectional: true,
    metadata: { confidence: 0.95, createdBy: 'user' },
    createdAt: '2024-02-15T10:14:00Z',
    updatedAt: '2024-02-15T10:14:00Z'
  },

  // Кант - синтез
  {
    id: 'phil-edge-16',
    mapId: '2',
    sourceNodeId: 'phil-15',
    targetNodeId: 'phil-29',
    relationType: 'influences',
    label: 'синтезирует',
    strength: 0.9,
    bidirectional: false,
    metadata: { confidence: 0.9, createdBy: 'user' },
    createdAt: '2024-02-15T10:15:00Z',
    updatedAt: '2024-02-15T10:15:00Z'
  },
  {
    id: 'phil-edge-17',
    mapId: '2',
    sourceNodeId: 'phil-15',
    targetNodeId: 'phil-30',
    relationType: 'influences',
    label: 'синтезирует',
    strength: 0.9,
    bidirectional: false,
    metadata: { confidence: 0.9, createdBy: 'user' },
    createdAt: '2024-02-15T10:16:00Z',
    updatedAt: '2024-02-15T10:16:00Z'
  },
  {
    id: 'phil-edge-18',
    mapId: '2',
    sourceNodeId: 'phil-15',
    targetNodeId: 'phil-41',
    relationType: 'explains',
    label: 'развивает',
    strength: 0.95,
    bidirectional: false,
    metadata: { confidence: 0.95, createdBy: 'user' },
    createdAt: '2024-02-15T10:17:00Z',
    updatedAt: '2024-02-15T10:17:00Z'
  },

  // Немецкий идеализм
  {
    id: 'phil-edge-19',
    mapId: '2',
    sourceNodeId: 'phil-16',
    targetNodeId: 'phil-15',
    relationType: 'influences',
    label: 'развивает идеи',
    strength: 0.9,
    bidirectional: false,
    metadata: { confidence: 0.9, createdBy: 'user' },
    createdAt: '2024-02-15T10:18:00Z',
    updatedAt: '2024-02-15T10:18:00Z'
  },
  {
    id: 'phil-edge-20',
    mapId: '2',
    sourceNodeId: 'phil-16',
    targetNodeId: 'phil-42',
    relationType: 'explains',
    label: 'развивает',
    strength: 0.95,
    bidirectional: false,
    metadata: { confidence: 0.95, createdBy: 'user' },
    createdAt: '2024-02-15T10:19:00Z',
    updatedAt: '2024-02-15T10:19:00Z'
  },
  {
    id: 'phil-edge-21',
    mapId: '2',
    sourceNodeId: 'phil-17',
    targetNodeId: 'phil-15',
    relationType: 'influences',
    label: 'развивает',
    strength: 0.8,
    bidirectional: false,
    metadata: { confidence: 0.85, createdBy: 'user' },
    createdAt: '2024-02-15T10:20:00Z',
    updatedAt: '2024-02-15T10:20:00Z'
  },
  {
    id: 'phil-edge-22',
    mapId: '2',
    sourceNodeId: 'phil-18',
    targetNodeId: 'phil-15',
    relationType: 'influences',
    label: 'развивает',
    strength: 0.75,
    bidirectional: false,
    metadata: { confidence: 0.8, createdBy: 'user' },
    createdAt: '2024-02-15T10:21:00Z',
    updatedAt: '2024-02-15T10:21:00Z'
  },

  // XIX век - реакция на идеализм
  {
    id: 'phil-edge-23',
    mapId: '2',
    sourceNodeId: 'phil-19',
    targetNodeId: 'phil-15',
    relationType: 'contradicts',
    label: 'критикует',
    strength: 0.8,
    bidirectional: false,
    metadata: { confidence: 0.85, createdBy: 'user' },
    createdAt: '2024-02-15T10:22:00Z',
    updatedAt: '2024-02-15T10:22:00Z'
  },
  {
    id: 'phil-edge-24',
    mapId: '2',
    sourceNodeId: 'phil-19',
    targetNodeId: 'phil-43',
    relationType: 'similar-to',
    label: 'предшественник',
    strength: 0.7,
    bidirectional: false,
    metadata: { confidence: 0.75, createdBy: 'user' },
    createdAt: '2024-02-15T10:23:00Z',
    updatedAt: '2024-02-15T10:23:00Z'
  },
  {
    id: 'phil-edge-25',
    mapId: '2',
    sourceNodeId: 'phil-20',
    targetNodeId: 'phil-31',
    relationType: 'part-of',
    label: 'предшественник',
    strength: 0.9,
    bidirectional: false,
    metadata: { confidence: 0.9, createdBy: 'user' },
    createdAt: '2024-02-15T10:24:00Z',
    updatedAt: '2024-02-15T10:24:00Z'
  },
  {
    id: 'phil-edge-26',
    mapId: '2',
    sourceNodeId: 'phil-21',
    targetNodeId: 'phil-16',
    relationType: 'influences',
    label: 'развивает диалектику',
    strength: 0.85,
    bidirectional: false,
    metadata: { confidence: 0.9, createdBy: 'user' },
    createdAt: '2024-02-15T10:25:00Z',
    updatedAt: '2024-02-15T10:25:00Z'
  },
  {
    id: 'phil-edge-27',
    mapId: '2',
    sourceNodeId: 'phil-22',
    targetNodeId: 'phil-19',
    relationType: 'influences',
    label: 'развивает идеи',
    strength: 0.8,
    bidirectional: false,
    metadata: { confidence: 0.85, createdBy: 'user' },
    createdAt: '2024-02-15T10:26:00Z',
    updatedAt: '2024-02-15T10:26:00Z'
  },
  {
    id: 'phil-edge-28',
    mapId: '2',
    sourceNodeId: 'phil-22',
    targetNodeId: 'phil-43',
    relationType: 'explains',
    label: 'развивает',
    strength: 0.95,
    bidirectional: false,
    metadata: { confidence: 0.95, createdBy: 'user' },
    createdAt: '2024-02-15T10:27:00Z',
    updatedAt: '2024-02-15T10:27:00Z'
  },

  // XX век - Экзистенциализм
  {
    id: 'phil-edge-29',
    mapId: '2',
    sourceNodeId: 'phil-23',
    targetNodeId: 'phil-32',
    relationType: 'part-of',
    label: 'применяет метод',
    strength: 0.85,
    bidirectional: false,
    metadata: { confidence: 0.9, createdBy: 'user' },
    createdAt: '2024-02-15T10:28:00Z',
    updatedAt: '2024-02-15T10:28:00Z'
  },
  {
    id: 'phil-edge-30',
    mapId: '2',
    sourceNodeId: 'phil-23',
    targetNodeId: 'phil-31',
    relationType: 'part-of',
    label: 'представитель',
    strength: 0.9,
    bidirectional: false,
    metadata: { confidence: 0.9, createdBy: 'user' },
    createdAt: '2024-02-15T10:29:00Z',
    updatedAt: '2024-02-15T10:29:00Z'
  },
  {
    id: 'phil-edge-31',
    mapId: '2',
    sourceNodeId: 'phil-24',
    targetNodeId: 'phil-31',
    relationType: 'part-of',
    label: 'ключевая фигура',
    strength: 0.95,
    bidirectional: false,
    metadata: { confidence: 0.95, createdBy: 'user' },
    createdAt: '2024-02-15T10:30:00Z',
    updatedAt: '2024-02-15T10:30:00Z'
  },
  {
    id: 'phil-edge-32',
    mapId: '2',
    sourceNodeId: 'phil-24',
    targetNodeId: 'phil-23',
    relationType: 'influences',
    label: 'развивает',
    strength: 0.85,
    bidirectional: false,
    metadata: { confidence: 0.85, createdBy: 'user' },
    createdAt: '2024-02-15T10:31:00Z',
    updatedAt: '2024-02-15T10:31:00Z'
  },
  {
    id: 'phil-edge-33',
    mapId: '2',
    sourceNodeId: 'phil-25',
    targetNodeId: 'phil-44',
    relationType: 'explains',
    label: 'развивает',
    strength: 0.95,
    bidirectional: false,
    metadata: { confidence: 0.95, createdBy: 'user' },
    createdAt: '2024-02-15T10:32:00Z',
    updatedAt: '2024-02-15T10:32:00Z'
  },
  {
    id: 'phil-edge-34',
    mapId: '2',
    sourceNodeId: 'phil-25',
    targetNodeId: 'phil-24',
    relationType: 'related-to',
    label: 'современники',
    strength: 0.8,
    bidirectional: true,
    metadata: { confidence: 0.85, createdBy: 'user' },
    createdAt: '2024-02-15T10:33:00Z',
    updatedAt: '2024-02-15T10:33:00Z'
  },
  {
    id: 'phil-edge-35',
    mapId: '2',
    sourceNodeId: 'phil-20',
    targetNodeId: 'phil-44',
    relationType: 'influences',
    label: 'предшественник концепции',
    strength: 0.75,
    bidirectional: false,
    metadata: { confidence: 0.8, createdBy: 'user' },
    createdAt: '2024-02-15T10:34:00Z',
    updatedAt: '2024-02-15T10:34:00Z'
  },
  {
    id: 'phil-edge-36',
    mapId: '2',
    sourceNodeId: 'phil-31',
    targetNodeId: 'phil-20',
    relationType: 'influences',
    label: 'происходит от',
    strength: 0.85,
    bidirectional: false,
    metadata: { confidence: 0.9, createdBy: 'user' },
    createdAt: '2024-02-15T10:35:00Z',
    updatedAt: '2024-02-15T10:35:00Z'
  },
  {
    id: 'phil-edge-37',
    mapId: '2',
    sourceNodeId: 'phil-50',
    targetNodeId: 'phil-24',
    relationType: 'related-to',
    label: 'партнер',
    strength: 0.9,
    bidirectional: true,
    metadata: { confidence: 0.95, createdBy: 'user' },
    createdAt: '2024-02-15T10:36:00Z',
    updatedAt: '2024-02-15T10:36:00Z'
  },

  // Феноменология
  {
    id: 'phil-edge-38',
    mapId: '2',
    sourceNodeId: 'phil-33',
    targetNodeId: 'phil-32',
    relationType: 'explains',
    label: 'основатель',
    strength: 0.95,
    bidirectional: false,
    metadata: { confidence: 0.95, createdBy: 'user' },
    createdAt: '2024-02-15T10:37:00Z',
    updatedAt: '2024-02-15T10:37:00Z'
  },
  {
    id: 'phil-edge-39',
    mapId: '2',
    sourceNodeId: 'phil-23',
    targetNodeId: 'phil-33',
    relationType: 'influences',
    label: 'ученик',
    strength: 0.85,
    bidirectional: false,
    metadata: { confidence: 0.9, createdBy: 'user' },
    createdAt: '2024-02-15T10:38:00Z',
    updatedAt: '2024-02-15T10:38:00Z'
  },

  // Аналитическая философия
  {
    id: 'phil-edge-40',
    mapId: '2',
    sourceNodeId: 'phil-26',
    targetNodeId: 'phil-27',
    relationType: 'influences',
    label: 'ученик',
    strength: 0.85,
    bidirectional: false,
    metadata: { confidence: 0.9, createdBy: 'user' },
    createdAt: '2024-02-15T10:39:00Z',
    updatedAt: '2024-02-15T10:39:00Z'
  },
  {
    id: 'phil-edge-41',
    mapId: '2',
    sourceNodeId: 'phil-28',
    targetNodeId: 'phil-26',
    relationType: 'related-to',
    label: 'современники',
    strength: 0.7,
    bidirectional: true,
    metadata: { confidence: 0.75, createdBy: 'user' },
    createdAt: '2024-02-15T10:40:00Z',
    updatedAt: '2024-02-15T10:40:00Z'
  },

  // Постмодернизм
  {
    id: 'phil-edge-42',
    mapId: '2',
    sourceNodeId: 'phil-34',
    targetNodeId: 'phil-22',
    relationType: 'influences',
    label: 'развивает идеи',
    strength: 0.8,
    bidirectional: false,
    metadata: { confidence: 0.85, createdBy: 'user' },
    createdAt: '2024-02-15T10:41:00Z',
    updatedAt: '2024-02-15T10:41:00Z'
  },
  {
    id: 'phil-edge-43',
    mapId: '2',
    sourceNodeId: 'phil-35',
    targetNodeId: 'phil-23',
    relationType: 'influences',
    label: 'критикует',
    strength: 0.75,
    bidirectional: false,
    metadata: { confidence: 0.8, createdBy: 'user' },
    createdAt: '2024-02-15T10:42:00Z',
    updatedAt: '2024-02-15T10:42:00Z'
  },
  {
    id: 'phil-edge-44',
    mapId: '2',
    sourceNodeId: 'phil-36',
    targetNodeId: 'phil-22',
    relationType: 'influences',
    label: 'развивает',
    strength: 0.8,
    bidirectional: false,
    metadata: { confidence: 0.85, createdBy: 'user' },
    createdAt: '2024-02-15T10:43:00Z',
    updatedAt: '2024-02-15T10:43:00Z'
  },

  // Прагматизм
  {
    id: 'phil-edge-45',
    mapId: '2',
    sourceNodeId: 'phil-39',
    targetNodeId: 'phil-38',
    relationType: 'influences',
    label: 'развивает',
    strength: 0.85,
    bidirectional: false,
    metadata: { confidence: 0.9, createdBy: 'user' },
    createdAt: '2024-02-15T10:44:00Z',
    updatedAt: '2024-02-15T10:44:00Z'
  },

  // Политическая философия
  {
    id: 'phil-edge-46',
    mapId: '2',
    sourceNodeId: 'phil-45',
    targetNodeId: 'phil-13',
    relationType: 'influences',
    label: 'современники',
    strength: 0.7,
    bidirectional: true,
    metadata: { confidence: 0.75, createdBy: 'user' },
    createdAt: '2024-02-15T10:45:00Z',
    updatedAt: '2024-02-15T10:45:00Z'
  },
  {
    id: 'phil-edge-47',
    mapId: '2',
    sourceNodeId: 'phil-46',
    targetNodeId: 'phil-13',
    relationType: 'contradicts',
    label: 'критикует',
    strength: 0.75,
    bidirectional: false,
    metadata: { confidence: 0.8, createdBy: 'user' },
    createdAt: '2024-02-15T10:46:00Z',
    updatedAt: '2024-02-15T10:46:00Z'
  },

  // Утилитаризм
  {
    id: 'phil-edge-48',
    mapId: '2',
    sourceNodeId: 'phil-49',
    targetNodeId: 'phil-48',
    relationType: 'influences',
    label: 'развивает',
    strength: 0.9,
    bidirectional: false,
    metadata: { confidence: 0.9, createdBy: 'user' },
    createdAt: '2024-02-15T10:47:00Z',
    updatedAt: '2024-02-15T10:47:00Z'
  }
]

// Combined exports
export const ALL_EDGES: Edge[] = [..._nnEdges, ..._philEdges, ..._gtEdges]
