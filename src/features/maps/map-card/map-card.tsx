import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { GitBranch, MoreHorizontal } from 'lucide-react'
import { Link } from 'react-router'
import type { MapEntity } from '@/entities/map'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/shared/ui/dropdown-menu'

interface MapCardProps {
  map: MapEntity
}

export function MapCard({ map }: MapCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <Link to={`/dashboard/maps/${map.id}/view`} className="hover:underline">
            {map.title}
          </Link>
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Меню</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Редактировать</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Удалить</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em]">
          {map.description || 'Нет описания'}
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <GitBranch className="h-3 w-3" />
          <span>{map.nodesCount} концептов</span>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Изменено {formatDistanceToNow(new Date(map.updatedAt), { addSuffix: true, locale: ru })}
      </CardFooter>
    </Card>
  )
}
