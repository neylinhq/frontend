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
    nodesCount: 53,
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

// Mock узлы для карты "История философии" (mapId: '2')
const PHILOSOPHY_NODES: Node[] = [
  // Античная философия
  { id: 'phil-1', mapId: '2', label: 'Сократ', description: 'Основатель западной философии, метод майевтики', type: 'person', position: { x: 100, y: 100 }, metadata: { confidence: 0.95, complexity: 'basic', tags: ['античность', 'этика'] }, createdAt: '2024-02-15T09:00:00Z', updatedAt: '2024-02-15T09:00:00Z' },
  { id: 'phil-2', mapId: '2', label: 'Платон', description: 'Теория идей, основал Академию', type: 'person', position: { x: 250, y: 100 }, metadata: { confidence: 0.95, complexity: 'intermediate', tags: ['античность', 'идеализм'] }, createdAt: '2024-02-15T09:01:00Z', updatedAt: '2024-02-15T09:01:00Z' },
  { id: 'phil-3', mapId: '2', label: 'Аристотель', description: 'Систематизатор знаний, основатель логики', type: 'person', position: { x: 400, y: 100 }, metadata: { confidence: 0.95, complexity: 'advanced', tags: ['античность', 'логика'] }, createdAt: '2024-02-15T09:02:00Z', updatedAt: '2024-02-15T09:02:00Z' },
  { id: 'phil-4', mapId: '2', label: 'Эпикур', description: 'Философия удовольствия и атомизм', type: 'person', position: { x: 100, y: 250 }, metadata: { confidence: 0.85, complexity: 'intermediate', tags: ['античность', 'этика', 'материализм'] }, createdAt: '2024-02-15T09:03:00Z', updatedAt: '2024-02-15T09:03:00Z' },
  { id: 'phil-5', mapId: '2', label: 'Стоицизм', description: 'Школа философии: добродетель, апатия, судьба', type: 'school', position: { x: 250, y: 250 }, metadata: { confidence: 0.9, complexity: 'intermediate', tags: ['античность', 'этика'] }, createdAt: '2024-02-15T09:04:00Z', updatedAt: '2024-02-15T09:04:00Z' },
  { id: 'phil-6', mapId: '2', label: 'Сенека', description: 'Римский стоик, нравственная философия', type: 'person', position: { x: 400, y: 250 }, metadata: { confidence: 0.8, complexity: 'intermediate', tags: ['античность', 'стоицизм'] }, createdAt: '2024-02-15T09:05:00Z', updatedAt: '2024-02-15T09:05:00Z' },
  { id: 'phil-7', mapId: '2', label: 'Марк Аврелий', description: 'Римский император-философ, "Размышления"', type: 'person', position: { x: 550, y: 250 }, metadata: { confidence: 0.85, complexity: 'intermediate', tags: ['античность', 'стоицизм'] }, createdAt: '2024-02-15T09:06:00Z', updatedAt: '2024-02-15T09:06:00Z' },

  // Средневековая философия
  { id: 'phil-8', mapId: '2', label: 'Августин Блаженный', description: 'Отец церковной доктрины, неоплатонизм', type: 'person', position: { x: 100, y: 400 }, metadata: { confidence: 0.9, complexity: 'advanced', tags: ['средневековье', 'теология'] }, createdAt: '2024-02-15T09:07:00Z', updatedAt: '2024-02-15T09:07:00Z' },
  { id: 'phil-9', mapId: '2', label: 'Фома Аквинский', description: 'Схоластика, синтез Аристотеля и христианства', type: 'person', position: { x: 250, y: 400 }, metadata: { confidence: 0.9, complexity: 'advanced', tags: ['средневековье', 'схоластика'] }, createdAt: '2024-02-15T09:08:00Z', updatedAt: '2024-02-15T09:08:00Z' },

  // Философия Нового времени
  { id: 'phil-10', mapId: '2', label: 'Рене Декарт', description: 'Рационализм, "Cogito ergo sum", дуализм', type: 'person', position: { x: 100, y: 550 }, metadata: { confidence: 0.95, complexity: 'advanced', tags: ['новое время', 'рационализм'] }, createdAt: '2024-02-15T09:09:00Z', updatedAt: '2024-02-15T09:09:00Z' },
  { id: 'phil-11', mapId: '2', label: 'Бенедикт Спиноза', description: 'Пантеизм, монизм, этика', type: 'person', position: { x: 250, y: 550 }, metadata: { confidence: 0.9, complexity: 'advanced', tags: ['новое время', 'рационализм'] }, createdAt: '2024-02-15T09:10:00Z', updatedAt: '2024-02-15T09:10:00Z' },
  { id: 'phil-12', mapId: '2', label: 'Готфрид Лейбниц', description: 'Монадология, предустановленная гармония', type: 'person', position: { x: 400, y: 550 }, metadata: { confidence: 0.85, complexity: 'advanced', tags: ['новое время', 'рационализм'] }, createdAt: '2024-02-15T09:11:00Z', updatedAt: '2024-02-15T09:11:00Z' },
  { id: 'phil-13', mapId: '2', label: 'Джон Локк', description: 'Эмпиризм, tabula rasa, либерализм', type: 'person', position: { x: 550, y: 550 }, metadata: { confidence: 0.9, complexity: 'intermediate', tags: ['новое время', 'эмпиризм'] }, createdAt: '2024-02-15T09:12:00Z', updatedAt: '2024-02-15T09:12:00Z' },
  { id: 'phil-14', mapId: '2', label: 'Дэвид Юм', description: 'Скептицизм, критика причинности', type: 'person', position: { x: 700, y: 550 }, metadata: { confidence: 0.85, complexity: 'advanced', tags: ['новое время', 'эмпиризм'] }, createdAt: '2024-02-15T09:13:00Z', updatedAt: '2024-02-15T09:13:00Z' },
  { id: 'phil-15', mapId: '2', label: 'Иммануил Кант', description: 'Критическая философия, категорический императив', type: 'person', position: { x: 850, y: 550 }, metadata: { confidence: 0.95, complexity: 'advanced', tags: ['новое время', 'критицизм'] }, createdAt: '2024-02-15T09:14:00Z', updatedAt: '2024-02-15T09:14:00Z' },

  // Немецкий идеализм
  { id: 'phil-16', mapId: '2', label: 'Георг Гегель', description: 'Диалектика, абсолютный идеализм', type: 'person', position: { x: 100, y: 700 }, metadata: { confidence: 0.9, complexity: 'advanced', tags: ['идеализм', 'диалектика'] }, createdAt: '2024-02-15T09:15:00Z', updatedAt: '2024-02-15T09:15:00Z' },
  { id: 'phil-17', mapId: '2', label: 'Иоганн Фихте', description: 'Субъективный идеализм, теория Я', type: 'person', position: { x: 250, y: 700 }, metadata: { confidence: 0.75, complexity: 'advanced', tags: ['идеализм'] }, createdAt: '2024-02-15T09:16:00Z', updatedAt: '2024-02-15T09:16:00Z' },
  { id: 'phil-18', mapId: '2', label: 'Фридрих Шеллинг', description: 'Натурфилософия, философия тождества', type: 'person', position: { x: 400, y: 700 }, metadata: { confidence: 0.7, complexity: 'advanced', tags: ['идеализм'] }, createdAt: '2024-02-15T09:17:00Z', updatedAt: '2024-02-15T09:17:00Z' },

  // XIX век
  { id: 'phil-19', mapId: '2', label: 'Артур Шопенгауэр', description: 'Волюнтаризм, пессимизм, восточная философия', type: 'person', position: { x: 550, y: 700 }, metadata: { confidence: 0.85, complexity: 'advanced', tags: ['иррационализм'] }, createdAt: '2024-02-15T09:18:00Z', updatedAt: '2024-02-15T09:18:00Z' },
  { id: 'phil-20', mapId: '2', label: 'Сёрен Кьеркегор', description: 'Экзистенциализм, вера и абсурд', type: 'person', position: { x: 700, y: 700 }, metadata: { confidence: 0.85, complexity: 'advanced', tags: ['экзистенциализм'] }, createdAt: '2024-02-15T09:19:00Z', updatedAt: '2024-02-15T09:19:00Z' },
  { id: 'phil-21', mapId: '2', label: 'Карл Маркс', description: 'Исторический материализм, критика капитализма', type: 'person', position: { x: 850, y: 700 }, metadata: { confidence: 0.9, complexity: 'advanced', tags: ['материализм', 'политическая философия'] }, createdAt: '2024-02-15T09:20:00Z', updatedAt: '2024-02-15T09:20:00Z' },
  { id: 'phil-22', mapId: '2', label: 'Фридрих Ницше', description: 'Воля к власти, сверхчеловек, нигилизм', type: 'person', position: { x: 1000, y: 700 }, metadata: { confidence: 0.9, complexity: 'advanced', tags: ['иррационализм', 'нигилизм'] }, createdAt: '2024-02-15T09:21:00Z', updatedAt: '2024-02-15T09:21:00Z' },

  // XX век - Экзистенциализм
  { id: 'phil-23', mapId: '2', label: 'Мартин Хайдеггер', description: 'Фундаментальная онтология, бытие и время', type: 'person', position: { x: 100, y: 850 }, metadata: { confidence: 0.85, complexity: 'advanced', tags: ['экзистенциализм', 'феноменология'] }, createdAt: '2024-02-15T09:22:00Z', updatedAt: '2024-02-15T09:22:00Z' },
  { id: 'phil-24', mapId: '2', label: 'Жан-Поль Сартр', description: 'Атеистический экзистенциализм, свобода', type: 'person', position: { x: 250, y: 850 }, metadata: { confidence: 0.9, complexity: 'advanced', tags: ['экзистенциализм'] }, createdAt: '2024-02-15T09:23:00Z', updatedAt: '2024-02-15T09:23:00Z' },
  { id: 'phil-25', mapId: '2', label: 'Альбер Камю', description: 'Абсурдизм, бунт против абсурда', type: 'person', position: { x: 400, y: 850 }, metadata: { confidence: 0.85, complexity: 'intermediate', tags: ['экзистенциализм', 'абсурдизм'] }, createdAt: '2024-02-15T09:24:00Z', updatedAt: '2024-02-15T09:24:00Z' },

  // XX век - Аналитическая философия
  { id: 'phil-26', mapId: '2', label: 'Людвиг Витгенштейн', description: 'Логико-философский трактат, языковые игры', type: 'person', position: { x: 550, y: 850 }, metadata: { confidence: 0.9, complexity: 'advanced', tags: ['аналитическая философия', 'логика'] }, createdAt: '2024-02-15T09:25:00Z', updatedAt: '2024-02-15T09:25:00Z' },
  { id: 'phil-27', mapId: '2', label: 'Бертран Рассел', description: 'Логический атомизм, теория типов', type: 'person', position: { x: 700, y: 850 }, metadata: { confidence: 0.85, complexity: 'advanced', tags: ['аналитическая философия', 'логика'] }, createdAt: '2024-02-15T09:26:00Z', updatedAt: '2024-02-15T09:26:00Z' },
  { id: 'phil-28', mapId: '2', label: 'Карл Поппер', description: 'Критический рационализм, фальсификационизм', type: 'person', position: { x: 850, y: 850 }, metadata: { confidence: 0.85, complexity: 'advanced', tags: ['философия науки'] }, createdAt: '2024-02-15T09:27:00Z', updatedAt: '2024-02-15T09:27:00Z' },

  // Философские школы и концепции
  { id: 'phil-29', mapId: '2', label: 'Рационализм', description: 'Приоритет разума как источника знания', type: 'school', position: { x: 1000, y: 400 }, metadata: { confidence: 0.9, complexity: 'intermediate', tags: ['эпистемология'] }, createdAt: '2024-02-15T09:28:00Z', updatedAt: '2024-02-15T09:28:00Z' },
  { id: 'phil-30', mapId: '2', label: 'Эмпиризм', description: 'Опыт как основа познания', type: 'school', position: { x: 1150, y: 400 }, metadata: { confidence: 0.9, complexity: 'intermediate', tags: ['эпистемология'] }, createdAt: '2024-02-15T09:29:00Z', updatedAt: '2024-02-15T09:29:00Z' },
  { id: 'phil-31', mapId: '2', label: 'Экзистенциализм', description: 'Существование предшествует сущности', type: 'school', position: { x: 1000, y: 850 }, metadata: { confidence: 0.9, complexity: 'intermediate', tags: ['XX век'] }, createdAt: '2024-02-15T09:30:00Z', updatedAt: '2024-02-15T09:30:00Z' },
  { id: 'phil-32', mapId: '2', label: 'Феноменология', description: 'Изучение структуры сознания и опыта', type: 'school', position: { x: 1150, y: 850 }, metadata: { confidence: 0.85, complexity: 'advanced', tags: ['XX век'] }, createdAt: '2024-02-15T09:31:00Z', updatedAt: '2024-02-15T09:31:00Z' },
  { id: 'phil-33', mapId: '2', label: 'Эдмунд Гуссерль', description: 'Основатель феноменологии', type: 'person', position: { x: 1300, y: 850 }, metadata: { confidence: 0.8, complexity: 'advanced', tags: ['феноменология'] }, createdAt: '2024-02-15T09:32:00Z', updatedAt: '2024-02-15T09:32:00Z' },

  // Постмодернизм и современность
  { id: 'phil-34', mapId: '2', label: 'Мишель Фуко', description: 'Археология знания, власть/знание', type: 'person', position: { x: 100, y: 1000 }, metadata: { confidence: 0.85, complexity: 'advanced', tags: ['постмодернизм', 'власть'] }, createdAt: '2024-02-15T09:33:00Z', updatedAt: '2024-02-15T09:33:00Z' },
  { id: 'phil-35', mapId: '2', label: 'Жак Деррида', description: 'Деконструкция, différance', type: 'person', position: { x: 250, y: 1000 }, metadata: { confidence: 0.8, complexity: 'advanced', tags: ['постмодернизм'] }, createdAt: '2024-02-15T09:34:00Z', updatedAt: '2024-02-15T09:34:00Z' },
  { id: 'phil-36', mapId: '2', label: 'Жиль Делёз', description: 'Философия различия, ризома', type: 'person', position: { x: 400, y: 1000 }, metadata: { confidence: 0.75, complexity: 'advanced', tags: ['постмодернизм'] }, createdAt: '2024-02-15T09:35:00Z', updatedAt: '2024-02-15T09:35:00Z' },
  { id: 'phil-37', mapId: '2', label: 'Жан Бодрийяр', description: 'Симулякры и симуляция, гиперреальность', type: 'person', position: { x: 550, y: 1000 }, metadata: { confidence: 0.75, complexity: 'advanced', tags: ['постмодернизм'] }, createdAt: '2024-02-15T09:36:00Z', updatedAt: '2024-02-15T09:36:00Z' },

  // Прагматизм
  { id: 'phil-38', mapId: '2', label: 'Уильям Джеймс', description: 'Прагматизм, поток сознания', type: 'person', position: { x: 700, y: 1000 }, metadata: { confidence: 0.8, complexity: 'intermediate', tags: ['прагматизм'] }, createdAt: '2024-02-15T09:37:00Z', updatedAt: '2024-02-15T09:37:00Z' },
  { id: 'phil-39', mapId: '2', label: 'Джон Дьюи', description: 'Инструментализм, прогрессивное образование', type: 'person', position: { x: 850, y: 1000 }, metadata: { confidence: 0.75, complexity: 'intermediate', tags: ['прагматизм'] }, createdAt: '2024-02-15T09:38:00Z', updatedAt: '2024-02-15T09:38:00Z' },

  // Ключевые концепции
  { id: 'phil-40', mapId: '2', label: 'Теория идей', description: 'Мир идей Платона как истинная реальность', type: 'concept', position: { x: 1000, y: 100 }, metadata: { confidence: 0.9, complexity: 'intermediate', tags: ['метафизика'] }, createdAt: '2024-02-15T09:39:00Z', updatedAt: '2024-02-15T09:39:00Z' },
  { id: 'phil-41', mapId: '2', label: 'Категорический императив', description: 'Моральный закон Канта', type: 'concept', position: { x: 1000, y: 550 }, metadata: { confidence: 0.9, complexity: 'intermediate', tags: ['этика'] }, createdAt: '2024-02-15T09:40:00Z', updatedAt: '2024-02-15T09:40:00Z' },
  { id: 'phil-42', mapId: '2', label: 'Диалектика', description: 'Метод познания через противоречия', type: 'concept', position: { x: 1150, y: 700 }, metadata: { confidence: 0.85, complexity: 'advanced', tags: ['метод'] }, createdAt: '2024-02-15T09:41:00Z', updatedAt: '2024-02-15T09:41:00Z' },
  { id: 'phil-43', mapId: '2', label: 'Воля к власти', description: 'Центральная концепция Ницше', type: 'concept', position: { x: 1150, y: 700 }, metadata: { confidence: 0.85, complexity: 'intermediate', tags: ['психология'] }, createdAt: '2024-02-15T09:42:00Z', updatedAt: '2024-02-15T09:42:00Z' },
  { id: 'phil-44', mapId: '2', label: 'Абсурд', description: 'Столкновение человека с бессмысленностью мира', type: 'concept', position: { x: 550, y: 850 }, metadata: { confidence: 0.8, complexity: 'intermediate', tags: ['экзистенциализм'] }, createdAt: '2024-02-15T09:43:00Z', updatedAt: '2024-02-15T09:43:00Z' },

  // Дополнительные философы
  { id: 'phil-45', mapId: '2', label: 'Томас Гоббс', description: 'Социальный контракт, Левиафан', type: 'person', position: { x: 1000, y: 250 }, metadata: { confidence: 0.8, complexity: 'intermediate', tags: ['политическая философия'] }, createdAt: '2024-02-15T09:44:00Z', updatedAt: '2024-02-15T09:44:00Z' },
  { id: 'phil-46', mapId: '2', label: 'Жан-Жак Руссо', description: 'Общественный договор, естественное состояние', type: 'person', position: { x: 1150, y: 250 }, metadata: { confidence: 0.85, complexity: 'intermediate', tags: ['политическая философия'] }, createdAt: '2024-02-15T09:45:00Z', updatedAt: '2024-02-15T09:45:00Z' },
  { id: 'phil-47', mapId: '2', label: 'Джордж Беркли', description: 'Субъективный идеализм, esse est percipi', type: 'person', position: { x: 1300, y: 550 }, metadata: { confidence: 0.75, complexity: 'advanced', tags: ['идеализм'] }, createdAt: '2024-02-15T09:46:00Z', updatedAt: '2024-02-15T09:46:00Z' },
  { id: 'phil-48', mapId: '2', label: 'Иеремия Бентам', description: 'Утилитаризм, принцип наибольшего счастья', type: 'person', position: { x: 1300, y: 400 }, metadata: { confidence: 0.8, complexity: 'intermediate', tags: ['этика'] }, createdAt: '2024-02-15T09:47:00Z', updatedAt: '2024-02-15T09:47:00Z' },
  { id: 'phil-49', mapId: '2', label: 'Джон Стюарт Милль', description: 'Утилитаризм, либерализм, феминизм', type: 'person', position: { x: 1300, y: 500 }, metadata: { confidence: 0.8, complexity: 'intermediate', tags: ['этика', 'политика'] }, createdAt: '2024-02-15T09:48:00Z', updatedAt: '2024-02-15T09:48:00Z' },
  { id: 'phil-50', mapId: '2', label: 'Симона де Бовуар', description: 'Феминистская философия, экзистенциализм', type: 'person', position: { x: 1300, y: 850 }, metadata: { confidence: 0.8, complexity: 'intermediate', tags: ['феминизм', 'экзистенциализм'] }, createdAt: '2024-02-15T09:49:00Z', updatedAt: '2024-02-15T09:49:00Z' },
  { id: 'phil-51', mapId: '2', label: 'Фрэнсис Бэкон', description: 'Эмпирический метод, идолы познания', type: 'person', position: { x: 1300, y: 300 }, metadata: { confidence: 0.8, complexity: 'intermediate', tags: ['эмпиризм', 'метод'] }, createdAt: '2024-02-15T09:50:00Z', updatedAt: '2024-02-15T09:50:00Z' },
  { id: 'phil-52', mapId: '2', label: 'Блез Паскаль', description: 'Пари Паскаля, сердце и разум', type: 'person', position: { x: 1300, y: 200 }, metadata: { confidence: 0.75, complexity: 'intermediate', tags: ['теология', 'математика'] }, createdAt: '2024-02-15T09:51:00Z', updatedAt: '2024-02-15T09:51:00Z' },
  { id: 'phil-53', mapId: '2', label: 'Анри Бергсон', description: 'Философия жизни, élan vital, интуиция', type: 'person', position: { x: 1300, y: 700 }, metadata: { confidence: 0.75, complexity: 'advanced', tags: ['витализм'] }, createdAt: '2024-02-15T09:52:00Z', updatedAt: '2024-02-15T09:52:00Z' },
]

