import { formatDistanceToNow } from 'date-fns'
import { de, enUS, ru } from 'date-fns/locale'
import { GitBranch, MoreHorizontal } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import type { MapEntity } from '@/entities/map'
import { Button } from '@/shared/components/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/shared/components/dropdown-menu'

interface MapCardProps {
  map: MapEntity
}

const DATE_LOCALES = {
  ru,
  en: enUS,
  de
}

export const MapCard = memo(({ map }: MapCardProps) => {
  const { t, i18n } = useTranslation()
  const dateLocale = DATE_LOCALES[i18n.language as keyof typeof DATE_LOCALES] || ru

  return (
    <Card className='hover:shadow-md transition-shadow'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>
          <Link to={`/dashboard/maps/${map.id}/view`} className='hover:underline'>
            {map.title}
          </Link>
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>{t('dashboard.mapCard.menu')}</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem>{t('dashboard.mapCard.edit')}</DropdownMenuItem>
            <DropdownMenuItem className='text-destructive'>
              {t('dashboard.mapCard.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className='text-xs text-muted-foreground line-clamp-2 min-h-[2.5em]'>
          {map.description || t('dashboard.mapCard.noDescription')}
        </div>
        <div className='mt-4 flex items-center gap-2 text-xs text-muted-foreground'>
          <GitBranch className='h-3 w-3' />
          <span>
            {map.nodesCount} {t('dashboard.mapCard.concepts')}
          </span>
        </div>
      </CardContent>
      <CardFooter className='text-xs text-muted-foreground'>
        {t('dashboard.mapCard.updated')}{' '}
        {formatDistanceToNow(new Date(map.updatedAt), { addSuffix: true, locale: dateLocale })}
      </CardFooter>
    </Card>
  )
})

MapCard.displayName = 'MapCard'
