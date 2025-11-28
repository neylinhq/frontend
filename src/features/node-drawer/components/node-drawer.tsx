import { Focus, Pencil } from 'lucide-react'
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { Edge, Node } from '@/entities/map'
import { useFocusMode } from '@/features/graph-view'
import { getNodeIcon } from '@/features/graph-visualization/lib/get-node-style'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/shared/ui/drawer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { useDrawerTabs } from '../model/drawer-tabs.hooks'
import { DrawerConnectionsTab } from './drawer-connections-tab'
import { DrawerOverviewTab } from './drawer-overview-tab'

interface NodeDrawerProps {
  node: Node | null
  edges: Edge[]
  nodes: Node[]
  onClose: () => void
  onSelectNode?: (nodeId: string) => void
  onPanToNode?: (nodeId: string) => void
  className?: string
}

export const NodeDrawer = memo(
  ({ node, edges, nodes, onClose, onSelectNode, onPanToNode, className }: NodeDrawerProps) => {
    const { t } = useTranslation()
    const [isMobile, setIsMobile] = useState(false)
    const { activeTab, switchTab } = useDrawerTabs()
    const { focusedNodeId, focusNode, clearFocus } = useFocusMode()

    // Check mobile via matchMedia
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
    const isFocused = focusedNodeId === node.id

    return (
      <Drawer open={!!node} onOpenChange={onClose}>
        <DrawerContent
          side={isMobile ? 'bottom' : 'right'}
          size={isMobile ? '70vh' : '360px'}
          showOverlay={isMobile}
          className={cn('p-6', className)}
        >
          <DrawerHeader className='px-0 pt-0'>
            <div className='flex items-center justify-between'>
              <DrawerTitle className='flex items-center gap-2'>
                <Icon className='w-5 h-5' />
                {node.label}
              </DrawerTitle>
              <div className='flex gap-2'>
                <Button
                  variant={isFocused ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => (isFocused ? clearFocus() : focusNode(node.id))}
                  title={
                    isFocused
                      ? t('graph.nodeControls.clearFocus')
                      : t('graph.nodeControls.focusMode')
                  }
                >
                  <Focus className='h-4 w-4' />
                </Button>
                <Button variant='outline' size='sm' asChild title={t('nodeDrawer.edit')}>
                  <Link to={`/dashboard/maps/${node.mapId}/node/${node.id}`}>
                    <Pencil className='h-4 w-4' />
                  </Link>
                </Button>
              </div>
            </div>
          </DrawerHeader>

          <Tabs
            value={activeTab === 'view' ? 'overview' : activeTab}
            onValueChange={value => switchTab(value as 'overview' | 'connections')}
            className='mt-4'
          >
            <TabsList className='w-full grid grid-cols-2'>
              <TabsTrigger value='overview'>{t('nodeDrawer.tabs.overview')}</TabsTrigger>
              <TabsTrigger value='connections'>{t('nodeDrawer.tabs.connections')}</TabsTrigger>
            </TabsList>

            <TabsContent value='overview' className='mt-4'>
              <DrawerOverviewTab node={node} />
            </TabsContent>

            <TabsContent value='connections' className='mt-4'>
              <DrawerConnectionsTab
                node={node}
                edges={edges}
                allNodes={nodes}
                onOpenNode={onSelectNode}
                onPanToNode={onPanToNode}
              />
            </TabsContent>
          </Tabs>
        </DrawerContent>
      </Drawer>
    )
  }
)

NodeDrawer.displayName = 'NodeDrawer'
