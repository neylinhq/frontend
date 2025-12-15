import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Node } from '@/entities/map'
import { getNodeBorderColor, getRatingColor } from '@/entities/node'
import { Badge } from '@/shared/components/badge'
import { cn } from '@/shared/lib/cn'
import { getComplexityTier } from '@/shared/lib/rating'

interface DrawerOverviewTabProps {
  node: Node
  className?: string
}

export const DrawerOverviewTab = memo(({ node, className }: DrawerOverviewTabProps) => {
  const { t, i18n } = useTranslation()

  // Calculate tier from complexity value
  const complexityTier = getComplexityTier(node.complexity)
  const complexity = node.complexity ?? null

  return (
    <div className={cn('space-y-6', className)}>
      {/* Описание */}
      {node.description && (
        <div>
          <h4 className='text-sm font-medium mb-2'>{t('nodeDrawer.overview.description')}</h4>
          <p className='text-sm text-muted-foreground leading-relaxed'>{node.description}</p>
        </div>
      )}

      {/* Метаданные */}
      <div>
        <h4 className='text-sm font-medium mb-3'>{t('nodeDrawer.overview.metadata')}</h4>

        <div className='space-y-3'>
          {/* Тип узла */}
          <div className='flex items-center gap-2'>
            <span className='text-xs text-muted-foreground w-20'>
              {t('nodeDrawer.overview.type')}:
            </span>
            <Badge variant='outline' className={cn('text-xs', getNodeBorderColor(node.type))}>
              {node.type}
            </Badge>
          </div>

          {/* Complexity Tier */}
          {complexityTier && (
            <div className='flex items-center gap-2'>
              <span className='text-xs text-muted-foreground w-20'>
                {t('nodeDrawer.overview.complexity')}:
              </span>
              <Badge variant='secondary' className={cn('text-xs pointer-events-none', getRatingColor(complexityTier))}>
                {complexityTier}
                {complexity !== null && <span className='ml-1 opacity-70'>({complexity})</span>}
              </Badge>
            </div>
          )}

          {/* Уверенность */}
          {node.metadata.confidence !== undefined && (
            <div className='flex items-center gap-2'>
              <span className='text-xs text-muted-foreground w-20'>
                {t('nodeDrawer.overview.confidence')}:
              </span>
              <div className='flex-1'>
                <div className='flex items-center gap-2'>
                  <div className='flex-1 h-2 bg-muted rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-primary transition-all'
                      style={{ width: `${node.metadata.confidence * 100}%` }}
                    />
                  </div>
                  <span className='text-xs font-medium'>
                    {Math.round(node.metadata.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Теги */}
          {node.metadata.tags && node.metadata.tags.length > 0 && (
            <div className='flex items-start gap-2'>
              <span className='text-xs text-muted-foreground w-20 pt-1'>
                {t('nodeDrawer.overview.tags')}:
              </span>
              <div className='flex-1 flex flex-wrap gap-1'>
                {node.metadata.tags.map(tag => (
                  <Badge key={tag} variant='outline' className='text-xs'>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Даты */}
          <div className='flex items-center gap-2'>
            <span className='text-xs text-muted-foreground w-20'>{t('common.created')}:</span>
            <span className='text-xs'>
              {new Date(node.createdAt).toLocaleDateString(i18n.language)}
            </span>
          </div>

          <div className='flex items-center gap-2'>
            <span className='text-xs text-muted-foreground w-20'>{t('common.updated')}:</span>
            <span className='text-xs'>
              {new Date(node.updatedAt).toLocaleDateString(i18n.language)}
            </span>
          </div>

          {/* Повторения */}
          {(node.metadata.reviewCount ?? 0) > 0 && (
            <div className='flex items-center gap-2'>
              <span className='text-xs text-muted-foreground w-20'>
                {t('nodeDrawer.overview.reviews')}:
              </span>
              <span className='text-xs font-medium'>{node.metadata.reviewCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

DrawerOverviewTab.displayName = 'DrawerOverviewTab'
