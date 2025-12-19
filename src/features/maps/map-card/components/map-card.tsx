import { formatDistanceToNow } from 'date-fns'
import { de, enUS, ru } from 'date-fns/locale'
import { Copy01Icon, GitBranch01Icon, Globe01Icon, Lock01Icon, DotsHorizontalIcon, User01Icon } from '@untitledui/icons-react/outline'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import type { MapEntity, MatchedNode } from '@/entities/map'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/components/dropdown-menu'
import { pluralizeItems } from '@/shared/lib/pluralize'

interface MapCardProps {
  map: MapEntity
  isOwned?: boolean
  matchedNodes?: MatchedNode[]
  onCopy?: () => void
  onToggleVisibility?: () => void
  onDelete?: () => void
}

const DATE_LOCALES = {
  ru,
  en: enUS,
  de
}

export const MapCard = memo(
  ({ map, isOwned = true, matchedNodes, onCopy, onToggleVisibility, onDelete }: MapCardProps) => {
    const { t, i18n } = useTranslation()
    const dateLocale = DATE_LOCALES[i18n.language as keyof typeof DATE_LOCALES] || ru

    return (
      <Card className='transition-colors'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 gap-2'>
          <div className='flex items-center gap-2 min-w-0 flex-1'>
            <CardTitle className='text-sm font-medium truncate'>
              <Link to={`/dashboard/maps/${map.id}/view`} className='hover:underline'>
                {map.title}
              </Link>
            </CardTitle>
            {map.isPublic && (
              <Badge variant='info' className='shrink-0 gap-1'>
                <Globe01Icon className='h-3 w-3' />
                {t('dashboard.mapCard.public')}
              </Badge>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0 shrink-0'>
                <span className='sr-only'>{t('dashboard.mapCard.menu')}</span>
                <DotsHorizontalIcon className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {isOwned ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link to={`/dashboard/maps/${map.id}/view`}>{t('dashboard.mapCard.edit')}</Link>
                  </DropdownMenuItem>
                  {onToggleVisibility && (
                    <DropdownMenuItem onClick={onToggleVisibility}>
                      {map.isPublic ? (
                        <>
                          <Lock01Icon className='h-4 w-4 mr-2' />
                          {t('dashboard.mapCard.makePrivate')}
                        </>
                      ) : (
                        <>
                          <Globe01Icon className='h-4 w-4 mr-2' />
                          {t('dashboard.mapCard.makePublic')}
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {onDelete && (
                    <DropdownMenuItem className='text-destructive' onClick={onDelete}>
                      {t('dashboard.mapCard.delete')}
                    </DropdownMenuItem>
                  )}
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to={`/dashboard/maps/${map.id}/view`}>{t('dashboard.mapCard.view')}</Link>
                  </DropdownMenuItem>
                  {onCopy && (
                    <DropdownMenuItem onClick={onCopy}>
                      <Copy01Icon className='h-4 w-4 mr-2' />
                      {t('dashboard.mapCard.copyToMyMaps')}
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className='text-xs text-muted-foreground line-clamp-2 min-h-[2.5em]'>
            {map.description || t('dashboard.mapCard.noDescription')}
          </div>

          {/* Author for public maps */}
          {!isOwned && map.authorName && (
            <div className='mt-2 flex items-center gap-1.5 text-xs text-muted-foreground'>
              <User01Icon className='h-3 w-3' />
              <span>{map.authorName}</span>
            </div>
          )}

          {/* Matched nodes from search */}
          {matchedNodes && matchedNodes.length > 0 && (
            <div className='mt-2'>
              <div className='flex flex-wrap gap-1'>
                {matchedNodes.slice(0, 3).map(node => (
                  <Badge key={node.id} variant='outline' className='text-[10px] px-1.5 py-0'>
                    {node.label}
                  </Badge>
                ))}
                {matchedNodes.length > 3 && (
                  <Badge variant='outline' className='text-[10px] px-1.5 py-0'>
                    +{matchedNodes.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className='mt-4 flex items-center gap-2 text-xs text-muted-foreground'>
            <GitBranch01Icon className='h-3 w-3' />
            <span>{pluralizeItems(map.nodesCount, i18n.language)}</span>
          </div>
        </CardContent>
        <CardFooter className='text-xs text-muted-foreground'>
          {t('dashboard.mapCard.updated')}{' '}
          {formatDistanceToNow(new Date(map.updatedAt), { addSuffix: true, locale: dateLocale })}
        </CardFooter>
      </Card>
    )
  }
)

MapCard.displayName = 'MapCard'
