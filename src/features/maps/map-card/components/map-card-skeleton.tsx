import { Card, CardContent, CardFooter, CardHeader } from '@/shared/components/card'
import { Skeleton } from '@/shared/components/skeleton'

export function MapCardSkeleton() {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <div className='flex items-center gap-2 min-w-0 flex-1'>
          {/* Title */}
          <Skeleton className='h-4 w-32' />
        </div>
        {/* Menu button */}
        <Skeleton className='h-8 w-8 rounded-sm shrink-0' />
      </CardHeader>
      <CardContent>
        {/* Description - 2 lines */}
        <div className='space-y-1.5 min-h-[2.5em]'>
          <Skeleton className='h-3 w-full' />
          <Skeleton className='h-3 w-2/3' />
        </div>

        {/* Stats row */}
        <div className='mt-4 flex items-center gap-2'>
          <Skeleton className='h-3 w-3 rounded-full' />
          <Skeleton className='h-3 w-20' />
        </div>
      </CardContent>
      <CardFooter>
        {/* Updated time */}
        <Skeleton className='h-3 w-28' />
      </CardFooter>
    </Card>
  )
}
