import { Focus, Pencil } from 'lucide-react'
import { memo, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { Node } from '@/entities/map'
import { getNodeIcon } from '@/entities/node'
import { Button } from '@/shared/components/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/shared/components/drawer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/tabs'
import { cn } from '@/shared/lib/cn'
import { useDrawerTabs } from '../model/drawer-tabs.hooks'
import { useFocusMode } from '../model/graph.store'
import { DrawerOverviewTab } from './drawer-overview-tab'

interface NodeDrawerProps {
  node: Node | null
  onClose: () => void
  /** Render prop for connections tab content - injected by parent to avoid cross-feature import */
  connectionsTab?: React.ReactNode
  className?: string
}

export const NodeDrawer = memo(
  ({ node, onClose, connectionsTab, className }: NodeDrawerProps) => {
    const { t } = useTranslation()
    const [isMobile, setIsMobile] = useState(false)
    const { activeTab, switchTab } = useDrawerTabs()
    const { focusedNodeId, focusNode, clearFocus } = useFocusMode()

    // Keep track of the last valid node for smooth transitions
    // This prevents drawer from closing/reopening when switching nodes
    const displayNodeRef = useRef<Node | null>(null)
    if (node) {
      displayNodeRef.current = node
    }
    const displayNode = displayNodeRef.current

    // Check mobile via matchMedia
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768) // md breakpoint
      }

      checkMobile()
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Use node for open state, but displayNode for content
    if (!displayNode) {
      return null
    }

    const Icon = getNodeIcon(displayNode.type)
    const isFocused = focusedNodeId === displayNode.id

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
                {displayNode.label}
              </DrawerTitle>
              <div className='flex gap-2'>
                <Button
                  variant={isFocused ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => (isFocused ? clearFocus() : focusNode(displayNode.id))}
                  title={
                    isFocused
                      ? t('graph.nodeControls.clearFocus')
                      : t('graph.nodeControls.focusMode')
                  }
                >
                  <Focus className='h-4 w-4' />
                </Button>
                <Button variant='outline' size='sm' asChild title={t('nodeDrawer.edit')}>
                  <Link to={`/dashboard/maps/${displayNode.mapId}/node/${displayNode.id}`}>
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
              <DrawerOverviewTab node={displayNode} />
            </TabsContent>

            <TabsContent value='connections' className='mt-4'>
              {connectionsTab}
            </TabsContent>
          </Tabs>
        </DrawerContent>
      </Drawer>
    )
  }
)

NodeDrawer.displayName = 'NodeDrawer'
