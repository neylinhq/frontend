import { useInfiniteQuery } from '@tanstack/react-query'
import {
  ClockRewindIcon,
  Link01Icon,
  Loading02Icon,
  MessageChatCircleIcon,
  PlusIcon,
  Trash01Icon,
  User01Icon
} from '@untitledui/icons-react/outline'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { type MapEvent, mapApi, mapKeys } from '@/entities/map'
import { Button } from '@/shared/components/button'
import { cn } from '@/shared/lib/cn'

interface MapHistoryListProps {
  mapId: string
  className?: string
}

const ITEMS_PER_PAGE = 20

export const MapHistoryList = memo(({ mapId, className }: MapHistoryListProps) => {
  const { t } = useTranslation()

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useInfiniteQuery({
    queryKey: [...mapKeys.history(mapId), 'infinite'],
    queryFn: ({ pageParam = 0 }) =>
      mapApi.getMapHistory(mapId, { limit: ITEMS_PER_PAGE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((sum, page) => sum + page.events.length, 0)
      return loadedCount < lastPage.totalCount ? loadedCount : undefined
    },
    enabled: !!mapId
  })

  const allEvents = useMemo(() => {
    return data?.pages.flatMap(page => page.events) ?? []
  }, [data])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loading02Icon className='h-5 w-5 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (!allEvents.length) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <ClockRewindIcon className='h-10 w-10 text-muted-foreground/30 mb-3' />
        <p className='text-sm font-medium text-muted-foreground'>
          {t('mapSettings.history.empty')}
        </p>
        <p className='text-xs text-muted-foreground/70 mt-1'>
          {t('mapSettings.history.emptyDescription')}
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-1', className)}>
      {allEvents.map(event => (
        <HistoryEventItem key={event.id} event={event} />
      ))}

      {hasNextPage && (
        <div className='pt-3'>
          <Button
            variant='ghost'
            size='sm'
            className='w-full'
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage && (
              <Loading02Icon className='h-4 w-4 animate-spin mr-2' />
            )}
            {t('mapSettings.history.loadMore')}
          </Button>
        </div>
      )}
    </div>
  )
})

MapHistoryList.displayName = 'MapHistoryList'

// ====== Event Item Component ======

interface HistoryEventItemProps {
  event: MapEvent
}

const HistoryEventItem = memo(({ event }: HistoryEventItemProps) => {
  const { t } = useTranslation()

  const timeAgo = useMemo(() => formatTimeAgo(event.createdAt, t), [event.createdAt, t])

  const Icon = useMemo(() => {
    switch (event.eventType) {
      case 'node_created':
        return PlusIcon
      case 'node_deleted':
        return Trash01Icon
      case 'edge_created':
      case 'edge_deleted':
        return Link01Icon
      default:
        return ClockRewindIcon
    }
  }, [event.eventType])

  const SourceIcon = event.source === 'ai' ? MessageChatCircleIcon : User01Icon

  const iconColorClass = useMemo(() => {
    if (event.eventType.includes('deleted')) {
      return 'text-destructive/70'
    }
    if (event.eventType.includes('created')) {
      return 'text-success/70'
    }
    return 'text-info/70'
  }, [event.eventType])

  // Extract label from changes if available
  const entityLabel = useMemo(() => {
    const after = event.changes?.after as Record<string, unknown> | undefined
    if (after?.label) {
      return String(after.label)
    }
    if (after?.Label) {
      return String(after.Label)
    }

    const before = event.changes?.before as Record<string, unknown> | undefined
    if (before?.label) {
      return String(before.label)
    }
    if (before?.Label) {
      return String(before.Label)
    }

    return null
  }, [event.changes])

  return (
    <div className='flex items-start gap-3 py-2 px-2 rounded-md hover:bg-muted/50 transition-colors'>
      <div className={cn('mt-0.5 p-1.5 rounded-md bg-muted/50', iconColorClass)}>
        <Icon className='h-3.5 w-3.5' />
      </div>

      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium truncate'>
            {t(`mapSettings.history.events.${event.eventType}`)}
          </span>
          <SourceIcon className='h-3 w-3 text-muted-foreground/50 shrink-0' />
        </div>

        {entityLabel && (
          <p className='text-xs text-muted-foreground truncate mt-0.5'>
            {entityLabel}
          </p>
        )}

        <p className='text-xs text-muted-foreground/60 mt-1'>
          {timeAgo}
        </p>
      </div>
    </div>
  )
})

HistoryEventItem.displayName = 'HistoryEventItem'

// ====== Time Formatting Helper ======

function formatTimeAgo(dateString: string, t: (key: string, options?: Record<string, unknown>) => string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) {
    return t('mapSettings.history.timeAgo.justNow')
  }
  if (diffMins < 60) {
    return t('mapSettings.history.timeAgo.minutesAgo', { count: diffMins })
  }
  if (diffHours < 24) {
    return t('mapSettings.history.timeAgo.hoursAgo', { count: diffHours })
  }
  return t('mapSettings.history.timeAgo.daysAgo', { count: diffDays })
}
