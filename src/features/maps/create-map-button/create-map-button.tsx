import { Plus } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Button } from '@/shared/components/button'
import { MAPS_ROUTES } from '@/shared/config'
import { cn } from '@/shared/lib/cn'

interface CreateMapCardProps {
  className?: string
}

export const CreateMapCard = memo(({ className }: CreateMapCardProps) => {
  const { t } = useTranslation()

  return (
    <Button
      variant='outline'
      className={cn(
        'h-full min-h-[180px] flex flex-col items-center justify-center gap-2 border-dashed hover:bg-transparent hover:border-primary/50 whitespace-normal p-6',
        className
      )}
      asChild
    >
      <Link to={MAPS_ROUTES.new}>
        <div className='h-10 w-10 rounded-full bg-muted flex items-center justify-center'>
          <Plus className='h-6 w-6 text-muted-foreground' />
        </div>
        <span className='font-semibold text-lg'>{t('dashboard.createMap.title')}</span>
        <span className='text-xs text-muted-foreground font-normal text-center px-4'>
          {t('dashboard.createMap.description')}
        </span>
      </Link>
    </Button>
  )
})

CreateMapCard.displayName = 'CreateMapCard'