// Добавляем философские узлы к общему массиву
MOCK_NODES.push(...PHILOSOPHY_NODES)

// Mock связи для философии (mapId: '2')
const PHILOSOPHY_EDGES: Edge[] = [
  // Античная философия
  { id: 'phil-edge-1', mapId: '2', sourceNodeId: 'phil-2', targetNodeId: 'phil-1', relationType: 'influences', label: 'ученик', strength: 0.95, bidirectional: false, metadata: { confidence: 0.95, createdBy: 'user' }, createdAt: '2024-02-15T10:00:00Z', updatedAt: '2024-02-15T10:00:00Z' },
  { id: 'phil-edge-2', mapId: '2', sourceNodeId: 'phil-3', targetNodeId: 'phil-2', relationType: 'influences', label: 'ученик', strength: 0.95, bidirectional: false, metadata: { confidence: 0.95, createdBy: 'user' }, createdAt: '2024-02-15T10:01:00Z', updatedAt: '2024-02-15T10:01:00Z' },
  { id: 'phil-edge-3', mapId: '2', sourceNodeId: 'phil-2', targetNodeId: 'phil-40', relationType: 'explains', label: 'развивает', strength: 0.9, bidirectional: false, metadata: { confidence: 0.9, createdBy: 'user' }, createdAt: '2024-02-15T10:02:00Z', updatedAt: '2024-02-15T10:02:00Z' },
  { id: 'phil-edge-4', mapId: '2', sourceNodeId: 'phil-6', targetNodeId: 'phil-5', relationType: 'part-of', label: 'представитель', strength: 0.85, bidirectional: false, metadata: { confidence: 0.9, createdBy: 'user' }, createdAt: '2024-02-15T10:03:00Z', updatedAt: '2024-02-15T10:03:00Z' },
  { id: 'phil-edge-5', mapId: '2', sourceNodeId: 'phil-7', targetNodeId: 'phil-5', relationType: 'part-of', label: 'представитель', strength: 0.9, bidirectional: false, metadata: { confidence: 0.95, createdBy: 'user' }, createdAt: '2024-02-15T10:04:00Z', updatedAt: '2024-02-15T10:04:00Z' },

  // Средневековье и влияние античности
  { id: 'phil-edge-6', mapId: '2', sourceNodeId: 'phil-8', targetNodeId: 'phil-2', relationType: 'influences', label: 'вдохновлен', strength: 0.8, bidirectional: false, metadata: { confidence: 0.85, createdBy: 'user' }, createdAt: '2024-02-15T10:05:00Z', updatedAt: '2024-02-15T10:05:00Z' },
  { id: 'phil-edge-7', mapId: '2', sourceNodeId: 'phil-9', targetNodeId: 'phil-3', relationType: 'influences', label: 'синтезирует с христианством', strength: 0.85, bidirectional: false, metadata: { confidence: 0.9, createdBy: 'user' }, createdAt: '2024-02-15T10:06:00Z', updatedAt: '2024-02-15T10:06:00Z' },

  // Новое время - рационалисты
  { id: 'phil-edge-8', mapId: '2', sourceNodeId: 'phil-10', targetNodeId: 'phil-29', relationType: 'part-of', label: 'основатель', strength: 0.95, bidirectional: false, metadata: { confidence: 0.95, createdBy: 'user' }, createdAt: '2024-02-15T10:07:00Z', updatedAt: '2024-02-15T10:07:00Z' },
  { id: 'phil-edge-9', mapId: '2', sourceNodeId: 'phil-11', targetNodeId: 'phil-29', relationType: 'part-of', label: 'представитель', strength: 0.9, bidirectional: false, metadata: { confidence: 0.9, createdBy: 'user' }, createdAt: '2024-02-15T10:08:00Z', updatedAt: '2024-02-15T10:08:00Z' },
  { id: 'phil-edge-10', mapId: '2', sourceNodeId: 'phil-12', targetNodeId: 'phil-29', relationType: 'part-of', label: 'представитель', strength: 0.85, bidirectional: false, metadata: { confidence: 0.85, createdBy: 'user' }, createdAt: '2024-02-15T10:09:00Z', updatedAt: '2024-02-15T10:09:00Z' },
  { id: 'phil-edge-11', mapId: '2', sourceNodeId: 'phil-11', targetNodeId: 'phil-10', relationType: 'influences', label: 'критикует', strength: 0.7, bidirectional: false, metadata: { confidence: 0.8, createdBy: 'user' }, createdAt: '2024-02-15T10:10:00Z', updatedAt: '2024-02-15T10:10:00Z' },

  // Новое время - эмпиристы
  { id: 'phil-edge-12', mapId: '2', sourceNodeId: 'phil-13', targetNodeId: 'phil-30', relationType: 'part-of', label: 'основатель', strength: 0.95, bidirectional: false, metadata: { confidence: 0.95, createdBy: 'user' }, createdAt: '2024-02-15T10:11:00Z', updatedAt: '2024-02-15T10:11:00Z' },
  { id: 'phil-edge-13', mapId: '2', sourceNodeId: 'phil-14', targetNodeId: 'phil-30', relationType: 'part-of', label: 'представитель', strength: 0.9, bidirectional: false, metadata: { confidence: 0.9, createdBy: 'user' }, createdAt: '2024-02-15T10:12:00Z', updatedAt: '2024-02-15T10:12:00Z' },
  { id: 'phil-edge-14', mapId: '2', sourceNodeId: 'phil-47', targetNodeId: 'phil-30', relationType: 'part-of', label: 'представитель', strength: 0.85, bidirectional: false, metadata: { confidence: 0.85, createdBy: 'user' }, createdAt: '2024-02-15T10:13:00Z', updatedAt: '2024-02-15T10:13:00Z' },
  { id: 'phil-edge-15', mapId: '2', sourceNodeId: 'phil-29', targetNodeId: 'phil-30', relationType: 'contradicts', label: 'противопоставлены', strength: 0.9, bidirectional: true, metadata: { confidence: 0.95, createdBy: 'user' }, createdAt: '2024-02-15T10:14:00Z', updatedAt: '2024-02-15T10:14:00Z' },

  // Кант - синтез
  { id: 'phil-edge-16', mapId: '2', sourceNodeId: 'phil-15', targetNodeId: 'phil-29', relationType: 'influences', label: 'синтезирует', strength: 0.9, bidirectional: false, metadata: { confidence: 0.9, createdBy: 'user' }, createdAt: '2024-02-15T10:15:00Z', updatedAt: '2024-02-15T10:15:00Z' },
  { id: 'phil-edge-17', mapId: '2', sourceNodeId: 'phil-15', targetNodeId: 'phil-30', relationType: 'influences', label: 'синтезирует', strength: 0.9, bidirectional: false, metadata: { confidence: 0.9, createdBy: 'user' }, createdAt: '2024-02-15T10:16:00Z', updatedAt: '2024-02-15T10:16:00Z' },
  { id: 'phil-edge-18', mapId: '2', sourceNodeId: 'phil-15', targetNodeId: 'phil-41', relationType: 'explains', label: 'развивает', strength: 0.95, bidirectional: false, metadata: { confidence: 0.95, createdBy: 'user' }, createdAt: '2024-02-15T10:17:00Z', updatedAt: '2024-02-15T10:17:00Z' },

  // Немецкий идеализм
  { id: 'phil-edge-19', mapId: '2', sourceNodeId: 'phil-16', targetNodeId: 'phil-15', relationType: 'influences', label: 'развивает идеи', strength: 0.9, bidirectional: false, metadata: { confidence: 0.9, createdBy: 'user' }, createdAt: '2024-02-15T10:18:00Z', updatedAt: '2024-02-15T10:18:00Z' },
  { id: 'phil-edge-20', mapId: '2', sourceNodeId: 'phil-16', targetNodeId: 'phil-42', relationType: 'explains', label: 'развивает', strength: 0.95, bidirectional: false, metadata: { confidence: 0.95, createdBy: 'user' }, createdAt: '2024-02-15T10:19:00Z', updatedAt: '2024-02-15T10:19:00Z' },
  { id: 'phil-edge-21', mapId: '2', sourceNodeId: 'phil-17', targetNodeId: 'phil-15', relationType: 'influences', label: 'развивает', strength: 0.8, bidirectional: false, metadata: { confidence: 0.85, createdBy: 'user' }, createdAt: '2024-02-15T10:20:00Z', updatedAt: '2024-02-15T10:20:00Z' },
  { id: 'phil-edge-22', mapId: '2', sourceNodeId: 'phil-18', targetNodeId: 'phil-15', relationType: 'influences', label: 'развивает', strength: 0.75, bidirectional: false, metadata: { confidence: 0.8, createdBy: 'user' }, createdAt: '2024-02-15T10:21:00Z', updatedAt: '2024-02-15T10:21:00Z' },

  // XIX век - реакция на идеализм
  { id: 'phil-edge-23', mapId: '2', sourceNodeId: 'phil-19', targetNodeId: 'phil-15', relationType: 'contradicts', label: 'критикует', strength: 0.8, bidirectional: false, metadata: { confidence: 0.85, createdBy: 'user' }, createdAt: '2024-02-15T10:22:00Z', updatedAt: '2024-02-15T10:22:00Z' },
  { id: 'phil-edge-24', mapId: '2', sourceNodeId: 'phil-19', targetNodeId: 'phil-43', relationType: 'similar-to', label: 'предшественник', strength: 0.7, bidirectional: false, metadata: { confidence: 0.75, createdBy: 'user' }, createdAt: '2024-02-15T10:23:00Z', updatedAt: '2024-02-15T10:23:00Z' },
  { id: 'phil-edge-25', mapId: '2', sourceNodeId: 'phil-20', targetNodeId: 'phil-31', relationType: 'part-of', label: 'предшественник', strength: 0.9, bidirectional: false, metadata: { confidence: 0.9, createdBy: 'user' }, createdAt: '2024-02-15T10:24:00Z', updatedAt: '2024-02-15T10:24:00Z' },
  { id: 'phil-edge-26', mapId: '2', sourceNodeId: 'phil-21', targetNodeId: 'phil-16', relationType: 'influences', label: 'развивает диалектику', strength: 0.85, bidirectional: false, metadata: { confidence: 0.9, createdBy: 'user' }, createdAt: '2024-02-15T10:25:00Z', updatedAt: '2024-02-15T10:25:00Z' },
  { id: 'phil-edge-27', mapId: '2', sourceNodeId: 'phil-22', targetNodeId: 'phil-19', relationType: 'influences', label: 'развивает идеи', strength: 0.8, bidirectional: false, metadata: { confidence: 0.85, createdBy: 'user' }, createdAt: '2024-02-15T10:26:00Z', updatedAt: '2024-02-15T10:26:00Z' },
  { id: 'phil-edge-28', mapId: '2', sourceNodeId: 'phil-22', targetNodeId: 'phil-43', relationType: 'explains', label: 'развивает', strength: 0.95, bidirectional: false, metadata: { confidence: 0.95, createdBy: 'user' }, createdAt: '2024-02-15T10:27:00Z', updatedAt: '2024-02-15T10:27:00Z' },

  // XX век - Экзистенциализм
  { id: 'phil-edge-29', mapId: '2', sourceNodeId: 'phil-23', targetNodeId: 'phil-32', relationType: 'part-of', label: 'применяет метод', strength: 0.85, bidirectional: false, metadata: { confidence: 0.9, createdBy: 'user' }, createdAt: '2024-02-15T10:28:00Z', updatedAt: '2024-02-15T10:28:00Z' },
  { id: 'phil-edge-30', mapId: '2', sourceNodeId: 'phil-23', targetNodeId: 'phil-31', relationType: 'part-of', label: 'представитель', strength: 0.9, bidirectional: false, metadata: { confidence: 0.9, createdBy: 'user' }, createdAt: '2024-02-15T10:29:00Z', updatedAt: '2024-02-15T10:29:00Z' },
  { id: 'phil-edge-31', mapId: '2', sourceNodeId: 'phil-24', targetNodeId: 'phil-31', relationType: 'part-of', label: 'ключевая фигура', strength: 0.95, bidirectional: false, metadata: { confidence: 0.95, createdBy: 'user' }, createdAt: '2024-02-15T10:30:00Z', updatedAt: '2024-02-15T10:30:00Z' },
  { id: 'phil-edge-32', mapId: '2', sourceNodeId: 'phil-24', targetNodeId: 'phil-23', relationType: 'influences', label: 'развивает', strength: 0.85, bidirectional: false, metadata: { confidence: 0.85, createdBy: 'user' }, createdAt: '2024-02-15T10:31:00Z', updatedAt: '2024-02-15T10:31:00Z' },
  { id: 'phil-edge-33', mapId: '2', sourceNodeId: 'phil-25', targetNodeId: 'phil-44', relationType: 'explains', label: 'развивает', strength: 0.95, bidirectional: false, metadata: { confidence: 0.95, createdBy: 'user' }, createdAt: '2024-02-15T10:32:00Z', updatedAt: '2024-02-15T10:32:00Z' },
  { id: 'phil-edge-34', mapId: '2', sourceNodeId: 'phil-25', targetNodeId: 'phil-24', relationType: 'related-to', label: 'современники', strength: 0.8, bidirectional: true, metadata: { confidence: 0.85, createdBy: 'user' }, createdAt: '2024-02-15T10:33:00Z', updatedAt: '2024-02-15T10:33:00Z' },
  { id: 'phil-edge-35', mapId: '2', sourceNodeId: 'phil-20', targetNodeId: 'phil-44', relationType: 'influences', label: 'предшественник концепции', strength: 0.75, bidirectional: false, metadata: { confidence: 0.8, createdBy: 'user' }, createdAt: '2024-02-15T10:34:00Z', updatedAt: '2024-02-15T10:34:00Z' },
  { id: 'phil-edge-36', mapId: '2', sourceNodeId: 'phil-31', targetNodeId: 'phil-20', relationType: 'influences', label: 'происходит от', strength: 0.85, bidirectional: false, metadata: { confidence: 0.9, createdBy: 'user' }, createdAt: '2024-02-15T10:35:00Z', updatedAt: '2024-02-15T10:35:00Z' },
  { id: 'phil-edge-37', mapId: '2', sourceNodeId: 'phil-50', targetNodeId: 'phil-24', relationType: 'related-to', label: 'партнер', strength: 0.9, bidirectional: true, metadata: { confidence: 0.95, createdBy: 'user' }, createdAt: '2024-02-15T10:36:00Z', updatedAt: '2024-02-15T10:36:00Z' },

  // Феноменология
  { id: 'phil-edge-38', mapId: '2', sourceNodeId: 'phil-33', targetNodeId: 'phil-32', relationType: 'explains', label: 'основатель', strength: 0.95, bidirectional: false, metadata: { confidence: 0.95, createdBy: 'user' }, createdAt: '2024-02-15T10:37:00Z', updatedAt: '2024-02-15T10:37:00Z' },
  { id: 'phil-edge-39', mapId: '2', sourceNodeId: 'phil-23', targetNodeId: 'phil-33', relationType: 'influences', label: 'ученик', strength: 0.85, bidirectional: false, metadata: { confidence: 0.9, createdBy: 'user' }, createdAt: '2024-02-15T10:38:00Z', updatedAt: '2024-02-15T10:38:00Z' },

  // Аналитическая философия
  { id: 'phil-edge-40', mapId: '2', sourceNodeId: 'phil-26', targetNodeId: 'phil-27', relationType: 'influences', label: 'ученик', strength: 0.85, bidirectional: false, metadata: { confidence: 0.9, createdBy: 'user' }, createdAt: '2024-02-15T10:39:00Z', updatedAt: '2024-02-15T10:39:00Z' },
  { id: 'phil-edge-41', mapId: '2', sourceNodeId: 'phil-28', targetNodeId: 'phil-26', relationType: 'related-to', label: 'современники', strength: 0.7, bidirectional: true, metadata: { confidence: 0.75, createdBy: 'user' }, createdAt: '2024-02-15T10:40:00Z', updatedAt: '2024-02-15T10:40:00Z' },

  // Постмодернизм
  { id: 'phil-edge-42', mapId: '2', sourceNodeId: 'phil-34', targetNodeId: 'phil-22', relationType: 'influences', label: 'развивает идеи', strength: 0.8, bidirectional: false, metadata: { confidence: 0.85, createdBy: 'user' }, createdAt: '2024-02-15T10:41:00Z', updatedAt: '2024-02-15T10:41:00Z' },
  { id: 'phil-edge-43', mapId: '2', sourceNodeId: 'phil-35', targetNodeId: 'phil-23', relationType: 'influences', label: 'критикует', strength: 0.75, bidirectional: false, metadata: { confidence: 0.8, createdBy: 'user' }, createdAt: '2024-02-15T10:42:00Z', updatedAt: '2024-02-15T10:42:00Z' },
  { id: 'phil-edge-44', mapId: '2', sourceNodeId: 'phil-36', targetNodeId: 'phil-22', relationType: 'influences', label: 'развивает', strength: 0.8, bidirectional: false, metadata: { confidence: 0.85, createdBy: 'user' }, createdAt: '2024-02-15T10:43:00Z', updatedAt: '2024-02-15T10:43:00Z' },

  // Прагматизм
  { id: 'phil-edge-45', mapId: '2', sourceNodeId: 'phil-39', targetNodeId: 'phil-38', relationType: 'influences', label: 'развивает', strength: 0.85, bidirectional: false, metadata: { confidence: 0.9, createdBy: 'user' }, createdAt: '2024-02-15T10:44:00Z', updatedAt: '2024-02-15T10:44:00Z' },

  // Политическая философия
  { id: 'phil-edge-46', mapId: '2', sourceNodeId: 'phil-45', targetNodeId: 'phil-13', relationType: 'influences', label: 'современники', strength: 0.7, bidirectional: true, metadata: { confidence: 0.75, createdBy: 'user' }, createdAt: '2024-02-15T10:45:00Z', updatedAt: '2024-02-15T10:45:00Z' },
  { id: 'phil-edge-47', mapId: '2', sourceNodeId: 'phil-46', targetNodeId: 'phil-13', relationType: 'contradicts', label: 'критикует', strength: 0.75, bidirectional: false, metadata: { confidence: 0.8, createdBy: 'user' }, createdAt: '2024-02-15T10:46:00Z', updatedAt: '2024-02-15T10:46:00Z' },

  // Утилитаризм
  { id: 'phil-edge-48', mapId: '2', sourceNodeId: 'phil-49', targetNodeId: 'phil-48', relationType: 'influences', label: 'развивает', strength: 0.9, bidirectional: false, metadata: { confidence: 0.9, createdBy: 'user' }, createdAt: '2024-02-15T10:47:00Z', updatedAt: '2024-02-15T10:47:00Z' },
]

// Mock связи для карты "Основы нейросетей"
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

// Добавляем философские связи
MOCK_EDGES.push(...PHILOSOPHY_EDGES)

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
