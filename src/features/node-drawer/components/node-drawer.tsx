import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Edge, Node } from '@/entities/map'
import { getNodeIcon } from '@/features/graph-visualization/lib/get-node-style'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/shared/ui/drawer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { cn } from '@/shared/lib/cn'
import { useDrawerTabs } from '../model/drawer-tabs.hooks'
import { DrawerConnectionsTab } from './drawer-connections-tab'
import { DrawerOverviewTab } from './drawer-overview-tab'

interface NodeDrawerProps {
  node: Node | null
  edges: Edge[]
  nodes: Node[]
  onClose: () => void
  className?: string
}

export const NodeDrawer = memo(({ node, edges, nodes, onClose, className }: NodeDrawerProps) => {
  const { t } = useTranslation()
  const [isMobile, setIsMobile] = useState(false)
  const { activeTab, switchTab } = useDrawerTabs()

  // Определяем мобилку через matchMedia
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!node) return null

  const Icon = getNodeIcon(node.type)

  return (
    <Drawer open={!!node} onOpenChange={onClose}>
      <DrawerContent
        side={isMobile ? 'bottom' : 'right'}
        size={isMobile ? '70vh' : '40vw'}
        showOverlay={isMobile}
        className={cn('p-6', className)}
      >
        <DrawerHeader className="px-0 pt-0">
          <DrawerTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {node.label}
          </DrawerTitle>
        </DrawerHeader>

        <Tabs value={activeTab} onValueChange={value => switchTab(value as any)} className="mt-4">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="overview">{t('nodeDrawer.tabs.overview')}</TabsTrigger>
            <TabsTrigger value="connections">{t('nodeDrawer.tabs.connections')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <DrawerOverviewTab node={node} />
          </TabsContent>

          <TabsContent value="connections" className="mt-4">
            <DrawerConnectionsTab node={node} edges={edges} allNodes={nodes} />
          </TabsContent>
        </Tabs>
      </DrawerContent>
    </Drawer>
  )
})

NodeDrawer.displayName = 'NodeDrawer'
