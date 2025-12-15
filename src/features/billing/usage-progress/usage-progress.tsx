import { useTranslation } from 'react-i18next'
import type { PlanLimits, UsageStats } from '@/entities/subscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/card'
import { Progress } from '@/shared/components/progress'

interface UsageProgressProps {
  usage: UsageStats
  limits: PlanLimits
}

export const UsageProgress = ({ usage, limits }: UsageProgressProps) => {
  const { t } = useTranslation()

  const calculatePercentage = (current: number, max: number | null) => {
    if (max === null) {
      return 0 // unlimited
    }
    return Math.min((current / max) * 100, 100)
  }

  const formatLimit = (limit: number | null) => {
    return limit === null ? t('billing.unlimited') : limit.toString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('billing.usage.title')}</CardTitle>
        <CardDescription>{t('billing.usage.description')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Maps usage */}
        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span>{t('billing.usage.maps')}</span>
            <span className='text-muted-foreground'>
              {usage.mapsCount} / {formatLimit(limits.maxMaps)}
            </span>
          </div>
          <Progress value={calculatePercentage(usage.mapsCount, limits.maxMaps)} />
        </div>

        {/* Nodes per map info */}
        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span>{t('billing.usage.nodesPerMap')}</span>
            <span className='text-muted-foreground'>{formatLimit(limits.maxNodesPerMap)}</span>
          </div>
        </div>

        {/* AI requests usage */}
        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span>{t('billing.usage.aiRequests')}</span>
            <span className='text-muted-foreground'>
              {usage.aiRequestsThisMonth} / {formatLimit(limits.aiRequestsPerMonth)}
            </span>
          </div>
          <Progress
            value={calculatePercentage(usage.aiRequestsThisMonth, limits.aiRequestsPerMonth)}
          />
        </div>

        {/* Storage usage (info only, no limit) */}
        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span>{t('billing.usage.storage')}</span>
            <span className='text-muted-foreground'>{usage.storageUsedMB.toFixed(1)} MB</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
