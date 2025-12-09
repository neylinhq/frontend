import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import {
  type MapFilter,
  useCopyMap,
  useDeleteMap,
  useDiscoverMaps,
  useSearchMaps,
  useSetVisibility
} from '@/entities/map'
import { useCurrentUser } from '@/entities/user'
import { CreateMapCard } from '@/features/maps/create-map-button'
import { MapFilters } from '@/features/maps/map-filters'
import { MapCard } from '@/features/maps/map-card/map-card'
import { Button } from '@/shared/components/button'
import { Input } from '@/shared/components/input'
import { Typography } from '@/shared/components/typography'
import { MAPS_ROUTES } from '@/shared/config'
import { useToast } from '@/shared/components/toast'

export const OverviewPage = () => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: user } = useCurrentUser()
  const [filter, setFilter] = useState<MapFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: discoverData, isLoading } = useDiscoverMaps({ filter })
  const { data: searchData, isLoading: isSearching } = useSearchMaps({
    query: searchQuery,
    mode: 'all',
    filter,
    enabled: searchQuery.length >= 2
  })

  const copyMap = useCopyMap()
  const deleteMap = useDeleteMap()
  const setVisibility = useSetVisibility()

  const handleCopy = async (mapId: string) => {
    try {
      await copyMap.mutateAsync(mapId)
      toast({
        title: t('dashboard.mapCard.copySuccess'),
        variant: 'default'
      })
    } catch {
      toast({
        title: t('dashboard.mapCard.copyError'),
        variant: 'destructive'
      })
    }
  }

  const handleToggleVisibility = async (mapId: string, currentlyPublic: boolean) => {
    try {
      await setVisibility.mutateAsync({ mapId, isPublic: !currentlyPublic })
      toast({
        title: currentlyPublic
          ? t('dashboard.mapCard.madePrivate')
          : t('dashboard.mapCard.madePublic'),
        variant: 'default'
      })
    } catch {
      toast({
        title: t('dashboard.mapCard.visibilityError'),
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (mapId: string) => {
    try {
      await deleteMap.mutateAsync(mapId)
      toast({
        title: t('dashboard.mapCard.deleteSuccess'),
        variant: 'default'
      })
    } catch {
      toast({
        title: t('dashboard.mapCard.deleteError'),
        variant: 'destructive'
      })
    }
  }

  // Use search results if searching, otherwise use discover results
  const isSearchActive = searchQuery.length >= 2
  const maps = isSearchActive ? searchData?.maps : discoverData?.maps
  const counts = discoverData
    ? {
        all: discoverData.totalCount,
        owned: discoverData.ownedCount,
        public: discoverData.publicCount
      }
    : undefined

  return (
    <div className='container mx-auto py-8 px-4 md:px-8'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <Typography variant='h1'>{t('dashboard.overview.title')}</Typography>
          <p className='text-muted-foreground mt-1'>{t('dashboard.overview.description')}</p>
        </div>
        <Button asChild>
          <Link to={MAPS_ROUTES.new}>
            <Plus className='mr-2 h-4 w-4' />
            {t('dashboard.overview.createMap')}
          </Link>
        </Button>
      </div>

      {/* Filters and Search */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6'>
        <MapFilters value={filter} onChange={setFilter} counts={counts} />

        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            type='search'
            placeholder={t('dashboard.overview.searchPlaceholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='pl-9'
          />
        </div>
      </div>

      {/* Search results info */}
      {isSearchActive && searchData && (
        <p className='text-sm text-muted-foreground mb-4'>
          {t('dashboard.overview.searchResults', {
            count: searchData.totalCount,
            query: searchData.query
          })}
        </p>
      )}

      {/* Loading state */}
      {(isLoading || isSearching) && (
        <div className='flex items-center justify-center py-12'>
          <div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full' />
        </div>
      )}

      {/* Maps grid */}
      {!isLoading && !isSearching && maps && (
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {maps.map(map => {
            const isOwned = map.authorId === user?.id
            return (
              <MapCard
                key={map.id}
                map={map}
                isOwned={isOwned}
                matchedNodes={'matchedNodes' in map ? map.matchedNodes : undefined}
                onCopy={!isOwned ? () => handleCopy(map.id) : undefined}
                onToggleVisibility={
                  isOwned ? () => handleToggleVisibility(map.id, map.isPublic) : undefined
                }
                onDelete={isOwned ? () => handleDelete(map.id) : undefined}
              />
            )
          })}

          {/* Create new map card - only show when viewing own maps */}
          {filter !== 'public' && <CreateMapCard />}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isSearching && (!maps || maps.length === 0) && (
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <p className='text-muted-foreground mb-4'>
            {isSearchActive
              ? t('dashboard.overview.noSearchResults')
              : t('dashboard.overview.noMaps')}
          </p>
          {!isSearchActive && filter !== 'public' && (
            <Button asChild>
              <Link to={MAPS_ROUTES.new}>
                <Plus className='mr-2 h-4 w-4' />
                {t('dashboard.overview.createFirstMap')}
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
