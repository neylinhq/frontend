import { Plus } from 'lucide-react'
import { Link } from 'react-router'
import type { MapEntity } from '@/entities/map'
import { CreateMapCard } from '@/features/maps/create-map-button'
import { MapCard } from '@/features/maps/map-card/map-card'
import { Button } from '@/shared/ui/button'

// Временные данные
const MOCK_MAPS: MapEntity[] = [
  {
    id: '1',
    title: 'Основы нейросетей',
    description: 'Разбор архитектур трансформеров и их применение в NLP.',
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-03-20T15:30:00Z',
    nodesCount: 42
  },
  {
    id: '2',
    title: 'История философии',
    description: 'Связи между античными школами и современным экзистенциализмом.',
    createdAt: '2024-02-15T09:00:00Z',
    updatedAt: '2024-03-18T12:00:00Z',
    nodesCount: 156
  },
  {
    id: '3',
    title: 'Мой стартап',
    description: '',
    createdAt: '2024-03-21T08:00:00Z',
    updatedAt: '2024-03-21T08:05:00Z',
    nodesCount: 3
  }
]

export function OverviewPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Обзор</h1>
          <p className="text-muted-foreground mt-1">
            Ваша когнитивная карта и последние активности.
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/maps/new">
            <Plus className="mr-2 h-4 w-4" />
            Создать карту
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_MAPS.map(map => (
          <MapCard key={map.id} map={map} />
        ))}

        {/* Карточка создания новой карты */}
        <CreateMapCard />
      </div>
    </div>
  )
}
