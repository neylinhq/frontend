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

  // Format token count with K/M suffix
  const formatTokens = (tokens: number): string => {
    if (tokens >= 1_000_000) {
      return `${(tokens / 1_000_000).toFixed(1)}M`
    }
    if (tokens >= 1_000) {
      return `${(tokens / 1_000).toFixed(0)}K`
    }
    return tokens.toString()
  }

  const formatTokenLimit = (limit: number | null): string => {
    if (limit === null) return t('billing.unlimited')
    return formatTokens(limit)
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

        {/* AI Tokens usage (new, primary metric) */}
        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span>{t('billing.usage.aiTokens', 'AI Tokens')}</span>
            <span className='text-muted-foreground'>
              {formatTokens(usage.tokensUsedThisMonth)} / {formatTokenLimit(limits.tokensPerMonth)}
            </span>
          </div>
          <Progress value={calculatePercentage(usage.tokensUsedThisMonth, limits.tokensPerMonth)} />
        </div>

        {/* Model tiers info */}
        {limits.allowedTiers && limits.allowedTiers.length > 0 && (
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span>{t('billing.usage.modelTiers', 'Model Tiers')}</span>
              <span className='text-muted-foreground capitalize'>
                {limits.allowedTiers.join(', ')}
              </span>
            </div>
          </div>
        )}

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
