import type { Node } from '@/entities/map'
import { GRAPH_THEORY_NODES as _gtNodes } from './graph-theory.mock'
import { NEURAL_NETWORKS_NODES as _nnNodes } from './neural-networks.mock'
import { PHILOSOPHY_NODES as _philNodes } from './philosophy.mock'

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

export const NEURAL_NETWORKS_NODES: Node[] = [
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
      confidence: 0.75,
      complexity: 'advanced',
      tags: ['GPT', 'generation', 'LLM']
    },
    createdAt: '2024-03-16T10:00:00Z',
    updatedAt: '2024-03-16T10:00:00Z'
  }
]

export const PHILOSOPHY_NODES: Node[] = [
  // Античная философия
  {
    id: 'phil-1',
    mapId: '2',
    label: 'Сократ',
    description: 'Основатель западной философии, метод майевтики',
    type: 'person',
    position: { x: 100, y: 100 },
    metadata: { confidence: 0.95, complexity: 'basic', tags: ['античность', 'этика'] },
    createdAt: '2024-02-15T09:00:00Z',
    updatedAt: '2024-02-15T09:00:00Z'
  },
  {
    id: 'phil-2',
    mapId: '2',
    label: 'Платон',
    description: 'Теория идей, основал Академию',
    type: 'person',
    position: { x: 250, y: 100 },
    metadata: { confidence: 0.95, complexity: 'intermediate', tags: ['античность', 'идеализм'] },
    createdAt: '2024-02-15T09:01:00Z',
    updatedAt: '2024-02-15T09:01:00Z'
  },
  {
    id: 'phil-3',
    mapId: '2',
    label: 'Аристотель',
    description: 'Систематизатор знаний, основатель логики',
    type: 'person',
    position: { x: 400, y: 100 },
    metadata: { confidence: 0.95, complexity: 'advanced', tags: ['античность', 'логика'] },
    createdAt: '2024-02-15T09:02:00Z',
    updatedAt: '2024-02-15T09:02:00Z'
  },
  {
    id: 'phil-4',
    mapId: '2',
    label: 'Эпикур',
    description: 'Философия удовольствия и атомизм',
    type: 'person',
    position: { x: 100, y: 250 },
    metadata: {
      confidence: 0.85,
      complexity: 'intermediate',
      tags: ['античность', 'этика', 'материализм']
    },
    createdAt: '2024-02-15T09:03:00Z',
    updatedAt: '2024-02-15T09:03:00Z'
  },
  {
    id: 'phil-5',
    mapId: '2',
    label: 'Стоицизм',
    description: 'Школа философии: добродетель, апатия, судьба',
    type: 'school',
    position: { x: 250, y: 250 },
    metadata: { confidence: 0.9, complexity: 'intermediate', tags: ['античность', 'этика'] },
    createdAt: '2024-02-15T09:04:00Z',
    updatedAt: '2024-02-15T09:04:00Z'
  },
  {
    id: 'phil-6',
    mapId: '2',
    label: 'Сенека',
    description: 'Римский стоик, нравственная философия',
    type: 'person',
    position: { x: 400, y: 250 },
    metadata: { confidence: 0.8, complexity: 'intermediate', tags: ['античность', 'стоицизм'] },
    createdAt: '2024-02-15T09:05:00Z',
    updatedAt: '2024-02-15T09:05:00Z'
  },
  {
    id: 'phil-7',
    mapId: '2',
    label: 'Марк Аврелий',
    description: 'Римский император-философ, "Размышления"',
    type: 'person',
    position: { x: 550, y: 250 },
    metadata: { confidence: 0.85, complexity: 'intermediate', tags: ['античность', 'стоицизм'] },
    createdAt: '2024-02-15T09:06:00Z',
    updatedAt: '2024-02-15T09:06:00Z'
  },

  // Средневековая философия
  {
    id: 'phil-8',
    mapId: '2',
    label: 'Августин Блаженный',
    description: 'Отец церковной доктрины, неоплатонизм',
    type: 'person',
    position: { x: 100, y: 400 },
    metadata: { confidence: 0.9, complexity: 'advanced', tags: ['средневековье', 'теология'] },
    createdAt: '2024-02-15T09:07:00Z',
    updatedAt: '2024-02-15T09:07:00Z'
  },
  {
    id: 'phil-9',
    mapId: '2',
    label: 'Фома Аквинский',
    description: 'Схоластика, синтез Аристотеля и христианства',
    type: 'person',
    position: { x: 250, y: 400 },
    metadata: { confidence: 0.9, complexity: 'advanced', tags: ['средневековье', 'схоластика'] },
    createdAt: '2024-02-15T09:08:00Z',
    updatedAt: '2024-02-15T09:08:00Z'
  },

  // Философия Нового времени
  {
    id: 'phil-10',
    mapId: '2',
    label: 'Рене Декарт',
    description: 'Рационализм, "Cogito ergo sum", дуализм',
    type: 'person',
    position: { x: 100, y: 550 },
    metadata: { confidence: 0.95, complexity: 'advanced', tags: ['новое время', 'рационализм'] },
    createdAt: '2024-02-15T09:09:00Z',
    updatedAt: '2024-02-15T09:09:00Z'
  },
  {
    id: 'phil-11',
    mapId: '2',
    label: 'Бенедикт Спиноза',
    description: 'Пантеизм, монизм, этика',
    type: 'person',
    position: { x: 250, y: 550 },
    metadata: { confidence: 0.9, complexity: 'advanced', tags: ['новое время', 'рационализм'] },
    createdAt: '2024-02-15T09:10:00Z',
    updatedAt: '2024-02-15T09:10:00Z'
  },
  {
    id: 'phil-12',
    mapId: '2',
    label: 'Готфрид Лейбниц',
    description: 'Монадология, предустановленная гармония',
    type: 'person',
    position: { x: 400, y: 550 },
    metadata: { confidence: 0.85, complexity: 'advanced', tags: ['новое время', 'рационализм'] },
    createdAt: '2024-02-15T09:11:00Z',
    updatedAt: '2024-02-15T09:11:00Z'
  },
  {
    id: 'phil-13',
    mapId: '2',
    label: 'Джон Локк',
    description: 'Эмпиризм, tabula rasa, либерализм',
    type: 'person',
    position: { x: 550, y: 550 },
    metadata: { confidence: 0.9, complexity: 'intermediate', tags: ['новое время', 'эмпиризм'] },
    createdAt: '2024-02-15T09:12:00Z',
    updatedAt: '2024-02-15T09:12:00Z'
  },
  {
    id: 'phil-14',
    mapId: '2',
    label: 'Дэвид Юм',
    description: 'Скептицизм, критика причинности',
    type: 'person',
    position: { x: 700, y: 550 },
    metadata: { confidence: 0.85, complexity: 'advanced', tags: ['новое время', 'эмпиризм'] },
    createdAt: '2024-02-15T09:13:00Z',
    updatedAt: '2024-02-15T09:13:00Z'
  },
  {
    id: 'phil-15',
    mapId: '2',
    label: 'Иммануил Кант',
    description: 'Критическая философия, категорический императив',
    type: 'person',
    position: { x: 850, y: 550 },
    metadata: { confidence: 0.95, complexity: 'advanced', tags: ['новое время', 'критицизм'] },
    createdAt: '2024-02-15T09:14:00Z',
    updatedAt: '2024-02-15T09:14:00Z'
  },

  // Немецкий идеализм
  {
    id: 'phil-16',
    mapId: '2',
    label: 'Георг Гегель',
    description: 'Диалектика, абсолютный идеализм',
    type: 'person',
    position: { x: 100, y: 700 },
    metadata: { confidence: 0.9, complexity: 'advanced', tags: ['идеализм', 'диалектика'] },
    createdAt: '2024-02-15T09:15:00Z',
    updatedAt: '2024-02-15T09:15:00Z'
  },
  {
    id: 'phil-17',
    mapId: '2',
    label: 'Иоганн Фихте',
    description: 'Субъективный идеализм, теория Я',
    type: 'person',
    position: { x: 250, y: 700 },
    metadata: { confidence: 0.75, complexity: 'advanced', tags: ['идеализм'] },
    createdAt: '2024-02-15T09:16:00Z',
    updatedAt: '2024-02-15T09:16:00Z'
  },
  {
    id: 'phil-18',
    mapId: '2',
    label: 'Фридрих Шеллинг',
    description: 'Натурфилософия, философия тождества',
    type: 'person',
    position: { x: 400, y: 700 },
    metadata: { confidence: 0.7, complexity: 'advanced', tags: ['идеализм'] },
    createdAt: '2024-02-15T09:17:00Z',
    updatedAt: '2024-02-15T09:17:00Z'
  },

  // XIX век
  {
    id: 'phil-19',
    mapId: '2',
    label: 'Артур Шопенгауэр',
    description: 'Волюнтаризм, пессимизм, восточная философия',
    type: 'person',
    position: { x: 550, y: 700 },
    metadata: { confidence: 0.85, complexity: 'advanced', tags: ['иррационализм'] },
    createdAt: '2024-02-15T09:18:00Z',
    updatedAt: '2024-02-15T09:18:00Z'
  },
  {
    id: 'phil-20',
    mapId: '2',
    label: 'Сёрен Кьеркегор',
    description: 'Экзистенциализм, вера и абсурд',
    type: 'person',
    position: { x: 700, y: 700 },
    metadata: { confidence: 0.85, complexity: 'advanced', tags: ['экзистенциализм'] },
    createdAt: '2024-02-15T09:19:00Z',
    updatedAt: '2024-02-15T09:19:00Z'
  },
  {
    id: 'phil-21',
    mapId: '2',
    label: 'Карл Маркс',
    description: 'Исторический материализм, критика капитализма',
    type: 'person',
    position: { x: 850, y: 700 },
    metadata: {
      confidence: 0.9,
      complexity: 'advanced',
      tags: ['материализм', 'политическая философия']
    },
    createdAt: '2024-02-15T09:20:00Z',
    updatedAt: '2024-02-15T09:20:00Z'
  },
  {
    id: 'phil-22',
    mapId: '2',
    label: 'Фридрих Ницше',
    description: 'Воля к власти, сверхчеловек, нигилизм',
    type: 'person',
    position: { x: 1000, y: 700 },
    metadata: { confidence: 0.9, complexity: 'advanced', tags: ['иррационализм', 'нигилизм'] },
    createdAt: '2024-02-15T09:21:00Z',
    updatedAt: '2024-02-15T09:21:00Z'
  },

  // XX век - Экзистенциализм
  {
    id: 'phil-23',
    mapId: '2',
    label: 'Мартин Хайдеггер',
    description: 'Фундаментальная онтология, бытие и время',
    type: 'person',
    position: { x: 100, y: 850 },
    metadata: {
      confidence: 0.85,
      complexity: 'advanced',
      tags: ['экзистенциализм', 'феноменология']
    },
    createdAt: '2024-02-15T09:22:00Z',
    updatedAt: '2024-02-15T09:22:00Z'
  },
  {
    id: 'phil-24',
    mapId: '2',
    label: 'Жан-Поль Сартр',
    description: 'Атеистический экзистенциализм, свобода',
    type: 'person',
    position: { x: 250, y: 850 },
    metadata: { confidence: 0.9, complexity: 'advanced', tags: ['экзистенциализм'] },
    createdAt: '2024-02-15T09:23:00Z',
    updatedAt: '2024-02-15T09:23:00Z'
  },
  {
    id: 'phil-25',
    mapId: '2',
    label: 'Альбер Камю',
    description: 'Абсурдизм, бунт против абсурда',
    type: 'person',
    position: { x: 400, y: 850 },
    metadata: {
      confidence: 0.85,
      complexity: 'intermediate',
      tags: ['экзистенциализм', 'абсурдизм']
    },
    createdAt: '2024-02-15T09:24:00Z',
    updatedAt: '2024-02-15T09:24:00Z'
  },

  // XX век - Аналитическая философия
  {
    id: 'phil-26',
    mapId: '2',
    label: 'Людвиг Витгенштейн',
    description: 'Логико-философский трактат, языковые игры',
    type: 'person',
    position: { x: 550, y: 850 },
    metadata: {
      confidence: 0.9,
      complexity: 'advanced',
      tags: ['аналитическая философия', 'логика']
    },
    createdAt: '2024-02-15T09:25:00Z',
    updatedAt: '2024-02-15T09:25:00Z'
  },
  {
    id: 'phil-27',
    mapId: '2',
    label: 'Бертран Рассел',
    description: 'Логический атомизм, теория типов',
    type: 'person',
    position: { x: 700, y: 850 },
    metadata: {
      confidence: 0.85,
      complexity: 'advanced',
      tags: ['аналитическая философия', 'логика']
    },
    createdAt: '2024-02-15T09:26:00Z',
    updatedAt: '2024-02-15T09:26:00Z'
  },
  {
    id: 'phil-28',
    mapId: '2',
    label: 'Карл Поппер',
    description: 'Критический рационализм, фальсификационизм',
    type: 'person',
    position: { x: 850, y: 850 },
    metadata: { confidence: 0.85, complexity: 'advanced', tags: ['философия науки'] },
    createdAt: '2024-02-15T09:27:00Z',
    updatedAt: '2024-02-15T09:27:00Z'
  },

  // Философские школы и концепции
  {
    id: 'phil-29',
    mapId: '2',
    label: 'Рационализм',
    description: 'Приоритет разума как источника знания',
    type: 'school',
    position: { x: 1000, y: 400 },
    metadata: { confidence: 0.9, complexity: 'intermediate', tags: ['эпистемология'] },
    createdAt: '2024-02-15T09:28:00Z',
    updatedAt: '2024-02-15T09:28:00Z'
  },
  {
    id: 'phil-30',
    mapId: '2',
    label: 'Эмпиризм',
    description: 'Опыт как основа познания',
    type: 'school',
    position: { x: 1150, y: 400 },
    metadata: { confidence: 0.9, complexity: 'intermediate', tags: ['эпистемология'] },
    createdAt: '2024-02-15T09:29:00Z',
    updatedAt: '2024-02-15T09:29:00Z'
  },
  {
    id: 'phil-31',
    mapId: '2',
    label: 'Экзистенциализм',
    description: 'Существование предшествует сущности',
    type: 'school',
    position: { x: 1000, y: 850 },
    metadata: { confidence: 0.9, complexity: 'intermediate', tags: ['XX век'] },
    createdAt: '2024-02-15T09:30:00Z',
    updatedAt: '2024-02-15T09:30:00Z'
  },
  {
    id: 'phil-32',
    mapId: '2',
    label: 'Феноменология',
    description: 'Изучение структуры сознания и опыта',
    type: 'school',
    position: { x: 1150, y: 850 },
    metadata: { confidence: 0.85, complexity: 'advanced', tags: ['XX век'] },
    createdAt: '2024-02-15T09:31:00Z',
    updatedAt: '2024-02-15T09:31:00Z'
  },
  {
    id: 'phil-33',
    mapId: '2',
    label: 'Эдмунд Гуссерль',
    description: 'Основатель феноменологии',
    type: 'person',
    position: { x: 1300, y: 850 },
    metadata: { confidence: 0.8, complexity: 'advanced', tags: ['феноменология'] },
    createdAt: '2024-02-15T09:32:00Z',
    updatedAt: '2024-02-15T09:32:00Z'
  },

  // Постмодернизм и современность
  {
    id: 'phil-34',
    mapId: '2',
    label: 'Мишель Фуко',
    description: 'Археология знания, власть/знание',
    type: 'person',
    position: { x: 100, y: 1000 },
    metadata: { confidence: 0.85, complexity: 'advanced', tags: ['постмодернизм', 'власть'] },
    createdAt: '2024-02-15T09:33:00Z',
    updatedAt: '2024-02-15T09:33:00Z'
  },
  {
    id: 'phil-35',
    mapId: '2',
    label: 'Жак Деррида',
    description: 'Деконструкция, différance',
    type: 'person',
    position: { x: 250, y: 1000 },
    metadata: { confidence: 0.8, complexity: 'advanced', tags: ['постмодернизм'] },
    createdAt: '2024-02-15T09:34:00Z',
    updatedAt: '2024-02-15T09:34:00Z'
  },
  {
    id: 'phil-36',
    mapId: '2',
    label: 'Жиль Делёз',
    description: 'Философия различия, ризома',
    type: 'person',
    position: { x: 400, y: 1000 },
    metadata: { confidence: 0.75, complexity: 'advanced', tags: ['постмодернизм'] },
    createdAt: '2024-02-15T09:35:00Z',
    updatedAt: '2024-02-15T09:35:00Z'
  },
  {
    id: 'phil-37',
    mapId: '2',
    label: 'Жан Бодрийяр',
    description: 'Симулякры и симуляция, гиперреальность',
    type: 'person',
    position: { x: 550, y: 1000 },
    metadata: { confidence: 0.75, complexity: 'advanced', tags: ['постмодернизм'] },
    createdAt: '2024-02-15T09:36:00Z',
    updatedAt: '2024-02-15T09:36:00Z'
  },

  // Прагматизм
  {
    id: 'phil-38',
    mapId: '2',
    label: 'Уильям Джеймс',
    description: 'Прагматизм, поток сознания',
    type: 'person',
    position: { x: 700, y: 1000 },
    metadata: { confidence: 0.8, complexity: 'intermediate', tags: ['прагматизм'] },
    createdAt: '2024-02-15T09:37:00Z',
    updatedAt: '2024-02-15T09:37:00Z'
  },
  {
    id: 'phil-39',
    mapId: '2',
    label: 'Джон Дьюи',
    description: 'Инструментализм, прогрессивное образование',
    type: 'person',
    position: { x: 850, y: 1000 },
    metadata: { confidence: 0.75, complexity: 'intermediate', tags: ['прагматизм'] },
    createdAt: '2024-02-15T09:38:00Z',
    updatedAt: '2024-02-15T09:38:00Z'
  },

  // Ключевые концепции
  {
    id: 'phil-40',
    mapId: '2',
    label: 'Теория идей',
    description: 'Мир идей Платона как истинная реальность',
    type: 'concept',
    position: { x: 1000, y: 100 },
    metadata: { confidence: 0.9, complexity: 'intermediate', tags: ['метафизика'] },
    createdAt: '2024-02-15T09:39:00Z',
    updatedAt: '2024-02-15T09:39:00Z'
  },
  {
    id: 'phil-41',
    mapId: '2',
    label: 'Категорический императив',
    description: 'Моральный закон Канта',
    type: 'concept',
    position: { x: 1000, y: 550 },
    metadata: { confidence: 0.9, complexity: 'intermediate', tags: ['этика'] },
    createdAt: '2024-02-15T09:40:00Z',
    updatedAt: '2024-02-15T09:40:00Z'
  },
  {
    id: 'phil-42',
    mapId: '2',
    label: 'Диалектика',
    description: 'Метод познания через противоречия',
    type: 'concept',
    position: { x: 1150, y: 700 },
    metadata: { confidence: 0.85, complexity: 'advanced', tags: ['метод'] },
    createdAt: '2024-02-15T09:41:00Z',
    updatedAt: '2024-02-15T09:41:00Z'
  },
  {
    id: 'phil-43',
    mapId: '2',
    label: 'Воля к власти',
    description: 'Центральная концепция Ницше',
    type: 'concept',
    position: { x: 1150, y: 700 },
    metadata: { confidence: 0.85, complexity: 'intermediate', tags: ['психология'] },
    createdAt: '2024-02-15T09:42:00Z',
    updatedAt: '2024-02-15T09:42:00Z'
  },
  {
    id: 'phil-44',
    mapId: '2',
    label: 'Абсурд',
    description: 'Столкновение человека с бессмысленностью мира',
    type: 'concept',
    position: { x: 550, y: 850 },
    metadata: { confidence: 0.8, complexity: 'intermediate', tags: ['экзистенциализм'] },
    createdAt: '2024-02-15T09:43:00Z',
    updatedAt: '2024-02-15T09:43:00Z'
  },

  // Дополнительные философы
  {
    id: 'phil-45',
    mapId: '2',
    label: 'Томас Гоббс',
    description: 'Социальный контракт, Левиафан',
    type: 'person',
    position: { x: 1000, y: 250 },
    metadata: { confidence: 0.8, complexity: 'intermediate', tags: ['политическая философия'] },
    createdAt: '2024-02-15T09:44:00Z',
    updatedAt: '2024-02-15T09:44:00Z'
  },
  {
    id: 'phil-46',
    mapId: '2',
    label: 'Жан-Жак Руссо',
    description: 'Общественный договор, естественное состояние',
    type: 'person',
    position: { x: 1150, y: 250 },
    metadata: { confidence: 0.85, complexity: 'intermediate', tags: ['политическая философия'] },
    createdAt: '2024-02-15T09:45:00Z',
    updatedAt: '2024-02-15T09:45:00Z'
  },
  {
    id: 'phil-47',
    mapId: '2',
    label: 'Джордж Беркли',
    description: 'Субъективный идеализм, esse est percipi',
    type: 'person',
    position: { x: 1300, y: 550 },
    metadata: { confidence: 0.75, complexity: 'advanced', tags: ['идеализм'] },
    createdAt: '2024-02-15T09:46:00Z',
    updatedAt: '2024-02-15T09:46:00Z'
  },
  {
    id: 'phil-48',
    mapId: '2',
    label: 'Иеремия Бентам',
    description: 'Утилитаризм, принцип наибольшего счастья',
    type: 'person',
    position: { x: 1300, y: 400 },
    metadata: { confidence: 0.8, complexity: 'intermediate', tags: ['этика'] },
    createdAt: '2024-02-15T09:47:00Z',
    updatedAt: '2024-02-15T09:47:00Z'
  },
  {
    id: 'phil-49',
    mapId: '2',
    label: 'Джон Стюарт Милль',
    description: 'Утилитаризм, либерализм, феминизм',
    type: 'person',
    position: { x: 1300, y: 500 },
    metadata: { confidence: 0.8, complexity: 'intermediate', tags: ['этика', 'политика'] },
    createdAt: '2024-02-15T09:48:00Z',
    updatedAt: '2024-02-15T09:48:00Z'
  },
  {
    id: 'phil-50',
    mapId: '2',
    label: 'Симона де Бовуар',
    description: 'Феминистская философия, экзистенциализм',
    type: 'person',
    position: { x: 1300, y: 850 },
    metadata: {
      confidence: 0.8,
      complexity: 'intermediate',
      tags: ['феминизм', 'экзистенциализм']
    },
    createdAt: '2024-02-15T09:49:00Z',
    updatedAt: '2024-02-15T09:49:00Z'
  },
  {
    id: 'phil-51',
    mapId: '2',
    label: 'Фрэнсис Бэкон',
    description: 'Эмпирический метод, идолы познания',
    type: 'person',
    position: { x: 1300, y: 300 },
    metadata: { confidence: 0.8, complexity: 'intermediate', tags: ['эмпиризм', 'метод'] },
    createdAt: '2024-02-15T09:50:00Z',
    updatedAt: '2024-02-15T09:50:00Z'
  },
  {
    id: 'phil-52',
    mapId: '2',
    label: 'Блез Паскаль',
    description: 'Пари Паскаля, сердце и разум',
    type: 'person',
    position: { x: 1300, y: 200 },
    metadata: { confidence: 0.75, complexity: 'intermediate', tags: ['теология', 'математика'] },
    createdAt: '2024-02-15T09:51:00Z',
    updatedAt: '2024-02-15T09:51:00Z'
  },
  {
    id: 'phil-53',
    mapId: '2',
    label: 'Анри Бергсон',
    description: 'Философия жизни, élan vital, интуиция',
    type: 'person',
    position: { x: 1300, y: 700 },
    metadata: { confidence: 0.75, complexity: 'advanced', tags: ['витализм'] },
    createdAt: '2024-02-15T09:52:00Z',
    updatedAt: '2024-02-15T09:52:00Z'
  }
]

// Combined exports
export const ALL_NODES: Node[] = [..._nnNodes, ..._philNodes, ..._gtNodes]
