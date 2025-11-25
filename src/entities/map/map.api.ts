import type { MapEntity } from './map.schema'

// Mock Data
const MOCK_MAPS: MapEntity[] = [
  {
    id: '1',
    title: 'Основы нейросетей',
    description: 'Разбор архитектур трансформеров и их применение в NLP.',
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-03-20T15:30:00Z',
    nodesCount: 42,
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

export const mapApi = {
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
  }
}
