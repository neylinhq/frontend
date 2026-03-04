import { PlusIcon, SearchMdIcon } from '@untitledui/icons-react/outline'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLoaderData } from 'react-router'

import { CreateMapCard } from '@/features/maps/create-map-button'
import { MapCard, MapCardSkeleton } from '@/features/maps/map-card'
import { MapFilters } from '@/features/maps/map-filters'
import {
  type DashboardMapsResponse,
  type MapEntity,
  useCopyMap,
  useDashboardMaps,
  useDeleteMap,
  useDiscoverMaps,
  useSearchMaps,
  useSetVisibility
} from '@/entities/map'
import { useLoaderUser } from '@/entities/user'
import { Button } from '@/shared/components/button'
import { Input } from '@/shared/components/input'
import { LoadMoreButton } from '@/shared/components/load-more-button'
import { toast } from '@/shared/components/toast'
import { Typography } from '@/shared/components/typography'
import { MAPS_ROUTES } from '@/shared/config'
import { useDebouncedCallback } from '@/shared/hooks'

const PAGE_SIZE = 20

interface LoaderData {
  initialData: DashboardMapsResponse
}

export const OverviewPage = () => {
  const { t } = useTranslation()
  const user = useLoaderUser()
  const { initialData } = useLoaderData<LoaderData>()
  const [filter, setFilter] = useState<'owned' | 'public'>('owned')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Pagination state for load more
  const [ownedOffset, setOwnedOffset] = useState(PAGE_SIZE)
  const [publicOffset, setPublicOffset] = useState(PAGE_SIZE)

  // Accumulated maps from load more
  const [extraOwnedMaps, setExtraOwnedMaps] = useState<MapEntity[]>([])
  const [extraPublicMaps, setExtraPublicMaps] = useState<MapEntity[]>([])

  // Has more state (initialized from dashboard response)
  const [ownedHasMore, setOwnedHasMore] = useState(initialData.owned.hasMore)
  const [publicHasMore, setPublicHasMore] = useState(initialData.public.hasMore)

  const debouncedSetQuery = useDebouncedCallback((value: string) => {
    setDebouncedQuery(value)
  }, 300)

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    debouncedSetQuery(value)
  }

  // Dashboard data - initial load with both groups
  const { data: dashboardData, isLoading } = useDashboardMaps({
    initialData
  })

  // Load more queries (only fetch when triggered)
  const { refetch: fetchMoreOwned, isFetching: isLoadingMoreOwned } = useDiscoverMaps({
    filter: 'owned',
    limit: PAGE_SIZE,
    offset: ownedOffset
  })

  const { refetch: fetchMorePublic, isFetching: isLoadingMorePublic } = useDiscoverMaps({
    filter: 'public',
    limit: PAGE_SIZE,
    offset: publicOffset
  })

  // Search query
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
        currentlyPublic ? t('dashboard.mapCard.madePrivate') : t('dashboard.mapCard.madePublic')
      )
    } catch {
      toast.error(t('dashboard.mapCard.visibilityError'))
    }
  }

  const handleDelete = async (mapId: string) => {
    try {
      await deleteMap.mutateAsync(mapId)
    } catch {
      toast.error(t('dashboard.mapCard.deleteError'))
    }
  }

  const handleLoadMoreOwned = useCallback(async () => {
    const result = await fetchMoreOwned()
    if (result.data?.maps) {
      setExtraOwnedMaps(prev => [...prev, ...result.data.maps])
      setOwnedOffset(prev => prev + PAGE_SIZE)
      // Check if there are more pages
      const newTotal = ownedOffset + result.data.maps.length
      setOwnedHasMore(newTotal < (dashboardData?.owned.total ?? 0))
    }
  }, [fetchMoreOwned, ownedOffset, dashboardData?.owned.total])

  const handleLoadMorePublic = useCallback(async () => {
    const result = await fetchMorePublic()
    if (result.data?.maps) {
      setExtraPublicMaps(prev => [...prev, ...result.data.maps])
      setPublicOffset(prev => prev + PAGE_SIZE)
      // Check if there are more pages
      const newTotal = publicOffset + result.data.maps.length
      setPublicHasMore(newTotal < (dashboardData?.public.total ?? 0))
    }
  }, [fetchMorePublic, publicOffset, dashboardData?.public.total])

  // Combine initial maps with loaded more maps
  const ownedMaps = useMemo(() => {
    const initial = dashboardData?.owned.maps ?? []
    return [...initial, ...extraOwnedMaps]
  }, [dashboardData?.owned.maps, extraOwnedMaps])

  const publicMaps = useMemo(() => {
    const initial = dashboardData?.public.maps ?? []
    return [...initial, ...extraPublicMaps]
  }, [dashboardData?.public.maps, extraPublicMaps])

  // Filter maps based on selected filter
  const displayMaps = useMemo(() => {
    return filter === 'owned' ? ownedMaps : publicMaps
  }, [filter, ownedMaps, publicMaps])

  // Determine hasMore for current filter
  const currentHasMore = filter === 'owned' ? ownedHasMore : publicHasMore

  const handleLoadMore = useCallback(() => {
    if (filter === 'owned') {
      handleLoadMoreOwned()
    } else {
      handleLoadMorePublic()
    }
  }, [filter, handleLoadMoreOwned, handleLoadMorePublic])

  const isLoadingMore = isLoadingMoreOwned || isLoadingMorePublic

  // Search mode
  const isSearchActive = debouncedQuery.length >= 2

  // Keep last known counts to prevent tab numbers from disappearing during loading
  const lastCountsRef = useRef<{ owned: number; public: number } | undefined>()
  if (dashboardData) {
    lastCountsRef.current = {
      owned: dashboardData.owned.total,
      public: dashboardData.public.total
    }
  }
  const counts = lastCountsRef.current

  // Show skeleton during initial load or while search is loading
  const showSkeleton = isSearchActive ? isSearchLoading : isLoading && !dashboardData

  // Determine which maps to display
  const maps = isSearchActive ? (searchData?.maps ?? []) : displayMaps

  return (
    <div className='container mx-auto py-8 px-4 md:px-8'>
      <div className='flex items-center justify-between mb-8 gap-6'>
        <div>
          <Typography variant='h1'>{t('dashboard.overview.title')}</Typography>
          <p className='text-muted-foreground mt-1'>{t('dashboard.overview.description')}</p>
        </div>
        <Button asChild>
          <Link to={MAPS_ROUTES.new}>
            <PlusIcon className='mr-2 h-4 w-4' />
            {t('dashboard.overview.createMap')}
          </Link>
        </Button>
      </div>

      {/* Filters and Search */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6'>
        <MapFilters value={filter} onChange={setFilter} counts={counts} />

        <div className='relative flex-1 max-w-sm'>
          <SearchMdIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            type='search'
            placeholder={t('dashboard.overview.searchPlaceholder')}
            value={searchInput}
            onChange={e => handleSearchChange(e.target.value)}
            className='pl-9 text-sm'
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
        {showSkeleton && Array.from({ length: 6 }).map((_, i) => <MapCardSkeleton key={i} />)}

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
                  <PlusIcon className='mr-2 h-4 w-4' />
                  {t('dashboard.overview.createFirstMap')}
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Load more button - only show when not searching */}
      {!isSearchActive && !showSkeleton && maps && maps.length > 0 && (
        <div className='mt-8 flex justify-center'>
          <LoadMoreButton
            hasMore={currentHasMore}
            isLoading={isLoadingMore}
            onLoadMore={handleLoadMore}
          />
        </div>
      )}
    </div>
  )
}
