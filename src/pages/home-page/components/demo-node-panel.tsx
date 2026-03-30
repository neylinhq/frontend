import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { useMapActiveTab } from '@/entities/map-ui'
import type { FullMap } from '@/entities/map'
import { cn } from '@/shared/lib/cn'

interface DemoNodePanelProps {
  data: FullMap
}

export const DemoNodePanel = memo(function DemoNodePanel({ data }: DemoNodePanelProps) {
  const { t } = useTranslation()
  // TODO: read selected node from store when GraphWorkspace supports it
  // For now, show a prompt to select a node

  return (
    <div className='flex items-center justify-center h-full p-4'>
      <p className='text-sm text-muted-foreground text-center'>
        {t('mapSidebar.selectNode', 'Select a node to see details')}
      </p>
    </div>
  )
})
