import { Plus, Search } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLoaderData } from 'react-router'

import {
  type MapDiscoverResponse,
  type MapFilter,
  useCopyMap,
  useDeleteMap,
  useDiscoverMaps,
  useSearchMaps,
  useSetVisibility
} from '@/entities/map'
import { useLoaderUser } from '@/entities/user'
import { CreateMapCard } from '@/features/maps/create-map-button'
import { MapFilters } from '@/features/maps/map-filters'
import { MapCard, MapCardSkeleton } from '@/features/maps/map-card'
import { Button } from '@/shared/components/button'
import { Input } from '@/shared/components/input'
import { Typography } from '@/shared/components/typography'
import { MAPS_ROUTES } from '@/shared/config'
import { toast } from '@/shared/components/toast'
import { useDebouncedCallback } from '@/shared/hooks'

interface LoaderData {
  initialData: MapDiscoverResponse
}

export const OverviewPage = () => {
  const { t } = useTranslation()
  const user = useLoaderUser()
  const { initialData } = useLoaderData<LoaderData>()
  const [filter, setFilter] = useState<MapFilter>('all')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const debouncedSetQuery = useDebouncedCallback((value: string) => {
    setDebouncedQuery(value)
  }, 300)

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    debouncedSetQuery(value)
  }

  // SSR initial data only for default filter 'all'
  const { data: discoverData, isLoading } = useDiscoverMaps({
    filter,
    initialData: filter === 'all' ? initialData : undefined
  })
  const { data: searchData, isLoading: isSearchLoading } = useSearchMaps({
    query: debouncedQuery,
    mode: 'all',
    filter,
    enabled: debouncedQuery.length >= 2
  })

  const copyMap = useCopyMap()
  const deleteMap = useDeleteMap()
  const setVisibility = useSetVisibility()

  const handleCopy = async (mapId: string) => {
    try {
      await copyMap.mutateAsync(mapId)
      toast.success(t('dashboard.mapCard.copySuccess'))
    } catch {
      toast.error(t('dashboard.mapCard.copyError'))
    }
  }

  const handleToggleVisibility = async (mapId: string, currentlyPublic: boolean) => {
    try {
      await setVisibility.mutateAsync({ mapId, isPublic: !currentlyPublic })
      toast.success(
        currentlyPublic
          ? t('dashboard.mapCard.madePrivate')
          : t('dashboard.mapCard.madePublic')
      )
    } catch {
      toast.error(t('dashboard.mapCard.visibilityError'))
    }
  }

  const handleDelete = async (mapId: string) => {
    try {
      await deleteMap.mutateAsync(mapId)
      toast.success(t('dashboard.mapCard.deleteSuccess'))
    } catch {
      toast.error(t('dashboard.mapCard.deleteError'))
    }
  }

  // Use search results if searching, otherwise use discover results
  const isSearchActive = debouncedQuery.length >= 2
  const maps = isSearchActive ? searchData?.maps : discoverData?.maps

  // Keep last known counts to prevent tab numbers from disappearing during loading
  const lastCountsRef = useRef<{ all: number; owned: number; public: number } | undefined>()
  if (discoverData) {
    lastCountsRef.current = {
      all: discoverData.totalCount,
      owned: discoverData.ownedCount,
      public: discoverData.publicCount
    }
  }
  const counts = lastCountsRef.current

  // Show skeleton only on true initial load (no data yet)
  const showSkeleton = isSearchActive
    ? isSearchLoading && !searchData
    : isLoading && !discoverData

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
            value={searchInput}
            onChange={e => handleSearchChange(e.target.value)}
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

      {/* Maps grid - always rendered to avoid layout shifts */}
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {/* Loading state - show skeleton cards only on true initial load */}
        {showSkeleton && (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <MapCardSkeleton key={i} />
            ))}
          </>
        )}

        {/* Loaded maps - show even with placeholder data during filter switch */}
        {!showSkeleton && maps && maps.length > 0 && (
          <>
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
          </>
        )}

        {/* Empty state - still inside grid for consistent layout */}
        {!showSkeleton && (!maps || maps.length === 0) && (
          <div className='col-span-full flex flex-col items-center justify-center py-12 text-center'>
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
    </div>
  )
}
